const puppeteer = require("puppeteer");

const getZillowIds = async () => {
  const params = {
    pagination: {},
    mapBounds: {
      west: -162.1132578125,
      east: -59.28122656249999,
      south: 31.07051352132537,
      north: 48.762475012009936,
    },
    mapZoom: 4,
    customRegionId: "2fff36345bX1-CRzfsard91z9mm_1111aq",
    isMapVisible: true,
    filterState: {
      "3d": { value: true },
      ah: { value: true },
      sort: { value: "globalrelevanceex" },
      land: { value: false },
    },
    isListVisible: true,
  };

  const wants = {
    cat1: ["listResults", "mapResults"],
    cat2: ["total"],
  };

  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();

  await page.goto(
    "https://www.zillow.com/homes/for_sale/?searchQueryState=%7B%22pagination%22%3A%7B%7D%2C%22mapBounds%22%3A%7B%22west%22%3A-162.1132578125%2C%22east%22%3A-59.28122656249999%2C%22south%22%3A9.16574676924911%2C%22north%22%3A61.96926165763659%7D%2C%22mapZoom%22%3A4%2C%22customRegionId%22%3A%222fff36345bX1-CRzfsard91z9mm_1111aq%22%2C%22isMapVisible%22%3Atrue%2C%22filterState%22%3A%7B%223d%22%3A%7B%22value%22%3Atrue%7D%2C%22ah%22%3A%7B%22value%22%3Atrue%7D%2C%22sort%22%3A%7B%22value%22%3A%22globalrelevanceex%22%7D%2C%22land%22%3A%7B%22value%22%3Afalse%7D%7D%2C%22isListVisible%22%3Atrue%7D"
  );

  const json = await page.evaluate(
    async (params, wants) => {
      return await new Promise(async (resolve, reject) => {
        const response = await fetch(
          `https://www.zillow.com/search/GetSearchPageState.htm?searchQueryState=${encodeURIComponent(
            JSON.stringify(params)
          )}&wants=${encodeURIComponent(JSON.stringify(wants))}&requestId=6`,
          {
            headers: {
              accept: "*/*",
              "accept-language": "en-US,en;q=0.9,pt-BR;q=0.8,pt;q=0.7",
              "cache-control": "no-cache",
              pragma: "no-cache",
              "sec-ch-ua":
                '" Not;A Brand";v="99", "Google Chrome";v="97", "Chromium";v="97"',
              "sec-ch-ua-mobile": "?0",
              "sec-ch-ua-platform": '"Windows"',
              "sec-fetch-dest": "empty",
              "sec-fetch-mode": "cors",
              "sec-fetch-site": "same-origin",
            },
            referrerPolicy: "unsafe-url",
            body: null,
            method: "GET",
            mode: "cors",
            credentials: "include",
          }
        );
        const json = await response.json();
        console.log("json", json);

        return resolve(json);
      });
    },
    params,
    wants
  );
  await page.waitForTimeout(5000);
  await browser.close();
  const zillowIDSet = new Set();
  json.cat1.searchResults.mapResults.forEach((home) => {
    zillowIDSet.add(home.zpid);
  });
  return zillowIDSet;
};

module.exports = {
  getZillowIds,
};
