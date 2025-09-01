import { createBrowser, createPage, waitForPageLoad } from '../utils/browser-playwright.js';

export async function scrapeMatches(year = 2025, sharedBrowser = null) {
    const browser = sharedBrowser || await createBrowser();
    const shouldCloseBrowser = !sharedBrowser;
    
    try {
        const page = await createPage(browser);
        
        console.log(`🏆 Loading matches for ${year}...`);
        
        // Try current year first, fallback to 2024 if no data
        let url = `https://www.iplt20.com/matches/results/${year}`;     
        await page.goto(url);
        await waitForPageLoad(page);
        
        // Wait for match elements to load
        
        try {
            // Look for match containers
            const matches = await page.evaluate(() => {
                const matchElements = Array.from(document.querySelectorAll('*')).filter(el => {
                    const text = el.textContent || '';
                    return text.includes('vs') || text.includes('V/S') || 
                           text.includes('Match') || text.includes('Final') ||
                           text.includes('Qualifier') || text.includes('Eliminator');
                });
                
                const matchesData = [];
                
                matchElements.forEach((element, index) => {
                    if (matchesData.length >= 50) return; // Limit matches
                    
                    const text = element.textContent || '';
                    
                    // Basic match parsing
                    if (text.includes('vs') || text.includes('V/S')) {
                        const matchInfo = {
                            id: matchesData.length + 1,
                            matchNumber: matchesData.length + 1,
                            teams: text.split(/vs|V\/S/i).map(t => t.trim()).slice(0, 2),
                            date: new Date().toISOString().split('T')[0], // Placeholder
                            venue: 'Stadium', // Placeholder
                            status: 'Completed',
                            result: text.includes('won') ? text : 'Match completed',
                            extracted: new Date().toISOString()
                        };
                        
                        if (matchInfo.teams.length === 2 && matchInfo.teams[0] && matchInfo.teams[1]) {
                            matchesData.push(matchInfo);
                        }
                    }
                });
                
                return matchesData;
            });
            
            console.log(`✅ Found ${matches.length} matches for ${year}`);
            
            await page.close();
            
            return matches;
            
        } catch (error) {
            console.log(`⚠️ Error parsing matches for ${year}:`, error.message);
            await page.close();
            return [];
        }
        
    } catch (error) {
        console.error('❌ Error scraping matches:', error.message);
        return [];
    } finally {
        if (shouldCloseBrowser && browser) {
            await browser.close();
        }
    }
}