import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "src/lib/auth";
import { db } from "src/lib/db";
import { logger } from "src/lib/logger";

export const dynamic = "force-dynamic";

// Схема валидации для мультиязычного товара через Zod
const productUpdateSchema = z.object({
  name: z.object({
    ru: z.string().min(1, "Название на русском языке обязательно"),
    de: z.string().optional().nullable(),
  }),
  description: z.object({
    ru: z.string().min(1, "Описание на русском языке обязательно"),
    de: z.string().optional().nullable(),
  }),
  price: z.number().min(0, "Цена не может быть отрицательной"),
  oldPrice: z.number().min(0, "Старая цена не может быть отрицательной").nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  category: z.enum(["BRACELET", "COURSE", "CONSULTATION"]),
  subCategory: z.string().nullable().optional(),
  features: z.object({
    ru: z.array(z.string()).optional(),
    de: z.array(z.string()).optional(),
  }).nullable().optional(),
  isAvailable: z.boolean().optional(),
});

type RouteParams = {
  params: Promise<{ id: string }>;
};

/**
 * Редактирование товара администратором (PATCH)
 * Путь: /api/admin/products/[id]
 */
export async function PATCH(
  request: Request,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession();

    if (!session || session.role !== "ADMIN") {
      return NextResponse.json(
        {
          error: true,
          code: "FORBIDDEN",
          message: "У вас нет прав для выполнения этого действия",
        },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Проверяем существование товара
    const existingProduct = await db.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json(
        {
          error: true,
          code: "NOT_FOUND",
          message: "Указанный товар не найден",
        },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validatedData = productUpdateSchema.parse(body);

    const product = await db.product.update({
      where: { id },
      data: {
        name: validatedData.name,
        description: validatedData.description,
        price: validatedData.price,
        oldPrice: validatedData.oldPrice,
        imageUrl: validatedData.imageUrl,
        category: validatedData.category,
        subCategory: validatedData.subCategory,
        features: validatedData.features || { ru: [], de: [] },
        isAvailable: validatedData.isAvailable ?? existingProduct.isAvailable,
      },
    });

    logger.info({ productId: product.id }, "Товар успешно обновлен в базе данных");

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: true,
          code: "VALIDATION_ERROR",
          message: "Ошибка валидации входных данных",
          details: error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    logger.error({ error }, "Ошибка при обновлении товара в API по ID");
    return NextResponse.json(
      {
        error: true,
        code: "INTERNAL_SERVER_ERROR",
        message: "Не удалось обновить товар в базе данных",
      },
      { status: 500 }
    );
  }
}

/**
 * Удаление товара администратором (DELETE)
 * Путь: /api/admin/products/[id]
 */
export async function DELETE(
  request: Request,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession();

    if (!session || session.role !== "ADMIN") {
      return NextResponse.json(
        {
          error: true,
          code: "FORBIDDEN",
          message: "У вас нет прав для выполнения этого действия",
        },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Проверяем существование товара
    const existingProduct = await db.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json(
        {
          error: true,
          code: "NOT_FOUND",
          message: "Указанный товар не найден",
        },
        { status: 404 }
      );
    }

    await db.product.delete({
      where: { id },
    });

    logger.info({ productId: id }, "Товар успешно удален из базы данных");

    return NextResponse.json({ success: true, message: "Товар успешно удален" });
  } catch (error: any) {
    logger.error({ error }, "Ошибка при удалении товара в API по ID");
    return NextResponse.json(
      {
        error: true,
        code: "INTERNAL_SERVER_ERROR",
        message: "Не удалось удалить товар из базы данных",
      },
      { status: 500 }
    );
  }
}
