const iconv = require("iconv-lite");
var fs = require('fs');
const https = require("https");
var cheerio = require('cheerio');

const date = Date.now();

function decodeUrl(url, i) {
    https.get(url, (res) => {
        res.pipe(iconv.decodeStream("win1251")).collect((err, html) => {
            if (err) throw err;
            var $ = cheerio.load(html);
            let nameArr = [1, 6, 7];
            let socialArr = [9, 10, 11, 12, 13, 14, 15];
            let emailArr = [16];
            let siteArr = [17];
            $(`.windowbg > table > tbody > tr:nth-child(6) > td:last-child`).filter(function() {
                if ($(this).text().trim() === 'Кому я изменил репутацию') {
                    nameArr = [1, 7, 8];
                    socialArr = [10, 11, 12, 13, 14, 15, 16];
                    emailArr = [17];
                    siteArr = [18];
                }
            });
            let outLine = i + '||';
            // Name, date
            nameArr.forEach(j => {
                $(`.windowbg > table > tbody > tr:nth-child(${j}) > td:last-child`).filter(function() {
                    if ($(this).text().trim() !== '') outLine += $(this).text().trim() + '||';
                    else outLine += ' ||';
                });
            });
            // VK - ICQ
            socialArr.forEach(j => {
                let flag = false;
                $(`.windowbg > table > tbody > tr:nth-child(${j}) > td:last-child`).filter(function() {
                    if ($(this).text() === '') flag = true;
                });
                if (flag === false) {
                    $(`.windowbg > table > tbody > tr:nth-child(${j}) > td:last-child > a`).filter(function() {
                        outLine += $(this).attr('href').trim() + '||';
                    })
                } else outLine += ' ||';
            });
            // email
            emailArr.forEach(j => {
                $(`.windowbg > table > tbody > tr:nth-child(${j}) > td:last-child > i`).filter(function() {
                    if ($(this).text().trim() === 'скрытый') outLine += $(this).text().trim() + '||';
                });
                $(`.windowbg > table > tbody > tr:nth-child(${j}) > td:last-child > a`).filter(function() {
                    outLine += $(this).attr('href').trim() + '||';
                });
            });
            // site
            siteArr.forEach(j => {
                $(`.windowbg > table > tbody > tr:nth-child(${j}) > td:last-child > noindex > a`).filter(function() {
                    if ($(this).attr('href').trim() === '') outLine += ' ||';
                    else outLine += $(this).attr('href').trim() + '||';
                });
            });
            if (outLine.length > 10) {
                fs.appendFile(`${__dirname}/out/${date}.txt`, outLine + '\n', (err) => {
                    if (err) throw err;
                    console.log(`${i} written!`);
                });
            };
        });
    }).on("error", function(e) {
        console.log(i + ': ' + e)
        fs.appendFile(`${__dirname}/out/${date}Errors.txt`, i + '\n', (err) => {
            if (err) throw err;
        });
    });
};

let interval = 0;
for (let i = 1; i < 100000; i++) {
    setTimeout(function() {
        decodeUrl("https://forum.grodno.net/index.php?action=profile;u=" + i, i)
    }, interval += 30);
}