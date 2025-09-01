import { NextRequest, NextResponse } from 'next/server';
import { scrapeTeams } from '@/lib/scrapers/teams-playwright.js';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const year = parseInt(searchParams.get('year') || '2025');
  
  try {
    console.log(`👥 Scraping teams data for ${year}...`);
    
    // Call local scraper function
    const teamsData = await scrapeTeams(year);
    
    console.log(`✅ Scraped ${teamsData.teams?.length || 0} teams`);
    
    const cacheHeaders: Record<string, string> = {
      'Cache-Control': 'public, s-maxage=1800, max-age=300', // CDN 30min, browser 5min (teams change less)
      'X-Cache-Status': 'LIVE-SCRAPED',
      'X-Teams-Count': teamsData.teams?.length?.toString() || '0',
      'X-Scraper-Source': 'vercel-local'
    };
    
    return NextResponse.json(teamsData, {
      headers: cacheHeaders
    });
    
  } catch (error) {
    console.error('❌ Teams scraping error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to scrape teams data',
        message: (error as Error).message,
        service: 'vercel-local-scraper',
        timestamp: new Date().toISOString()
      },
      { 
        status: 500,
        headers: {
          'X-Service-Status': 'scraping-failed'
        }
      }
    );
  }
}