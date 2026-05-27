import { NextResponse } from "next/server";
import { getServerSession } from "src/lib/auth";
import { db } from "src/lib/db";
import { put } from "@vercel/blob";
import { logger } from "src/lib/logger";

// Принудительно устанавливаем динамический рендеринг роута
export const dynamic = "force-dynamic";

/**
 * Обработчик POST запроса для сохранения выданного именного сертификата.
 * Доступен только для авторизованных пользователей, имеющих доступ к соответствующему курсу.
 * Загружает PDF-файл в Vercel Blob и создает/обновляет запись в БД.
 * 
 * Путь: /api/cabinet/certificates
 */
export async function POST(request: Request) {
  try {
    // 1. Проверяем авторизацию
    const session = await getServerSession();
    if (!session) {
      logger.warn("Попытка доступа к API сертификатов без авторизации");
      return NextResponse.json(
        {
          error: true,
          code: "UNAUTHORIZED",
          message: "Вы должны быть авторизованы, чтобы получить сертификат",
        },
        { status: 401 }
      );
    }

    // 2. Считываем данные формы
    const formData = await request.formData();
    const courseId = formData.get("courseId") as string | null;
    const recipientName = formData.get("recipientName") as string | null;
    const file = formData.get("file") as File | null;

    if (!courseId || !recipientName || !file) {
      return NextResponse.json(
        {
          error: true,
          code: "BAD_REQUEST",
          message: "Не заполнены обязательные поля (courseId, recipientName, file)",
        },
        { status: 400 }
      );
    }

    // 3. Проверяем доступ пользователя к указанному курсу (для не-администраторов)
    if (session.role !== "ADMIN") {
      const access = await db.userAccess.findUnique({
        where: {
          userId_courseId: {
            userId: session.userId,
            courseId: courseId,
          },
        },
      });

      const isAccessActive = access && (!access.expiresAt || new Date(access.expiresAt) > new Date());

      if (!isAccessActive) {
        logger.warn(
          { userId: session.userId, courseId },
          "Попытка выдать сертификат на курс без активного доступа"
        );
        return NextResponse.json(
          {
            error: true,
            code: "FORBIDDEN",
            message: "У вас нет активного доступа к этому курсу для получения сертификата",
          },
          { status: 403 }
        );
      }
    }

    // Проверяем существование самого курса
    const course = await db.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json(
        {
          error: true,
          code: "NOT_FOUND",
          message: "Указанный курс не найден в системе",
        },
        { status: 404 }
      );
    }

    // Валидация файла (должен быть только PDF)
    if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
      return NextResponse.json(
        {
          error: true,
          code: "INVALID_FILE_TYPE",
          message: "Разрешена загрузка файлов только в формате PDF",
        },
        { status: 400 }
      );
    }

    // Ограничение размера файла (макс. 5 МБ для PDF сертификата)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        {
          error: true,
          code: "FILE_TOO_LARGE",
          message: "Размер файла сертификата не должен превышать 5 МБ",
        },
        { status: 400 }
      );
    }

    // 4. Конвертируем File в Buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Создаем безопасное имя файла на основе ID пользователя и ID курса
    const filename = `certificates/${session.userId}_${courseId}_${Date.now()}.pdf`;

    // 5. Загружаем файл в Vercel Blob
    logger.info({ filename, userId: session.userId, courseId }, "Загрузка сертификата в Vercel Blob...");
    const blob = await put(filename, buffer, {
      access: "public",
      contentType: "application/pdf",
    });

    logger.info({ url: blob.url }, "Сертификат успешно сохранен в Vercel Blob");

    // 6. Записываем информацию в базу данных через Prisma
    const certificate = await db.certificate.upsert({
      where: {
        userId_courseId: {
          userId: session.userId,
          courseId: courseId,
        },
      },
      update: {
        recipientName: recipientName.trim(),
        pdfUrl: blob.url,
        createdAt: new Date(),
      },
      create: {
        userId: session.userId,
        courseId: courseId,
        recipientName: recipientName.trim(),
        pdfUrl: blob.url,
      },
    });

    logger.info(
      { certificateId: certificate.id, userId: session.userId, courseId },
      "Запись о сертификате успешно обновлена/создана в БД"
    );

    return NextResponse.json({
      success: true,
      certificate,
    });
  } catch (error: any) {
    logger.error({ error }, "Ошибка при обработке выдачи сертификата");
    return NextResponse.json(
      {
        error: true,
        code: "INTERNAL_SERVER_ERROR",
        message: "Произошла внутренняя ошибка сервера при выдаче сертификата",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
