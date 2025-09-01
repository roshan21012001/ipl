// No static imports - use dynamic imports only

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
    
    let chromium;
    
    // Try playwright-aws-lambda first for serverless, then regular playwright
    try {
        if (isLambda) {
            console.log('🔄 Trying playwright-aws-lambda...');
            const awsPlaywright = await import('playwright-aws-lambda');
            chromium = awsPlaywright.chromium;
            console.log('✅ Using playwright-aws-lambda for serverless');
        } else {
            console.log('🔄 Trying regular playwright...');
            const playwright = await import('playwright');
            chromium = playwright.chromium;
            console.log('✅ Using regular playwright for local');
        }
    } catch (primaryError) {
        console.log(`⚠️ Primary import failed: ${primaryError.message}`);
        
        // Try the other option as fallback
        try {
            if (isLambda) {
                console.log('🔄 Fallback to regular playwright...');
                const playwright = await import('playwright');
                chromium = playwright.chromium;
                console.log('✅ Fallback to regular playwright successful');
            } else {
                console.log('🔄 Fallback to playwright-aws-lambda...');
                const awsPlaywright = await import('playwright-aws-lambda');
                chromium = awsPlaywright.chromium;
                console.log('✅ Fallback to playwright-aws-lambda successful');
            }
        } catch (fallbackError) {
            console.error(`❌ Both imports failed:`, primaryError.message, fallbackError.message);
            throw new Error(`Cannot import chromium: ${primaryError.message} | ${fallbackError.message}`);
        }
    }
    
    if (!chromium) {
        throw new Error('Chromium is undefined after import attempts');
    }
    
    console.log('🚀 Launching chromium browser...');
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