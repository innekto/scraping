const puppeteer = require('puppeteer');
const XLSX = require('xlsx');

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto(
    'https://partners.veeva.com/meet-veeva/partners/content/partner-finder',
  );

  const waitForAllElements = async (selector, timeout = 60000) => {
    await page.waitForFunction(
      (selector) => {
        const elements = document.querySelectorAll(selector);
        return (
          elements.length > 9 &&
          elements.length === document.querySelectorAll(selector).length
        );
      },
      { timeout },
      selector,
    );
  };
  await waitForAllElements('.row.partner-list');

  // Отримуємо дані з веб-сторінки
  const results = await page.evaluate(() => {
    const items = document.querySelectorAll('.row.partner-list');

    const itemsArray = Array.from(items).map((i) => {
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
        '[data-bind="text:  record.office_location"]',
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

    return itemsArray;
  });

  // Переобразуємо результати в формат таблиці
  const ws = XLSX.utils.json_to_sheet(results);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Partners');

  // Зберігаємо таблицю як Excel файл
  XLSX.writeFile(wb, 'partners.xlsx');

  console.log('Results have been saved to partners.xlsx');

  await browser.close();
})();
