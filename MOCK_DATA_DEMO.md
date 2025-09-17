# SmartBlock Mock/Real Data System Demo

## 🎯 Overview
The SmartBlock platform now supports seamless switching between mock data (for development) and real blockchain data (for production).

## 🚀 Quick Start

### 1. Environment Configuration
Add to your `.env` file:
```bash
# Data Service Configuration
# Options: 'mock', 'real', 'auto'
VITE_DATA_MODE=auto
```

### 2. Data Modes Explained

- **`mock`**: Always use sample data (great for rapid UI development)
- **`real`**: Always use blockchain data (production mode)
- **`auto`**: Smart switching based on environment (recommended)

### 3. Visual Data Mode Indicator

In development mode, you'll see a colored indicator in the bottom-right corner:
- **🟡 YELLOW**: Using mock data
- **🟢 GREEN**: Using real blockchain data

Click the indicator to switch modes during development!

## 📊 Mock Data Includes

### Users
- 5 realistic user profiles with usernames, bios, avatars
- Follow relationships between users
- Post counts and engagement metrics

### Posts
- 8 sample posts with varied content
- Realistic timestamps (recent activity)
- Like counts and engagement data
- IPFS image hashes for media content

### Social Features
- Comment threads on posts
- Like/unlike functionality
- Follow/unfollow relationships
- Chat messages between users

## 🛠️ Developer Usage

### Programmatic Mode Switching
```typescript
import { useContract } from './hooks/useContract';

const { getCurrentDataMode, setDataMode } = useContract();

// Check current mode
const mode = getCurrentDataMode();
console.log(`Using ${mode.usingMock ? 'mock' : 'real'} data`);

// Switch to mock data for testing
setDataMode(DataMode.MOCK);

// Switch to real blockchain data
setDataMode(DataMode.REAL);

// Auto-detect based on environment
setDataMode(DataMode.AUTO);
```

### Hook Usage (Same API for Both Modes)
```typescript
const { getUserProfile, getRecentPosts, createPost } = useContract();

// These work identically with mock or real data
const profile = await getUserProfile(userAddress);
const posts = await getRecentPosts(10);
await createPost("Hello SmartBlock!");
```

## 🧪 Testing the System

### Test Script
```typescript
import { testDataSystem } from './utils/testDataSystem';

// Run comprehensive test of mock/real data switching
await testDataSystem();
```

### Manual Testing Steps

1. **Start in Mock Mode**:
   - Set `VITE_DATA_MODE=mock`
   - Run `npm run dev`
   - See sample users and posts immediately

2. **Test Real Mode**:
   - Connect MetaMask wallet
   - Deploy smart contract
   - Set `VITE_DATA_MODE=real`
   - See blockchain data

3. **Test Auto Mode**:
   - Set `VITE_DATA_MODE=auto`
   - Watch it automatically switch based on wallet connection

## 🎨 UI Components Integration

All existing components work without changes:
- `PostCard` - Shows mock or real posts
- `UserProfile` - Displays mock or real user data
- `Feed` - Renders mock or real content feed
- `Messages` - Shows mock or real chat data

## 🔧 Development Benefits

### Faster Iteration
- No waiting for blockchain transactions
- Instant data loading
- Consistent test data

### Better Testing
- Predictable user scenarios
- Edge case simulation
- UI state testing

### Production Ready
- Seamless transition to real data
- Same API surface
- No code changes needed

## 📱 Example User Profiles

```typescript
// Sample mock users available immediately:
{
  username: 'alice_wonderland',
  bio: 'Exploring the blockchain rabbit hole 🐰',
  followers: 342,
  following: 89,
  posts: 15
}

{
  username: 'bob_builder',
  bio: 'Building the future with smart contracts 🔨',
  followers: 156,
  following: 201,
  posts: 23
}
// ... and more!
```

## 🎯 Production Deployment

For production, simply set:
```bash
VITE_DATA_MODE=real
VITE_CONTRACT_ADDRESS=0x...
VITE_CHAIN_ID=1
```

The system automatically uses real blockchain data with the same UI!

## ✅ Status

✅ Mock data system implemented
✅ Real data integration maintained
✅ Seamless switching functionality
✅ Visual mode indicator
✅ Backward compatibility
✅ Production ready

---

**Happy coding with SmartBlock! 🚀**