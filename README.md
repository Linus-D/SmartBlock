# SmartBlock - Decentralized Social Media Platform

A full-stack decentralized social media platform built with React, TypeScript, and Ethereum smart contracts. Features a revolutionary dual data system that seamlessly switches between mock data for development and real blockchain data for production, enabling rapid development without compromising production readiness.

## 🏗️ Architecture Overview

```
SmartBlock/
├── Project_Backend/          # Smart contracts & deployment
│   ├── contracts/           # Solidity smart contracts
│   ├── scripts/            # Deployment scripts
│   ├── test/               # Contract tests
│   └── hardhat.config.ts   # Hardhat configuration
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # React context providers (Web3, User)
│   │   ├── data/           # Mock data for development
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility libraries and data services
│   │   ├── pages/          # Application pages
│   │   └── types/          # TypeScript type definitions
│   └── package.json
├── ai-engine/              # AI integration (optional)
├── server/                 # Backend API (optional)
└── setup.js               # Automated setup script
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Git
- MetaMask or compatible Web3 wallet (optional for mock mode)

### 🎯 Data Modes

SmartBlock supports three data modes for different development and deployment scenarios:

#### 1. Mock Mode (`VITE_DATA_MODE=mock`) - **Recommended for Development**
- ✅ Uses simulated data without blockchain
- ✅ No wallet connection required
- ✅ Instant startup and fast iteration
- ✅ Perfect for UI development and testing

#### 2. Real Mode (`VITE_DATA_MODE=real`)
- 🔗 Uses actual smart contracts and blockchain
- 🔗 Requires deployed contracts and wallet connection
- 🔗 Production-ready mode

#### 3. Auto Mode (`VITE_DATA_MODE=auto`) - **Default**
- 🤖 Automatically switches between mock and real based on:
  - Wallet connection status
  - Contract availability
  - Network conditions

### Quick Start Options

#### Option A: Mock Development (No Blockchain Required)
```bash
# Clone and install
git clone <repository-url>
cd SmartBlock/frontend
npm install

# Start with mock data
npm run dev
```
Visit `http://localhost:5173` - No wallet required!

#### Option B: Full Blockchain Development

### Manual Setup

1. **Install Dependencies**
   ```bash
   # Backend dependencies
   cd Project_Backend
   npm install

   # Frontend dependencies
   cd ../frontend
   npm install
   ```

2. **Compile Smart Contracts**
   ```bash
   cd Project_Backend
   npm run compile
   ```

3. **Start Local Development Network**
   ```bash
   cd Project_Backend
   npm run node
   ```

4. **Deploy Contracts (in a new terminal)**
   ```bash
   cd Project_Backend
   npm run deploy:local
   ```

5. **Start Frontend**
   ```bash
   cd frontend
   npm run dev
   ```

6. **Open Application**
   - Visit `http://localhost:5173`
   - Connect your MetaMask wallet
   - Switch to Hardhat network (Chain ID: 31337)

## 📱 Features

### Core Features
- **User Registration**: Create a username and profile on-chain
- **Post Creation**: Share content with optional IPFS media storage
- **Social Interactions**: Like, comment, and share posts
- **Follow System**: Follow/unfollow other users
- **Real-time Chat**: Direct messaging between users
- **Feed Algorithm**: View posts from followed users
- **Explore Page**: Discover new content and users

### Technical Features
- **Decentralized Storage**: User data stored on blockchain
- **IPFS Integration**: Media files stored on IPFS
- **Gas Optimization**: Efficient contract design
- **Multiple Networks**: Support for local, testnet, and mainnet
- **Real-time Updates**: Event-driven UI updates
- **Type Safety**: Full TypeScript implementation

## 🔧 Development

### Backend (Smart Contracts)

Located in `Project_Backend/`:

```bash
# Compile contracts
npm run compile

# Run tests
npm run test

# Run tests with gas reporting
npm run test:gas

# Start local network
npm run node

# Deploy to local network
npm run deploy:local

# Deploy to Sepolia testnet
npm run deploy:sepolia

# Clean artifacts
npm run clean
```

### Frontend (React App)

Located in `frontend/`:

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

### Smart Contract Details

The main contract (`SocialMediaPlatform.sol`) includes:

- **User Management**: Registration, profiles, followers/following
- **Content System**: Posts, comments, likes, shares
- **Chat System**: Private messaging between users
- **Access Control**: Proper permission management
- **Event Logging**: Comprehensive event emission
- **Gas Optimization**: Efficient data structures and operations

### Frontend Architecture

- **Context Providers**:
  - `Web3Context`: Wallet connection and blockchain interaction
  - `UserContext`: User state management
  - `ThemeContext`: UI theme management

