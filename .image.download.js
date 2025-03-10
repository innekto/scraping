import { launch } from 'puppeteer';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { randomBooks } from './.links.js'; // Імпортуємо масив з посиланнями на книги

(async () => {
  // Отримуємо поточний шлях за допомогою fileURLToPath
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  const browser = await launch({ headless: false });
  const page = await browser.newPage();

  // Перевірка і створення папки для збереження зображень
  const imagesFolderPath = join(__dirname, 'images');
  if (!existsSync(imagesFolderPath)) {
    mkdirSync(imagesFolderPath);
    console.log('Папка для збереження зображень створена.');
  }

  // Пройдемо по кожному об'єкту в randomBooks
  for (const book of randomBooks) {
    const imageUrl = book.image; // Отримуємо URL зображення

    try {
      const response = await page.goto(imageUrl, { waitUntil: 'load' });
      const contentType = response.headers()['content-type'];

      if (contentType && contentType.startsWith('image')) {
        // Завантажуємо зображення, якщо це зображення
        const imageBuffer = await response.buffer();

        // Формуємо шлях для збереження
        const imagePath = join(imagesFolderPath, imageUrl.split('/').pop());
        writeFileSync(imagePath, imageBuffer);
        console.log(`Зображення збережено: ${imagePath}`);
      } else {
        console.log(`Це не зображення: ${imageUrl}`);
      }
    } catch (error) {
      console.error(`Помилка при обробці URL: ${imageUrl}`, error);
    }
  }

  await browser.close();
})();
