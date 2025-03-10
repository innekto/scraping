import { launch } from 'puppeteer';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname, extname } from 'path';
import { fileURLToPath } from 'url';
import { randomBooks } from './.links.js';

(async () => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  const browser = await launch({ headless: false });
  const page = await browser.newPage();

  const imagesFolderPath = join(__dirname, 'images');
  if (!existsSync(imagesFolderPath)) {
    mkdirSync(imagesFolderPath);
    console.log('Папка для збереження зображень створена.');
  }

  let counter = 1;

  for (const book of randomBooks) {
    const imageUrl = book.image;

    try {
      const response = await page.goto(imageUrl, { waitUntil: 'load' });
      const contentType = response.headers()['content-type'];

      if (contentType && contentType.startsWith('image')) {
        const imageBuffer = await response.buffer();
        const extension = extname(imageUrl) || '.jpg';
        const imagePath = join(imagesFolderPath, `${counter}${extension}`);

        writeFileSync(imagePath, imageBuffer);
        console.log(`Зображення збережено: ${imagePath}`);

        counter++;
      } else {
        console.log(`Це не зображення: ${imageUrl}`);
      }
    } catch (error) {
      console.error(`Помилка при обробці URL: ${imageUrl}`, error);
    }
  }

  await browser.close();
})();
