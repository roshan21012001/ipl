import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

const USER_AGENTS = [
    // Chrome on macOS
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    
    // Chrome on Windows
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    
    // Safari on macOS
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Safari/605.1.15',
    
    // Firefox on Windows
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/120.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/119.0',
    
    // Edge on Windows
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0'
];

function getRandomUserAgent() {
    return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

function getRandomAcceptLanguage() {
    const languages = [
        'en-US,en;q=0.9',
        'en-US,en;q=0.8,es;q=0.7',
        'en-GB,en;q=0.9',
        'en-US,en;q=0.9,fr;q=0.8',
        'en-US,en;q=0.7,de;q=0.6'
    ];
    return languages[Math.floor(Math.random() * languages.length)];
}

export async function createBrowser() {
    const isVercel = !!process.env.VERCEL || !!process.env.AWS_LAMBDA_FUNCTION_NAME;
    const isProduction = process.env.NODE_ENV === 'production';
    
    console.log(`🚀 Initializing browser (Vercel: ${isVercel}, Production: ${isProduction}, Platform: ${process.platform})...`);
    
    let executablePath;
    let browserArgs = [];
    
    if (isVercel) {
        // Vercel serverless environment
        try {
            const chromiumPath = await chromium.executablePath();
            console.log(`🔧 Raw Chromium response:`, typeof chromiumPath, JSON.stringify(chromiumPath));
            
            // Handle different response types
            if (typeof chromiumPath === 'string') {
                executablePath = chromiumPath;
            } else if (chromiumPath && typeof chromiumPath === 'object' && chromiumPath.path) {
                executablePath = chromiumPath.path;
            } else if (chromiumPath && typeof chromiumPath === 'object' && chromiumPath.executablePath) {
                executablePath = chromiumPath.executablePath;
            } else {
                // Fallback to string conversion
                executablePath = String(chromiumPath);
            }
            
            console.log(`🔧 Final executablePath: ${executablePath}`);
        } catch (pathError) {
            console.error(`❌ Failed to get Chromium path:`, pathError);
            throw new Error(`Chromium executable path error: ${pathError.message}`);
        }
        
        browserArgs = [
            ...chromium.args,
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu',
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor',
            '--memory-pressure-off',
            '--max_old_space_size=1024',
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-renderer-backgrounding'
        ];
        console.log(`📍 Using Chromium for Vercel: ${executablePath}`);
    } else {
        // Local development
        const puppeteerPackage = await import('puppeteer');
        executablePath = puppeteerPackage.default.executablePath();
        browserArgs = [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-web-security'
        ];
        console.log(`📍 Using local Puppeteer: ${executablePath}`);
    }
    
    // Validate executable path
    if (!executablePath || typeof executablePath !== 'string') {
        throw new Error(`Invalid executable path: ${typeof executablePath} - ${executablePath}`);
    }
    
    const browserConfig = {
        headless: true,
        args: browserArgs,
        executablePath: executablePath,
        timeout: isVercel ? 60000 : 30000
    };
    
    console.log(`🔧 Browser config:`, { 
        isVercel, 
        executablePath: executablePath || 'system default',
        argsCount: browserConfig.args.length 
    });
    
    try {
        const browser = await puppeteer.launch(browserConfig);
        console.log(`✅ Browser launched successfully and ready`);
        return browser;
    } catch (error) {
        console.error(`❌ Browser launch failed:`, error.message);
        
        if (isVercel) {
            console.log(`🔄 Retrying with ultra-minimal config for Vercel...`);
            
            // Get fresh chromium path and try again
            try {
                await chromium.font('https://raw.githack.com/googlei18n/noto-emoji/master/fonts/NotoColorEmoji.ttf');
                const freshPath = await chromium.executablePath({
                    path: '/tmp/chromium'
                });
                
                const ultraMinimalConfig = {
                    headless: 'new',
                    args: [
                        '--no-sandbox',
                        '--disable-setuid-sandbox',
                        '--disable-dev-shm-usage',
                        '--disable-accelerated-2d-canvas',
                        '--disable-gpu',
                        '--disable-extensions',
                        '--disable-default-apps',
                        '--no-first-run',
                        '--no-zygote',
                        '--single-process',
                        '--disable-background-timer-throttling'
                    ],
                    executablePath: freshPath,
                    timeout: 60000
                };
                
                console.log(`🔄 Trying with fresh chromium path: ${freshPath}`);
                return await puppeteer.launch(ultraMinimalConfig);
                
            } catch (retryError) {
                console.error(`❌ Retry also failed:`, retryError.message);
                throw new Error(`Browser launch failed on Vercel: ${error.message} | Retry: ${retryError.message}`);
            }
        }
        
        throw error;
    }
}

export async function createPage(browser) {
    const page = await browser.newPage();
    
    // Set random user agent
    const userAgent = getRandomUserAgent();
    await page.setUserAgent(userAgent);
    console.log(`🔄 Using User Agent: ${userAgent.split(' ')[0]}...`);
    
    // Remove automation detection
    await page.evaluateOnNewDocument(() => {
        delete navigator.__proto__.webdriver;
        Object.defineProperty(navigator, 'webdriver', {
            get: () => undefined,
        });
        Object.defineProperty(navigator, 'plugins', {
            get: () => [1, 2, 3, 4, 5],
        });
        Object.defineProperty(navigator, 'languages', {
            get: () => ['en-US', 'en'],
        });
        window.chrome = {
            runtime: {},
        };
    });
    
    // Add random headers
    await page.setExtraHTTPHeaders({
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': getRandomAcceptLanguage(),
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
    });
    
    // Set random viewport
    const viewports = [
        { width: 1920, height: 1080 },
        { width: 1366, height: 768 },
        { width: 1440, height: 900 },
        { width: 1536, height: 864 },
        { width: 1280, height: 720 }
    ];
    const viewport = viewports[Math.floor(Math.random() * viewports.length)];
    await page.setViewport(viewport);
    
    return page;
}


export async function waitForPageLoad(page, timeout = 1000) {
    await new Promise(resolve => setTimeout(resolve, timeout));
}