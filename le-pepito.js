import { launch } from 'puppeteer';

(async () => {
  // Запускаємо браузер
  const browser = await launch({ headless: false });
  const page = await browser.newPage();
  await page.goto(
    'https://food.bolt.eu/uk-UA/158-kyiv/p/20827-pasta-la-pepito',
  );

  const allItems = new Set(); // Для зберігання всіх знайдених елементів
  let newItemsFound = true;

  while (newItemsFound) {
    // Затримка для завантаження нових елементів
    await page.evaluate(
      () => new Promise((resolve) => setTimeout(resolve, 2000)),
    );

    // Отримання даних з веб-сторінки
    const results = await page.evaluate(() => {
      const items = document.querySelectorAll(
        '.css-175oi2r.r-1habvwh.r-18u37iz.r-1wtj0ep.r-b9tw7p.r-1udh08x',
      );
      return Array.from(items).map((item) => {
        const title =
          item.querySelector(
            '[data-testid="components.DishList.DishRow.title"]',
          )?.innerText || 'No text';

        const description =
          item.querySelector(
            '[data-testid="components.DishList.DishRow.description"]',
          )?.innerText || 'No text';

        const weight = parseFloat(description.split('г')[0].replace(',', '.'));

        const price =
          item.querySelector('[data-testid="components.Price.originalPrice"]')
            ?.innerText || 'No text';
        const formattedPrice = parseFloat(
          price.replace(',', '.').replace('₴', '').trim(),
        );

        const image = item.querySelector('img')
          ? item.querySelector('img').src
          : null;

        return {
          title,
          weight,
          composition: description,
          price: formattedPrice,
          image,
        };
      });
    });

    // Перевірка нових елементів
    newItemsFound = false;
    for (const result of results) {
      const text = result.title;
      if (!Array.from(allItems).some((item) => item.title === text)) {
        allItems.add(result);
        newItemsFound = true;
      }
    }

    // Скрол до кінця сторінки
    await page.evaluate(() => {
      window.scrollBy(0, window.innerHeight);
    });
  }

  // Перетворення Set у масив об'єктів
  const resultArray = Array.from(allItems);

  // Сортуємо за алфавітом
  resultArray.sort((a, b) => a.title.localeCompare(b.title));

  // Виведення результатів
  console.log('Результати:', resultArray);
  console.log('Кількість результатів:', resultArray.length);

  await browser.close();
})();
