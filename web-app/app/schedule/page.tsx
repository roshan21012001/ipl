'use client';

import { useState, useEffect } from 'react';
import TopNav from '@/components/TopNav';
import { useYear } from '@/contexts/YearContext';
import { getYearStyles, IPL_YEARS } from '@/utils/gradients';

// Universal IPL Match Data Parser (2008-2025)
function parseMatchData(description: string) {
  if (!description) return null;
  
  try {
    // Removed debug logging for cleaner console
    
    // Handle special cases
    const isAbandoned = /Match Abandoned|abandoned/i.test(description);
    const isNoResult = /No Result/i.test(description);
    
    if (isAbandoned || isNoResult) {
      const teamCodes = description.match(/\b([A-Z]{2,5})\b(?!\s*OV)/g);
      if (teamCodes && teamCodes.length >= 2) {
        return {
          team1: { name: teamCodes[0], code: teamCodes[0], score: '', overs: '' },
          team2: { name: teamCodes[1], code: teamCodes[1], score: '', overs: '' },
          result: isAbandoned ? 'Abandoned' : 'No Result',
          status: 'abandoned',
          winner: ''
        };
      }
    }
    
    // Universal winner extraction (case-insensitive)
    const winnerMatch = description.match(/^(.+?)\s+won\s+by/i);
    let winner = '';
    
    // Universal team & score pattern - handles both formats
    // Pattern: TEAM_CODE score (overs OV)
    const teamPattern = /\b([A-Z]{2,5})\s+(\d+(?:\/\d+)?)\s*\(\s*([0-9.]+)\s*OV\s*\)/gi;
    const teams = [];
    let match;
    
    // Reset regex state
    teamPattern.lastIndex = 0;
    
    while ((match = teamPattern.exec(description)) !== null) {
      teams.push({
        code: match[1],
        score: match[2],
        overs: match[3]
      });
    }
    
    // Get unique teams (some descriptions repeat winner team)
    const uniqueTeams = [];
    const seenCodes = new Set();
    
    for (const team of teams) {
      if (!seenCodes.has(team.code)) {
        uniqueTeams.push(team);
        seenCodes.add(team.code);
      }
    }
    
    // Determine winner by mapping team name to code
    if (winnerMatch && uniqueTeams.length >= 2) {
      const winnerName = winnerMatch[1].trim().toLowerCase();
      
      // Create mapping for team names to codes
      const teamNameMap: Record<string, string> = {
        'mumbai indians': 'MI',
        'chennai super kings': 'CSK', 
        'royal challengers bengaluru': 'RCB',
        'royal challengers bangalore': 'RCB',
        'kolkata knight riders': 'KKR',
        'rajasthan royals': 'RR',
        'delhi capitals': 'DC',
        'delhi daredevils': 'DD',
        'punjab kings': 'PBKS',
        'kings xi punjab': 'PBKS',
        'sunrisers hyderabad': 'SRH',
        'gujarat titans': 'GT',
        'lucknow super giants': 'LSG',
        'deccan chargers': 'DC'
      };
      
      winner = teamNameMap[winnerName] || '';
      
      // If not found in mapping, check if winner name contains any team code
      if (!winner) {
        for (const team of uniqueTeams) {
          if (winnerName.includes(team.code.toLowerCase())) {
            winner = team.code;
            break;
          }
        }
      }
    }
    
    // Winner determination complete
    
    if (uniqueTeams.length >= 2) {
      return {
        team1: { 
          name: uniqueTeams[0].code, 
          code: uniqueTeams[0].code, 
          score: uniqueTeams[0].score, 
          overs: uniqueTeams[0].overs
        },
        team2: { 
          name: uniqueTeams[1].code, 
          code: uniqueTeams[1].code, 
          score: uniqueTeams[1].score, 
          overs: uniqueTeams[1].overs
        },
        result: winner,
        status: 'completed',
        winner: winner
      };
    }
    
    // Failed to parse - insufficient team data
    
  } catch (error) {
    console.warn('Error parsing match data:', error, description);
  }
  
  return null;
}

