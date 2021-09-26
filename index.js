const puppeteer = require('puppeteer');
const fs = require('fs');
(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(`https://data.anbima.com.br/debentures/AGRU12/agenda`);
  await page.waitForSelector('.normal-text');
  var list = [];
  while (true) {
    let nextButton;
    const listA = await page.evaluate(async () => {
      const nodeList = document.querySelectorAll(
        '.anbima-ui-table > tbody > tr'
      );
      let nodeArray = [...nodeList];
      let nextBtn = document.querySelector(
        '.anbima-ui-pagination__next-button:not(--disabled)'
      );
      let thereIsNext = document.querySelector(
        '.anbima-ui-pagination__next-button--disabled#pagination-next-button'
      );

      return [
        !thereIsNext ? nextBtn?.href : null,
        ...nodeArray
          .map((tbody) => [...tbody.children].map((td) => [...td.children]))
          .map((tr) =>
            tr.map((span) =>
              span[0].innerHTML
                .replace('<label class="flag__children">', '')
                .replace('</label>', '')
            )
          ),
      ];
    });
    list.push(listA.slice(1));
    if (!listA[0]) {
      list = list.flat(1).map((key) => ({
        ...key.map((value, index) => {
          switch (index) {
            case 0:
              return { eventDate: value };
            case 1:
              return { settlementDate: value };
            case 2:
              return { event: value };
            case 3:
              return {
                percentage:
                  Number(value.replace(' %', '').replace(',', '.')) / 100,
              };
            case 4:
              return { paymentValue: value };
            case 5:
              return { Status: value };

            default:
              break;
          }
        }),
      }));
      list = [
        list.map((obj) =>
          Object.assign(
            {},
            ...(function _flatten(o) {
              return [].concat(
                ...Object.keys(o).map((k) =>
                  typeof o[k] === 'object' ? _flatten(o[k]) : { [k]: o[k] }
                )
              );
            })(obj)
          )
        ),
      ];
      break;
    } else {
      await page.goto(listA[0]);
      await page.waitForSelector('.normal-text');
    }
  }

  fs.writeFile('eventDates.json', JSON.stringify(list[0], null, 2), (err) => {
    if (err) throw new Error('Something went wrong');

    console.log('well done you got the dates');
  });
  await browser.close();
})();
