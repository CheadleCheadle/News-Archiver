const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    try {
        const page = await browser.newPage();

        await page.goto('https://www.foxnews.com/');

        const articleElements = await page.$$('.thumbs-2-7 article');

        for (const articleElement of articleElements) {
            let imageSrc;
            //To handle videos and images
            try {
                 imageSrc = await articleElement.$eval('img', img => img.src);
            } catch {
                imageSrc = await articleElement.$eval('source', video => video.src);
            }
            //---

            const title = await articleElement.$eval('.title a', anchor => anchor.textContent);
            const url = await articleElement.$eval('.title a', anchor => anchor.href);

            console.log('Image Source:', imageSrc);
            console.log('Title:', title);
            console.log('URL:', url);
            console.log('-------------------');


            // Delay Function to prevent too many requests
            // const delay = ms => new Promise(res => setTimeout(res, ms))

            // for (const article of articles) {
            //     console.log(`Going to: ${article.url}`);
            //     await page.goto(article.url);
            //     await delay(3000);
            // }

        }

    } catch (e) {
        console.log("scrape failed", e);
    }
    finally {
        await browser?.close();
    }

})();
