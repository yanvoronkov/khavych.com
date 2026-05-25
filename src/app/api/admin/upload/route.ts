import { NextResponse } from "next/server";
import { getServerSession } from "src/lib/auth";
import { put } from "@vercel/blob";
import { logger } from "src/lib/logger";

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

    // Проверка типа файла (только картинки)
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        {
          error: true,
          code: "INVALID_FILE_TYPE",
          message: "Разрешена загрузка только графических изображений (картинок)",
        },
        { status: 400 }
      );
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

    // 3. Загружаем файл в Vercel Blob
    // Заменяем все небезопасные символы в имени на подчеркивания
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filename = `products/${Date.now()}-${safeName}`;
    
    const blob = await put(filename, file, {
      access: "public",
    });

    logger.info({ url: blob.url }, "Файл успешно загружен в Vercel Blob");

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
