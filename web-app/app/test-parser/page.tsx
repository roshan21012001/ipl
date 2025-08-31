'use client';

import { useState, useEffect } from 'react';
import TopNav from '@/components/TopNav';
import { IPL_YEARS } from '@/utils/gradients';

interface TestResult {
  year: number;
  success: boolean;
  raw: unknown;
  parsed: unknown;
  [key: string]: unknown;
}

// Copy the same parsing function
function parseMatchData(description: string) {
  if (!description) return null;
  
  try {
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
    
    // Universal team & score pattern
    const teamPattern = /\b([A-Z]{2,5})\s+(\d+(?:\/\d+)?)\s*\(\s*([0-9.]+)\s*OV\s*\)/gi;
    const teams = [];
    let match;
    
    teamPattern.lastIndex = 0;
    
    while ((match = teamPattern.exec(description)) !== null) {
      teams.push({
        code: match[1],
        score: match[2],
        overs: match[3]
      });
    }
    
    // Get unique teams
    const uniqueTeams = [];
    const seenCodes = new Set();
    
    for (const team of teams) {
      if (!seenCodes.has(team.code)) {
        uniqueTeams.push(team);
        seenCodes.add(team.code);
      }
    }
    
    // Determine winner
    if (winnerMatch && uniqueTeams.length >= 2) {
      const winnerName = winnerMatch[1].trim().toLowerCase();
      
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
      
      if (!winner) {
        for (const team of uniqueTeams) {
          if (winnerName.includes(team.code.toLowerCase())) {
            winner = team.code;
            break;
          }
        }
      }
    }
    
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
    
  } catch (error) {
    console.warn('Error parsing match data:', error, description);
  }
  
  return null;
}

export default function TestParser() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(false);
  
  async function testAllYears() {
    setLoading(true);
    const results = [];
    
    for (const year of IPL_YEARS) { // Test all years
      try {
        const response = await fetch(`/api/matches?year=${year}`);
        const data = await response.json();
        const firstMatch = data.matches[0];
        
        if (firstMatch) {
          const parsed = parseMatchData(firstMatch.description);
          results.push({
            year,
            raw: firstMatch.description,
            parsed,
            success: parsed !== null && parsed.result !== ''
          });
        }
      } catch (error) {
        results.push({
          year,
          raw: `Error: ${error}`,
          parsed: null,
          success: false
        });
      }
    }
    
    setTestResults(results);
    setLoading(false);
  }
  
  useEffect(() => {
    testAllYears();
  }, []);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <TopNav />
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Parser Test Results</h1>
          
          <button 
            onClick={testAllYears}
            disabled={loading}
            className="mb-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Re-test Parser'}
          </button>
          
          <div className="space-y-6">
            {testResults.map((result, i) => (
              <div key={i} className={`p-4 rounded-lg border-2 ${result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                <h3 className="font-bold text-lg mb-2">
                  {result.year} - {result.success ? '✅ SUCCESS' : '❌ FAILED'}
                </h3>
                
                <div className="mb-3">
                  <strong>Raw Data:</strong>
                  <pre className="text-xs bg-gray-100 p-2 mt-1 rounded overflow-x-auto">
                    {JSON.stringify(result.raw, null, 2)}
                  </pre>
                </div>
                
                <div>
                  <strong>Parsed Result:</strong>
                  <pre className="text-xs bg-gray-100 p-2 mt-1 rounded">
                    {JSON.stringify(result.parsed, null, 2)}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}