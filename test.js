const puppeteer = require("puppeteer");
const Home = require("./models/home");
const database = require("./database");
const urls = new Set();

const getUrls = async (pageNum) => {
  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();
  await page.goto(
    `https://www.redfin.com/city/16409/CA/Sacramento/filter/has-virtual-tour,viewport=41.37847:36.16628:-115.39969:-123.21097,no-outline/page-${pageNum}`
  );

  await page.waitForTimeout(2000);
  let anchorElArr = await page.evaluate(async () => {
    window.scrollTo(0, window.document.body.scrollHeight);
    let anchorElArr = [];
    let anchorEls = document.querySelectorAll(".bottomV2 > a");
    anchorEls.forEach((el) => anchorElArr.push(el.href));
    return anchorElArr;
  });
  anchorElArr.forEach((elHref) => urls.add(elHref));
  await browser.close();
};

const visitUrls = async (url) => {
  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(0);
  await page.goto(url);
  let houseDetails = await page.evaluate(() => {
    let houseDetails = {};
    try {
      houseDetails.address = document.querySelector(
        `[data-rf-test-id="abp-cityStateZip"]`
      ).innerHTML;
      houseDetails.price = document.querySelector(
        `[data-rf-test-id="abp-price"] > .statsValue`
      ).innerHTML;
      houseDetails.tourUrl = document.querySelector(
        ".entryItemContent > span > a"
      ).href;
      return houseDetails;
    } catch (e) {
      console.log(e);
      houseDetails.address = "";
      houseDetails.price = "";
      houseDetails.tourUrl = "";
      return houseDetails;
    }
  });
  await browser.close();
  if (Home.findOne({ tourUrl: houseDetails.tourUrl })) {
    await Home.create({
      address: houseDetails.address.replace(/(?:<!-- -->)/g, ""),
      price: houseDetails.price,
      tourUrl: houseDetails.tourUrl,
    });
  }
};

(async () => {
  database.start();

  getUrls(1);
  getUrls(2);
  getUrls(3);
  getUrls(4);
  getUrls(5);
  getUrls(6);
  getUrls(7);
  getUrls(8);
  await getUrls(9);
  for (let i = 0; i < urls.size; i++) {
    let url = [...urls][i];
    await visitUrls(url);
  }
})();
