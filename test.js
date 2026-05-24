const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  await page.goto('http://localhost:3000/?geo=pe', { waitUntil: 'networkidle2' });
  
  try {
    // We want to click "ACTIVAR HÁBITOS" inside "LO MÁS POPULAR" section.
    // Let's just click the first element that has the text "ACTIVAR HÁBITOS"
    const elements = await page.$$('a, button');
    for (const el of elements) {
      const text = await page.evaluate(el => el.textContent, el);
      if (text && text.includes('ACTIVAR HÁBITOS')) {
        await el.click();
        break;
      }
    }
    
    // Wait for modal to render
    await new Promise(r => setTimeout(r, 2000));
  } catch (err) {
    console.error('Script Error:', err);
  }
  
  await browser.close();
})();
