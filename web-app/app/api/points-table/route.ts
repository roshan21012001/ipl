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
      console.log(`🔄 Force refresh requested for points table ${year}...`);
    } else {
      console.log(`📊 Loading points table for ${year}...`);
    }
    
    // Execute the scraper as a subprocess with year parameter
    const { stdout, stderr } = await execAsync(`cd ../scraper && npm run points ${year}`, {
      timeout: 30000 // 30 second timeout
    });
    
    if (stderr && !stderr.includes('Warning')) {
      throw new Error(`Scraper error: ${stderr}`);
    }
    
    // Extract JSON from the mixed console output
    const jsonMatch = stdout.match(/(\{.*\})/);
    if (!jsonMatch) {
      throw new Error('No JSON data found in scraper output');
    }
    
    // Parse the clean JSON string
    const jsonString = jsonMatch[1];
    const data = JSON.parse(jsonString);
    
    const cacheHeaders: Record<string, string> = forceRefresh ? {
      // Force refresh: Cache fresh data for everyone (updates CDN)
      'Cache-Control': 'public, s-maxage=60, max-age=10', // CDN 1min, browser 10sec
      'X-Cache-Status': 'FORCE-REFRESHED',
      'X-Refresh-Time': new Date().toISOString(),
      'X-Teams-Count': data.teams.length.toString()
    } : {
      // Normal request: Standard CDN caching
      'Cache-Control': 'public, s-maxage=60, max-age=60', // CDN 1min, browser 1min
      'X-Cache-Status': 'FRESH',
      'X-Teams-Count': data.teams.length.toString()
    };
    
    console.log(`✅ ${forceRefresh ? 'Force refreshed' : 'Loaded'} ${data.teams.length} teams`);
    
    // Return the data with appropriate cache headers
    return NextResponse.json(data, {
      headers: cacheHeaders
    });
    
  } catch (error) {
    console.error('❌ API Error:', error);
    
    return NextResponse.json(
      { error: 'Failed to scrape points table', message: (error as Error).message },
      { status: 500 }
    );
  }
}