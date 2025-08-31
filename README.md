# IPL Data Monorepo 🏆

A complete IPL data ecosystem with web scraping, server-side rendering, and frontend visualization.

## Project Structure

```
ipl_data/
├── scraper/           # Web scraper for IPL data (Node.js + Puppeteer)
├── backend-nextjs/    # Next.js SSR backend API
├── frontend-react/    # React frontend with routing
└── package.json       # Monorepo management
```

## Projects

### 🔧 Scraper (`./scraper/`)
- **Tech**: Node.js, Puppeteer
- **Purpose**: Scrape IPL points table, matches, and team data
- **Anti-bot**: User agent rotation, rate limiting
- **Data**: 74 matches, 10 teams, points table

### ⚡ Backend Next.js (`./backend-nextjs/`)
- **Tech**: Next.js 15, TypeScript, Tailwind CSS
- **Purpose**: Server-side rendering, API endpoints
- **Features**: SSR pages, API routes for scraped data

### 🎨 Frontend React (`./frontend-react/`)
- **Tech**: React, TypeScript
- **Purpose**: Data visualization and routing
- **Features**: IPL dashboard, match results, team standings

## Quick Start

```bash
# Install all dependencies
npm run install:all

# Start all projects in development
npm run dev

# Or start individually
npm run dev:scraper    # Scraper utilities
npm run dev:backend    # Next.js on localhost:3000
npm run dev:frontend   # React on localhost:3001

# Run scrapers
npm run scrape:points  # Get points table
npm run scrape:matches # Get all matches
npm run scrape:teams   # Get team data
npm run scrape:all     # Get everything
```

## Build for Production

```bash
npm run build
```

## Development Workflow

1. **Scraper**: Extract fresh IPL data
2. **Backend**: Serve data via SSR/API
3. **Frontend**: Display and interact with data

## Data Flow

```
IPL Website → Scraper → JSON Data → Next.js API → React Frontend
```