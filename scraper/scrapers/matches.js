import { createBrowser, createPage, waitForPageLoad, respectfulDelay } from '../utils/browser.js';

export async function scrapeMatches(year = 2025) {
    const browser = await createBrowser();
    
    try {
        const page = await createPage(browser);
        
        console.log(`🏆 Loading matches for ${year}...`);
        await respectfulDelay(); // Add delay before request
        
        // Try current year first, fallback to 2024 if no data
        let url = `https://www.iplt20.com/matches/results/${year}`;     
        await page.goto(url);
        await waitForPageLoad(page);
        
        // Wait for match elements to load
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Check for pagination or load more buttons
        const paginationInfo = await page.evaluate(() => {
            const loadMore = document.querySelector('[class*="load"], [class*="more"], [class*="show"]');
            const pagination = document.querySelectorAll('[class*="page"], [class*="next"]');
            const totalMatches = document.querySelectorAll('.vn-shedule-desk').length;
            
            return {
                hasLoadMore: !!loadMore,
                hasPagination: pagination.length > 0,
                totalOnPage: totalMatches,
                loadMoreText: loadMore?.textContent || null
            };
        });
        
        console.log('📊 Page info:', paginationInfo);
        
        // Try different selectors for matches
        let matches = [];
        
        try {
            // Look for match containers - get ALL matches without filtering
            const matchElements = await page.$$eval('.vn-shedule-desk', elements => {
                return elements.map(el => {
                    const text = el.textContent.trim();
                    // Return all match text - remove restrictive filters
                    return text.length > 0 ? text : null;
                }).filter(text => text !== null);
            });
            
            matches = matchElements;
            
        } catch (error) {
            console.log('⚠️ Could not find specific match elements, trying alternative approach...');
            
            // Fallback: extract any text that looks like matches
            const pageText = await page.evaluate(() => document.body.innerText);
            const lines = pageText.split('\n').filter(line => 
                line.includes('vs') || line.includes('V/S') || 
                /[A-Z]{2,4}.*[A-Z]{2,4}/.test(line)
            );
            
            matches = lines;
        }
        
        return matches.map((match, index) => ({
            id: index + 1,
            description: match,
            extracted: new Date().toISOString()
        }));
        
    } catch (error) {
        console.error('❌ Error scraping matches:', error.message);
        return [];
    } finally {
        await browser.close();
    }
}