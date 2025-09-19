// Debug registration flow by checking key components
const fs = require('fs');
const path = require('path');

console.log('🔍 Debugging SmartBlock Registration Flow...\n');

// Check if key files exist and have correct content
const filesToCheck = [
  'frontend/src/context/UserContext.tsx',
  'frontend/src/pages/Connect.tsx',
  'frontend/src/lib/mockService.ts',
  'frontend/src/lib/dataService.ts'
];

filesToCheck.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (fs.existsSync(fullPath)) {
    console.log(`✅ ${file} exists`);
    
    const content = fs.readFileSync(fullPath, 'utf8');
    
    // Check for key patterns
    if (file.includes('UserContext')) {
      const hasRegisterUser = content.includes('registerUser');
      const hasIsRegistered = content.includes('isRegistered: true');
      console.log(`   - registerUser function: ${hasRegisterUser ? '✅' : '❌'}`);
      console.log(`   - sets isRegistered: ${hasIsRegistered ? '✅' : '❌'}`);
    }
    
    if (file.includes('Connect.tsx')) {
      const hasNavigation = content.includes('navigate("/feed"');
      const hasUseEffect = content.includes('useEffect');
      console.log(`   - navigation to feed: ${hasNavigation ? '✅' : '❌'}`);
      console.log(`   - useEffect for navigation: ${hasUseEffect ? '✅' : '❌'}`);
    }
    
    if (file.includes('mockService')) {
      const hasIsRegistered = content.includes('isRegistered: true');
      const hasCreateProfile = content.includes('createProfile');
      console.log(`   - sets isRegistered in mock: ${hasIsRegistered ? '✅' : '❌'}`);
      console.log(`   - createProfile method: ${hasCreateProfile ? '✅' : '❌'}`);
    }
    
  } else {
    console.log(`❌ ${file} missing`);
  }
});

console.log('\n🔍 Checking for potential issues...');

// Check Connect.tsx for navigation logic
const connectPath = path.join(__dirname, 'frontend/src/pages/Connect.tsx');
if (fs.existsSync(connectPath)) {
  const content = fs.readFileSync(connectPath, 'utf8');
  
  // Check for hasNavigated reference
  const hasNavigatedRef = content.includes('hasNavigated.current');
  const hasTimeout = content.includes('setTimeout');
  const hasReplaceTrue = content.includes('replace: true');
  
  console.log(`Navigation logic checks:`);
  console.log(`   - hasNavigated ref: ${hasNavigatedRef ? '✅' : '❌'}`);
  console.log(`   - setTimeout delay: ${hasTimeout ? '✅' : '❌'}`);
  console.log(`   - replace: true: ${hasReplaceTrue ? '✅' : '❌'}`);
}

console.log('\n✅ Registration flow debug complete');
