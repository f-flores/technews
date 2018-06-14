const Nightmare = require('nightmare');
const nightmare = Nightmare({ show: false });

const URL = 
"https://medium.com/topic/culture";
/* 'http://blog.oscarmorrison.com/nightmarejs-on-heroku-the-ultimate-scraping-setup/'; */
console.log('Welcome to Nightmare scrape\n==========');

nightmare
    .goto(URL)
    .wait('.ui-h3')
    .evaluate(() => document.querySelector('.ui-h3').textContent)
    .end()
    .then((result) => {
        console.log(result);
        console.log('=========\nAll done');
    })
    .catch((error) => {
        console.error('an error has occurred: ' + error);
    })
    .then(() => (console.log('process exit'), process.exit()));
