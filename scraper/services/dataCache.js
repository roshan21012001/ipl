import { scrapePointsTable } from '../scrapers/pointsTable.js';
import { scrapeMatches } from '../scrapers/matches.js';
import { scrapeTeams } from '../scrapers/teams.js';
import { createBrowser } from '../utils/browser.js';

class DataCache {
    constructor() {
        this.cache = {
            pointsTable: {},
            matches: {},
            teams: {},
            lastUpdated: null,
            isLoading: false
        };
        
        // Shared browser instance
        this.browser = null;
        
        // Only years with confirmed data availability on current IPL website structure
        this.IPL_YEARS = [2025, 2024, 2023, 2022];
        this.ALL_IPL_YEARS = [2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010, 2009, 2008];
        this.REFRESH_INTERVAL = 30 * 60 * 1000; // 30 minutes
        this.refreshTimer = null;
    }

    async ensureBrowser() {
        if (!this.browser) {
            console.log('🌐 Creating shared browser instance...');
            this.browser = await createBrowser();
            console.log('✅ Shared browser ready');
        }
        return this.browser;
    }

    async closeBrowser() {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
            console.log('🔒 Shared browser closed');
        }
    }

    async preloadAllData() {
        if (this.cache.isLoading) {
            console.log('🔄 Data loading already in progress...');
            return;
        }

        console.log('🚀 Starting data preload for all IPL years...');
        this.cache.isLoading = true;
        const startTime = Date.now();

        try {
            // Initialize shared browser
            await this.ensureBrowser();
            
            // Load teams data once (same for all years)
            console.log('👥 Loading teams data (once for all years)...');
            try {
                const teams = await scrapeTeams(2025, this.browser); // Pass shared browser
                console.log(`✅ Teams loaded: ${teams.teams?.length || 0} teams`);
                
                // Cache same teams data for available years
                for (const year of this.IPL_YEARS) {
                    this.cache.teams[year] = {
                        ...teams,
                        year: year,
                        note: 'Teams data is consistent across all IPL years'
                    };
                }
                
                // Set "no data" message for older years not available on current website
                const unavailableYears = [2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010, 2009, 2008];
                for (const year of unavailableYears) {
                    this.cache.teams[year] = {
                        teams: [],
                        year: year,
                        error: `Data not available for ${year} on current IPL website structure`,
                        note: `Historical data for ${year} season is not accessible via current IPL API`
                    };
                }
                
                console.log(`📋 Teams data cached for ${this.IPL_YEARS.length} available years`);
            } catch (error) {
                console.log(`⚠️ Teams loading failed: ${error.message}`);
                // Set error for available years
                for (const year of this.IPL_YEARS) {
                    this.cache.teams[year] = { error: error.message, teams: [] };
                }
                
                // Set "no data" for unavailable years
                const unavailableYears = [2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010, 2009, 2008];
                for (const year of unavailableYears) {
                    this.cache.teams[year] = {
                        teams: [],
                        year: year,
                        error: `Data not available for ${year} on current IPL website structure`,
                        note: `Historical data for ${year} season is not accessible via current IPL API`
                    };
                }
            }

            // Load points table data (from recent to old: 2025 → 2008)
            console.log('📊 Loading points table data (2025 → 2008)...');
            for (const year of this.IPL_YEARS) {
                try {
                    const pointsTable = await scrapePointsTable(year, this.browser); // Pass shared browser
                    this.cache.pointsTable[year] = pointsTable;
                    console.log(`✅ Points ${year}: ${pointsTable.teams?.length || 0} teams loaded`);
                } catch (error) {
                    console.log(`⚠️ Points ${year}: ${error.message}`);
                    this.cache.pointsTable[year] = { error: error.message, teams: [] };
                }
                
                await new Promise(resolve => setTimeout(resolve, 500));
            }

            // Load matches data (from recent to old: 2025 → 2008)
            console.log('🏏 Loading matches data (2025 → 2008)...');
            for (const year of this.IPL_YEARS) {
                try {
                    const matches = await scrapeMatches(year, this.browser); // Pass shared browser
                    this.cache.matches[year] = matches;
                    console.log(`✅ Matches ${year}: ${matches.length || 0} matches loaded`);
                } catch (error) {
                    console.log(`⚠️ Matches ${year}: ${error.message}`);
                    this.cache.matches[year] = { error: error.message, matches: [] };
                }
                
                await new Promise(resolve => setTimeout(resolve, 500));
            }

            this.cache.lastUpdated = new Date().toISOString();
            const duration = ((Date.now() - startTime) / 1000).toFixed(2);
            
            console.log(`🎉 Data preload completed in ${duration}s`);
            console.log(`📊 Loaded data for ${this.IPL_YEARS.length} years`);
            
            // Start periodic refresh
            this.startPeriodicRefresh();
            
        } catch (error) {
            console.error('❌ Data preload failed:', error);
            // Keep browser open for future use
        } finally {
            this.cache.isLoading = false;
        }
    }

    startPeriodicRefresh() {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
        }
        
        this.refreshTimer = setInterval(async () => {
            console.log('🔄 Starting periodic data refresh...');
            await this.refreshRecentData();
        }, this.REFRESH_INTERVAL);
        
        console.log(`⏰ Periodic refresh scheduled every ${this.REFRESH_INTERVAL / 60000} minutes`);
    }

    async refreshRecentData() {
        // Only refresh recent years (2023, 2024, 2025) to save time
        const recentYears = [2025, 2024, 2023];
        
        await this.ensureBrowser(); // Ensure browser is available
        
        for (const year of recentYears) {
            try {
                // Refresh points table
                const pointsTable = await scrapePointsTable(year, this.browser);
                this.cache.pointsTable[year] = pointsTable;
                
                // Refresh matches
                const matches = await scrapeMatches(year, this.browser);
                this.cache.matches[year] = matches;
                
                console.log(`🔄 Refreshed data for ${year}`);
                
                // Small delay between years
                await new Promise(resolve => setTimeout(resolve, 1000));
                
            } catch (error) {
                console.log(`⚠️ Refresh failed for ${year}: ${error.message}`);
            }
        }
        
        this.cache.lastUpdated = new Date().toISOString();
        console.log('✅ Periodic refresh completed');
    }

    getPointsTable(year) {
        return this.cache.pointsTable[year] || { 
            error: `No data available for ${year}`, 
            teams: [],
            year: parseInt(year)
        };
    }

    getMatches(year) {
        return this.cache.matches[year] || { 
            error: `No data available for ${year}`, 
            matches: [],
            year: parseInt(year)
        };
    }

    getTeams(year) {
        return this.cache.teams[year] || { 
            error: `No data available for ${year}`, 
            teams: [],
            year: parseInt(year)
        };
    }

    getCacheStatus() {
        const totalYears = this.IPL_YEARS.length;
        const loadedPoints = Object.keys(this.cache.pointsTable).length;
        const loadedMatches = Object.keys(this.cache.matches).length;
        const loadedTeams = Object.keys(this.cache.teams).length;
        
        return {
            isLoading: this.cache.isLoading,
            lastUpdated: this.cache.lastUpdated,
            coverage: {
                pointsTable: `${loadedPoints}/${totalYears}`,
                matches: `${loadedMatches}/${totalYears}`,
                teams: `${loadedTeams}/${totalYears}`
            },
            availableYears: this.IPL_YEARS,
            refreshInterval: `${this.REFRESH_INTERVAL / 60000} minutes`
        };
    }

    async forceRefresh(year = null) {
        await this.ensureBrowser(); // Ensure browser is available
        
        if (year) {
            console.log(`🔄 Force refreshing data for ${year}...`);
            
            try {
                const [pointsTable, matches] = await Promise.all([
                    scrapePointsTable(year, this.browser),
                    scrapeMatches(year, this.browser)
                ]);
                
                this.cache.pointsTable[year] = pointsTable;
                this.cache.matches[year] = matches;
                // Teams data is same for all years, no need to refresh
                this.cache.lastUpdated = new Date().toISOString();
                
                console.log(`✅ Force refresh completed for ${year}`);
                return true;
            } catch (error) {
                console.error(`❌ Force refresh failed for ${year}:`, error);
                return false;
            }
        } else {
            // Refresh all data
            await this.preloadAllData();
            return true;
        }
    }
}

// Export singleton instance
export const dataCache = new DataCache();