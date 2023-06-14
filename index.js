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
//     .then((articles) => {
//         console.log("articles", articles, articles.length);
//         trending_articles_details(articles);
//     })

async function trending_articles_details(articles) {

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


async function trending_article_thumbnails_cnn() {
    const browser = await puppeteer.launch();
    try {
        const page = await browser.newPage();
        await page.goto('https://www.cnn.com/us');

        const imageUrls = await page.$$eval('.container_lead-plus-headlines__item-media img', (images) =>
            images.map((img) => img.src)
        );

        const titles = await page.$$eval('.container_lead-plus-headlines__headline span', (spans) =>
            spans.map((span) => span.textContent)
        );

        console.log('Image URLs:');
        console.log(imageUrls);
        console.log('\nTitles:');
        console.log(titles);


    } catch (e) {
        console.log("Scrape has failed:", e);
    }
    finally {
        await browser.close();
    }

}

trending_article_thumbnails_cnn();
