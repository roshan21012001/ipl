#!/usr/bin/env node
import { scrapePointsTable } from './scrapers/pointsTable.js';
import { scrapeMatches } from './scrapers/matches.js';
import { scrapeTeams } from './scrapers/teams.js';
import { respectfulDelay } from './utils/browser.js';

async function runPointsTableScraper(year = 2025) {
    const pointsTable = await scrapePointsTable(year);
    return pointsTable;
}

async function runMatchesScraper(year = 2025) {
    await respectfulDelay(3000, 6000);
    const matches = await scrapeMatches(year);
    return matches;
}

async function runTeamsScraper(year = 2025) {
    await respectfulDelay(3000, 6000);
    const teams = await scrapeTeams(year);
    return teams;
}

async function runAllScrapers() {
    try {
        const pointsTable = await runPointsTableScraper();
        const matches = await runMatchesScraper();
        const teams = await runTeamsScraper();
        
        return {
            pointsTable: pointsTable.teams.length,
            matches: matches.length,
            teams: teams.length
        };
    } catch (error) {
        throw new Error(`Scraping failed: ${error.message}`);
    }
}

// Handle command line arguments
const args = process.argv.slice(2);
const command = args[0];
const year = args[1] ? parseInt(args[1]) : 2025; // Get year from command line or default to 2025

switch (command) {
    case 'points':
        runPointsTableScraper(year).then(data => console.log(JSON.stringify(data)));
        break;
    case 'matches':
        runMatchesScraper(year).then(data => console.log(JSON.stringify(data)));
        break;
    case 'teams':
        runTeamsScraper(year).then(data => console.log(JSON.stringify(data)));
        break;
    default:
        runAllScrapers().then(results => console.log(JSON.stringify(results)));
}