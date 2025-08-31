#!/usr/bin/env node
import puppeteer from 'puppeteer';

// Direct Puppeteer usage - no wrapper functions needed
const browser = await puppeteer.launch({
    headless: 'new',
    args: [
        '--no-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-images'
    ]
});

const page = await browser.newPage();

// Set realistic user agent
await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');

// Remove automation detection
await page.evaluateOnNewDocument(() => {
    delete navigator.__proto__.webdriver;
});

try {
    console.log('Scraping quotes...');
    const year = 2025;
    await page.goto(`https://www.iplt20.com/points-table/men/${year}`);
    
    // Wait for page to fully load
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Check if page loaded at all
    const pageTitle = await page.title();    

    // Try to find table element first
    try {
        await page.waitForSelector('table', { timeout: 5000 });
        console.log('Table found!');
        
        const tableData = await page.$$eval('table tr', rows => 
            rows.map(row => 
                Array.from(row.cells || row.children).map(cell => cell.textContent.trim())
            ).filter(row => row.length > 0)
        );
        
        console.log(`Found ${tableData.length} table rows:`);
        tableData.forEach((row, i) => {
            console.log(`Row ${i}:`, row);
        });
        
    } catch (tableError) {
        console.log('No table found, trying alternative selectors...');
        
        // Try ng-scope elements
        const ngElements = await page.$$eval('.ng-scope', els => 
            els.map(el => el.textContent.trim()).filter(text => text.length > 0)
        );
        
        console.log(`Found ${ngElements.length} ng-scope elements:`);
        ngElements.slice(0, 10).forEach((text, i) => {
            console.log(`${i}:`, text);
        });
    }
    
} catch (error) {
    console.error('Scraping failed:', error.message);
} finally {
    await browser.close();
}