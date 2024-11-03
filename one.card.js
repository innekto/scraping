// eslint-disable-next-line @typescript-eslint/no-var-requires
import puppeteer from 'puppeteer';
// eslint-disable-next-line @typescript-eslint/no-var-requires
import fs from 'fs'; // Додаємо модуль fs
import finalProducts from './finalProducts.js';

const t = finalProducts.slice(0, 3);
console.log('t :>> ', t);

(async () => {
  // Запускаємо браузер
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  // Функція затримки
  const delay = (time) => new Promise((resolve) => setTimeout(resolve, time));

  // Проходимо через кожен продуктnoce
  for (let product of t) {
    await page.goto(product.link);

    // Очікуємо, поки сторінка повністю завантажиться
    await page.waitForSelector('img');

    // Знайти кнопку для перегортання каруселі (якщо є)
    const nextButtonSelector =
      '.slick-arrow.slick-next.ProductCard__slickArrowThemeArrow__r7MC7.ProductCard__slickArrowThemeNext__ddu1n';

    // Прокручуємо карусель, якщо є
    for (let i = 0; i < 5; i++) {
      try {
        await page.click(nextButtonSelector);
        await delay(1000); // Невелика затримка для завантаження зображень
      } catch (e) {
        console.log('Кнопка недоступна або карусель закінчилася раніше.');
        break; // Якщо кнопка більше не доступна, виходимо з циклу
      }
    }

    // Отримуємо всі зображення
    const images = await page.evaluate(() => {
      const items = document.querySelectorAll('img');
      const imagesWithAltText = Array.from(items).filter((i) =>
        i.src.includes('540x813'),
      );
      return [...new Set(imagesWithAltText.map((img) => img.src))].filter(
        (i) => !i.includes('F1'),
      );
    });

    // Додаємо зображення до масиву other
    if (images.length > 0) {
      product.colors[0].other.push(...images);
    }

    console.log(`Оброблено: ${product.title}`);

    // Затримка на 1 секунду перед переходом до наступного товару
    await delay(1000);
  }

  // Записуємо фінальний масив продуктів у файл
  const fileContent = `const finalProducts = ${JSON.stringify(finalProducts, null, 2)};\n\nexport default finalProducts;`;
  fs.writeFileSync('finalProductsWithImages.js', fileContent, 'utf8');

  console.log('Дані збережено у файл finalProductsWithImages.js');

  await browser.close();
})();