- **Custom Hooks**:
  - `useContract`: Smart contract interaction
  - `useWallet`: Wallet management
  - `useIPFS`: IPFS file handling

- **Services**:
  - `contractService`: Contract interaction abstraction
  - `contractConfig`: Network and contract configuration

## 🌍 Deployment

### Local Development
```bash
# Terminal 1: Start local network
cd Project_Backend && npm run node

# Terminal 2: Deploy contracts
cd Project_Backend && npm run deploy:local

# Terminal 3: Start frontend
cd frontend && npm run dev
```

### Sepolia Testnet

1. Create `.env` file in `Project_Backend/`:
   ```env
   PRIVATE_KEY=your-private-key
   SEPOLIA_RPC_URL=your-alchemy-or-infura-url
   ETHERSCAN_API_KEY=your-etherscan-api-key
   ```

2. Deploy to Sepolia:
   ```bash
   cd Project_Backend
   npm run deploy:sepolia
   ```

3. Update `frontend/.env.local` with deployed contract address

### Mainnet Deployment

⚠️ **Warning**: Deploying to mainnet requires real ETH and thorough testing.

1. Update `hardhat.config.ts` with mainnet configuration
2. Set mainnet environment variables
3. Deploy with appropriate gas settings
4. Verify contracts on Etherscan

## 🔐 Security Considerations

- **Private Keys**: Never commit private keys to version control
- **Access Control**: Contracts include proper permission checks
- **Input Validation**: All user inputs are validated
- **Reentrancy Protection**: Guards against reentrancy attacks
- **Gas Limits**: Cooldown periods prevent spam

## 🛠️ Configuration

### Environment Variables

#### Backend (`Project_Backend/.env`)
```env
PRIVATE_KEY=your-private-key
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/your-key
ETHERSCAN_API_KEY=your-etherscan-key
```

#### Frontend (`frontend/.env.local`)
```env
VITE_CONTRACT_ADDRESS=deployed-contract-address
VITE_CHAIN_ID=31337
VITE_SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/your-key
VITE_IPFS_GATEWAY=https://ipfs.io/ipfs/
VITE_DEBUG=true
```

### Network Configuration

Supported networks:
- **Local**: Hardhat (Chain ID: 31337)
- **Testnet**: Sepolia (Chain ID: 11155111)
- **Mainnet**: Ethereum (Chain ID: 1) - Configure manually

## 🧪 Testing

### Smart Contract Tests
```bash
cd Project_Backend
npm run test
```

Test coverage includes:
- User registration and management
- Post creation and interactions
- Follow/unfollow functionality
- Chat system operations
- Access control and permissions

### Frontend Testing
```bash
cd frontend
npm run test  # If tests are configured
```

## 📚 API Reference

### Smart Contract Methods

#### User Management
- `registerUser(string username)`: Register a new user
- `updateProfile(string profilePictureHash)`: Update profile
- `followUser(address user)`: Follow a user
- `unfollowUser(address user)`: Unfollow a user

#### Posts
- `createPost(string content, string ipfsHash)`: Create a new post
- `likePost(uint256 postId)`: Like a post
- `addComment(uint256 postId, string content)`: Comment on a post
- `sharePost(uint256 postId)`: Share a post

#### Chat
- `createChat(address participant)`: Start a chat
- `sendMessage(uint256 chatId, string content)`: Send a message

### Frontend Hooks

#### useContract
```typescript
const {
  registerUserOnContract,
  createPost,
  likePost,
  getUserInfo,
  isContractReady
} = useContract();
```

#### useWeb3
```typescript
const {
  account,
  isConnected,
  connectWallet,
  switchNetwork
} = useWeb3();
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Frontend**: `http://localhost:5173` (development)
- **Local Network**: `http://localhost:8545`
- **Hardhat Console**: Available when running local network

## 💡 Tips

- Use MetaMask's test networks for development
- Get free Sepolia ETH from faucets for testnet deployment
- Monitor gas usage with `npm run test:gas`
- Use the Hardhat console for contract debugging
- Check contract events for debugging frontend issues

## 🆘 Troubleshooting

### Common Issues

1. **Contract not found**: Ensure contracts are deployed and addresses are correct
2. **Network mismatch**: Check that wallet and app are on the same network
3. **Transaction failures**: Check gas limits and account balance
4. **IPFS uploads**: Verify IPFS configuration and network connectivity

### Debug Commands
```bash
# Check contract deployment
npx hardhat console --network localhost

# Verify contract on Etherscan
npm run verify:sepolia <contract-address>

# Reset local blockchain
# Stop the node and restart it
```

---

Built with ❤️ using React, Hardhat, and Ethereum.