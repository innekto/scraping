import { launch } from 'puppeteer';
import XLSX from 'xlsx';

(async () => {
  // Запускаємо браузер
  const browser = await launch({ headless: false });
  const page = await browser.newPage();
  await page.goto(
    'https://partners.veeva.com/meet-veeva/partners/content/partner-finder',
  );
  // Можна закоментувати цей рядок, якщо не потрібен скріншот
  // await page.screenshot({ path: 'img.png' });
  const waitForAllElements = async (selector, timeout = 60000) => {
    await page.waitForFunction(
      (selector) => {
        const elements = document.querySelectorAll(selector);

        return (
          elements.length > 9 &&
          elements.length === document.querySelectorAll(selector).length
        );
      },
      { timeout },
      selector,
    );
  };
  await waitForAllElements('.row.partner-list');

  //   await page.waitForSelector('.row.partner-list');
  //   await page.waitForFunction(() => {
  //     const item = document.querySelector('h5[data-bind="html: record.title"]');
  //     return item && item.innerText.trim() !== '';
  //   });
  // Отримуємо дані з веб-сторінки
  const results = await page.evaluate(() => {
    const items = document.querySelectorAll('.row.partner-list');

    const itemsArray = Array.from(items).map((i) => {
      // Знайти всі елементи з атрибутом data-target="#myModal"
      const certElements = i.querySelectorAll('[data-target="#myModal"]');

      // Для кожного елемента з data-target="#myModal"
      const certLines = Array.from(certElements).map((c) => {
        // Знайти <span> і <em> всередині кожного елемента
        const span = c.querySelector('span');
        const em = c.querySelector('em');

        // Отримати текст з <span> та <em>, якщо вони є
        const spanText = span ? span.innerText.trim() : '';
        const emText = em ? em.innerText.trim() : '';

        // Об'єднати текст з <span> та <em> в один рядок
        return `${spanText} ${emText}`;
      });

      // Повернути масив рядків
      return certLines;
    });

    // Повернути масив масивів рядків
    return itemsArray;
  });

  // Виводимо результати в консоль (опціонально)
  console.log('results :>> ', results);

  //   // Створюємо нову робочу книгу
  //   const workbook = XLSX.utils.book_new();

  //   // Перетворюємо масив об'єктів в робочий аркуш
  //   const worksheet = XLSX.utils.json_to_sheet(results);

  //   // Додаємо робочий аркуш до робочої книги
  //   XLSX.utils.book_append_sheet(workbook, worksheet, 'Scraping Results');

  //   // Зберігаємо робочу книгу як файл Excel
  //   XLSX.writeFile(workbook, 'scraping_results.xlsx');

  // Закриваємо браузер
  await browser.close();
})();
