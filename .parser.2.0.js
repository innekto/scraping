import { launch } from 'puppeteer';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { randomBooks } from './.links.js';

(async () => {
  for (let index = 0; index < randomBooks.length; index++) {
    const url = randomBooks[index].orgLink;
    const description = randomBooks[index].description;
    const image = randomBooks[index].image;

    // Створюємо новий браузер для кожної лінки
    const browser = await launch({ headless: false });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });

    // Чекаємо появи h1 із потрібними класами (максимум 15 секунд)
    await page.waitForSelector('h1.title.size-sm.lg\\:size-xl.mt-4', {
      timeout: 2000,
    });

    // Отримуємо текст заголовка книги та іншу інформацію
    const data = await page.evaluate(() => {
      const titleElement = document.querySelector(
        'h1.title.size-sm.lg\\:size-xl.mt-4',
      );
      const linkElement = document.querySelector(
        'a[aria-label="Link to category page"]',
      );

      const title = titleElement
        ? titleElement.textContent?.trim()
        : 'Заголовок не знайдено';

      const category = linkElement
        ? linkElement.textContent?.trim()
        : 'Категорія не знайдена';

      const author = document.querySelector(
        'p.flex.text-sm.text-purple.lg\\:text-base',
      ).innerText;

      const ul = Array.from(document.querySelectorAll('td.py-0\\.5'));

      const pages = ul[2].innerText;

      return {
        title,
        category,
        pages: +pages,
        author: author.trim(),
      };
    });

    try {
      const desktopPath = join(
        homedir(),
        'Desktop',
        'book-trails-utils',
        'bookTitle.json', // Збереження в форматі .json
      );

      let currentTitles = [];

      // Якщо файл існує, спробуємо його прочитати
      if (existsSync(desktopPath)) {
        const fileContent = readFileSync(desktopPath, 'utf-8');

        try {
          currentTitles = JSON.parse(fileContent);
        } catch (error) {
          console.error(
            'Не вдалося розпарсити вміст файлу. Створимо новий масив.',
          );
        }
      }

      // Додаємо новий заголовок і категорію у масив
      currentTitles.push({
        title: data.title,
        category: data.category,
        pages: +data.pages,
        author: data.author,
        description,
        image,
      });

      // Записуємо оновлений масив в файл у форматі JSON
      const dataToWrite = JSON.stringify(currentTitles, null, 2); // Форматуємо JSON для читабельності
      writeFileSync(desktopPath, dataToWrite);
      console.log(`Дані успішно збережені у файл: ${desktopPath}`);
    } catch (error) {
      console.error('Помилка при збереженні файлу:', error);
    }

    // Закриваємо браузер після кожного переходу
    await browser.close();

    // Затримка між проходами, щоб не натрапити на капчу (наприклад, 5 секунд)
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }
})();
