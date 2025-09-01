import { createBrowser, createPage, waitForPageLoad } from '../utils/browser.js';

// Universal Points Table Parser for all IPL years (2008-2025)
function createColumnMap(headerRow) {
    console.log(`📊 Analyzing table structure:`, headerRow);
    
    const columnMap = {
        position: headerRow.indexOf('POS'),
        team: headerRow.indexOf('TEAM'),
        played: headerRow.indexOf('P'),
        won: headerRow.indexOf('W'),
        lost: headerRow.indexOf('L'),
        noResult: headerRow.indexOf('NR'),
        nrr: headerRow.indexOf('NRR'),
        for: headerRow.indexOf('FOR'),
        against: headerRow.indexOf('AGAINST'),
        points: headerRow.indexOf('PTS'),
        recentForm: headerRow.indexOf('RECENT FORM')
    };
    
    console.log(`📊 Column mapping:`, columnMap);
    return columnMap;
}

function parseTeamRow(row, columnMap, rowIndex) {
    try {
        const team = {
            position: parseInt(row[columnMap.position]) || rowIndex,
            team: row[columnMap.team] || '',
            played: parseInt(row[columnMap.played]) || 0,
            won: parseInt(row[columnMap.won]) || 0,
            lost: parseInt(row[columnMap.lost]) || 0,
            noResult: parseInt(row[columnMap.noResult]) || 0,
            netRunRate: parseFloat(row[columnMap.nrr]) || 0,
            runsFor: row[columnMap.for] || '',
            runsAgainst: row[columnMap.against] || '',
            points: parseInt(row[columnMap.points]) || 0,
            recentForm: row[columnMap.recentForm] || ''
        };
        
        // Validate team data
        if (!team.team || team.team.length > 5 || team.team.length < 2) {
            console.log(`⚠️ Invalid team data at row ${rowIndex}:`, team);
            return null;
        }
        
        return team;
    } catch (error) {
        console.log(`⚠️ Error parsing team row ${rowIndex}:`, error, row);
        return null;
    }
}

export async function scrapePointsTable(year = 2025) {
    console.log('DEBUG: Attempting to create browser...');
    const browser = await createBrowser();
    console.log('DEBUG: Browser created.');
    
    try {
        const page = await createPage(browser);
        
        console.log(`📊 Loading points table for ${year}...`);
        console.log(`DEBUG: Navigating to URL: https://www.iplt20.com/points-table/men/${year}`);
        await page.goto(`https://www.iplt20.com/points-table/men/${year}`);
        console.log('DEBUG: Page navigation initiated.');
        await waitForPageLoad(page);
        console.log('DEBUG: Page loaded.');
        
        // Wait for table to load
        await page.waitForSelector('table', { timeout: 10000 });
        
        // Extract table data
        const tableData = await page.$$eval('table tr', rows => 
            rows.map(row => 
                Array.from(row.cells || row.children).map(cell => cell.textContent.trim())
            ).filter(row => row.length > 0)
        );
        
        console.log(`📊 Extracted ${tableData.length} rows for ${year}`);
        
        if (tableData.length < 2) {
            throw new Error(`Insufficient table data for ${year}`);
        }
        
        // Create column mapping from header row
        const headerRow = tableData[0];
        const columnMap = createColumnMap(headerRow);
        
        // Validate essential columns exist
        if (columnMap.team === -1 || columnMap.played === -1) {
            console.log(`❌ Missing essential columns in ${year} table:`, headerRow);
            throw new Error(`Invalid table structure for ${year}`);
        }
        
        // Parse team rows using dynamic column mapping
        const teams = [];
        for (let i = 1; i < tableData.length && teams.length < 10; i++) {
            const row = tableData[i];
            
            // Skip rows that are too short or don't contain team data
            if (row.length < Math.max(...Object.values(columnMap)) + 1) {
                continue;
            }
            
            const teamData = parseTeamRow(row, columnMap, i);
            if (teamData) {
                teams.push(teamData);
            }
        }
        
        console.log(`✅ Successfully parsed ${teams.length} teams for ${year}`);
        console.log(`📊 Sample team:`, teams[0]);
        
        return {
            year,
            lastUpdated: new Date().toISOString(),
            teams,
            totalTeams: teams.length,
            tableStructure: columnMap // For debugging
        };
        
    } catch (error) {
        console.error('ERROR: An error occurred during scraping:', error);
        throw error; // Re-throw to ensure it's caught by the server.js handler
    } finally {
        if (browser) {
            await browser.close();
            console.log('DEBUG: Browser closed.');
        }
    }
}