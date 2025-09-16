# SmartBlock Frontend-Backend Integration Guide

This guide explains how the frontend is connected to the backend smart contracts in the refactored SmartBlock architecture.

## 🏗️ Architecture Overview

```
┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│     Frontend        │    │    Integration      │    │     Backend         │
│    (React App)     │◄──►│     Services        │◄──►│  (Smart Contracts)  │
└─────────────────────┘    └─────────────────────┘    └─────────────────────┘
```

## 🔧 Key Integration Components

### 1. Contract Configuration (`frontend/src/lib/contractConfig.ts`)

**Purpose**: Centralized configuration for contract addresses, ABIs, and network settings.

```typescript
export const CONTRACT_CONFIG = {
  address: import.meta.env.VITE_CONTRACT_ADDRESS || "",
  abi: CONTRACT_ABI,
  supportedChainIds: [31337, 11155111] // Local and Sepolia
};
```

**Features**:
- ✅ Environment-based configuration
- ✅ Multiple network support
- ✅ Type-safe contract interface

### 2. Contract Service (`frontend/src/lib/contractService.ts`)

**Purpose**: Singleton service that handles all smart contract interactions.

```typescript
export class SocialMediaContractService {
  // User Management
  async getUserInfo(address: string): Promise<ContractUser>
  async registerUser(username: string): Promise<string>

  // Post System
  async createPost(content: string, ipfsHash?: string): Promise<string>
  async likePost(postId: number): Promise<string>

  // Social Features
  async followUser(userAddress: string): Promise<string>
  async getFollowers(address: string): Promise<string[]>
}
```

**Features**:
- ✅ Provider/Signer initialization
- ✅ Error handling and validation
- ✅ Type-safe return types
- ✅ Event listening support

### 3. Contract Hook (`frontend/src/hooks/useContract.ts`)

**Purpose**: React hook that provides contract functionality to components.

```typescript
export const useContract = () => {
  const { provider, signer, account, chainId, isConnected } = useWeb3();

  return {
    // State
    isContractReady,
    error,
    loading,

    // Functions
    registerUserOnContract,
    getUserInfo,
    createPost,
    likePost,
    followUser
  };
};
```

**Features**:
- ✅ Automatic contract initialization
- ✅ Network validation
- ✅ Transaction state management
- ✅ React-optimized with useCallback

### 4. Web3 Context (`frontend/src/context/Web3Context.tsx`)

**Purpose**: Manages wallet connection and Web3 provider state.

```typescript
interface Web3ContextType {
  provider: ethers.Provider | null;
  signer: ethers.Signer | null;
  account: string | null;
  chainId: number | null;
  isConnected: boolean;
  connectWallet: () => Promise<void>;
  switchNetwork: () => Promise<void>;
}
```

**Features**:
- ✅ MetaMask integration
- ✅ Automatic reconnection
- ✅ Network switching
- ✅ Account change handling

### 5. User Context (`frontend/src/context/UserContext.tsx`)

**Purpose**: Manages user state and profile data from smart contracts.

```typescript
interface UserContextType {
  currentUser: User | null;
  isLoading: boolean;
  registerUser: (username: string) => Promise<void>;
  updateProfilePicture: (ipfsHash: string) => Promise<void>;
  refreshUserData: () => Promise<void>;
}
```

**Features**:
- ✅ Automatic user data loading
- ✅ Profile management
- ✅ Social metrics (followers, posts)

## 🔗 Data Flow

### User Registration Flow
```
1. User clicks "Register" → UserContext.registerUser()
2. UserContext → useContract.registerUserOnContract()
3. useContract → contractService.registerUser()
4. contractService → SocialMediaPlatform.registerUser() [Smart Contract]
5. Transaction confirmed → UserContext.loadUserData()
6. UI updates with new user state
```

### Post Creation Flow
```
1. User submits post → Component calls useContract.createPost()
2. useContract → contractService.createPost()
3. contractService → SocialMediaPlatform.createPost() [Smart Contract]
4. PostCreated event emitted → Frontend can listen for real-time updates
5. UI refreshes feed with new post
```

## 🚀 Deployment Integration

### Development Setup

The deployment script automatically creates frontend configuration:

