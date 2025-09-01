import { NextRequest, NextResponse } from 'next/server';

const SCRAPER_SERVICE_URL = process.env.SCRAPER_SERVICE_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = searchParams.get('limit') || '20';
  const forceRefresh = searchParams.get('refresh') === 'true';
  
  try {
    console.log(`📰 Loading news data (limit: ${limit})...`);
    
    // Call external scraper service
    const scraperUrl = `${SCRAPER_SERVICE_URL}/api/news?limit=${limit}${forceRefresh ? '&refresh=true' : ''}`;
    const response = await fetch(scraperUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'IPL-Dashboard/1.0'
      },
      // Timeout after 25 seconds
      signal: AbortSignal.timeout(25000)
    });
    
    if (!response.ok) {
      throw new Error(`Scraper service error: ${response.status} ${response.statusText}`);
    }
    
    const newsData = await response.json();
    
    console.log(`✅ Loaded news with ${newsData.articles?.length || 0} articles from external service`);
    
    const cacheHeaders: Record<string, string> = forceRefresh ? {
      'Cache-Control': 'public, s-maxage=300, max-age=60', // CDN 5min, browser 1min
      'X-Cache-Status': 'FORCE-REFRESHED',
      'X-Articles-Count': newsData.articles?.length?.toString() || '0',
      'X-Scraper-Service': 'external'
    } : {
      'Cache-Control': 'public, s-maxage=300, max-age=180', // CDN 5min, browser 3min
      'X-Cache-Status': 'FRESH',
      'X-Articles-Count': newsData.articles?.length?.toString() || '0',
      'X-Scraper-Service': 'external'
    };
    
    return NextResponse.json(newsData, {
      headers: cacheHeaders
    });
    
  } catch (error) {
    console.error('❌ External scraper service error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch news data',
        message: (error as Error).message,
        service: 'external-scraper',
        timestamp: new Date().toISOString()
      },
      { 
        status: 503,
        headers: {
          'X-Service-Status': 'unavailable',
          'Retry-After': '60'
        }
      }
    );
  }
}