// Client-side data fetching with year parameter
async function getSchedule(year: number) {
  try {
    const response = await fetch(`/api/schedule?year=${year}`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.log('⚠️ Could not fetch schedule, using fallback');
    return {
      matches: [
        { 
          id: 1, 
          team1: 'MI', 
          team2: 'CSK', 
          date: '2025-03-15', 
          time: '19:30',
          venue: 'Wankhede Stadium',
          status: 'upcoming'
        },
        { 
          id: 2, 
          team1: 'RCB', 
          team2: 'KKR', 
          date: '2025-03-16', 
          time: '15:30',
          venue: 'Chinnaswamy Stadium',
          status: 'upcoming'
        }
      ],
      totalMatches: 74,
      upcomingMatches: 2,
      completedMatches: 0,
      lastUpdated: null
    };
  }
}

export default function Schedule() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { selectedYear, setSelectedYear } = useYear();

  useEffect(() => {
    // Add a small delay to show tab switch first
    const timer = setTimeout(() => {
      const loadData = async () => {
        setLoading(true);
        const scheduleData = await getSchedule(selectedYear);
        // Debug logging removed for cleaner console
        setData(scheduleData);
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
              📅 IPL Schedule {selectedYear}
            </h1>
            
            
            {data?.lastUpdated && (
              <p className="text-sm text-gray-500">
                Last updated: {new Date(data.lastUpdated).toLocaleString()}
              </p>
            )}
          </header>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <div className="text-2xl mb-2">🏏</div>
              <div className="text-2xl font-bold text-blue-600">{data?.totalMatches || 74}</div>
              <div className="text-sm text-gray-600">Total Matches</div>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <div className="text-2xl mb-2">⏳</div>
              <div className="text-2xl font-bold text-green-600">{data?.upcomingMatches ?? 0}</div>
              <div className="text-sm text-gray-600">Upcoming</div>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <div className="text-2xl mb-2">✅</div>
              <div className="text-2xl font-bold text-gray-600">{data?.completedMatches || 0}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
          </div>

          {/* Matches List */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className={`px-6 py-4 ${yearStyles.headerBg} text-white`}>
              <h2 className="text-xl font-semibold">Match Schedule</h2>
            </div>
            
            {loading || !data ? (
              <div className="flex items-center justify-center min-h-96">
                <div className="text-center">
                  <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${yearStyles.spinnerBorder} mx-auto`}></div>
                  <p className="mt-4 text-gray-600">Loading schedule...</p>
                </div>
              </div>
            ) : (
              <>
                {data.matches && data.matches.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Match
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Teams
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Score
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Result
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {data.matches.map((match: any, index: number) => {
                          const parsedMatch = parseMatchData(match.description || match.text || '');
                          
                          return (
                            <tr key={match.id || index} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                #{index + 1}
                              </td>
                              <td className="px-6 py-4 text-center">
                                {parsedMatch ? (
                                  <div className="flex items-center justify-center space-x-3">
                                    <div className="text-sm font-medium text-blue-600">
                                      {parsedMatch.team1.code}
                                    </div>
                                    <div className="text-xs text-gray-500">vs</div>
                                    <div className="text-sm font-medium text-red-600">
                                      {parsedMatch.team2.code}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-xs text-gray-700 max-w-xs truncate">
                                    {(match.description || match.text || 'Match details not available').substring(0, 50)}...
                                  </div>
                                )}
                              </td>
                              <td className="px-6 py-4 text-center">
                                {parsedMatch && parsedMatch.team1.score ? (
                                  <div className="text-sm">
                                    <div className="text-blue-600 font-medium">
                                      {parsedMatch.team1.score} ({parsedMatch.team1.overs})
                                    </div>
                                    <div className="text-red-600 font-medium">
                                      {parsedMatch.team2.score} ({parsedMatch.team2.overs})
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-xs text-gray-500">TBD</span>
                                )}
                              </td>
                              <td className="px-6 py-4 text-center">
                                {parsedMatch?.result ? (
                                  <div className="text-xs text-gray-700 max-w-xs">
                                    {parsedMatch.result}
                                  </div>
                                ) : (
                                  <span className="text-xs text-gray-500">-</span>
                                )}
                              </td>
                              <td className="px-6 py-4 text-center">
                                <span className={`
                                  px-2 py-1 rounded-full text-xs font-medium
                                  ${parsedMatch?.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                    parsedMatch?.status === 'upcoming' ? 'bg-green-100 text-green-800' :
                                    parsedMatch?.status === 'abandoned' ? 'bg-red-100 text-red-800' :
                                    'bg-gray-100 text-gray-800'}
                                `}>
                                  {parsedMatch?.status || 'scheduled'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    <div className="text-4xl mb-4">🏏</div>
                    <p>No matches data available</p>
                    <p className="text-sm mt-2">Try refreshing the data</p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={`/api/schedule?year=${selectedYear}`}
              className={`${yearStyles.secondaryBg} ${yearStyles.secondaryBgHover} text-white px-6 py-3 rounded-lg font-medium transition duration-300 text-center`}
            >
              📅 View Raw API Data
            </a>
            <a
              href={`/api/schedule?year=${selectedYear}&refresh=true`}
              className={`${yearStyles.primaryBg} ${yearStyles.primaryBgHover} text-white px-6 py-3 rounded-lg font-medium transition duration-300 text-center`}
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