import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "src/lib/auth";
import { db } from "src/lib/db";
import { logger } from "src/lib/logger";

export const dynamic = "force-dynamic";

// Схема валидации для мультиязычного товара через Zod
const productSchema = z.object({
  name: z.object({
    ru: z.string().min(1, "Название на русском языке обязательно"),
    en: z.string().optional().nullable(),
  }),
  description: z.object({
    ru: z.string().min(1, "Описание на русском языке обязательно"),
    en: z.string().optional().nullable(),
  }),
  price: z.number().min(0, "Цена не может быть отрицательной"),
  oldPrice: z.number().min(0, "Старая цена не может быть отрицательной").nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  category: z.enum(["BRACELET", "COURSE", "CONSULTATION"]),
  subCategory: z.string().nullable().optional(),
  features: z.object({
    ru: z.array(z.string()).optional(),
    en: z.array(z.string()).optional(),
  }).nullable().optional(),
  isAvailable: z.boolean().optional(),
});

/**
 * Получение всех товаров администратором (GET)
 * Путь: /api/admin/products
 */
export async function GET() {
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

    const products = await db.product.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, products });
  } catch (error: any) {
    logger.error({ error }, "Ошибка при получении списка товаров в API");
    return NextResponse.json(
      {
        error: true,
        code: "INTERNAL_SERVER_ERROR",
        message: "Не удалось получить список товаров",
      },
      { status: 500 }
    );
  }
}

/**
 * Создание нового товара администратором (POST)
 * Путь: /api/admin/products
 */
export async function POST(request: Request) {
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

    const body = await request.json();
    const validatedData = productSchema.parse(body);

    // Подготовка features JSON
    const featuresJson = validatedData.features || { ru: [], en: [] };

    const product = await db.product.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        price: validatedData.price,
        oldPrice: validatedData.oldPrice,
        imageUrl: validatedData.imageUrl,
        category: validatedData.category,
        subCategory: validatedData.subCategory,
        features: featuresJson,
        isAvailable: validatedData.isAvailable ?? true,
      },
    });

    logger.info({ productId: product.id }, "Товар успешно создан в базе данных");

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

    logger.error({ error }, "Ошибка при создании товара в API");
    return NextResponse.json(
      {
        error: true,
        code: "INTERNAL_SERVER_ERROR",
        message: "Не удалось создать товар в базе данных",
      },
      { status: 500 }
    );
  }
}
