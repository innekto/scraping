import { launch } from 'puppeteer';
import { writeFileSync } from 'fs';

(async () => {
  // Запуск браузера
  const browser = await launch({ headless: false }); // headless: false відкриває браузер з UI
  const page = await browser.newPage();

  // Перехід на сторінку
  const url = 'https://www.usatoday.com/booklist';
  await page.goto(url, { waitUntil: 'networkidle2' }); // Очікуємо, поки всі запити завершаться

  let allElements = [];

  while (true) {
    // Чекаємо на елементи з класом .class-TEan-75
    await page.waitForSelector('.class-TEan-75');

    // Затримка 4 секунди
    await new Promise((resolve) => setTimeout(resolve, 4000)); // 4000 мс = 4 секунди

    // Збираємо елементи з поточної сторінки
    const elements = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('.class-TEan-75'));
      const result = elements.map((el) => {
        const h2Element = el.querySelector('h2.class-PdmOpB7');
        const title = h2Element?.querySelector('a')?.innerText || null;

        const authors =
          el.querySelector('.class-weYteKA')?.innerText.replace(/^by\s*/, '') ||
          null;

        const description =
          el.querySelector('div.class-wzhdcT0')?.innerText || null;

        const underDesc = el.querySelector('ul.class-3i6XWos');
        const lis = Array.from(underDesc.querySelectorAll('li'));

        const genre = lis[0].innerText.replace(/^Genre:\s*/, '');
        const published = lis[1].innerText.replace(/^Published:\s*/, '');

        return { title, description, authors, genre, published };
      });
      return result;
    });

    // Додаємо елементи до загального масиву
    allElements = allElements.concat(...elements);

    // Перевіряємо, чи існує посилання "next" і чи воно активне
    const isNextDisabled = await page.evaluate(() => {
      const nextLink = document.querySelector('a[rel="next"]');
      return !nextLink || nextLink.getAttribute('aria-disabled') === 'true';
    });

    if (isNextDisabled) {
      console.log('Посилання "next" більше недоступне.');
      break;
    }

    // Натискаємо на посилання "next"
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle2' }), // Чекаємо переходу на наступну сторінку
      page.click('a[rel="next"]'), // Натискаємо на посилання
    ]);
  }

  console.log('Знайдені елементи:', allElements);

  // Збереження масиву в файл
  try {
    const dataToWrite = `const allElements = ${JSON.stringify(allElements, null, 2)};\nexport default allElements;`;
    writeFileSync('allElements.js', dataToWrite);
    console.log('Дані успішно збережені у файл allElements.js');
  } catch (error) {
    console.error('Помилка при збереженні файлу:', error);
  }

  // Закриваємо браузер
  await browser.close();
})();
