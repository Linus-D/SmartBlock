# Social Media Platform - Hardhat Project

A comprehensive Hardhat project for deploying and testing the SocialMediaPlatform smart contract. This project includes TypeScript support, testing framework, deployment scripts, and frontend integration helpers.

## 📁 Project Structure

```
contracts/
├── contracts/
│   └── SocialMedia.sol          # Main smart contract
├── scripts/
│   └── deploy.ts                # Deployment script
├── test/
│   └── SocialMediaPlatform.ts   # Comprehensive test suite
├── frontend/
│   └── constants/
│       ├── deployment.json      # Auto-generated deployment info
│       ├── abi.json            # Contract ABI
│       ├── contractAddress.json # Contract address
│       ├── contractHelper.ts    # Frontend integration helper
│       └── ReactExample.tsx     # React component example
├── hardhat.config.ts           # Hardhat configuration
├── tsconfig.json               # TypeScript configuration
├── .env                        # Environment variables
└── README.md                   # This file
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy the `.env` file and update it with your values:

```bash
# Private key for deployment (without 0x prefix)
PRIVATE_KEY=your_private_key_here

# RPC URLs for different networks
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your_infura_project_id
GOERLI_RPC_URL=https://goerli.infura.io/v3/your_infura_project_id

# Etherscan API key for contract verification
ETHERSCAN_API_KEY=your_etherscan_api_key_here

# Gas reporting (optional)
REPORT_GAS=false
```

### 3. Compile Contracts

```bash
npm run compile
```

### 4. Run Tests

```bash
npm test
```

## 🧪 Testing

The project includes comprehensive tests covering:

- User registration and management
- Post creation and interactions (likes, comments, shares)
- User following system
- Chat functionality
- Error handling and edge cases

### Run Tests

```bash
# Run all tests
npm test

# Run tests with gas reporting
npm run test:gas

# Run tests with coverage
npm run coverage
```

### Test Structure

- **User Registration**: Tests user registration, duplicate registration prevention, and username validation
- **Post Management**: Tests post creation, content validation, and cooldown mechanisms
- **Post Interactions**: Tests liking, unliking, sharing, and commenting functionality
- **User Following**: Tests follow/unfollow functionality and relationship management
- **Chat Functionality**: Tests chat creation and messaging between users
- **Getter Functions**: Tests all read-only functions for data retrieval

## 🚀 Deployment

### Local Development

1. **Start local Hardhat node:**
   ```bash
   npm run node
   ```

2. **Deploy to local network (in another terminal):**
   ```bash
   npm run deploy:local
   ```

### Testnet Deployment

#### Deploy to Sepolia

1. **Update `.env` with your Sepolia RPC URL and private key**
2. **Deploy:**
   ```bash
   npm run deploy:sepolia
   ```

3. **Verify contract on Etherscan:**
   ```bash
   npm run verify:sepolia <CONTRACT_ADDRESS>
   ```

#### Deploy to Goerli

1. **Update `.env` with your Goerli RPC URL and private key**
2. **Deploy:**
   ```bash
   npm run deploy:goerli
   ```

3. **Verify contract on Etherscan:**
   ```bash
   npm run verify:goerli <CONTRACT_ADDRESS>
   ```

### Deployment Output

After deployment, the following files are automatically generated in `frontend/constants/`:

- `deployment.json` - Complete deployment information
- `abi.json` - Contract ABI for frontend integration
- `contractAddress.json` - Contract address

## 🔗 Frontend Integration

### Using the Contract Helper

The project includes a comprehensive helper class for frontend integration:

```typescript
import { SocialMediaContractHelper } from './frontend/constants/contractHelper';

// Initialize helper
const helper = new SocialMediaContractHelper();

// Connect with wallet (for write operations)
const contract = await helper.connectWithWallet();

// Connect read-only (for read operations)
const contract = await helper.connectReadOnly('https://sepolia.infura.io/v3/YOUR_PROJECT_ID');
```

### Example Usage

#### Read Operations

```typescript
// Get all posts
const posts = await getAllPosts(helper);

// Get user info
const userInfo = await helper.getUserInfo(userAddress);

// Get post comments
const comments = await helper.getPostComments(postId);

