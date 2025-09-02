import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get('year') || '2025');
    const forceRefresh = searchParams.get('refresh') === 'true';

    // Construct the URL for the scraper service
    // In a production environment, this URL would come from an environment variable
    const scraperServiceBaseUrl = process.env.SCRAPER_SERVICE_URL || 'http://localhost:3002';
    const scraperApiUrl = `${scraperServiceBaseUrl}/api/points-table?year=${year}${forceRefresh ? '&refresh=true' : ''}`;

    console.log(`Fetching points table from scraper service: ${scraperApiUrl}`);

    const response = await fetch(scraperApiUrl);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch data from scraper service');
    }

    const data = await response.json();

    const cacheHeaders: Record<string, string> = {
      'Cache-Control': 'public, s-maxage=300, max-age=60', // CDN 5min, browser 1min
      'X-Cache-Status': data.cached ? 'CACHED' : 'LIVE-SCRAPED', // Use status from scraper service
      'X-Teams-Count': data.teams?.length?.toString() || '0',
      'X-Scraper-Source': 'external-service' // Indicate data source
    };

    console.log(`✅ Fetched ${data.teams?.length || 0} teams for ${year} from external service`);

    return NextResponse.json(data, {
      headers: cacheHeaders
    });

  } catch (error) {
    console.error('❌ Error fetching points table:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch points table data',
        message: (error as Error).message,
        service: 'web-app-api', // Indicate error source
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