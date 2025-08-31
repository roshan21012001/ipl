// Move scraping logic directly into web-app as API routes
// This eliminates the need for external service calls

import { NextRequest, NextResponse } from 'next/server';
// Import your scraping functions here

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year') || '2025';
    
    // Direct scraping instead of HTTP call
    const scrapedData = await scrapePointsTable(year);
    
    return NextResponse.json(scrapedData);
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Scraping failed', message: error.message },
      { status: 500 }
    );
  }
}