```typescript
// Project_Backend/scripts/deploy.ts
const frontendEnvPath = path.join(__dirname, "../../frontend/.env.local");
const envContent = `
VITE_CONTRACT_ADDRESS=${contractAddress}
VITE_CHAIN_ID=${deploymentInfo.chainId}
VITE_NETWORK_NAME=${deploymentInfo.network}
`;
fs.writeFileSync(frontendEnvPath, envContent);
```

### Automatic Configuration

1. **Deploy Contract**: `cd Project_Backend && npm run deploy:local`
2. **Auto-Generated**:
   - `frontend/.env.local` with contract address
   - `Project_Backend/frontend/constants/deployment.json`
   - Network configuration

## 🧪 Testing Integration

### Development Testing

```bash
# 1. Verify setup
npm run verify

# 2. Run integration test (in browser console when VITE_DEBUG=true)
runIntegrationTest().then(logTestResults)

# 3. Test contract functions
const { getUserInfo } = useContract();
const userInfo = await getUserInfo("0x...");
```

### Manual Verification

1. **Connect Wallet**: MetaMask should connect to correct network
2. **Register User**: Should create on-chain profile
3. **Create Post**: Should emit PostCreated event
4. **Follow User**: Should update follower counts
5. **Real-time Updates**: Events should trigger UI updates

## 📊 Smart Contract Mapping

| Frontend Function | Smart Contract Method | Purpose |
|-------------------|----------------------|---------|
| `registerUserOnContract(username)` | `registerUser(string)` | Create user profile |
| `createPost(content, ipfsHash)` | `createPost(string, string)` | Publish new post |
| `likePost(postId)` | `likePost(uint256)` | Like a post |
| `followUser(address)` | `followUser(address)` | Follow another user |
| `getUserInfo(address)` | `users(address)` | Get user profile data |
| `getUserPosts(address)` | `getUserPosts(address)` | Get user's post IDs |
| `getFollowers(address)` | `getFollowers(address)` | Get user's followers |

## 🔐 Security Integration

### Input Validation
- ✅ Frontend validates before sending to contract
- ✅ Smart contract has additional validation
- ✅ Type safety with TypeScript interfaces

### Access Control
- ✅ Only signed-in users can perform write operations
- ✅ Contract checks `msg.sender` for permissions
- ✅ Network validation prevents wrong-chain transactions

### Error Handling
- ✅ Transaction failures handled gracefully
- ✅ User-friendly error messages
- ✅ Retry mechanisms for network issues

## 🔧 Troubleshooting

### Common Issues & Solutions

1. **"Contract not initialized"**
   - Check `VITE_CONTRACT_ADDRESS` in `.env.local`
   - Verify contract is deployed on current network
   - Run `npm run verify` to check configuration

2. **"Network not supported"**
   - Switch MetaMask to supported network (Local/Sepolia)
   - Update `supportedChainIds` in `contractConfig.ts`

3. **"Transaction failed"**
   - Check wallet has sufficient ETH for gas
   - Verify contract method exists and is callable
   - Check cooldown periods in smart contract

4. **"User not found"**
   - User needs to register first
   - Check if calling correct contract address
   - Verify user address format

### Debug Commands

```bash
# Check contract deployment
cd Project_Backend && npx hardhat console --network localhost

# Verify all connections
npm run verify

# Test contract interaction
cd Project_Backend && npm run test

# Check frontend integration
# (Open browser console with VITE_DEBUG=true)
```

## 🎯 Best Practices

### For Developers

1. **Always use the contract service** - Don't create direct ethers.Contract instances
2. **Handle loading states** - All contract calls are async
3. **Validate network** - Check user is on correct chain
4. **Error boundaries** - Wrap contract calls in try/catch
5. **Event listening** - Use contract events for real-time updates

### For Deployment

1. **Environment variables** - Never commit private keys
2. **Contract verification** - Verify contracts on Etherscan
3. **Gas optimization** - Test gas usage before mainnet
4. **Backup data** - Keep deployment artifacts safe

## 📚 Additional Resources

- [Smart Contract Documentation](./Project_Backend/README.md)
- [Frontend Component Guide](./frontend/README.md)
- [Hardhat Documentation](https://hardhat.org/)
- [Ethers.js Documentation](https://docs.ethers.org/)

---

✅ **Integration Status**: Complete and tested
🔗 **All components properly connected**
🚀 **Ready for development and deployment**