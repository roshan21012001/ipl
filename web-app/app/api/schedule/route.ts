import { NextRequest, NextResponse } from 'next/server';

interface MatchData {
  description?: string;
  text?: string;
  [key: string]: unknown;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year') || '2025';
    const forceRefresh = searchParams.get('refresh') === 'true';
    
    // Get the base URL from the request
    const baseUrl = `${request.nextUrl.protocol}//${request.nextUrl.host}`;
    
    console.log(`📅 Loading schedule data for ${year}...`);
    
    // Fetch matches data from our existing API with year parameter
    const matchesResponse = await fetch(`${baseUrl}/api/matches?year=${year}${forceRefresh ? '&refresh=true' : ''}`, {
      headers: {
        'User-Agent': 'IPL-Schedule-API'
      }
    });
    
    if (!matchesResponse.ok) {
      throw new Error(`Failed to fetch matches: ${matchesResponse.status}`);
    }
    
    const matchesData = await matchesResponse.json();
    
    // Transform matches data for schedule view
    const matches = matchesData.matches || [];
    
    // Helper functions to determine match status
    const getMatchStatus = (match: MatchData) => {
      const description = match.description || match.text || '';
      const isAbandoned = /Match Abandoned|abandoned|No Result|no result/i.test(description);
      const hasWonBy = /won by/i.test(description); // Case insensitive and include lowercase
      
      // Status determined successfully
      
      if (isAbandoned) return 'abandoned';
      if (hasWonBy) return 'completed';
      return 'upcoming';
    };
    
    const completedMatches = matches.filter((match: MatchData) => getMatchStatus(match) === 'completed');
    const upcomingMatches = matches.filter((match: MatchData) => getMatchStatus(match) === 'upcoming');
    const abandonedMatches = matches.filter((match: MatchData) => getMatchStatus(match) === 'abandoned');
    
    const scheduleData = {
      year: parseInt(year),
      totalMatches: matchesData.totalMatches || matches.length || 74,
      matches: matches,
      lastUpdated: matchesData.lastUpdated || new Date().toISOString(),
      upcomingMatches: upcomingMatches.length,
      completedMatches: completedMatches.length,
      abandonedMatches: abandonedMatches.length
    };
    
    const cacheHeaders: Record<string, string> = forceRefresh ? {
      'Cache-Control': 'public, s-maxage=60, max-age=10', // CDN 1min, browser 10sec
      'X-Cache-Status': 'FORCE-REFRESHED',
      'X-Refresh-Time': new Date().toISOString(),
      'X-Matches-Count': scheduleData.totalMatches.toString()
    } : {
      'Cache-Control': 'public, s-maxage=60, max-age=60', // CDN 1min, browser 1min
      'X-Cache-Status': 'FRESH',
      'X-Matches-Count': scheduleData.totalMatches.toString()
    };
    
    console.log(`✅ ${forceRefresh ? 'Force refreshed' : 'Loaded'} schedule with ${scheduleData.totalMatches} matches`);
    
    return NextResponse.json(scheduleData, {
      headers: cacheHeaders
    });
    
  } catch (error) {
    console.error('❌ API Error loading schedule:', error);
    
    return NextResponse.json(
      { error: 'Failed to load schedule', message: (error as Error).message },
      { status: 500 }
    );
  }
}