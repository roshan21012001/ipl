import { NextRequest, NextResponse } from 'next/server';
import { scrapeMatches } from '@/lib/scrapers/matches.js';

export async function GET(request: NextRequest) {
  try {
    // Get year from query params, default to 2025
    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get('year') || '2025');
    
    console.log(`🏏 Scraping matches for ${year}...`);
    
    // Call local scraper function
    const matches = await scrapeMatches(year);
    
    const responseData = { 
      year: year,
      totalMatches: matches.length,
      matches: matches,
      lastUpdated: new Date().toISOString()
    };
    
    const cacheHeaders: Record<string, string> = {
      'Cache-Control': 'public, s-maxage=600, max-age=120', // CDN 10min, browser 2min
      'X-Cache-Status': 'LIVE-SCRAPED', 
      'X-Matches-Count': responseData.totalMatches.toString(),
      'X-Scraper-Source': 'vercel-local'
    };
    
    console.log(`✅ Scraped ${responseData.totalMatches} matches for ${year}`);
    
    // Return the data with appropriate cache headers
    return NextResponse.json(responseData, {
      headers: cacheHeaders
    });
    
  } catch (error) {
    console.error('❌ Matches scraping error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to scrape matches data',
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