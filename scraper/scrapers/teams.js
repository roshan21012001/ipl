import { createBrowser, createPage, waitForPageLoad, respectfulDelay } from '../utils/browser.js';

export async function scrapeTeams(year = 2025) {
    const browser = await createBrowser();
    
    try {
        const page = await createPage(browser);
        
        console.log(`👥 Loading teams data from iplt20.com/teams...`);
        await respectfulDelay();
        await page.goto(`https://www.iplt20.com/teams`);
        await waitForPageLoad(page);
        
        // Wait for team elements to load
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        let teams = [];
        
        try {
            // Enhanced approach: get team data with championships using the specific structure
            const teamData = await page.evaluate(() => {
                const teamsFound = [];
                
                // Get all team links
                const teamLinks = document.querySelectorAll('a[href*="/teams/"]');
                
                teamLinks.forEach((link, index) => {
                    const href = link.href;
                    const text = link.textContent?.trim() || '';
                    
                    // Extract team code from URL
                    const urlMatch = href.match(/\/teams\/([a-z\-]+)/i);
                    if (!urlMatch) return;
                    
                    const teamCode = urlMatch[1];
                    
                    // Only add if this looks like a real team page
                    if (teamCode && teamCode !== 'teams' && teamCode.length > 2) {
                        // Clean up team name
                        let teamName = text.replace(/\s+/g, ' ').replace(/\n+/g, ' ').trim();
                        
                        // Extract clean team name
                        const cleanMatch = teamName.match(/([A-Za-z\s]+?)(?:\s+\d+|\s*$)/);
                        if (cleanMatch && cleanMatch[1] && cleanMatch[1].trim().length > 3) {
                            teamName = cleanMatch[1].trim();
                        }
                        
                        if (!teamName || teamName.length < 3) {
                            teamName = teamCode.split('-')
                                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                .join(' ');
                        }
                        
                        // Map team codes to standard abbreviations
                        const teamAbbreviations = {
                            'chennai-super-kings': 'CSK',
                            'delhi-capitals': 'DC',
                            'gujarat-titans': 'GT',
                            'kolkata-knight-riders': 'KKR',
                            'lucknow-super-giants': 'LSG',
                            'mumbai-indians': 'MI',
                            'punjab-kings': 'PBKS',
                            'rajasthan-royals': 'RR',
                            'royal-challengers-bengaluru': 'RCB',
                            'sunrisers-hyderabad': 'SRH'
                        };
                        
                        const shortName = teamAbbreviations[teamCode.toLowerCase()] || 
                                        teamCode.toUpperCase().replace(/-/g, '');
                        
                        // Find the team container for this specific team link
                        let image = '';
                        let championships = '';
                        let totalTitles = 0;
                        
                        // Find the most specific container for this team
                        // Try multiple levels of containers to find the team-specific section
                        let teamContainer = link;
                        let foundTeamData = false;
                        
                        for (let level = 0; level < 5 && !foundTeamData; level++) {
                            teamContainer = teamContainer.parentElement;
                            if (!teamContainer) break;
                            
                            // Look for team logo in this container level
                            if (!image) {
                                const imgElements = teamContainer.querySelectorAll('img');
                                for (const imgElement of imgElements) {
                                    const imgSrc = imgElement.src;
                                    const lowerImgSrc = imgSrc.toLowerCase();
                                    
                                    // Check if this is a team logo based on URL patterns
                                    if (lowerImgSrc.includes('logos') || lowerImgSrc.includes('logooutline')) {
                                        // Check if the image src contains team-specific identifiers
                                        if (lowerImgSrc.includes(`/${shortName.toLowerCase()}/`) || 
                                            lowerImgSrc.includes(`${shortName.toLowerCase()}outline`) ||
                                            lowerImgSrc.includes(`/${shortName.toLowerCase()}.png`) ||
                                            lowerImgSrc.includes(teamCode.toLowerCase()) ||
                                            lowerImgSrc.includes(`ipl/${shortName.toLowerCase()}/`)) {
                                            image = imgSrc;
                                            break;
                                        }
                                    }
                                }
                            }
                            
                            // Look for championship data in this container level
                            if (!championships) {
                                const teamOnHoverElements = teamContainer.querySelectorAll('.team-on-hover');
                                
                                // Check each team-on-hover element to see if it's closest to our team link
                                for (const teamOnHover of teamOnHoverElements) {
                                    const trophyTextAlign = teamOnHover.querySelector('.trophy-text-align');
                                    if (trophyTextAlign) {
                                        const championshipText = trophyTextAlign.textContent?.trim();
                                        if (championshipText && championshipText.match(/^\d{4}(\s*\|\s*\d{4})*$/)) {
                                            // Check if this championship data is spatially close to our team link
                                            const linkRect = link.getBoundingClientRect();
                                            const trophyRect = teamOnHover.getBoundingClientRect();
                                            const distance = Math.abs(linkRect.top - trophyRect.top) + Math.abs(linkRect.left - trophyRect.left);
                                            
                                            // If this is the first match or closer than previous matches
                                            if (distance < 200) { // Within 200px distance
                                                championships = championshipText;
                                                totalTitles = championshipText.split('|').length;
                                                foundTeamData = true;
                                                break;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        
                        teamsFound.push({
                            id: `team-${index}`,
                            name: teamName,
                            shortName: shortName,
                            link: href,
                            image: image,
                            championships: championships,
                            totalTitles: totalTitles,
                            isChampion: totalTitles > 0,
                            extracted: new Date().toISOString()
                        });
                    }
                });
                
                return teamsFound;
            });
            
            console.log(`🔍 Found ${teamData.length} potential team elements`);
            
            // Deduplicate teams using URL codes
            const uniqueTeams = new Map();
            teamData.forEach(team => {
                if (team.link && team.link.includes('/teams/')) {
                    const urlMatch = team.link.match(/\/teams\/([a-z\-]+)/i);
                    if (urlMatch) {
                        const key = urlMatch[1].toLowerCase();
                        if (!uniqueTeams.has(key)) {
                            uniqueTeams.set(key, team);
                        }
                    }
                }
            });
            
            teams = Array.from(uniqueTeams.values()).map((team, index) => ({
                id: index + 1,
                name: team.name,
                shortName: team.shortName,
                link: team.link,
                image: team.image,
                championships: team.championships || '',
                totalTitles: team.totalTitles || 0,
                isChampion: (team.totalTitles || 0) > 0,
                extracted: new Date().toISOString()
            }));
            
            console.log(`✅ Processed ${teams.length} unique teams`);
            if (teams.length > 0) {
                console.log(`🏏 Sample team:`, teams[0]);
            }
            
        } catch (error) {
            console.log('⚠️ Error scraping team data:', error.message);
        }
        
        // Fallback if no teams found
        if (teams.length === 0) {
            console.log('📋 No teams scraped, returning empty result');
            teams = [];
        }
        
        const championTeams = teams.filter(team => team.isChampion).length;
        
        return {
            teams: teams,
            totalTeams: teams.length,
            championTeams: championTeams,
            lastUpdated: new Date().toISOString(),
            source: 'https://www.iplt20.com/teams',
            scrapedOnly: true,
            note: 'Team information and championship data scraped from official IPL website using team-on-hover structure'
        };
        
    } catch (error) {
        console.error('❌ Error scraping teams:', error.message);
        
        return {
            teams: [],
            totalTeams: 0,
            lastUpdated: new Date().toISOString(),
            source: 'https://www.iplt20.com/teams',
            error: error.message,
            scrapedOnly: true,
            note: 'Failed to scrape team data - no hardcoded data used'
        };
    } finally {
        await browser.close();
    }
}