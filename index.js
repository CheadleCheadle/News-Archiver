const puppeteer = require('puppeteer');

async function trending_article_thumbnails_fox() {
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

        const articles = {};


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

            articles[title] = { imageSrc, title, url };
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
                // Ignore HTML Element that contains the Daily Crossword Puzzle
                if (title !== "PLAY HERE: Check out the latest edition of the Fox News Daily Crossword Puzzle") {
                    articles[title] = { imageSrc, title, url };
                }

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


// trending_article_thumbnails_fox()
// .then((articles) => {
    //      console.log("articles", articles, articles.length);
    //       trending_articles_details_fox(articles);
    //    })

async function trending_articles_details_fox(articles) {

    // Delay Function to prevent too many requests within a short timespan
    const delay = ms => new Promise(res => setTimeout(res, ms))

    const articleDetails = {};

    const browser = await puppeteer.launch();
    try {

        const page = await browser.newPage();

        for (const title in articles) {
            const article = articles[title];
            console.log(`Going to: ${article.url}`);
            await page.goto(article.url);
            //     /*
                //     Scrape article content
            //     Images
            //     Take screenshots
            //     */
                // --- Try Catch to handle redirects to video pages and article pages.
                let publishingDate;
            let headline;
            let subheadline;
            let articleParagraphs;
            try {
                publishingDate = await page.$eval('.article-date time', element => element.textContent.trim());
                headline = await page.$eval('.headline', element => element.textContent.trim());
                subheadline = await page.$eval('.sub-headline', element => element.textContent.trim());
                articleParagraphs = await page.$$eval('.article-body p', paragraphs => {
                    return paragraphs.map(p => p.textContent.trim());
                });
                articleDetails[headline] = { headline, subheadline, articleParagraphs }
            } catch {
                // --- Video Page HTML format is different
                try {
                    publishingDate = await page.$eval('.publish-date time', element => element.textContent.trim());
                } catch {
                    publishingDate = await page.$eval('.live', element => element.textContent.trim());
                }
                headline = await page.$eval('.title', element => element.textContent.trim());
                subheadline = await page.$eval('.dek', element => element.textContent.trim());
                articleParagraphs = await page.$$eval('.article-body p', paragraphs => {
                    return paragraphs.map(p => p.textContent.trim());
                });

                articleDetails[headline] = { headline, subheadline, articleParagraphs }
            }

            await delay(2000);
        }
    } catch (e) {
        console.log("Scrape failed", e);
    }
    finally {
        browser?.close();
    }

    console.log(articleDetails);

}

// Scrape trending article thumbnails from CNN
async function trending_article_urls() {
    // Query for all HREFS and then filter locally to get everything
    //
    const browser = await puppeteer.launch();
    try {

        const page = await browser.newPage();
        await page.goto('https://www.cnn.com/us');

        const urls = await page.evaluate(() => {
            const articles = Array.from(document.querySelectorAll('.container_lead-plus-headlines__item'));
            return articles.map(article => {
                const linkElement = article.querySelector('.container__link');
                // Filter out all hrefs that dont specifically go to CNN;
                const url = linkElement.href;
                if (url.split('').slice(0, 19).join('') == 'https://www.cnn.com') {
                    return linkElement.href;
                }
            });
        });

        console.log("hi",urls[0].split('').slice(0, 19).join(''));
        return urls;

    } catch (e) {
        console.log("Scrape has failed:", e);
    }
    finally {
        await browser.close();
    }

}

async function trending_articles_details_cnn(urls) {
    console.log("These are the URLS for the func", urls)
    const browser = await puppeteer.launch();
    const delay = ms => new Promise(res => setTimeout(res, ms))
    try {
        const page = await browser.newPage();

        for (url of urls) {
            try {
                await page.goto(url)
                console.log('Going to', url);
                const title = await page.$eval('.headline__wrapper h1', (title) => {
                    return title.textContent;
                })
                //const title = await page.$('.headline__text').textContent;
                console.log("title", title);











            } catch (error) {
                console.log("Failed to goto new URL", error);
            }
            await delay(2000);
        }

    } catch(e) {
        console.log("Whole thing failed...", e);
    }
    finally {
        await browser.close();
    }

}

// Test Invocation
const urls = trending_article_urls()
    .then((d) => {
        //console.log("These are the URLS",d);
        trending_articles_details_cnn(d);
    });

/*
    * Don't need to scrape the thumbnails and titles;
* Just scrape each article details and use info collected there to create trending_article_thumbnails_cnn
    * 
    */
