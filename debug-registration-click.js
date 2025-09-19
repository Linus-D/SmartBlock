// Debug script to test registration click behavior
const testRegistrationClick = async () => {
  console.log('🔍 Testing registration click behavior...\n');
  
  try {
    // Test the registration endpoint
    const response = await fetch('http://localhost:5176');
    const html = await response.text();
    
    console.log('✅ Frontend accessible at port 5176');
    
    // Check if the form elements are present
    if (html.includes('Choose a username')) {
      console.log('✅ Registration form detected');
    }
    
    if (html.includes('Register')) {
      console.log('✅ Register button detected');
    }
    
    // Check for React hydration issues
    if (html.includes('hydration')) {
      console.log('⚠️ Potential hydration issue detected');
    }
    
    console.log('\n🎯 Manual test steps:');
    console.log('1. Open http://localhost:5176 in browser');
    console.log('2. Navigate to /connect (or click Get Started)');
    console.log('3. Enter username "testuser123"');
    console.log('4. Click Register button');
    console.log('5. Check browser console for errors');
    console.log('6. Look for navigation to /feed');
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
};

testRegistrationClick();
