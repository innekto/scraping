import { launch } from 'puppeteer';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

(async () => {
  const browser = await launch({ headless: false });
  const page = await browser.newPage();
  const url = 'https://www.usatoday.com/booklist/date/2025-03-05';
  await page.goto(url, { waitUntil: 'networkidle2' });

  let allElements = [];

  while (true) {
    await page.waitForSelector('.class-TEan-75');
    await new Promise((r) => setTimeout(r, 4000));

    const elements = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('.class-TEan-75'));
      return elements.map((el) => {
        const h2Element = el.querySelector('h2.class-PdmOpB7');
        const title = h2Element?.querySelector('a')?.innerText || null;
        const authors =
          el.querySelector('.class-weYteKA')?.innerText.replace(/^by\s*/, '') ||
          null;
        const description =
          el.querySelector('div.class-wzhdcT0')?.innerText || null;
        const underDesc = el.querySelector('ul.class-3i6XWos');
        const lis = Array.from(underDesc?.querySelectorAll('li') || []);
        const genre =
          lis.length > 0 ? lis[0].innerText.replace(/^Genre:\s*/, '') : null;

        const image = el.querySelector('img.class-q6JZ8js')?.src || null;

        const orgLink = el.querySelector('li.class-X6VH3R6 a')?.href || null;

        return {
          // title,
          description,
          // authors,
          // genre,
          image,
          orgLink,
        };
      });
    });

    allElements = allElements.concat(...elements);

    const isNextDisabled = await page.evaluate(() => {
      const nextLink = document.querySelector('a[rel="next"]');
      return !nextLink || nextLink.getAttribute('aria-disabled') === 'true';
    });

    if (isNextDisabled) {
      console.log('Посилання "next" більше недоступне.');
      break;
    }

    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle2' }),
      page.click('a[rel="next"]'),
    ]);
  }

  console.log('Знайдені елементи:', allElements.length);

  // Вибираємо 50 випадкових книг
  const randomBooks = [];
  const availableBooks = [...allElements];
  while (randomBooks.length < 50 && availableBooks.length > 0) {
    const randomIndex = Math.floor(Math.random() * availableBooks.length);
    randomBooks.push(availableBooks.splice(randomIndex, 1)[0]);
  }

  // Вивести URL всіх картинок цих випадкових книг
  randomBooks.forEach((book, index) => {
    if (book.image) {
      console.log(`Картинка книги ${index + 1}: ${book.image}`);
    }
  });

  // Записуємо 50 випадкових книг у файл у корінь проєкту
  try {
    const filePath = join(__dirname, 'links.js');
    const dataToWrite = `export const randomBooks = ${JSON.stringify(randomBooks, null, 2)};\nexport default randomBooks;`;
    writeFileSync(filePath, dataToWrite);
    console.log(`Дані успішно збережені у файл: ${filePath}`);
  } catch (error) {
    console.error('Помилка при збереженні файлу:', error);
  }

  await browser.close();
})();
