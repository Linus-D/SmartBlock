// Test utility to demonstrate the mock/real data system
import { dataService, DataMode } from '../lib/dataService';

export const testDataSystem = async () => {
  console.log('🧪 Testing SmartBlock Data System');
  console.log('==================================');

  // Show initial mode
  const initialMode = dataService.getCurrentMode();
  console.log(`📊 Initial mode: ${initialMode.mode} (using ${initialMode.usingMock ? 'MOCK' : 'REAL'} data)`);

  // Test mock mode
  console.log('\n🔄 Switching to MOCK mode...');
  dataService.setMode(DataMode.MOCK);

  try {
    // Initialize with mock data
    await dataService.initializeWithProvider(null);

    // Test getting mock users
    const mockUser = await dataService.getUserProfile('0x742d35Cc5FE4C9c5b6f8e8F57b7dB8D8d8d8d8d8');
    console.log('👤 Mock user profile:', mockUser?.username);

    // Test getting mock posts
    const mockPosts = await dataService.getRecentPosts(3);
    console.log(`📝 Mock posts (${mockPosts.length}):`, mockPosts.map(p => p.content.substring(0, 50) + '...'));

    // Test following data
    const followers = await dataService.getFollowers('0x742d35Cc5FE4C9c5b6f8e8F57b7dB8D8d8d8d8d8');
    console.log(`👥 Mock followers: ${followers.length}`);

  } catch (error) {
    console.error('❌ Error in mock mode:', error);
  }

  // Test switching to real mode (will likely fail without proper setup, but that's expected)
  console.log('\n🔄 Switching to REAL mode...');
  dataService.setMode(DataMode.REAL);

  const realMode = dataService.getCurrentMode();
  console.log(`📊 New mode: ${realMode.mode} (using ${realMode.usingMock ? 'MOCK' : 'REAL'} data)`);

  console.log('\n✅ Data system test completed!');
  console.log('💡 Use the Data Mode Indicator in the bottom-right corner to switch modes in the UI');
};