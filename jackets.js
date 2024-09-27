// console.log('hello');

// import { launch } from 'puppeteer';

// (async () => {
//   const browser = await launch({ headless: false });
//   const page = await browser.newPage();
//   // await page.goto('https://columbia-shop.com.ua/ua/women/dress_kp/jackets_0s');
//   // await page.goto('https://columbia-shop.com.ua/ua/men/dress/windbreaker');
//   await page.goto('https://planeta-shop.com.ua/ru/miachi-dlia-fitnesa-fitboly');
//   // await page.screenshot({path:'img.png'});

//   const results = await page.evaluate(() => {
//     const items = document.querySelectorAll('article.product-cut ');

//     const itemArray = Array.from(items).map((item) => {
//       //  const title=item.querySelector('a').title;
//       const image = item.querySelector('img.product-photo__img').src;
//       // const price=item.querySelector('.product-sales-price').innerText

//       const card = {
//         // title,
//         image,
//         // price
//       };
//       return card;
//     });

//     return itemArray;
//   });
//   console.log(results);

//   await browser.close();
// })();

const puppeteer = require('puppeteer');
const XLSX = require('xlsx');

(async () => {
  // Запускаємо браузер
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto(
    'https://partners.veeva.com/meet-veeva/partners/content/partner-finder',
  );
  // Можна закоментувати цей рядок, якщо не потрібен скріншот
  // await page.screenshot({ path: 'img.png' });

  // Отримуємо дані з веб-сторінки
  const results = await page.evaluate(() => {
    const items = document.querySelectorAll('article.product-cut');
    const itemArray = Array.from(items).map((item) => {
      const image = item.querySelector('img.product-photo__img').src;
      // Можна додати більше полів, якщо потрібно
      const card = {
        image,
      };
      return card;
    });
    return itemArray;
  });

  // Виводимо результати в консоль (опціонально)
  console.log(results);

  // Створюємо нову робочу книгу
  const workbook = XLSX.utils.book_new();

  // Перетворюємо масив об'єктів в робочий аркуш
  const worksheet = XLSX.utils.json_to_sheet(results);

  // Додаємо робочий аркуш до робочої книги
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Scraping Results');

  // Зберігаємо робочу книгу як файл Excel
  XLSX.writeFile(workbook, 'scraping_results.xlsx');

  // Закриваємо браузер
  await browser.close();
})();
