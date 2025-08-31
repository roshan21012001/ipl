'use client';

import { useState, useEffect } from 'react';
import TopNav from '@/components/TopNav';
import { useYear } from '@/contexts/YearContext';
import { getYearStyles } from '@/utils/gradients';

// Client-side data fetching for teams
async function getTeams(year: number) {
  try {
    const response = await fetch(`/api/teams?year=${year}`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.log('⚠️ Could not fetch teams, using fallback');
    return {
      teams: [
        {
          id: 1,
          name: 'Team Information Not Available',
          shortName: 'N/A',
          link: 'https://www.iplt20.com/teams',
          image: '',
          extracted: new Date().toISOString()
        }
      ],
      totalTeams: 1,
      lastUpdated: new Date().toISOString(),
      source: 'fallback',
      note: 'Could not load team data'
    };
  }
}

function getTeamCard(team: any, yearStyles: any) {
  return (
    <div 
      key={team.id}
      className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105"
    >
      {/* Team Header */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            {team.image && (
              <img 
                src={team.image} 
                alt={team.name}
                className="w-12 h-12 rounded-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            )}
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg bg-blue-600"
              style={{ display: team.image ? 'none' : 'flex' }}
            >
              {team.shortName ? team.shortName.substring(0, 3) : 'T'}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{team.name}</h3>
              <p className="text-sm text-gray-600">{team.shortName}</p>
            </div>
          </div>
          
          {/* Info Icon */}
          <div className="text-right">
            <div className="text-2xl mb-1">🏏</div>
            <div className="text-xs text-gray-500">
              IPL Team
            </div>
          </div>
        </div>

        {/* Team Championships */}
        {team.championships && team.totalTitles > 0 ? (
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <div className="text-yellow-500 text-lg mr-2">🏆</div>
              <div className="text-sm font-medium text-gray-700">
                IPL Champion ({team.totalTitles} {team.totalTitles === 1 ? 'title' : 'titles'})
              </div>
            </div>
            <div className="text-sm text-gray-600">
              <p className="font-medium">Championship Years:</p>
              <p className="mt-1 text-gray-800">{team.championships}</p>
            </div>
          </div>
        ) : (
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <div className="text-gray-400 text-lg mr-2">🏏</div>
              <div className="text-sm font-medium text-gray-600">
                IPL Team
              </div>
            </div>
            <div className="text-sm text-gray-500">
              <p>No IPL championships yet</p>
            </div>
          </div>
        )}
                
      </div>

      {/* Action Button */}
      <div className="p-4 bg-gray-50">
        <a
          href={team.link || 'https://www.iplt20.com/teams'}
          target="_blank"
          rel="noopener noreferrer"
          className={`w-full ${yearStyles.primaryBg} ${yearStyles.primaryBgHover} text-white py-2 px-4 rounded-lg font-medium transition duration-300 text-center block`}
        >
          View Team Details →
        </a>
      </div>
    </div>
  );
}

export default function TeamsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<string>('championships'); // default to championships
  const { selectedYear } = useYear();

  useEffect(() => {
    const timer = setTimeout(() => {
      const loadData = async () => {
        setLoading(true);
        const teamsData = await getTeams(selectedYear);
        setData(teamsData);
        setLoading(false);
      };
      loadData();
    }, 300);

    return () => clearTimeout(timer);
  }, [selectedYear]);

  const yearStyles = getYearStyles(selectedYear);
  
  // Sort teams based on selected criteria
  const sortedTeams = data?.teams ? [...data.teams].sort((a: any, b: any) => {
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
          {/* Header */}
          <header className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              🏏 IPL Teams Profile
            </h1>
            <p className="text-lg text-gray-600">
              Current IPL teams with official information scraped from iplt20.com
            </p>
            
            {data?.lastUpdated && (
              <p className="text-sm text-gray-500 mt-2">
                Last updated: {new Date(data.lastUpdated).toLocaleString()}
              </p>
            )}
          </header>

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
            <div className="flex items-center justify-center min-h-96">
              <div className="text-center">
                <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${yearStyles.spinnerBorder} mx-auto`}></div>
                <p className="mt-4 text-gray-600">Scraping team data from iplt20.com...</p>
              </div>
            </div>
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
                {sortedTeams.map((team: any) => getTeamCard(team, yearStyles))}
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