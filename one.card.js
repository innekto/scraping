// eslint-disable-next-line @typescript-eslint/no-var-requires
import puppeteer from 'puppeteer';
// eslint-disable-next-line @typescript-eslint/no-var-requires
import fs from 'fs';
import finalProducts from './finalProducts.js';

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  const delay = (time) => new Promise((resolve) => setTimeout(resolve, time));

  for (let product of finalProducts) {
    try {
      // Переходимо на сторінку товару
      await page.goto(product.link, { waitUntil: 'domcontentloaded' });

      // Додаємо затримку на 3 секунди, щоб всі елементи завантажилися
      await delay(3000);
      await page.waitForSelector('img');

      // Знаходимо всі доступні кольори на сторінці товару
      const colors = await page.evaluate(() => {
        const colorElements = document.querySelectorAll(
          '.ColorPicker__colors__q-7EP a',
        );
        return Array.from(colorElements).map((colorEl) => ({
          link: colorEl.href,
          name: colorEl.getAttribute('title'),
        }));
      });

      console.log(
        `Кількість кольорів для товару "${product.title}": ${colors.length}`,
      );

      const nextButtonSelector =
        '.slick-arrow.slick-next.ProductCard__slickArrowThemeArrow__r7MC7.ProductCard__slickArrowThemeNext__ddu1n';

      // Обробка першого кольору (поточна сторінка)
      if (!product.colors[0]) {
        product.colors[0] = { color: colors[0].name, other: [] }; // Ініціалізація кольору, якщо він не існує
      }

      // Збираємо зображення для першого кольору
      const imagesForFirstColor = [];

      // Прокручуємо карусель для першого кольору
      for (let i = 0; i < 5; i++) {
        const images = await page.evaluate(() => {
          const items = document.querySelectorAll('img');
          const imagesWithAltText = Array.from(items).filter((i) =>
            i.src.includes('540x813'),
          );
          return [...new Set(imagesWithAltText.map((img) => img.src))].filter(
            (i) => !i.includes('F1'),
          );
        });

        // Додаємо лише нові зображення
        imagesForFirstColor.push(
          ...images.filter((img) => !imagesForFirstColor.includes(img)),
        );

        try {
          await page.click(nextButtonSelector);
          await delay(1000); // Невелика затримка для завантаження зображень
        } catch (e) {
          console.log('Кнопка недоступна або карусель закінчилася раніше.');
          break; // Якщо кнопка більше не доступна, виходимо з циклу
        }
      }

      // Додаємо зображення до масиву other без дублікатів
      if (imagesForFirstColor.length > 0) {
        product.colors[0].other.push(...[...new Set(imagesForFirstColor)]);
      }

      // Обробка другого кольору, якщо він існує і не такий самий, як перший
      if (
        colors[1] &&
        colors[1].name.toLowerCase() !== product.colors[0].color.toLowerCase()
      ) {
        console.log(`Переходимо на другий колір: ${colors[1].name}`);
        await page.goto(colors[1].link, { waitUntil: 'domcontentloaded' });

        // Затримка на 3 секунди для завантаження сторінки другого кольору
        await delay(3000);
        await page.waitForSelector('img');

        const imagesForSecondColor = [];

        // Прокручуємо карусель для другого кольору
        for (let i = 0; i < 5; i++) {
          const images = await page.evaluate(() => {
            const items = document.querySelectorAll('img');
            const imagesWithAltText = Array.from(items).filter((i) =>
              i.src.includes('540x813'),
            );
            return [...new Set(imagesWithAltText.map((img) => img.src))].filter(
              (i) => !i.includes('F1'),
            );
          });

          // Додаємо лише нові зображення
          imagesForSecondColor.push(
            ...images.filter((img) => !imagesForSecondColor.includes(img)),
          );

          try {
            await page.click(nextButtonSelector);
            await delay(1000);
          } catch (e) {
            console.log('Кнопка недоступна або карусель закінчилася раніше.');
            break;
          }
        }

        // Додаємо зображення до масиву other без дублікатів
        if (
          imagesForSecondColor.length > 0 &&
          product.colors.color !== colors[1].name.toLowerCase()
        ) {
          product.colors.push({
            color: colors[1].name.toLowerCase(),
            images: {
              other: [...new Set(imagesForSecondColor)],
            },
          });
        }

        console.log(
          `Завантажено зображення для другого кольору: ${colors[1].name}`,
        );
      }

      console.log(`Оброблено: ${product.title}`);
      await delay(1000);
    } catch (error) {
      console.error(
        `Помилка під час обробки товару "${product.title}":`,
        error,
      );
    }
  }

  // Записуємо результати у файл
  const fileContent = `const finalProducts = ${JSON.stringify(finalProducts, null, 2)};\n\nexport default finalProducts;`;
  fs.writeFileSync('finalProductsWithImages.js', fileContent, 'utf8');

  console.log('Дані збережено у файл finalProductsWithImages.js');
  await browser.close();
})();
