import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

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
    
    // Execute the scraper as a subprocess with year parameter
    const { stdout, stderr } = await execAsync(`cd ../scraper && npm run matches ${year}`, {
      timeout: 30000 // 30 second timeout
    });
    
    if (stderr && !stderr.includes('Warning')) {
      throw new Error(`Scraper error: ${stderr}`);
    }
    
    // Extract JSON from the mixed console output  
    // Look for the array that starts with [ and ends with ]
    const jsonMatch = stdout.match(/(\[.*\])/);
    if (!jsonMatch) {
      throw new Error('No JSON data found in scraper output');
    }
    
    // Parse the clean JSON string
    const jsonString = jsonMatch[1];
    const data = JSON.parse(jsonString);
    
    const responseData = { 
      year: parseInt(year),
      totalMatches: data.length,
      matches: data,
      lastUpdated: new Date().toISOString()
    };
    
    const cacheHeaders: Record<string, string> = forceRefresh ? {
      // Force refresh: Cache fresh data for everyone (updates CDN)
      'Cache-Control': 'public, s-maxage=60, max-age=10', // CDN 1min, browser 10sec
      'X-Cache-Status': 'FORCE-REFRESHED',
      'X-Refresh-Time': new Date().toISOString(),
      'X-Matches-Count': data.length.toString()
    } : {
      // Normal request: Standard CDN caching
      'Cache-Control': 'public, s-maxage=60, max-age=60', // CDN 1min, browser 1min
      'X-Cache-Status': 'FRESH',
      'X-Matches-Count': data.length.toString()
    };
    
    console.log(`✅ ${forceRefresh ? 'Force refreshed' : 'Loaded'} ${data.length} matches`);
    
    // Return the data with appropriate cache headers
    return NextResponse.json(responseData, {
      headers: cacheHeaders
    });
    
  } catch (error) {
    console.error('❌ API Error scraping matches:', error);
    
    return NextResponse.json(
      { error: 'Failed to scrape matches', message: (error as Error).message },
      { status: 500 }
    );
  }
}