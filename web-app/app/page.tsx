'use client';

import { useState, useEffect } from 'react';
import TopNav from '@/components/TopNav';
import { useYear } from '@/contexts/YearContext';
import { getYearStyles, IPL_YEARS } from '@/utils/gradients';

// Client-side data fetching with year parameter
async function getPointsTable(year: number) {
  try {
    const response = await fetch(`/api/points-table?year=${year}`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.log('⚠️ Could not fetch points table, using fallback');
    return {
      teams: [
        { team: 'PBKS', position: 1, played: 14, won: 10, lost: 4, points: 20, netRunRate: 0.372 },
        { team: 'RCB', position: 2, played: 14, won: 9, lost: 5, points: 18, netRunRate: 0.301 },
        { team: 'GT', position: 3, played: 14, won: 8, lost: 6, points: 16, netRunRate: 0.254 },
        { team: 'MI', position: 4, played: 14, won: 7, lost: 7, points: 14, netRunRate: 1.142 },
        { team: 'DC', position: 5, played: 14, won: 6, lost: 8, points: 12, netRunRate: 0.011 }
      ],
      lastUpdated: null
    };
  }
}

export default function PointsTablePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { selectedYear, setSelectedYear } = useYear();

  useEffect(() => {
    // Add a small delay to show components loading first
    const timer = setTimeout(() => {
      const loadData = async () => {
        setLoading(true);
        const pointsData = await getPointsTable(selectedYear);
        setData(pointsData);
        setLoading(false);
      };
      loadData();
    }, 300); // 300ms delay to show UI first

    return () => clearTimeout(timer);
  }, [selectedYear]);
  const yearStyles = getYearStyles(selectedYear);
  
  return (
    <div className={`min-h-screen bg-gradient-to-br ${yearStyles.gradient}`}>
      <TopNav />
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header with Year Selector */}
          <header className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              🏆 IPL Points Table {selectedYear}
            </h1>
            
            
            {data?.lastUpdated && (
              <p className="text-sm text-gray-500">
                Last updated: {new Date(data.lastUpdated).toLocaleString()}
              </p>
            )}
          </header>

          {/* Points Table */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className={`px-6 py-4 ${yearStyles.headerBg} text-white`}>
              <h2 className="text-xl font-semibold">Current Standings</h2>
            </div>
            
            <div className="overflow-x-auto">
              {loading || !data ? (
                <div className="flex items-center justify-center min-h-96">
                  <div className="text-center">
                    <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${yearStyles.spinnerBorder} mx-auto`}></div>
                    <p className="mt-4 text-gray-600">Loading points table...</p>
                  </div>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Position
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Team
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Matches
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Won
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Lost
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        NRR
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Points
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.teams.map((team: any, index: number) => (
                      <tr key={team.team || `team-${index}`} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-lg font-bold text-gray-900">
                              #{team.position || index + 1}
                            </span>
                            {(team.position || index + 1) <= 4 && (
                              <span className="ml-2 text-green-500">🏅</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-lg font-semibold text-blue-600">
                            {team.team || 'Unknown'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                          {team.played || team.matches || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-green-600 font-medium">
                          {team.wins || team.won || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-red-600 font-medium">
                          {team.losses || team.lost || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                          <span className={`${(team.netRunRate || team.nrr || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {(team.netRunRate || team.nrr || 0).toFixed(3)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="text-xl font-bold text-gray-900">
                            {team.points || 'N/A'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={`/api/points-table?year=${selectedYear}`}
              className={`${yearStyles.primaryBg} ${yearStyles.primaryBgHover} text-white px-6 py-3 rounded-lg font-medium transition duration-300 text-center`}
            >
              📊 View Raw API Data
            </a>
            <a
              href={`/api/points-table?year=${selectedYear}&refresh=true`}
              className={`${yearStyles.secondaryBg} ${yearStyles.secondaryBgHover} text-white px-6 py-3 rounded-lg font-medium transition duration-300 text-center`}
            >
              🔄 Force Refresh Data
            </a>
          </div>

          {/* Footer */}
          <footer className="text-center mt-12 pt-8 border-t border-gray-200">
            <p className="text-gray-500">
              Data scraped from IPL official website
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}