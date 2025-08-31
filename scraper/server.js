import express from 'express';
import cors from 'cors';
import { scrapePointsTable } from './scrapers/pointsTable.js';
import { scrapeMatches } from './scrapers/matches.js';
import { scrapeTeams } from './scrapers/teams.js';
// import { scrapeNews } from './scrapers/news.js';

const app = express();
const PORT = 3002;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Points table endpoint
app.get('/api/points-table', async (req, res) => {
  try {
    const year = req.query.year ? parseInt(req.query.year) : 2025;
    console.log(`📊 Scraping points table for ${year}...`);
    
    const data = await scrapePointsTable(year);
    
    console.log(`✅ Successfully scraped ${data.teams?.length || 0} teams`);
    res.json(data);
  } catch (error) {
    console.error('❌ Error scraping points table:', error);
    res.status(500).json({ 
      error: 'Failed to scrape points table', 
      message: error.message 
    });
  }
});

// Matches endpoint
app.get('/api/matches', async (req, res) => {
  try {
    const year = req.query.year ? parseInt(req.query.year) : 2025;
    console.log(`🏏 Scraping matches for ${year}...`);
    
    const matches = await scrapeMatches(year);
    
    const response = {
      year,
      totalMatches: matches.length,
      matches: matches,
      lastUpdated: new Date().toISOString()
    };
    
    console.log(`✅ Successfully scraped ${matches.length} matches`);
    res.json(response);
  } catch (error) {
    console.error('❌ Error scraping matches:', error);
    res.status(500).json({ 
      error: 'Failed to scrape matches', 
      message: error.message 
    });
  }
});

// Teams endpoint
app.get('/api/teams', async (req, res) => {
  try {
    const year = req.query.year ? parseInt(req.query.year) : 2025;
    console.log(`👥 Scraping teams for ${year}...`);
    
    const data = await scrapeTeams(year);
    
    console.log(`✅ Successfully scraped ${data.teams?.length || 0} teams`);
    res.json(data);
  } catch (error) {
    console.error('❌ Error scraping teams:', error);
    res.status(500).json({ 
      error: 'Failed to scrape teams', 
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

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'ipl-scraper',
    timestamp: new Date().toISOString() 
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: '🏏 IPL Scraper Service',
    endpoints: [
      'GET /api/points-table?year=2025',
      'GET /api/matches?year=2025',
      'GET /api/teams?year=2025',
      'GET /health'
    ],
    version: '1.0.0'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 IPL Scraper Service running on http://localhost:${PORT}`);
  console.log(`📊 Available endpoints:`);
  console.log(`   - Points Table: http://localhost:${PORT}/api/points-table`);
  console.log(`   - Matches: http://localhost:${PORT}/api/matches`);
  console.log(`   - Teams: http://localhost:${PORT}/api/teams`);
  console.log(`   - Health: http://localhost:${PORT}/health`);
});