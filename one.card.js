const puppeteer = require('puppeteer');
const XLSX = require('xlsx');

// (async () => {
//   // Запускаємо браузер
//   const browser = await puppeteer.launch({ headless: false });
//   const page = await browser.newPage();

//   await page.goto(
//     'https://answear.ua/p/suknya-tommy-hilfiger-kolir-synij-mini-pryama-ww0ww43230-1319762',
//   );

//   // Отримуємо результати з сторінки
//   const results = await page.evaluate(() => {
//     // Знаходимо всі img теги на сторінці
//     const items = document.querySelectorAll('img');

//     // Фільтруємо img теги, у яких атрибут alt містить 'WW0WW43230'
//     const imagesWithAltText = Array.from(items).filter((i) =>
//       i.src.includes('540x813'),
//     );
//     // Повертаємо результати
//     // return imagesWithAltText.map((img) => img.src); // Повертаємо масив URL зображень
//     const uniqueImages = [...new Set(imagesWithAltText.map((img) => img.src))];
//     return uniqueImages;
//   });

//   console.log(results);
//   await delay(15000);
//   // Закриваємо браузер
//   await browser.close();
// })();

(async () => {
  // Запускаємо браузер
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto(
    'https://answear.ua/p/futbolka-under-armour-project-rock-zhinocha-kolir-chornyj-1386440-1327770',
  );

  // Функція затримки
  const delay = (time) => new Promise((resolve) => setTimeout(resolve, time));

  // Очікуємо, поки сторінка повністю завантажиться
  await page.waitForSelector('img');

  // Знайти кнопку для перегортання каруселі (якщо є)
  const nextButtonSelector =
    '.slick-arrow.slick-next.ProductCard__slickArrowThemeArrow__r7MC7.ProductCard__slickArrowThemeNext__ddu1n'; // Замініть на фактичний селектор кнопки

  let isNextButtonVisible = true;

  // Поки кнопка перегортання є видимою, натискаємо її та чекаємо на завантаження наступних зображень
  for (let i = 0; i < 5; i++) {
    try {
      // Натискаємо кнопку перегортання
      await page.click(nextButtonSelector);

      // Чекаємо на появу нових зображень
      await delay(1000); // Невелика затримка для завантаження зображень
    } catch (e) {
      console.log('Кнопка недоступна або карусель закінчилася раніше.');
      break; // Якщо кнопка більше не доступна, виходимо з циклу
    }
  }

  // Після прокручування каруселі отримуємо всі URL зображень
  const results = await page.evaluate(() => {
    // Знаходимо всі img теги на сторінці
    const items = document.querySelectorAll('img');

    // Фільтруємо img теги, у яких атрибут alt містить 'WW0WW43230'
    const imagesWithAltText = Array.from(items).filter((i) =>
      i.src.includes('540x813'),
    );

    // Повертаємо унікальні URL зображень
    const uniqueImages = [
      ...new Set(imagesWithAltText.map((img) => img.src)),
    ].filter((i) => !i.includes('F1'));

    return uniqueImages;
  });

  console.log(results);

  // Затримка на 5 секунд перед закриттям браузера
  await delay(5000);

  // Закриваємо браузер
  await browser.close();
})();
