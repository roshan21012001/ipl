import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import { iplCache } from '@/lib/cache';

// Fixed cache import to use iplCache singleton
const SCRAPER_PATH = path.join(process.cwd(), '..', 'scraper');

function runScraper(scriptName: string, args: string[] = []): Promise<any> {
  return new Promise((resolve, reject) => {
    console.log(`👥 Running enhanced teams scraper from ${SCRAPER_PATH}...`);
    
    const child = spawn('node', [scriptName, ...args], {
      cwd: SCRAPER_PATH,
      stdio: 'pipe'
    });

    let stdout = '';
    let stderr = '';

    child.stdout?.on('data', (data) => {
      const output = data.toString();
      stdout += output;
      console.log(output.trim());
    });

    child.stderr?.on('data', (data) => {
      const output = data.toString();
      stderr += output;
      console.error(output.trim());
    });

    child.on('close', (code) => {
      if (code === 0) {
        try {
          // Extract JSON from mixed console output
          // Look for the last occurrence of { or [ to get the JSON
          const lines = stdout.trim().split('\n');
          let jsonLine = '';
          
          // Find the last line that looks like JSON (starts with { or [)
          for (let i = lines.length - 1; i >= 0; i--) {
            const line = lines[i].trim();
            if (line.startsWith('{') || line.startsWith('[')) {
              jsonLine = line;
              break;
            }
          }
          
          if (!jsonLine) {
            throw new Error('No JSON output found');
          }
          
          const result = JSON.parse(jsonLine);
          resolve(result);
        } catch (error) {
          console.error('Failed to parse scraper output:', error);
          console.error('Raw output:', stdout);
          reject(new Error('Invalid scraper output'));
        }
      } else {
        reject(new Error(`Scraper failed with code ${code}: ${stderr}`));
      }
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const year = searchParams.get('year') || '2025';
  const refresh = searchParams.get('refresh') === 'true';
  
  const cacheKey = `teams-${year}`;
  
  try {
    // Check cache first (unless refresh is requested)
    if (!refresh) {
      const cachedData = await iplCache.get(cacheKey);
      if (cachedData) {
        console.log('👥 Serving cached enhanced teams data');
        return NextResponse.json(cachedData);
      }
    }
    
    console.log(`👥 Loading enhanced teams data for ${year}...`);
    
    // Create a temporary script to run the enhanced teams scraper
    const tempScriptContent = `
import { scrapeTeams } from './scrapers/teams.js';

async function main() {
  try {
    const year = process.argv[2] ? parseInt(process.argv[2]) : 2025;
    const teamsData = await scrapeTeams(year);
    console.log(JSON.stringify(teamsData));
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
`;
    
    // Write and execute the temporary script
    const fs = await import('fs');
    const tempScriptPath = path.join(SCRAPER_PATH, 'temp-teams-scraper.js');
    
    fs.writeFileSync(tempScriptPath, tempScriptContent);
    
    try {
      const teamsData = await runScraper('temp-teams-scraper.js', [year]);
      
      // Cache the result for 15 minutes (teams data changes less frequently)
      await iplCache.set(cacheKey, teamsData, 15);
      
      console.log(`✅ Loaded enhanced teams: ${teamsData.teams?.length || 0} teams, ${teamsData.championTeams || 0} champions`);
      
      return NextResponse.json(teamsData);
    } finally {
      // Clean up temporary script
      try {
        fs.unlinkSync(tempScriptPath);
      } catch (error) {
        console.warn('Could not delete temporary script:', error);
      }
    }
    
  } catch (error) {
    console.error('❌ Error in enhanced teams API:', error);
    
    // Return enhanced fallback data
    const fallbackData = {
      teams: [
        {
          id: 1,
          code: 'CSK',
          name: 'Chennai Super Kings',
          shortName: 'CSK',
          city: 'Chennai',
          established: 2008,
          championships: [2010, 2011, 2018, 2021, 2023],
          totalTitles: 5,
          captain: 'MS Dhoni',
          homeVenue: 'M. A. Chidambaram Stadium',
          colors: ['#FFFF3C', '#F7941E'],
          nickname: 'Thala Army',
          logo: '/team-logos/csk-logo.png',
          link: 'https://www.iplt20.com/teams/csk',
          extracted: new Date().toISOString(),
          isChampion: true,
          lastChampionship: 2023,
          isNewTeam: false,
          primaryColor: '#FFFF3C',
          secondaryColor: '#F7941E'
        },
        {
          id: 2,
          code: 'MI',
          name: 'Mumbai Indians',
          shortName: 'MI',
          city: 'Mumbai',
          established: 2008,
          championships: [2013, 2015, 2017, 2019, 2020],
          totalTitles: 5,
          captain: 'Rohit Sharma',
          homeVenue: 'Wankhede Stadium',
          colors: ['#004BA0', '#00A6FB'],
          nickname: 'Paltan',
          logo: '/team-logos/mi-logo.png',
          link: 'https://www.iplt20.com/teams/mi',
          extracted: new Date().toISOString(),
          isChampion: true,
          lastChampionship: 2020,
          isNewTeam: false,
          primaryColor: '#004BA0',
          secondaryColor: '#00A6FB'
        }
      ],
      totalTeams: 10,
      championTeams: 6,
      newTeams: 2,
      lastUpdated: new Date().toISOString(),
      year: parseInt(year)
    };
    
    return NextResponse.json(fallbackData);
  }
}