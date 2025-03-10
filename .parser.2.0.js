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

    const browser = await launch({ headless: false });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });

    await page.waitForSelector('h1.title.size-sm.lg\\:size-xl.mt-4', {
      timeout: 2000,
    });

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
        'bookTitle.json',
      );

      let currentTitles = [];

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

      currentTitles.push({
        title: data.title,
        category: data.category,
        pages: +data.pages,
        author: data.author,
        description,
        image,
      });

      const dataToWrite = JSON.stringify(currentTitles, null, 2);
      writeFileSync(desktopPath, dataToWrite);
      console.log(`Дані успішно збережені у файл: ${desktopPath}`);
    } catch (error) {
      console.error('Помилка при збереженні файлу:', error);
    }

    await browser.close();
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }
})();
