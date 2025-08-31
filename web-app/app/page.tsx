'use client';

import TopNav from '@/components/TopNav';
import { useYear } from '@/contexts/YearContext';
import { getYearStyles } from '@/utils/gradients';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import PageHeader from '@/components/ui/PageHeader';
import { useData } from '@/lib/hooks/useData';
import { PointsTableResponse, PointsTableEntry } from '@/lib/types';

export default function PointsTablePage() {
  const { selectedYear } = useYear();
  const { data, loading, error } = useData<PointsTableResponse>('points-table');
  const yearStyles = getYearStyles(selectedYear);
  
  return (
    <div className={`min-h-screen bg-gradient-to-br ${yearStyles.gradient}`}>
      <TopNav />
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          <PageHeader title={`🏆 IPL Points Table ${selectedYear}`} lastUpdated={data?.lastUpdated || null} />

          {/* Points Table */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className={`px-6 py-4 ${yearStyles.headerBg} text-white`}>
              <h2 className="text-xl font-semibold">Current Standings</h2>
            </div>
            
            <div className="overflow-x-auto">
              {loading ? (
                <LoadingSpinner text="Loading points table..." />
              ) : error.hasError ? (
                <div className="p-8 text-center">
                  <div className="text-6xl mb-4">⚠️</div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {error.isServiceUnavailable ? 'Service Temporarily Unavailable' : 'Error Loading Data'}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {error.isServiceUnavailable 
                      ? 'The data service is currently unavailable. Please try again in a few minutes.' 
                      : error.message || 'Unable to load points table data'}
                  </p>
                  <button 
                    onClick={() => window.location.reload()} 
                    className={`${yearStyles.primaryBg} ${yearStyles.primaryBgHover} text-white px-6 py-2 rounded-lg font-medium transition duration-300`}
                  >
                    🔄 Retry
                  </button>
                </div>
              ) : !data ? (
                <div className="p-8 text-center text-gray-500">
                  No data available
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
                    {data.teams.map((team: PointsTableEntry, index: number) => (
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
                          {team.played || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-green-600 font-medium">
                          {team.won || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-red-600 font-medium">
                          {team.lost || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                          <span className={`${(team.netRunRate || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {(team.netRunRate || 0).toFixed(3)}
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