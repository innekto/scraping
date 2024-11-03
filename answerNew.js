// eslint-disable-next-line @typescript-eslint/no-var-requires
import puppeteer from 'puppeteer';
import fs from 'fs'; // Додаємо модуль fs

(async () => {
  // Запускаємо браузер
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto('https://answear.ua/k/vona?q=%D1%81%D1%83%D0%BA%D0%BD%D1%8F');

  // Отримуємо дані з веб-сторінки
  const results = await page.evaluate(() => {
    const items = document.querySelectorAll('[data-test="outfitProduct"]');

    const itemArray = Array.from(items)
      .slice(0, 30)
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
          colors: [
            {
              color:
                alt.split(' ').indexOf('колір') !== -1
                  ? alt.split(' ')[alt.split(' ').indexOf('колір') + 1]
                  : null,
              images: { front: images[3].split('\n')[1].trim().split(' ')[0] },
              other: [],
            },
          ],
        };
        return card;
      });
    return itemArray;
  });

  // Зберігаємо результати у змінну finalProducts
  const finalProducts = results;

  // Записуємо finalProducts у файл
  const fileContent = `const finalProducts = ${JSON.stringify(finalProducts, null, 2)};\n\nexport default finalProducts;`;
  fs.writeFileSync('finalProducts.js', fileContent, 'utf8');

  console.log('Дані збережено у файл finalProducts.js');

  await browser.close();
})();
