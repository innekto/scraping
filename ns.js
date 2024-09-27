const puppeteer = require('puppeteer');
const XLSX = require('xlsx');

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto(
    'https://partners.veeva.com/meet-veeva/partners/content/partner-finder',
  );

  const scrollUntilLoaded = async () => {
    let previousCount = 0;
    while (true) {
      // Скролимо вниз
      await page.evaluate(() => {
        window.scrollBy(0, window.innerHeight);
      });

      // Затримка для завантаження нових елементів
      await new Promise((resolve) => setTimeout(resolve, 40000));

      // Отримуємо кількість елементів
      const count = await page.evaluate((selector) => {
        return document.querySelectorAll(selector).length;
      }, '.row.partner-list');

      // Якщо кількість елементів не змінилася, виходимо з циклу
      if (count === previousCount) {
        break;
      }
      previousCount = count;
    }
  };

  const getData = async () => {
    await scrollUntilLoaded();

    // Отримуємо дані з веб-сторінки
    const results = await page.evaluate(() => {
      const items = document.querySelectorAll('.row.partner-list');

      return Array.from(items).map((i) => {
        const name = i.querySelector('h5')?.innerText || 'N/A';
        const description =
          i.querySelector('div[data-bind="html: record.content"]')?.innerText ||
          'N/A';
        const partnership =
          i.querySelector(
            '[data-bind="text: getPartnerTypes(record.partner_types)"]',
          )?.innerText || 'N/A';
        const companySpan = i.querySelector(
          '[data-bind="html: record.company_size.length > 0 ? record.company_size[0].name : \'\'"]',
        );
        const companySize = companySpan ? companySpan.innerText : 'N/A';
        const locationSpan = i.querySelector(
          '[data-bind="text: record.office_location"]',
        );
        const location = locationSpan ? locationSpan.innerText : 'N/A';
        const linkElement = i.querySelector(
          '[data-bind="attr: { href: record.link_url }, html: record.link_name"]',
        );
        const webPage = linkElement ? linkElement.getAttribute('href') : 'N/A';
        const centersOfExcellenceElement = i.querySelector(
          '[data-bind="text: record.centers_of_excellence"]',
        );
        const centersOfExcellence = centersOfExcellenceElement
          ? centersOfExcellenceElement.innerText
          : 'N/A';
        const affiliatesElements = i.querySelector(
          '[data-bind="text: record.affiliates"]',
        );
        const affiliates = affiliatesElements
          ? affiliatesElements.innerText
          : 'N/A';
        const learnMoreElements = i.querySelector(
          '[data-bind="attr: { href: record.download_url }, html: record.download_name"]',
        );
        const learnMore = learnMoreElements
          ? learnMoreElements.getAttribute('href')
          : 'N/A';
        const certElements = i.querySelectorAll('[data-target="#myModal"]');
        const certLines = Array.from(certElements).map((c) => {
          const span = c.querySelector('span');
          const em = c.querySelector('em');
          const spanText = span ? span.innerText.trim() : '';
          const emText = em ? em.innerText.trim() : '';
          return `${spanText} ${emText}`;
        });

        return {
          partnerName: name,
          description,
          partnership,
          companySize,
          location,
          webPage,
          centersOfExcellence,
          affiliates,
          learnMore,
          certLines: certLines.join('; '), // Join lines with semicolon
        };
      });
    });
    return results;
  };

  // Отримуємо дані
  const results = await getData();

  // Перевіряємо структуру результатів
  // console.log('Results:', results);
  console.log('Total number of items:', results.length);

  // Перевіряємо, чи є в результатах масив об'єктів
  if (
    Array.isArray(results) &&
    results.length > 0 &&
    typeof results[0] === 'object'
  ) {
    // Переобразуємо результати в формат таблиці
    const ws = XLSX.utils.json_to_sheet(results);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Partners');

    // Зберігаємо таблицю як Excel файл
    XLSX.writeFile(wb, 'partners.xlsx');

    console.log('Results have been saved to partners.xlsx');
  } else {
    console.error('Results are not in the expected format.');
  }

  await browser.close();
})();
