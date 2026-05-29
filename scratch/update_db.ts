import { db } from '../src/lib/db';

async function updateDb() {
  console.log('--- Updating database ---');
  
  const queries = [
    `UPDATE "Product" SET "imageUrl" = REPLACE("imageUrl", '.jpg', '.webp') WHERE "imageUrl" LIKE '%.jpg'`,
    `UPDATE "Product" SET "imageUrl" = REPLACE("imageUrl", '.jpeg', '.webp') WHERE "imageUrl" LIKE '%.jpeg'`,
    `UPDATE "Product" SET "imageUrl" = REPLACE("imageUrl", '.png', '.webp') WHERE "imageUrl" LIKE '%.png'`,
    
    `UPDATE "Course" SET "imageUrl" = REPLACE("imageUrl", '.jpg', '.webp') WHERE "imageUrl" LIKE '%.jpg'`,
    `UPDATE "Course" SET "imageUrl" = REPLACE("imageUrl", '.jpeg', '.webp') WHERE "imageUrl" LIKE '%.jpeg'`,
    `UPDATE "Course" SET "imageUrl" = REPLACE("imageUrl", '.png', '.webp') WHERE "imageUrl" LIKE '%.png'`,
    
    `UPDATE "Lesson" SET "videoCoverUrl" = REPLACE("videoCoverUrl", '.jpg', '.webp') WHERE "videoCoverUrl" LIKE '%.jpg'`,
    `UPDATE "Lesson" SET "videoCoverUrl" = REPLACE("videoCoverUrl", '.jpeg', '.webp') WHERE "videoCoverUrl" LIKE '%.jpeg'`,
    `UPDATE "Lesson" SET "videoCoverUrl" = REPLACE("videoCoverUrl", '.png', '.webp') WHERE "videoCoverUrl" LIKE '%.png'`,
  ];

  for (const q of queries) {
    try {
      await db.$executeRawUnsafe(q);
      console.log(`Executed: ${q}`);
    } catch (e) {
      console.error(`DB Update Error on query: ${q}`, e);
    }
  }

  await db.$disconnect();
  console.log('Database updated successfully.');
}

updateDb().catch(console.error);
