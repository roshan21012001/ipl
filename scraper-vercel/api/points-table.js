const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');

export default async function handler(req, res) {
  try {
    const { year = '2025', refresh } = req.query;
    
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });
    
    const page = await browser.newPage();
    
    // Add your scraping logic here (copy from scraper/scrapers/pointsTable.js)
    // ... scraping code ...
    
    await browser.close();
    
    res.status(200).json({
      year: parseInt(year),
      teams: scrapedTeams,
      lastUpdated: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Scraping error:', error);
    res.status(500).json({ error: 'Failed to scrape data' });
  }
}