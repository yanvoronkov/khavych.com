import { NextResponse } from "next/server";
import { getServerSession } from "src/lib/auth";
import { put, del } from "@vercel/blob";
import { logger } from "src/lib/logger";
import sharp from "sharp";
import heicConvert from "heic-convert";

// Отключаем кэширование и принудительно делаем роут динамическим
export const dynamic = "force-dynamic";

/**
 * Обработчик POST запроса для безопасной загрузки картинок товаров в Vercel Blob.
 * Доступен только для пользователей с ролью ADMIN.
 * Путь: /api/admin/upload
 */
export async function POST(request: Request) {
  try {
    // 1. Проверяем сессию и роль администратора
    const session = await getServerSession();

    if (!session || session.role !== "ADMIN") {
      logger.warn({ session }, "Несанкционированная попытка загрузки файла");
      return NextResponse.json(
        {
          error: true,
          code: "FORBIDDEN",
          message: "У вас нет прав для выполнения этого действия",
        },
        { status: 403 }
      );
    }

    // 2. Считываем файл из FormData
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const uploadType = formData.get("uploadType") as string | null;

    if (!file) {
      return NextResponse.json(
        {
          error: true,
          code: "BAD_REQUEST",
          message: "Файл не был передан в запросе",
        },
        { status: 400 }
      );
    }

    // Проверка типа файла
    if (uploadType === "document") {
      // Для документов запрещаем только опасные исполняемые расширения и типы файлов
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      const dangerousExtensions = ["exe", "bat", "cmd", "sh", "js", "ts", "html", "htm", "lnk", "vbs", "com", "scr"];
      
      if (
        dangerousExtensions.includes(fileExtension || "") || 
        file.type === "text/html" || 
        file.type === "application/javascript" ||
        file.type === "text/javascript"
      ) {
        return NextResponse.json(
          {
            error: true,
            code: "DANGEROUS_FILE_TYPE",
            message: "Загрузка исполняемых файлов и веб-страниц запрещена в целях безопасности",
          },
          { status: 400 }
        );
      }
    } else {
      // По умолчанию (для картинок товаров и курсов)
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      const isHeic = fileExtension === "heic" || fileExtension === "heif" || file.type === "image/heic" || file.type === "image/heif";

      if (!file.type.startsWith("image/") && !isHeic) {
        return NextResponse.json(
          {
            error: true,
            code: "INVALID_FILE_TYPE",
            message: "Разрешена загрузка только графических изображений (картинок)",
          },
          { status: 400 }
        );
      }
    }

    // Ограничение размера файла (макс. 5 МБ)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        {
          error: true,
          code: "FILE_TOO_LARGE",
          message: "Размер файла не должен превышать 5 МБ",
        },
        { status: 400 }
      );
    }

    // 3. Конвертируем File в Buffer для максимальной совместимости в Serverless среде Vercel
    const buffer = Buffer.from(await file.arrayBuffer());

    // Заменяем все небезопасные символы в имени на подчеркивания
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const folder = (uploadType === "document" || uploadType === "lesson-cover") ? "lessons" : "products";
    
    let processedBuffer: any = buffer;
    let filename = `${folder}/${Date.now()}-${safeName}`;
    let contentType = file.type;

    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const isHeic = fileExtension === "heic" || fileExtension === "heif" || file.type === "image/heic" || file.type === "image/heif";

    // Если загружается картинка и это не документ
    if (uploadType !== "document" && (file.type.startsWith("image/") || isHeic)) {
      try {
        let imageBuffer = buffer;

        // Если это HEIC/HEIF файл от iOS, предварительно конвертируем его в JPEG
        if (isHeic) {
          logger.info("Обнаружен файл формата HEIC/HEIF от iOS, запускается конвертация...");
          const converted = await heicConvert({
            buffer: buffer as any,
            format: "JPEG",
            quality: 1, // Максимальное качество для промежуточной конвертации
          });
          imageBuffer = Buffer.from(converted);
          logger.info("Конвертация HEIC -> JPEG успешно завершена");
        }

        processedBuffer = await sharp(imageBuffer)
          .webp({ quality: 82, lossless: false })
          .toBuffer();
        
        // Меняем расширение на .webp
        const baseName = safeName.substring(0, safeName.lastIndexOf(".")) || safeName;
        filename = `${folder}/${Date.now()}-${baseName}.webp`;
        contentType = "image/webp";
        
        logger.info(
          { 
            originalSize: file.size, 
            optimizedSize: processedBuffer.length,
            compressionRatio: ((1 - processedBuffer.length / file.size) * 100).toFixed(1) + "%" 
          }, 
          "Изображение успешно оптимизировано в WebP с помощью sharp"
        );
      } catch (sharpError) {
        logger.error({ sharpError }, "Не удалось оптимизировать изображение с помощью sharp, загружаем оригинал");
      }
    }

    const blob = await put(filename, processedBuffer, {
      access: "public",
      contentType: contentType,
    });

    logger.info({ url: blob.url, uploadType }, "Файл успешно загружен в Vercel Blob");

    return NextResponse.json({
      success: true,
      url: blob.url,
    });
  } catch (error: any) {
    logger.error({ error }, "Ошибка при загрузке файла в Vercel Blob");
    return NextResponse.json(
      {
        error: true,
        code: "INTERNAL_SERVER_ERROR",
        message: "Произошла внутренняя ошибка сервера при загрузке файла",
        details: error.message
      },
      { status: 500 }
    );
  }
}

/**
 * Обработчик DELETE запроса для удаления неиспользуемых файлов из Vercel Blob.
 * Доступен только для пользователей с ролью ADMIN.
 * Путь: /api/admin/upload
 */
export async function DELETE(request: Request) {
  try {
    // 1. Проверяем сессию и роль администратора
    const session = await getServerSession();

    if (!session || session.role !== "ADMIN") {
      logger.warn({ session }, "Несанкционированная попытка удаления файла");
      return NextResponse.json(
        {
          error: true,
          code: "FORBIDDEN",
          message: "У вас нет прав для выполнения этого действия",
        },
        { status: 403 }
      );
    }

    // 2. Считываем url файла из тела запроса
    const { url } = await request.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        {
          error: true,
          code: "BAD_REQUEST",
          message: "Не указан URL файла для удаления",
        },
        { status: 400 }
      );
    }

    // 3. Безопасность: проверяем, что URL принадлежит именно нашему Vercel Blob хранилищу
    if (!url.includes(".public.blob.vercel-storage.com")) {
      logger.warn({ url }, "Попытка удаления стороннего файла, отклонено в целях безопасности");
      return NextResponse.json(
        {
          error: true,
          code: "BAD_REQUEST",
          message: "Разрешено удалять файлы только из хранилища Vercel Blob проекта",
        },
        { status: 400 }
      );
    }

    // 4. Удаляем файл из Vercel Blob
    await del(url);

    logger.info({ url }, "Файл успешно удален из Vercel Blob");

    return NextResponse.json({
      success: true,
      message: "Файл успешно удален",
    });
  } catch (error: any) {
    logger.error({ error }, "Ошибка при удалении файла из Vercel Blob");
    return NextResponse.json(
      {
        error: true,
        code: "INTERNAL_SERVER_ERROR",
        message: "Произошла внутренняя ошибка сервера при удалении файла",
        details: error.message
      },
      { status: 500 }
    );
  }
}
