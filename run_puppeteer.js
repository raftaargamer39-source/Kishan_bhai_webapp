import puppeteer from 'puppeteer';

(async () => {
  try {
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    page.on('console', msg => {
      console.log('CONSOLE:', msg.text());
    });
    page.on('pageerror', error => {
      console.log('PAGE ERROR:', error.message, error.stack);
    });
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    
    // wait a bit in case errors happen asynchronously
    await new Promise(r => setTimeout(r, 2000));
    const title = await page.title();
    console.log('PAGE TITLE:', title);
    await browser.close();
  } catch (err) {
    console.error("Puppeteer script error:", err);
  }
})();
