const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  page.on('response', response => {
    if (!response.ok()) {
      console.log('FAILED RESPONSE:', response.url(), response.status());
    }
  });

  try {
    await page.goto('https://ai-call-command.vercel.app/', { waitUntil: 'networkidle0' });
    console.log('Page loaded successfully.');
    
    // Check if body is empty
    const bodyHTML = await page.evaluate(() => document.body.innerHTML);
    console.log('BODY HTML LENGTH:', bodyHTML.length);
  } catch (err) {
    console.error('ERROR NAVIGATING:', err);
  } finally {
    await browser.close();
  }
})();
