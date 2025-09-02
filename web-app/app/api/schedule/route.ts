import { NextRequest, NextResponse } from 'next/server';
import { scrapeMatches } from '@/lib/scrapers/matches.js';

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
    
    console.log(`📅 Loading schedule data for ${year}...`);
    
    // Call scraper function directly instead of making internal HTTP call
    const matches = await scrapeMatches(year);
    
    const matchesData = {
      year: year,
      totalMatches: matches.length,
      matches: matches,
      lastUpdated: new Date().toISOString()
    };
    
    // Transform matches data for schedule view
    const matchesList = matchesData.matches || [];
    
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
    
    const completedMatches = matchesList.filter((match: MatchData) => getMatchStatus(match) === 'completed');
    const upcomingMatches = matchesList.filter((match: MatchData) => getMatchStatus(match) === 'upcoming');
    const abandonedMatches = matchesList.filter((match: MatchData) => getMatchStatus(match) === 'abandoned');
    
    const scheduleData = {
      year: parseInt(year),
      totalMatches: matchesData.totalMatches || matchesList.length || 74,
      matches: matchesList,
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