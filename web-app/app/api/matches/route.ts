import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get('year') || '2025');
    const forceRefresh = searchParams.get('refresh') === 'true';

    const scraperServiceBaseUrl = process.env.SCRAPER_SERVICE_URL || 'http://localhost:3002';
    const scraperApiUrl = `${scraperServiceBaseUrl}/api/matches?year=${year}${forceRefresh ? '&refresh=true' : ''}`;

    console.log(`Fetching matches from scraper service: ${scraperApiUrl}`);

    const response = await fetch(scraperApiUrl);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch data from scraper service');
    }

    const data = await response.json();

    const cacheHeaders: Record<string, string> = {
      'Cache-Control': 'public, s-maxage=600, max-age=120', // CDN 10min, browser 2min
      'X-Cache-Status': data.cached ? 'CACHED' : 'LIVE-SCRAPED',
      'X-Matches-Count': data.totalMatches?.toString() || '0',
      'X-Scraper-Source': 'external-service'
    };

    console.log(`✅ Fetched ${data.totalMatches} matches for ${year} from external service`);

    return NextResponse.json(data, {
      headers: cacheHeaders
    });

  } catch (error) {
    console.error('❌ Error fetching matches:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch matches data',
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