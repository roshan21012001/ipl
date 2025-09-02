import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const year = parseInt(searchParams.get('year') || '2025');
  const forceRefresh = searchParams.get('refresh') === 'true'; // Add forceRefresh

  try {
    const scraperServiceBaseUrl = process.env.SCRAPER_SERVICE_URL || 'http://localhost:3002';
    const scraperApiUrl = `${scraperServiceBaseUrl}/api/teams?year=${year}${forceRefresh ? '&refresh=true' : ''}`;

    console.log(`Fetching teams from scraper service: ${scraperApiUrl}`);

    const response = await fetch(scraperApiUrl);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch data from scraper service');
    }

    const data = await response.json();

    const cacheHeaders: Record<string, string> = {
      'Cache-Control': 'public, s-maxage=1800, max-age=300', // CDN 30min, browser 5min (teams change less)
      'X-Cache-Status': data.cached ? 'CACHED' : 'LIVE-SCRAPED',
      'X-Teams-Count': data.teams?.length?.toString() || '0',
      'X-Scraper-Source': 'external-service'
    };

    console.log(`✅ Fetched ${data.teams?.length || 0} teams from external service`);

    return NextResponse.json(data, {
      headers: cacheHeaders
    });

  } catch (error) {
    console.error('❌ Error fetching teams:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch teams data',
        message: (error as Error).message,
        service: 'web-app-api',
        timestamp: new Date().toISOString()
      },
      {
        status: 500,
        headers: {
          'X-Service-Status': 'fetch-failed'
        }
      }
    );
  }
}