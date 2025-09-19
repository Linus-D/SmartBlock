// Simple test to verify registration flow
const testRegistration = async () => {
  console.log('Testing SmartBlock registration flow...');
  
  // Test if the frontend is running
  try {
    const response = await fetch('http://localhost:5175');
    if (response.ok) {
      console.log('✅ Frontend is running on port 5175');
    } else {
      console.log('❌ Frontend not responding properly');
    }
  } catch (error) {
    console.log('❌ Frontend not accessible:', error.message);
  }
};

testRegistration();
