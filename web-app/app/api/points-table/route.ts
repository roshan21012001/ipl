import { NextRequest, NextResponse } from 'next/server';
import { scrapePointsTable } from '@/lib/scrapers/pointsTable-playwright.js';

export async function GET(request: NextRequest) {
  try {
    // Get year from query params, default to 2025
    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get('year') || '2025');
    
    console.log(`📊 Scraping points table for ${year}...`);
    
    // Call local scraper function
    const data = await scrapePointsTable(year);
    
    const cacheHeaders: Record<string, string> = {
      'Cache-Control': 'public, s-maxage=300, max-age=60', // CDN 5min, browser 1min  
      'X-Cache-Status': 'LIVE-SCRAPED',
      'X-Teams-Count': data.teams?.length?.toString() || '0',
      'X-Scraper-Source': 'vercel-local'
    };
    
    console.log(`✅ Scraped ${data.teams?.length || 0} teams for ${year}`);
    
    // Return the data with appropriate cache headers
    return NextResponse.json(data, {
      headers: cacheHeaders
    });
    
  } catch (error) {
    console.error('❌ Scraping error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to scrape points table data',
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