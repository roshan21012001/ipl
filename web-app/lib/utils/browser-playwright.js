import { chromium as playwrightChromium } from 'playwright';

let chromium = playwrightChromium;

const USER_AGENTS = [
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15'
];

function getRandomUserAgent() {
    return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

export async function createBrowser() {
    const isLambda = !!process.env.AWS_LAMBDA_FUNCTION_NAME || !!process.env.VERCEL;
    
    console.log(`🌐 Creating Playwright browser (serverless: ${isLambda})...`);
    
    // Try to use playwright-aws-lambda for serverless, fallback to regular
    if (isLambda) {
        try {
            const awsPlaywright = await import('playwright-aws-lambda');
            console.log('✅ Using playwright-aws-lambda for serverless');
            chromium = awsPlaywright.chromium;
        } catch (error) {
            console.log('⚠️ playwright-aws-lambda not available, using regular playwright');
        }
    }
    
    const browser = await chromium.launch({
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor',
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-renderer-backgrounding',
            '--memory-pressure-off',
            '--disable-gpu',
            '--disable-images'
        ]
    });
    
    console.log('✅ Playwright browser created successfully');
    return browser;
}

export async function createPage(browser) {
    const context = await browser.newContext({
        userAgent: getRandomUserAgent(),
        viewport: { width: 1920, height: 1080 },
        extraHTTPHeaders: {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
        }
    });
    
    const page = await context.newPage();
    console.log(`🔄 Created new page with random user agent`);
    
    return page;
}

export async function waitForPageLoad(page, timeout = 1000) {
    await page.waitForTimeout(timeout);
}