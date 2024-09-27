const { title } = require('process');
const puppeteer = require('puppeteer');
const XLSX = require('xlsx');

(async () => {
  // Запускаємо браузер
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  // await page.goto('https://answear.ua/k/vona/odyag/sukni');
  // await page.goto('https://answear.ua/k/vona?q=%D0%A2%D0%BE%D0%BF');
  // await page.goto('https://answear.ua/k/vona/odyag/kofty');
  // await page.goto('https://answear.ua/k/vona/odyag/shorty');
  // await page.goto('https://answear.ua/k/vona/odyag/spidnytsi');
  // await page.goto('https://answear.ua/k/vona/odyag/shtany-ta-leginsy');
  // await page.goto(
  //   'https://answear.ua/k/vona?q=%D0%BA%D0%BE%D1%81%D1%82%D1%8E%D0%BC&sort=popularity',
  // );
  // await page.goto(
  //   'https://answear.ua/k/vona?q=%D0%BA%D1%83%D1%80%D1%82%D0%BA%D0%B0',
  // );
  await page.goto('https://answear.ua/k/vona/odyag/palta');
  // await page.goto(
  //   'https://answear.ua/k/vona?q=%D0%9B%D0%BE%D0%BD%D0%B3%D1%81%D0%BB%D1%96%D0%B2',
  // );
  // await page.goto(
  //   'https://answear.ua/k/vona/odyag/futbolky-i-majky?vyd=%D0%A4%D1%83%D1%82%D0%B1%D0%BE%D0%BB%D0%BA%D0%B8',
  // );
  // Можна закоментувати цей рядок, якщо не потрібен скріншот
  // await page.screenshot({ path: 'img.png' });

  // Отримуємо дані з веб-сторінки
  const results = await page.evaluate(() => {
    const items = document.querySelectorAll('[data-test="outfitProduct"]');
    // const item = document
    //   .querySelector('[data-test="outfitProduct"]')
    //   .querySelector('.Price__wrapperMain__sjWJK');
    // return item.innerHTML;
    const itemArray = Array.from(items)
      .slice(0, 10)
      .map((item) => {
        const textDiv = item.querySelector(
          '.ProductItem__productCardName__DCKIH',
        );
        const span = textDiv.querySelector('span');

        const priceDiv = item.querySelector(
          '[class^="ProductItemPrice__priceRegular"]',
        );
        const price = priceDiv.textContent;

        const imagesDiv = item.querySelector(' [class^="Image__cardImage"]');
        const imagesSourse = imagesDiv.querySelectorAll('source');

        const images = Array.from(imagesSourse).map((i) => {
          const imageUrl = i.srcset;

          return imageUrl;
        });

        const alt = imagesDiv.querySelector('img').alt;

        const card = {
          title: span.textContent.trim(),
          price,
          images: {
            mob2x: images[0].split('\n')[1].trim().split(' ')[0],
            mobBig2x: images[1].split('\n')[1].trim().split(' ')[0],
            tab2x: images[2].split('\n')[1].trim().split(' ')[0],
            desc2x: images[3].split('\n')[1].trim().split(' ')[0],
          },
          // alt: alt.split(' ')[0],
          // category: alt.split(' ')[0],
          alt:
            alt.split(' ').find((word) => word.toLowerCase() === 'пальто') ||
            alt.split(' ').find((word) => word.toLowerCase() === 'тренч'),
          category:
            alt.split(' ').find((word) => word.toLowerCase() === 'пальто') ||
            alt.split(' ').find((word) => word.toLowerCase() === 'тренч'),
          description: alt,
          color:
            alt.split(' ').indexOf('колір') !== -1
              ? alt.split(' ')[alt.split(' ').indexOf('колір') + 1]
              : null,
        };
        return card;
      });
    return itemArray;
  });

  // Виводимо результати в консоль (опціонально)
  console.log(results);

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

[
  'https://img2.ans-media.com/i/200x300/AW24-SUD1EH-99X_F1.webp?v=1725213166',
  'https://img2.ans-media.com/i/400x600/AW24-SUD1EH-99X_F1.webp?v=1725213166',
];
