'use client';

import { useState } from 'react';
import TopNav from '@/components/TopNav';
import { useYear } from '@/contexts/YearContext';
import { getYearStyles } from '@/utils/gradients';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import PageHeader from '@/components/ui/PageHeader';
import TeamCard from '@/components/teams/TeamCard';
import { useData } from '@/lib/hooks/useData';
import { TeamsResponse, Team } from '@/lib/types';

export default function TeamsPage() {
  const [sortBy, setSortBy] = useState<string>('championships'); // default to championships
  const { selectedYear } = useYear();
  const { data, loading } = useData<TeamsResponse>('teams');
  const yearStyles = getYearStyles(selectedYear);
  
  // Sort teams based on selected criteria
  const sortedTeams = data?.teams ? [...data.teams].sort((a: Team, b: Team) => {
    if (sortBy === 'championships') {
      // Sort by number of titles (descending), then by name
      const aTitles = a.totalTitles || 0;
      const bTitles = b.totalTitles || 0;
      if (aTitles !== bTitles) {
        return bTitles - aTitles;
      }
    }
    return a.name.localeCompare(b.name);
  }) : [];
  
  return (
    <div className={`min-h-screen bg-gradient-to-br ${yearStyles.gradient}`}>
      <TopNav />
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <PageHeader title="🏏 IPL Teams Profile" lastUpdated={data?.lastUpdated || null} />
           <p className="text-lg text-gray-600 text-center mb-8">
              Current IPL teams with official information scraped from iplt20.com
            </p>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <div className="text-2xl mb-2">🏏</div>
              <div className="text-2xl font-bold text-blue-600">{data?.totalTeams || 0}</div>
              <div className="text-sm text-gray-600">Teams Found</div>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <div className="text-2xl mb-2">🏆</div>
              <div className="text-2xl font-bold text-green-600">{data?.championTeams || 0}</div>
              <div className="text-sm text-gray-600">Championship Teams</div>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <div className="text-2xl mb-2">📊</div>
              <div className="text-2xl font-bold text-purple-600">{data?.teams?.filter(team => (team.totalTitles || 0) === 0).length || 0}</div>
              <div className="text-sm text-gray-600">Teams Without Titles</div>
            </div>
          </div>

          {/* Info Message */}
          <div className="mb-8 text-center">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-2xl mx-auto">
              <p className="text-blue-800 text-sm">
                📡 <strong>Live Data:</strong> Team information and championship records scraped from the official IPL website. 
                {data?.note}
              </p>
            </div>
          </div>

          {loading || !data ? (
            <LoadingSpinner text="Scraping team data from iplt20.com..." />
          ) : sortedTeams.length > 0 ? (
            <div className="mb-12">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  🏏 IPL Teams & Championship Records
                </h2>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="name">Team Name</option>
                    <option value="championships">Championships</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedTeams.map((team: Team) => <TeamCard key={team.id} team={team} yearStyles={yearStyles} />)}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No teams data found</h3>
              <p className="text-gray-600 mb-4">
                Could not scrape team information from iplt20.com
              </p>
              <p className="text-sm text-gray-500">
                {data?.note || 'Please check the source website or try refreshing the data'}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/api/teams"
              className={`${yearStyles.secondaryBg} ${yearStyles.secondaryBgHover} text-white px-6 py-3 rounded-lg font-medium transition duration-300 text-center`}
            >
              📊 View Raw Scraped Data
            </a>
            <a
              href="/api/teams?refresh=true"
              className={`${yearStyles.primaryBg} ${yearStyles.primaryBgHover} text-white px-6 py-3 rounded-lg font-medium transition duration-300 text-center`}
            >
              🔄 Re-scrape Teams Data
            </a>
            <a
              href="https://www.iplt20.com/teams"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-medium transition duration-300 text-center"
            >
              🌐 Visit IPL Teams Page
            </a>
          </div>

          {/* Footer */}
          <footer className="text-center mt-12 pt-8 border-t border-gray-200">
            <p className="text-gray-500">
              Teams data scraped live from <a href="https://www.iplt20.com/teams" target="_blank" rel="noopener noreferrer" className="underline">iplt20.com/teams</a>
            </p>
            <p className="text-xs text-gray-400 mt-2">
              No hardcoded or dummy data used • Pure web scraping approach
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}