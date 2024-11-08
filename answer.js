// const { title } = require('process');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const puppeteer = require('puppeteer');
// const XLSX = require('xlsx');

(async () => {
  // Запускаємо браузер
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto('https://answear.ua/k/vona?q=%D1%81%D1%83%D0%BA%D0%BD%D1%8F');

  // Отримуємо дані з веб-сторінки
  const results = await page.evaluate(() => {
    const items = document.querySelectorAll('[data-test="outfitProduct"]');

    const itemArray = Array.from(items)
      // .slice(0, 10)
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

        const link = item
          .querySelector('[data-test="productItem"]')
          .getAttribute('href');

        const card = {
          title: span.textContent.trim(),
          link: `https://answear.ua${link}`,
          price,

          images: {
            main: images[3].split('\n')[1].trim().split(' ')[0],
          },
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

  console.log(results);

  await browser.close();
})();
