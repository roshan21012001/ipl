import { NextRequest, NextResponse } from 'next/server';

const SCRAPER_SERVICE_URL = process.env.SCRAPER_SERVICE_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  try {
    // Get year from query params, default to 2025
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year') || '2025';
    const forceRefresh = searchParams.get('refresh') === 'true';
    
    if (forceRefresh) {
      console.log(`🔄 Force refresh requested for matches ${year}...`);
    } else {
      console.log(`🏏 Loading matches for ${year}...`);
    }
    
    // Call external scraper service
    const scraperUrl = `${SCRAPER_SERVICE_URL}/api/matches?year=${year}${forceRefresh ? '&refresh=true' : ''}`;
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
    
    const data = await response.json();
    
    const responseData = { 
      year: parseInt(year),
      totalMatches: data.matches?.length || data.length || 0,
      matches: data.matches || data,
      lastUpdated: data.lastUpdated || new Date().toISOString()
    };
    
    const cacheHeaders: Record<string, string> = forceRefresh ? {
      // Force refresh: Cache fresh data for everyone (updates CDN)
      'Cache-Control': 'public, s-maxage=60, max-age=10', // CDN 1min, browser 10sec
      'X-Cache-Status': 'FORCE-REFRESHED',
      'X-Refresh-Time': new Date().toISOString(),
      'X-Matches-Count': responseData.totalMatches.toString(),
      'X-Scraper-Service': 'external'
    } : {
      // Normal request: Standard CDN caching
      'Cache-Control': 'public, s-maxage=60, max-age=60', // CDN 1min, browser 1min
      'X-Cache-Status': 'FRESH',
      'X-Matches-Count': responseData.totalMatches.toString(),
      'X-Scraper-Service': 'external'
    };
    
    console.log(`✅ ${forceRefresh ? 'Force refreshed' : 'Loaded'} ${responseData.totalMatches} matches from external service`);
    
    // Return the data with appropriate cache headers
    return NextResponse.json(responseData, {
      headers: cacheHeaders
    });
    
  } catch (error) {
    console.error('❌ External scraper service error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch matches data',
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