// Get user's followers
const followers = await helper.getFollowers(userAddress);
```

#### Write Operations

```typescript
// Register user
await registerUser(helper, "alice");

// Create post
await createPost(helper, "Hello, world!", "QmIPFSHash");

// Like a post
await likePost(helper, postId);

// Follow user
await followUser(helper, userAddress);

// Send message
await sendMessage(helper, chatId, "Hello!");
```

### React Integration

Use the provided React hook for easy integration:

```typescript
import { useSocialMediaContract } from './frontend/constants/contractHelper';

function MyComponent() {
  const { helper, contract, isConnected, connectWallet } = useSocialMediaContract();
  
  // Your component logic here
}
```

See `frontend/constants/ReactExample.tsx` for a complete React component example.

## 📋 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run compile` | Compile smart contracts |
| `npm test` | Run test suite |
| `npm run test:gas` | Run tests with gas reporting |
| `npm run deploy:local` | Deploy to local Hardhat network |
| `npm run deploy:hardhat` | Deploy to Hardhat network |
| `npm run deploy:sepolia` | Deploy to Sepolia testnet |
| `npm run deploy:goerli` | Deploy to Goerli testnet |
| `npm run verify:sepolia` | Verify contract on Sepolia Etherscan |
| `npm run verify:goerli` | Verify contract on Goerli Etherscan |
| `npm run node` | Start local Hardhat node |
| `npm run clean` | Clean build artifacts |
| `npm run coverage` | Run test coverage |

## 🔧 Configuration

### Hardhat Configuration

The `hardhat.config.ts` file includes:

- **Solidity**: Version 0.8.19 with optimizer enabled
- **Networks**: localhost, hardhat, sepolia, goerli
- **Etherscan**: API key configuration for contract verification
- **Gas Reporter**: Optional gas usage reporting
- **TypeChain**: TypeScript bindings generation

### Network Configuration

#### Local Development
- **Network**: localhost
- **Chain ID**: 31337
- **RPC URL**: http://127.0.0.1:8545

#### Sepolia Testnet
- **Chain ID**: 11155111
- **RPC URL**: Configure in `.env` as `SEPOLIA_RPC_URL`
- **Explorer**: https://sepolia.etherscan.io

#### Goerli Testnet
- **Chain ID**: 5
- **RPC URL**: Configure in `.env` as `GOERLI_RPC_URL`
- **Explorer**: https://goerli.etherscan.io

## 🛡️ Security Considerations

1. **Private Key Security**: Never commit your private key to version control
2. **Environment Variables**: Use `.env` file for sensitive configuration
3. **Network Validation**: Always verify you're deploying to the correct network
4. **Contract Verification**: Verify contracts on Etherscan for transparency

## 🐛 Troubleshooting

### Common Issues

1. **"HH23: You are trying to initialize a project inside an existing Hardhat project"**
   - Solution: Remove any existing `hardhat.config.js` files

2. **"Error: cannot estimate gas"**
   - Solution: Check your RPC URL and ensure you have sufficient testnet ETH

3. **"Error: nonce too low"**
   - Solution: Wait a moment and try again, or reset your wallet

4. **TypeScript compilation errors**
   - Solution: Run `npm run compile` to generate TypeChain types

### Getting Help

- Check the [Hardhat Documentation](https://hardhat.org/docs)
- Review the test files for usage examples
- Check the generated TypeChain types in `typechain-types/`

## 📝 Contract Features

The SocialMediaPlatform contract includes:

- **User Management**: Registration, profile updates
- **Post System**: Create, like, share, comment on posts
- **Social Features**: Follow/unfollow users
- **Chat System**: Direct messaging between users
- **Content Moderation**: Length limits and cooldown periods
- **Gas Optimization**: Efficient storage patterns

## 🔄 Development Workflow

1. **Make changes** to the smart contract
2. **Run tests** to ensure functionality: `npm test`
3. **Compile** the contract: `npm run compile`
4. **Deploy locally** for testing: `npm run deploy:local`
5. **Deploy to testnet** when ready: `npm run deploy:sepolia`
6. **Verify contract** on Etherscan: `npm run verify:sepolia`
7. **Update frontend** with new contract address and ABI

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

---

**Happy coding! 🚀**
