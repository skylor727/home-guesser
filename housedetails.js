const puppeteer = require("puppeteer");
const indexModule = require("./index");
const Home = require("./models/home");
const database = require("./database");

const getHouseDetails = async (zpid) => {
  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();
  await page.goto(`https://www.zillow.com/homedetails/${zpid}_zpid/?`);
  const houseDetails = await page.evaluate(async () => {
    let houseDetail = {};
    try {
      const address = document.querySelector(
        `.summary-container > div > div > div > div > div > h1`
      ).innerText;
      const price = document.querySelector(
        `[data-testId="price"] > span`
      ).innerText;
      const imageUrl = document.querySelector(
        "ul > li > button figure > img"
      ).src;
      const modelId = imageUrl
        .match(/\/models\/(.*)\//g)[0]
        .replaceAll("/models/", "")
        .replaceAll("/", "");
      const tourUrl = `https://my.matterport.com/show/?m=${modelId}&amp;play=1`;
      houseDetail.tourUrl = tourUrl;
      houseDetail.price = price;
      houseDetail.address = address;
      return houseDetail;
    } catch (err) {
      houseDetail.tourUrl = null;
      houseDetail.price = null;
      houseDetail.address = null;
      return houseDetail;
    }
  });
  await browser.close();
  return houseDetails;
};

(async () => {
  database.database();
  const zillowIds = await indexModule.getZillowIds();
  for (let i = 0; i < zillowIds.size; i++) {
    let zpid = [...zillowIds][i];
    let houseDetail = await getHouseDetails(zpid);
    if (houseDetail.tourUrl && !Home.findOne({ zpid: zpid })) {
      Home.create({
        address: houseDetail.address,
        price: houseDetail.price,
        tourUrl: houseDetail.tourUrl,
        zillowId: zpid,
      });
    }
    console.log(houseDetail);
  }
})();
