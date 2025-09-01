import { scrapePointsTable } from '../scrapers/pointsTable.js';
import { scrapeMatches } from '../scrapers/matches.js';
import { scrapeTeams } from '../scrapers/teams.js';

class DataCache {
    constructor() {
        this.cache = {
            pointsTable: {},
            matches: {},
            teams: {},
            lastUpdated: null,
            isLoading: false
        };
        
        this.IPL_YEARS = [2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];
        this.REFRESH_INTERVAL = 30 * 60 * 1000; // 30 minutes
        this.refreshTimer = null;
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
            // Load teams data (usually same across years, but we'll cache for each year)
            console.log('👥 Loading teams data...');
            for (const year of this.IPL_YEARS) {
                try {
                    const teams = await scrapeTeams(year);
                    this.cache.teams[year] = teams;
                    console.log(`✅ Teams ${year}: ${teams.teams?.length || 0} teams loaded`);
                } catch (error) {
                    console.log(`⚠️ Teams ${year}: ${error.message}`);
                    this.cache.teams[year] = { error: error.message, teams: [] };
                }
                
                // Small delay between requests to avoid overwhelming the site
                await new Promise(resolve => setTimeout(resolve, 500));
            }

            // Load points table data
            console.log('📊 Loading points table data...');
            for (const year of this.IPL_YEARS) {
                try {
                    const pointsTable = await scrapePointsTable(year);
                    this.cache.pointsTable[year] = pointsTable;
                    console.log(`✅ Points ${year}: ${pointsTable.teams?.length || 0} teams loaded`);
                } catch (error) {
                    console.log(`⚠️ Points ${year}: ${error.message}`);
                    this.cache.pointsTable[year] = { error: error.message, teams: [] };
                }
                
                await new Promise(resolve => setTimeout(resolve, 500));
            }

            // Load matches data
            console.log('🏏 Loading matches data...');
            for (const year of this.IPL_YEARS) {
                try {
                    const matches = await scrapeMatches(year);
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
        const recentYears = [2023, 2024, 2025];
        
        for (const year of recentYears) {
            try {
                // Refresh points table
                const pointsTable = await scrapePointsTable(year);
                this.cache.pointsTable[year] = pointsTable;
                
                // Refresh matches
                const matches = await scrapeMatches(year);
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
        if (year) {
            console.log(`🔄 Force refreshing data for ${year}...`);
            
            try {
                const [pointsTable, matches, teams] = await Promise.all([
                    scrapePointsTable(year),
                    scrapeMatches(year),
                    scrapeTeams(year)
                ]);
                
                this.cache.pointsTable[year] = pointsTable;
                this.cache.matches[year] = matches;
                this.cache.teams[year] = teams;
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