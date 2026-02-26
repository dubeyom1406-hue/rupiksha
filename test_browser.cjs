const puppeteer = require('puppeteer');
(async () => {
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        page.on('console', msg => {
            if (msg.type() === 'error') {
                console.log('BROWSER ERROR:', msg.text());
            }
        });
        page.on('pageerror', error => {
            console.log('PAGE ERROR:', error.message);
        });
        await page.goto('http://localhost:5173/admin', { waitUntil: 'networkidle0' });
        console.log('Finished capturing.');
        await browser.close();
    } catch (err) {
        console.error('SCRIPT ERROR:', err);
    }
})();
