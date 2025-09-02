# IPL Data Monorepo 🏆

A complete IPL data ecosystem with web scraping, server-side rendering, and frontend visualization.

## Project Structure

```
ipl_data/
├── scraper/           # Standalone web scraper for IPL data (Node.js + Puppeteer)
├── scraper-vercel/    # Vercel-specific API routes for scraping (using @sparticuz/chromium)
├── web-app/           # Next.js application (combines backend API routes and React frontend)
└── package.json       # Monorepo management
```

## Projects

### 🔧 Scraper (`./scraper/`)
- **Tech**: Node.js, Puppeteer
- **Purpose**: Standalone web scraper to fetch IPL points table, matches, and team data. Can be run independently.
- **Anti-bot**: User agent rotation, rate limiting
- **Data**: 74 matches, 10 teams, points table

### ⚡ Web App (`./web-app/`)
- **Tech**: Next.js 15, React, TypeScript, Tailwind CSS
- **Purpose**: Serves as both the backend (API routes for scraped data) and the frontend (data visualization and routing).
- **Features**: SSR pages, API routes for scraped data, IPL dashboard, match results, team standings.

### ☁️ Scraper Vercel (`./scraper-vercel/`)
- **Tech**: Node.js, @sparticuz/chromium, Puppeteer-core
- **Purpose**: Contains serverless functions specifically designed for scraping on Vercel, leveraging `@sparticuz/chromium` for headless browser capabilities. These functions are typically consumed by the `web-app` when deployed to Vercel.

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