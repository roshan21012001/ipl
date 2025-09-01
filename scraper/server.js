import express from 'express';
import cors from 'cors';
import { dataCache } from './services/dataCache.js';
// Keep scrapers available for manual refresh if needed
import { scrapePointsTable } from './scrapers/pointsTable.js';
import { scrapeMatches } from './scrapers/matches.js';
import { scrapeTeams } from './scrapers/teams.js';

const app = express();
const PORT = process.env.PORT || 3002;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Points table endpoint - serve from memory cache
app.get('/api/points-table', async (req, res) => {
  try {
    const year = req.query.year ? parseInt(req.query.year) : 2025;
    const forceRefresh = req.query.refresh === 'true';
    
    if (forceRefresh) {
      console.log(`🔄 Force refresh requested for points table ${year}...`);
      await dataCache.forceRefresh(year);
    }
    
    const data = dataCache.getPointsTable(year);
    console.log(`⚡ Served points table for ${year} from memory cache`);
    
    // Add cache status to response
    const response = {
      ...data,
      cached: true,
      lastUpdated: dataCache.cache.lastUpdated
    };
    
    res.json(response);
  } catch (error) {
    console.error('❌ Error serving points table:', error);
    res.status(500).json({ 
      error: 'Failed to serve points table', 
      message: error.message 
    });
  }
});

// Matches endpoint - serve from memory cache
app.get('/api/matches', async (req, res) => {
  try {
    const year = req.query.year ? parseInt(req.query.year) : 2025;
    const forceRefresh = req.query.refresh === 'true';
    
    if (forceRefresh) {
      console.log(`🔄 Force refresh requested for matches ${year}...`);
      await dataCache.forceRefresh(year);
    }
    
    const matches = dataCache.getMatches(year);
    console.log(`⚡ Served matches for ${year} from memory cache`);
    
    const response = {
      year,
      totalMatches: matches.length || 0,
      matches: matches.matches || matches, // Handle both formats
      cached: true,
      lastUpdated: dataCache.cache.lastUpdated
    };
    
    res.json(response);
  } catch (error) {
    console.error('❌ Error serving matches:', error);
    res.status(500).json({ 
      error: 'Failed to serve matches', 
      message: error.message 
    });
  }
});

// Teams endpoint - serve from memory cache
app.get('/api/teams', async (req, res) => {
  try {
    const year = req.query.year ? parseInt(req.query.year) : 2025;
    const forceRefresh = req.query.refresh === 'true';
    
    if (forceRefresh) {
      console.log(`🔄 Force refresh requested for teams ${year}...`);
      await dataCache.forceRefresh(year);
    }
    
    const data = dataCache.getTeams(year);
    console.log(`⚡ Served teams for ${year} from memory cache`);
    
    const response = {
      ...data,
      cached: true,
      lastUpdated: dataCache.cache.lastUpdated
    };
    
    res.json(response);
  } catch (error) {
    console.error('❌ Error serving teams:', error);
    res.status(500).json({ 
      error: 'Failed to serve teams', 
      message: error.message 
    });
  }
});

// News endpoint (commented out if scraper doesn't exist)
/*
app.get('/api/news', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 20;
    console.log(`📰 Scraping news (limit: ${limit})...`);
    
    const data = await scrapeNews(limit);
    
    console.log(`✅ Successfully scraped ${data.articles?.length || 0} articles`);
    res.json(data);
  } catch (error) {
    console.error('❌ Error scraping news:', error);
    res.status(500).json({ 
      error: 'Failed to scrape news', 
      message: error.message 
    });
  }
});
*/

// Cache status endpoint
app.get('/api/cache-status', (req, res) => {
  res.json(dataCache.getCacheStatus());
});

// Force refresh endpoint
app.get('/api/refresh', async (req, res) => {
  try {
    const year = req.query.year ? parseInt(req.query.year) : null;
    
    if (year) {
      const success = await dataCache.forceRefresh(year);
      res.json({
        success,
        message: success ? `Data refreshed for ${year}` : `Failed to refresh data for ${year}`,
        year
      });
    } else {
      await dataCache.forceRefresh();
      res.json({
        success: true,
        message: 'All data refreshed successfully'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  const cacheStatus = dataCache.getCacheStatus();
  res.json({ 
    status: 'ok', 
    service: 'ipl-scraper',
    timestamp: new Date().toISOString(),
    cache: cacheStatus
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: '🏏 IPL Scraper Service (Memory Cached)',
    endpoints: [
      'GET /api/points-table?year=2025',
      'GET /api/matches?year=2025', 
      'GET /api/teams?year=2025',
      'GET /api/cache-status',
      'GET /api/refresh?year=2025',
      'GET /health'
    ],
    availableYears: [2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025],
    version: '2.0.0',
    features: ['Memory Cache', 'Instant Response', 'All IPL Years']
  });
});

// Start server and preload data
app.listen(PORT, async () => {
  console.log(`🚀 IPL Scraper Service running on http://localhost:${PORT}`);
  console.log(`📊 Available endpoints:`);
  console.log(`   - Points Table: http://localhost:${PORT}/api/points-table`);
  console.log(`   - Matches: http://localhost:${PORT}/api/matches`);
  console.log(`   - Teams: http://localhost:${PORT}/api/teams`);
  console.log(`   - Cache Status: http://localhost:${PORT}/api/cache-status`);
  console.log(`   - Refresh: http://localhost:${PORT}/api/refresh`);
  console.log(`   - Health: http://localhost:${PORT}/health`);
  console.log();
  
  // Start data preloading in background
  console.log('🔄 Starting background data preload...');
  dataCache.preloadAllData().catch(error => {
    console.error('❌ Data preload failed:', error);
  });
  
}).on('error', (err) => {
  console.error('FATAL ERROR: Server failed to start:', err);
});