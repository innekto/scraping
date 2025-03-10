import { launch } from 'puppeteer';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname, extname } from 'path';
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

  let counter = 1; // Лічильник для назв файлів

  // Пройдемо по кожному об'єкту в randomBooks
  for (const book of randomBooks) {
    const imageUrl = book.image; // Отримуємо URL зображення

    try {
      const response = await page.goto(imageUrl, { waitUntil: 'load' });
      const contentType = response.headers()['content-type'];

      if (contentType && contentType.startsWith('image')) {
        // Завантажуємо зображення, якщо це зображення
        const imageBuffer = await response.buffer();

        // Отримуємо розширення файлу
        const extension = extname(imageUrl) || '.jpg';

        // Формуємо шлях для збереження (1.jpg, 2.jpg, ...)
        const imagePath = join(imagesFolderPath, `${counter}${extension}`);

        writeFileSync(imagePath, imageBuffer);
        console.log(`Зображення збережено: ${imagePath}`);

        counter++; // Збільшуємо лічильник для наступного файлу
      } else {
        console.log(`Це не зображення: ${imageUrl}`);
      }
    } catch (error) {
      console.error(`Помилка при обробці URL: ${imageUrl}`, error);
    }
  }

  await browser.close();
})();
