import { NextRequest, NextResponse } from 'next/server';
import { iplCache } from '../../../lib/cache';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  try {
    switch (action) {
      case 'stats':
        const stats = iplCache.getStats();
        return NextResponse.json({
          message: 'Cache statistics',
          ...stats,
          timestamp: new Date().toISOString()
        });


      case 'status':
        const status = {
          'points-table-2025': iplCache.getCacheStatus('points-table-2025'),
          'matches-2025': iplCache.getCacheStatus('matches-2025'),
          'teams-2025': iplCache.getCacheStatus('teams-2025'),
        };
        return NextResponse.json({
          message: 'Cache status for all endpoints',
          status,
          timestamp: new Date().toISOString()
        });

      default:
        return NextResponse.json({
          message: 'IPL Data Cache Management',
          availableActions: [
            'GET /api/cache?action=stats - View cache statistics',
            'GET /api/cache?action=status - View cache status',
          ],
          currentStats: iplCache.getStats()
        });
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Cache operation failed', message: (error as Error).message },
      { status: 500 }
    );
  }
}