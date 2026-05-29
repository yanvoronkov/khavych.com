import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

async function checkDimensions() {
  const publicDir = path.join(__dirname, '../public');
  const imagesDir = path.join(__dirname, '../public/images');
  
  console.log('=== public/ ===');
  const files = fs.readdirSync(publicDir);
  for (const file of files) {
    if (file.endsWith('.webp')) {
      const metadata = await sharp(path.join(publicDir, file)).metadata();
      console.log(`- ${file}: ${metadata.width}x${metadata.height}`);
    }
  }
  
  console.log('=== public/images/ ===');
  const imagesFiles = fs.readdirSync(imagesDir);
  for (const file of imagesFiles) {
    if (file.endsWith('.webp')) {
      const metadata = await sharp(path.join(imagesDir, file)).metadata();
      console.log(`- ${file}: ${metadata.width}x${metadata.height}`);
    }
  }
}

checkDimensions().catch(console.error);
