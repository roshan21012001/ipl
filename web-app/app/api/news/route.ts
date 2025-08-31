import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import { iplCache } from '@/lib/cache';

// Fixed cache import to use iplCache singleton
const SCRAPER_PATH = path.join(process.cwd(), '..', 'scraper');

function runScraper(scriptName: string, args: string[] = []): Promise<any> {
  return new Promise((resolve, reject) => {
    console.log(`📰 Running news scraper from ${SCRAPER_PATH}...`);
    
    const child = spawn('node', [scriptName, ...args], {
      cwd: SCRAPER_PATH,
      stdio: 'pipe'
    });

    let stdout = '';
    let stderr = '';

    child.stdout?.on('data', (data) => {
      const output = data.toString();
      stdout += output;
      console.log(output.trim());
    });

    child.stderr?.on('data', (data) => {
      const output = data.toString();
      stderr += output;
      console.error(output.trim());
    });

    child.on('close', (code) => {
      if (code === 0) {
        try {
          // Extract JSON from mixed console output
          // Look for the last occurrence of { or [ to get the JSON
          const lines = stdout.trim().split('\n');
          let jsonLine = '';
          
          // Find the last line that looks like JSON (starts with { or [)
          for (let i = lines.length - 1; i >= 0; i--) {
            const line = lines[i].trim();
            if (line.startsWith('{') || line.startsWith('[')) {
              jsonLine = line;
              break;
            }
          }
          
          if (!jsonLine) {
            throw new Error('No JSON output found');
          }
          
          const result = JSON.parse(jsonLine);
          resolve(result);
        } catch (error) {
          console.error('Failed to parse scraper output:', error);
          console.error('Raw output:', stdout);
          reject(new Error('Invalid scraper output'));
        }
      } else {
        reject(new Error(`Scraper failed with code ${code}: ${stderr}`));
      }
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = searchParams.get('limit') || '20';
  const refresh = searchParams.get('refresh') === 'true';
  
  const cacheKey = `news-${limit}`;
  
  try {
    // Check cache first (unless refresh is requested)
    if (!refresh) {
      const cachedData = await iplCache.get(cacheKey);
      if (cachedData) {
        console.log('📰 Serving cached news data');
        return NextResponse.json(cachedData);
      }
    }
    
    console.log(`📰 Loading news data (limit: ${limit})...`);
    
    // Create a temporary script to run the news scraper
    const tempScriptContent = `
import { scrapeNews } from './scrapers/news.js';

async function main() {
  try {
    const limit = process.argv[2] ? parseInt(process.argv[2]) : 20;
    const newsData = await scrapeNews(limit);
    console.log(JSON.stringify(newsData));
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
`;
    
    // Write and execute the temporary script
    const fs = await import('fs');
    const tempScriptPath = path.join(SCRAPER_PATH, 'temp-news-scraper.js');
    
    fs.writeFileSync(tempScriptPath, tempScriptContent);
    
    try {
      const newsData = await runScraper('temp-news-scraper.js', [limit]);
      
      // Cache the result for 10 minutes
      await iplCache.set(cacheKey, newsData, 10);
      
      console.log(`✅ Loaded news with ${newsData.articles?.length || 0} articles`);
      
      return NextResponse.json(newsData);
    } finally {
      // Clean up temporary script
      try {
        fs.unlinkSync(tempScriptPath);
      } catch (error) {
        console.warn('Could not delete temporary script:', error);
      }
    }
    
  } catch (error) {
    console.error('❌ Error in news API:', error);
    
    // Return fallback data
    const fallbackData = {
      articles: [
        {
          id: 1,
          title: 'IPL 2025: Stay Updated with Latest News',
          summary: 'Get the latest updates on IPL 2025 matches, player performances, team news, and tournament highlights. Check back regularly for fresh content.',
          link: 'https://www.iplt20.com/news',
          image: '',
          publishedDate: new Date().toISOString().split('T')[0],
          category: 'Tournament Update',
          extracted: new Date().toISOString()
        },
        {
          id: 2,
          title: 'Live Match Updates Available',
          summary: 'Follow live match scores, team standings, and player statistics in real-time throughout the IPL 2025 season.',
          link: '',
          image: '',
          publishedDate: new Date().toISOString().split('T')[0],
          category: 'Live Updates',
          extracted: new Date().toISOString()
        },
        {
          id: 3,
          title: 'Team Profiles and Championship History',
          summary: 'Explore detailed team profiles, championship history, and current squad information for all IPL teams.',
          link: '/teams',
          image: '',
          publishedDate: new Date().toISOString().split('T')[0],
          category: 'Teams',
          extracted: new Date().toISOString()
        }
      ],
      totalArticles: 3,
      lastUpdated: new Date().toISOString(),
      source: 'fallback'
    };
    
    return NextResponse.json(fallbackData);
  }
}