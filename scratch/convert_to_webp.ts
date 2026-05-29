import fs from "fs";
import path from "path";
import sharp from "sharp";

const IMAGES_DIR = path.join(process.cwd(), "public", "images");

async function main() {
  console.log(`Сканирование директории: ${IMAGES_DIR}`);
  if (!fs.existsSync(IMAGES_DIR)) {
    console.error("Директория public/images не найдена");
    process.exit(1);
  }

  const files = fs.readdirSync(IMAGES_DIR);
  const jpegFiles = files.filter((file) => {
    const ext = path.extname(file).toLowerCase();
    return ext === ".jpg" || ext === ".jpeg";
  });

  if (jpegFiles.length === 0) {
    console.log("JPEG/JPG файлы в папке public/images не найдены");
    return;
  }

  console.log(`Найдено JPEG файлов для конвертации: ${jpegFiles.length}`);

  for (const file of jpegFiles) {
    const inputPath = path.join(IMAGES_DIR, file);
    const filenameNoExt = path.parse(file).name;
    const outputPath = path.join(IMAGES_DIR, `${filenameNoExt}.webp`);

    console.log(`Конвертация: ${file} -> ${filenameNoExt}.webp...`);
    try {
      await sharp(inputPath)
        .webp({ quality: 85 })
        .toFile(outputPath);

      console.log(`Успешно создано: ${filenameNoExt}.webp. Удаление исходного файла ${file}...`);
      fs.unlinkSync(inputPath);
    } catch (error) {
      console.error(`Ошибка при обработке файла ${file}:`, error);
    }
  }

  console.log("\nВсе операции конвертации завершены");
}

main()
  .catch((e) => console.error(e))
  .finally(() => process.exit(0));
