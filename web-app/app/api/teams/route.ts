import { NextRequest, NextResponse } from 'next/server';
import { iplCache } from '@/lib/cache';

const SCRAPER_SERVICE_URL = process.env.SCRAPER_SERVICE_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const year = searchParams.get('year') || '2025';
  const forceRefresh = searchParams.get('refresh') === 'true';
  
  const cacheKey = `teams-${year}`;
  
  try {
    // Check cache first (unless refresh is requested)
    if (!forceRefresh) {
      const cachedData = await iplCache.get(cacheKey);
      if (cachedData) {
        console.log('👥 Serving cached teams data');
        return NextResponse.json(cachedData);
      }
    }
    
    console.log(`👥 Loading teams data for ${year}...`);
    
    // Call external scraper service
    const scraperUrl = `${SCRAPER_SERVICE_URL}/api/teams?year=${year}${forceRefresh ? '&refresh=true' : ''}`;
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
    
    const teamsData = await response.json();
    
    // Cache the result for 15 minutes (teams data changes less frequently)
    await iplCache.set(cacheKey, teamsData, 15);
    
    console.log(`✅ Loaded teams: ${teamsData.teams?.length || 0} teams from external service`);
    
    const cacheHeaders: Record<string, string> = forceRefresh ? {
      'Cache-Control': 'public, s-maxage=300, max-age=60', // CDN 5min, browser 1min
      'X-Cache-Status': 'FORCE-REFRESHED',
      'X-Teams-Count': teamsData.teams?.length?.toString() || '0',
      'X-Scraper-Service': 'external'
    } : {
      'Cache-Control': 'public, s-maxage=300, max-age=300', // CDN 5min, browser 5min
      'X-Cache-Status': 'FRESH',
      'X-Teams-Count': teamsData.teams?.length?.toString() || '0',
      'X-Scraper-Service': 'external'
    };
    
    return NextResponse.json(teamsData, {
      headers: cacheHeaders
    });
    
  } catch (error) {
    console.error('❌ External scraper service error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch teams data',
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