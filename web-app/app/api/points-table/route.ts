import { NextRequest, NextResponse } from 'next/server';

const SCRAPER_SERVICE_URL = process.env.SCRAPER_SERVICE_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  try {
    // Get year from query params, default to 2025
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year') || '2025';
    const forceRefresh = searchParams.get('refresh') === 'true';
    
    if (forceRefresh) {
      console.log(`🔄 Force refresh requested for points table ${year}...`);
    } else {
      console.log(`📊 Loading points table for ${year}...`);
    }
    
    // Call external scraper service (with longer timeout for cold starts)
    const scraperUrl = `${SCRAPER_SERVICE_URL}/api/points-table?year=${year}${forceRefresh ? '&refresh=true' : ''}`;
    const response = await fetch(scraperUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'IPL-Dashboard/1.0'
      },
      // Timeout after 25 seconds (Vercel has 30s function limit)
      signal: AbortSignal.timeout(25000)
    });
    
    if (!response.ok) {
      throw new Error(`Scraper service error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    const cacheHeaders: Record<string, string> = forceRefresh ? {
      // Force refresh: Cache fresh data for everyone (updates CDN)
      'Cache-Control': 'public, s-maxage=60, max-age=10', // CDN 1min, browser 10sec
      'X-Cache-Status': 'FORCE-REFRESHED',
      'X-Refresh-Time': new Date().toISOString(),
      'X-Teams-Count': data.teams?.length?.toString() || '0',
      'X-Scraper-Service': 'external'
    } : {
      // Normal request: Standard CDN caching
      'Cache-Control': 'public, s-maxage=60, max-age=60', // CDN 1min, browser 1min
      'X-Cache-Status': 'FRESH',
      'X-Teams-Count': data.teams?.length?.toString() || '0',
      'X-Scraper-Service': 'external'
    };
    
    console.log(`✅ ${forceRefresh ? 'Force refreshed' : 'Loaded'} ${data.teams?.length || 0} teams from external service`);
    
    // Return the data with appropriate cache headers
    return NextResponse.json(data, {
      headers: cacheHeaders
    });
    
  } catch (error) {
    console.error('❌ External scraper service error:', error);
    
    const isTimeout = (error as Error).message.includes('aborted due to timeout');
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch points table data',
        message: isTimeout ? 
          'Service is starting up, please try again in 30 seconds' : 
          (error as Error).message,
        service: 'external-scraper',
        timestamp: new Date().toISOString(),
        retryAfter: isTimeout ? 30 : 60
      },
      { 
        status: 503,
        headers: {
          'X-Service-Status': isTimeout ? 'cold-start' : 'unavailable',
          'Retry-After': isTimeout ? '30' : '60'
        }
      }
    );
  }
}