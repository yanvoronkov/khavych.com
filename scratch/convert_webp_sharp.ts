import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { db } from '../src/lib/db'; // Import Prisma client initialized properly

const publicDir = path.join(__dirname, '../public');
const srcDir = path.join(__dirname, '../src');
const prismaDir = path.join(__dirname, '../prisma');

const excludeFiles = ['favicon.png', 'favicon.ico', 'icon.png', 'apple-icon.png'];

const convertedFiles = new Map<string, string>(); // old filename -> new filename

function walkDir(dir: string, callback: (filepath: string) => void) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filepath = path.join(dir, file);
    const stat = fs.statSync(filepath);
    if (stat.isDirectory()) {
      walkDir(filepath, callback);
    } else {
      callback(filepath);
    }
  }
}

async function convertImages() {
  console.log('--- Step 1: Converting images to webp ---');
  const tasks: Promise<void>[] = [];
  
  walkDir(publicDir, (filepath) => {
    const ext = path.extname(filepath).toLowerCase();
    if (['.jpg', '.jpeg', '.png'].includes(ext)) {
      const filename = path.basename(filepath);
      if (excludeFiles.includes(filename)) return;

      const newFilepath = filepath.replace(new RegExp(`\\${ext}$`, 'i'), '.webp');
      
      const oldRelative = path.relative(publicDir, filepath).replace(/\\/g, '/');
      const newRelative = path.relative(publicDir, newFilepath).replace(/\\/g, '/');
      
      // If we already converted it in previous run, just skip or re-convert
      if (!fs.existsSync(filepath)) return;
      
      convertedFiles.set('/' + oldRelative, '/' + newRelative);
      convertedFiles.set(filename, path.basename(newFilepath));

      console.log(`Converting ${filename} to webp...`);
      tasks.push(
        sharp(filepath)
          .webp({ quality: 85 })
          .toFile(newFilepath)
          .then(() => {
            fs.unlinkSync(filepath);
          })
          .catch(err => {
            console.error(`Error converting ${filepath}`, err);
          })
      );
    }
  });

  await Promise.all(tasks);
}

function replaceInFiles(dir: string) {
  walkDir(dir, (filepath) => {
    const ext = path.extname(filepath).toLowerCase();
    if (['.ts', '.tsx', '.css', '.js', '.jsx'].includes(ext)) {
      let content = fs.readFileSync(filepath, 'utf8');
      let changed = false;

      for (const [oldPath, newPath] of convertedFiles.entries()) {
        if (content.includes(oldPath)) {
          content = content.split(oldPath).join(newPath);
          changed = true;
        }
      }

      if (changed) {
        fs.writeFileSync(filepath, content, 'utf8');
        console.log(`Updated ${path.relative(process.cwd(), filepath)}`);
      }
    }
  });
}

async function updateDb() {
  console.log('--- Step 3: Updating database ---');
  
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
    } catch (e) {
      console.error(`DB Update Error on query: ${q}`, e);
    }
  }

  await db.$disconnect();
  console.log('Database updated successfully.');
}

async function main() {
  await convertImages();
  
  console.log('--- Step 2: Replacing references in codebase ---');
  replaceInFiles(srcDir);
  replaceInFiles(prismaDir);
  
  await updateDb();
}

main().catch(console.error);
