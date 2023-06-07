const puppeteer = require('puppeteer');

async function trending_article_thumbnails() {
    const browser = await puppeteer.launch();
    try {
        const page = await browser.newPage();

        await page.goto('https://www.foxnews.com/');

        const mainStory = await page.$('.story-1');
        const articleElements = await page.$$('.thumbs-2-7 article');
        // The main story isn't in the .thumbs-2-7 element so it has to be added seperately.
        articleElements.unshift(mainStory);

        const articleSelector = '.content.article-list.small-shelf article';
        const secondArticleElements = await page.$$(articleSelector);

        const articles = [];


        for (const articleElement of articleElements) {
            let imageSrc;
            //To handle videos and images
            try {
                imageSrc = await articleElement.$eval('img', img => img.src);
            } catch (e) {
                imageSrc = await articleElement.$eval('source', video => video.src);
            }
            //---
            const title = await articleElement.$eval('.title a', anchor => anchor.textContent);
            const url = await articleElement.$eval('.title a', anchor => anchor.href);

            articles.push({ imageSrc, title, url });
        }

        for (const article of secondArticleElements) {
            try {
                let imageSrc;

                try {
                    //  imageSrc = await article.$eval('img', img => img.src);
                    imageSrc = await article.$eval('img', (img) => img.getAttribute('src'));
                } catch (e) {
                    // imageSrc = await article.$eval('source', video => video.src);
                    imageSrc = await article.$eval('source', (video) => video.getAttribute('src'));
                }
                //     //---
                const title = await article.$eval('h3.title a', (a) => a.textContent);
                const url = await article.$eval('h3.title a', (a) => a.getAttribute('href'));

                articles.push({ imageSrc, title, url });

            } catch {
                break;
            }

        }

        return articles;
    } catch (e) {
        console.log("scrape failed", e);
    }
    finally {
        await browser?.close();
    }

};


trending_article_thumbnails()
.then((articles) => {
    console.log("wasd", articles, articles.length);
})

async function trending_articles_details(articles) {

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
        // Delay Function to prevent too many requests
        const delay = ms => new Promise(res => setTimeout(res, ms))

        for (const article of articles) {
            console.log(`Going to: ${article.url}`);
            await page.goto(article.url);
        //     /*
        //     Scrape article content
        //     Images
        //     Take screenshots
        //     */
            await delay(5000);
        }


}
