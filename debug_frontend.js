const { chromium } = require('playwright');

async function debugFrontend() {
  console.log('🚀 Debugging StriveTrack Frontend Issues...\n');
  
  const browser = await chromium.launch({ headless: false }); // Show browser to see issues
  const page = await browser.newPage();
  
  // Capture all console messages
  page.on('console', msg => {
    console.log(`📋 Console [${msg.type()}]:`, msg.text());
  });
  
  // Capture page errors
  page.on('pageerror', error => {
    console.log(`❌ Page Error:`, error.message);
    console.log(`   Stack:`, error.stack);
  });
  
  // Capture request failures
  page.on('requestfailed', request => {
    console.log(`🔴 Request Failed: ${request.method()} ${request.url()}`);
    console.log(`   Failure: ${request.failure()?.errorText}`);
  });
  
  // Capture responses
  page.on('response', response => {
    if (response.status() >= 400) {
      console.log(`⚠️  Response Error: ${response.status()} ${response.url()}`);
    }
  });
  
  try {
    console.log('1️⃣ Navigating to site...');
    await page.goto('https://3c01a5fb.strivetrackapp2-0.pages.dev', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    console.log('2️⃣ Taking initial screenshot...');
    await page.screenshot({ path: 'initial_load.png', fullPage: true });
    
    // Check if the app loaded
    const bodyText = await page.textContent('body');
    console.log('Body content preview:', bodyText.substring(0, 200));
    
    // Check for React root
    const hasReactRoot = await page.locator('#root').count() > 0;
    console.log('React root element exists:', hasReactRoot);
    
    if (hasReactRoot) {
      console.log('3️⃣ Checking for React app...');
      await page.waitForTimeout(5000); // Wait for React to load
      
      const reactExists = await page.evaluate(() => {
        return typeof window !== 'undefined' && 
               (window.React || window.__REACT_DEVTOOLS_GLOBAL_HOOK__ || 
                document.querySelector('[data-reactroot]') ||
                document.querySelector('#root').children.length > 0);
      });
      
      console.log('React detected:', reactExists);
      
      // Check for JavaScript errors
      const jsErrors = await page.evaluate(() => {
        return window.__jsErrors || [];
      });
      
      console.log('JavaScript Errors:', jsErrors);
    }
    
    console.log('4️⃣ Taking final screenshot...');
    await page.screenshot({ path: 'final_state.png', fullPage: true });
    
    console.log('\n🎯 Debug Complete!');
    console.log('Check the screenshots: initial_load.png and final_state.png');
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
    await page.screenshot({ path: 'error_state.png', fullPage: true });
    console.log('Error screenshot saved as error_state.png');
  } finally {
    await browser.close();
  }
}

debugFrontend();