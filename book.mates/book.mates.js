import { launch } from 'puppeteer';

(async () => {
  const browser = await launch({ headless: false });
  const page = await browser.newPage();
  const url = 'https://laboratory.ua/products/za-perekopom-e-zemlya';

  await page.goto(url, { waitUntil: 'networkidle2' });

  // Чекаємо, поки з'явиться зображення всередині 'picture.product-image'
  await page.waitForSelector('picture.product-image img');

  // Тепер можна безпечно працювати з document в середовищі браузера
  const data = await page.evaluate(() => {
    const picture = document.querySelector('picture.product-image img');

    const spans = document.querySelectorAll(
      'div.product-features__row span.product-features__column.product-features__values',
    );

    const spansValues = Array.from(spans).map((span) => span.innerText);
    const category = spansValues[1];
    const title = spansValues[2];
    const pages = spansValues[3];
    return {
      title,
      category,
      picture: picture ? picture.src : null,
      pages,
    };
  });

  console.log('Data:', data);

  await browser.close();
})();
