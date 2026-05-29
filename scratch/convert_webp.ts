import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { PrismaClient } from '@prisma/client';

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

console.log('--- Step 1: Converting images to webp ---');
walkDir(publicDir, (filepath) => {
  const ext = path.extname(filepath).toLowerCase();
  if (['.jpg', '.jpeg', '.png'].includes(ext)) {
    const filename = path.basename(filepath);
    if (excludeFiles.includes(filename)) return;

    const newFilepath = filepath.replace(new RegExp(`\\${ext}$`, 'i'), '.webp');
    console.log(`Converting ${filename} to webp...`);
    
    try {
      execSync(`cwebp -q 85 "${filepath}" -o "${newFilepath}"`, { stdio: 'ignore' });
      fs.unlinkSync(filepath);
      
      const oldRelative = path.relative(publicDir, filepath).replace(/\\/g, '/');
      const newRelative = path.relative(publicDir, newFilepath).replace(/\\/g, '/');
      convertedFiles.set('/' + oldRelative, '/' + newRelative);
      convertedFiles.set(filename, path.basename(newFilepath));
    } catch (e) {
      console.error(`Error converting ${filepath}`, e);
    }
  }
});

console.log('--- Step 2: Replacing references in codebase ---');
function replaceInFiles(dir: string) {
  walkDir(dir, (filepath) => {
    const ext = path.extname(filepath).toLowerCase();
    if (['.ts', '.tsx', '.css', '.js', '.jsx'].includes(ext)) {
      let content = fs.readFileSync(filepath, 'utf8');
      let changed = false;

      for (const [oldPath, newPath] of convertedFiles.entries()) {
        if (content.includes(oldPath)) {
          // Replace all occurrences of oldPath with newPath
          // Use a simple split/join for global replace without regex escaping issues
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

replaceInFiles(srcDir);
replaceInFiles(prismaDir);

console.log('--- Step 3: Updating database ---');
async function updateDb() {
  const prisma = new PrismaClient();
  
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
      await prisma.$executeRawUnsafe(q);
    } catch (e) {
      console.error(`DB Update Error on query: ${q}`, e);
    }
  }

  await prisma.$disconnect();
  console.log('Database updated successfully.');
}

updateDb().catch(console.error);
