const puppeteer = require('puppeteer');
const fs = require('fs');

const website_url = "https://sea.mashable.com/";


async function main(web_url) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(web_url);

    results = [];

    // main article
    const hero_main = await page.evaluate(() => {
        const article_hero_main = document.querySelectorAll("div.hero_main_story");

        return  Array.from(article_hero_main).map((article) => {
            const title = article.querySelector('a').querySelector('h1').textContent.trim();
            const url = article.querySelector('a').href;
            
            return { title, url };
        });
    });
    results = results.concat(hero_main);

    // sub main articles
    const hero_mob = await page.evaluate(() => {
        const article_hero_mob = document.querySelectorAll("div.hero_mob_box");

        return  Array.from(article_hero_mob).map((article) => {
            const title = article.querySelector('a').querySelector('span.hero_story').textContent.trim();
            const url = article.querySelector('a').href;
            
            return { title, url };
        });
    });
    results = results.concat(hero_mob);

    // trending tab area
    const trending = await page.evaluate(() => {
        const article_trending = document.querySelectorAll("div.w-full.justify-center.mt-4.lg\\:max-w-xs.mx-auto");

        return  Array.from(article_trending).map((article) => {
            const title = article.querySelector('a').textContent.trim();
            const url = article.querySelector('a').href;
            
            return { title, url };
        });
    });
    results = results.concat(trending);

    // generally the rest of the article contained in box_title
    const box = await page.evaluate(() => {
        const article_box = document.querySelectorAll(".box_title");


        return  Array.from(article_box).map((article) => {
            const title = article.textContent.trim();
            const url = article.href;
            
            return { title, url };
        });
    });
    results = results.concat(box);

    // Latest tab area
    const latest = await page.evaluate(() => {
        const article_latest = document.querySelectorAll("li.blogroll.DEAL, li.blogroll.ARTICLE");

        return  Array.from(article_latest).map((article) => {
            const title = article.querySelector('div.caption').textContent.trim();
            const url = article.querySelector('a').href;
            
            return { title, url };
        });
    });
    results = results.concat(latest);

    const newResults = results.filter(item => !item.url.includes("youtu.be"));

    // adding date to all articles
    for (let i=0; i<newResults.length; i++) {
        article = newResults[i];
        await page.goto(article.url);
        const rawDate = await page.evaluate(() => {
            return document.querySelector("time").getAttribute("datetime");
        });
        
        const dateObj = new Date(rawDate);
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        const formatDate = year + '-' + month + '-' + day;
        article.date = formatDate;
    }

    const filteredResults = newResults.filter(item => item.date.startsWith('2023'));
    filteredResults.sort((a, b) => new Date(b.date) - new Date(a.date));

    const jsonData = JSON.stringify(filteredResults);
    fs.writeFileSync('headlines.json', jsonData);
}

main(website_url);