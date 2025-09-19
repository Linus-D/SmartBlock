// Comprehensive test for SmartBlock registration flow
const puppeteer = require('puppeteer');

async function testRegistrationFlow() {
  console.log('🚀 Starting comprehensive registration flow test...\n');
  
  let browser;
  try {
    // Launch browser
    browser = await puppeteer.launch({ 
      headless: false, 
      defaultViewport: null,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Listen for console messages
    page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();
      if (type === 'error') {
        console.log(`❌ Console Error: ${text}`);
      } else if (text.includes('Registration') || text.includes('Navigation')) {
        console.log(`📝 Console: ${text}`);
      }
    });
    
    // Navigate to the app
    console.log('📱 Navigating to SmartBlock app...');
    await page.goto('http://localhost:5175', { waitUntil: 'networkidle0' });
    
    // Wait for the page to load
    await page.waitForTimeout(2000);
    
    // Check if we're on the connect page
    const title = await page.title();
    console.log(`📄 Page title: ${title}`);
    
    // Look for registration form
    const usernameInput = await page.$('input[placeholder*="username" i], input[type="text"]');
    if (usernameInput) {
      console.log('✅ Found username input field');
      
      // Fill in username
      await usernameInput.type('testuser123');
      console.log('✏️ Entered username: testuser123');
      
      // Look for register button
      const registerButton = await page.$('button:contains("Register"), button[type="submit"]');
      if (registerButton) {
        console.log('✅ Found register button');
        
        // Click register
        await registerButton.click();
        console.log('🔄 Clicked register button');
        
        // Wait for registration to complete and navigation
        await page.waitForTimeout(3000);
        
        // Check current URL
        const currentUrl = page.url();
        console.log(`🌐 Current URL: ${currentUrl}`);
        
        if (currentUrl.includes('/feed')) {
          console.log('✅ Successfully navigated to feed page!');
        } else {
          console.log('❌ Still on registration page - navigation failed');
        }
        
      } else {
        console.log('❌ Register button not found');
      }
    } else {
      console.log('❌ Username input not found');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Check if puppeteer is available
try {
  testRegistrationFlow();
} catch (error) {
  console.log('⚠️ Puppeteer not available, running basic connectivity test instead...');
  
  // Fallback to basic test
  const testBasic = async () => {
    try {
      const response = await fetch('http://localhost:5175');
      const html = await response.text();
      
      console.log('✅ Frontend is accessible');
      
      if (html.includes('SmartBlock')) {
        console.log('✅ SmartBlock app loaded');
      }
      
      if (html.includes('username') || html.includes('register')) {
        console.log('✅ Registration form elements detected');
      }
      
    } catch (error) {
      console.log('❌ Basic test failed:', error.message);
    }
  };
  
  testBasic();
}
