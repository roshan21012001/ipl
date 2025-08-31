# Ultra-Minimal Web Scraper

Direct Puppeteer usage for headless backend scraping. No wrappers, no classes, no complexity.

## Setup

```bash
npm install
```

## Usage

```bash
npm start
```

## Customize for Your Site

Just edit `scraper.js` directly:

```javascript
import puppeteer from 'puppeteer';

const browser = await puppeteer.launch({ headless: 'new' });
const page = await browser.newPage();

try {
    // Change URL
    await page.goto('https://your-site.com');
    
    // Change selectors
    await page.waitForSelector('.your-content');
    
    // Extract your data
    const data = await page.$$eval('.your-items', els => 
        els.map(el => el.textContent.trim())
    );
    
    console.log(data);
} finally {
    await browser.close();
}
```

## Features

- ✅ Ultra-minimal (40 lines total)
- ✅ Direct Puppeteer API
- ✅ Headless backend operation
- ✅ No unnecessary abstractions