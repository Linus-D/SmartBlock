#!/usr/bin/env node

/**
 * SmartBlock Setup Verification Script
 * Verifies that the frontend-backend connection is properly configured
 */

const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(colors[color] + message + colors.reset);
}

function checkFile(filePath, description) {
  if (fs.existsSync(filePath)) {
    log(`✅ ${description}`, 'green');
    return true;
  } else {
    log(`❌ ${description} - File not found: ${filePath}`, 'red');
    return false;
  }
}

function checkOptionalFile(filePath, description) {
  if (fs.existsSync(filePath)) {
    log(`✅ ${description}`, 'green');
    return true;
  } else {
    log(`⚠️  ${description} - Optional file not found: ${filePath}`, 'yellow');
    return false;
  }
}

function verifyContractArtifacts() {
  log('\n📜 Verifying Smart Contract Artifacts...', 'blue');

  const contractPath = path.join(__dirname, 'Project_Backend', 'contracts', 'SocialMedia.sol');
  const artifactPath = path.join(__dirname, 'Project_Backend', 'artifacts', 'contracts', 'SocialMedia.sol', 'SocialMediaPlatform.json');
  const typechainPath = path.join(__dirname, 'Project_Backend', 'typechain-types', 'SocialMediaPlatform.ts');

  let passed = 0;
  passed += checkFile(contractPath, 'Smart Contract Source') ? 1 : 0;
  passed += checkFile(artifactPath, 'Contract Artifact') ? 1 : 0;
  passed += checkFile(typechainPath, 'TypeChain Types') ? 1 : 0;

  return passed === 3;
}

function verifyBackendStructure() {
  log('\n🔧 Verifying Backend Structure...', 'blue');

  const files = [
    ['Project_Backend/package.json', 'Backend Package Config'],
    ['Project_Backend/hardhat.config.ts', 'Hardhat Configuration'],
    ['Project_Backend/scripts/deploy.ts', 'Deployment Script'],
    ['Project_Backend/test/SocialMediaPlatform.ts', 'Contract Tests']
  ];

  let passed = 0;
  files.forEach(([filePath, description]) => {
    passed += checkFile(path.join(__dirname, filePath), description) ? 1 : 0;
  });

  return passed === files.length;
}

function verifyFrontendStructure() {
  log('\n⚛️  Verifying Frontend Structure...', 'blue');

  const files = [
    ['frontend/package.json', 'Frontend Package Config'],
    ['frontend/src/main.tsx', 'Main App Entry'],
    ['frontend/src/App.tsx', 'App Component'],
    ['frontend/src/context/Web3Context.tsx', 'Web3 Context'],
    ['frontend/src/context/UserContext.tsx', 'User Context'],
    ['frontend/src/hooks/useContract.ts', 'Contract Hook'],
    ['frontend/src/lib/contractService.ts', 'Contract Service'],
    ['frontend/src/lib/contractConfig.ts', 'Contract Configuration']
  ];

  let passed = 0;
  files.forEach(([filePath, description]) => {
    passed += checkFile(path.join(__dirname, filePath), description) ? 1 : 0;
  });

  return passed === files.length;
}

function verifyConfiguration() {
  log('\n⚙️  Verifying Configuration Files...', 'blue');

  const requiredFiles = [
    ['frontend/.env.example', 'Frontend Environment Example'],
    ['setup.js', 'Setup Script'],
    ['package.json', 'Root Package Config']
  ];

  const optionalFiles = [
    ['frontend/.env.local', 'Frontend Environment (Auto-generated after deployment)'],
    ['Project_Backend/.env', 'Backend Environment (Required for testnet deployment)'],
    ['Project_Backend/frontend/constants/deployment.json', 'Deployment Configuration (Auto-generated)']
  ];

  let requiredPassed = 0;
  requiredFiles.forEach(([filePath, description]) => {
    requiredPassed += checkFile(path.join(__dirname, filePath), description) ? 1 : 0;
  });

  optionalFiles.forEach(([filePath, description]) => {
    checkOptionalFile(path.join(__dirname, filePath), description);
  });

  return requiredPassed === requiredFiles.length;
}

function checkDependencies() {
  log('\n📦 Checking Dependencies...', 'blue');

  // Check backend dependencies
  const backendNodeModules = path.join(__dirname, 'Project_Backend', 'node_modules');
  if (fs.existsSync(backendNodeModules)) {
    log('✅ Backend dependencies installed', 'green');
  } else {
    log('❌ Backend dependencies not installed. Run: cd Project_Backend && npm install', 'red');
    return false;
  }

  // Check frontend dependencies
  const frontendNodeModules = path.join(__dirname, 'frontend', 'node_modules');
  if (fs.existsSync(frontendNodeModules)) {
    log('✅ Frontend dependencies installed', 'green');
  } else {
    log('❌ Frontend dependencies not installed. Run: cd frontend && npm install', 'red');
    return false;
  }

  return true;
}

function validatePackageJson() {
  log('\n📄 Validating Package Configurations...', 'blue');

  try {
    // Check backend package.json
    const backendPkg = JSON.parse(fs.readFileSync(path.join(__dirname, 'Project_Backend', 'package.json')));
    if (backendPkg.scripts && backendPkg.scripts.compile && backendPkg.scripts['deploy:local']) {
      log('✅ Backend scripts configured correctly', 'green');
    } else {
      log('❌ Backend package.json missing required scripts', 'red');
      return false;
    }

    // Check frontend package.json
    const frontendPkg = JSON.parse(fs.readFileSync(path.join(__dirname, 'frontend', 'package.json')));
    if (frontendPkg.dependencies && frontendPkg.dependencies.ethers && frontendPkg.dependencies.viem) {
      log('✅ Frontend Web3 dependencies present', 'green');
    } else {
      log('❌ Frontend missing Web3 dependencies', 'red');
      return false;
    }

    return true;
  } catch (error) {
    log(`❌ Error reading package.json files: ${error.message}`, 'red');
    return false;
  }
}

function printDeploymentInstructions() {
  log('\n🚀 Deployment Instructions:', 'blue');
  log('\n1. Local Development Setup:', 'yellow');
  log('   Terminal 1: cd Project_Backend && npm run node');
  log('   Terminal 2: cd Project_Backend && npm run deploy:local');
  log('   Terminal 3: cd frontend && npm run dev');
  log('');
  log('2. Testnet Deployment (Sepolia):', 'yellow');
  log('   • Create Project_Backend/.env with your PRIVATE_KEY and RPC URLs');
  log('   • Get Sepolia ETH from a faucet');
  log('   • Run: cd Project_Backend && npm run deploy:sepolia');
  log('   • Frontend .env.local will be auto-generated with contract address');
  log('');
  log('3. After Deployment:', 'yellow');
  log('   • Start frontend: cd frontend && npm run dev');
  log('   • Connect MetaMask to the appropriate network');
  log('   • Register a user to start using the platform');
}

function main() {
  console.log('🔍 SmartBlock Setup Verification\n');

  const results = {
    contracts: verifyContractArtifacts(),
    backend: verifyBackendStructure(),
    frontend: verifyFrontendStructure(),
    config: verifyConfiguration(),
    dependencies: checkDependencies(),
    packages: validatePackageJson()
  };

  const allPassed = Object.values(results).every(Boolean);

  log('\n📊 Verification Summary:', 'blue');
  Object.entries(results).forEach(([category, passed]) => {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    const color = passed ? 'green' : 'red';
    log(`   ${category.toUpperCase()}: ${status}`, color);
  });

  if (allPassed) {
    log('\n🎉 All verifications passed! Your SmartBlock setup is ready.', 'green');
    printDeploymentInstructions();
  } else {
    log('\n🚨 Some verifications failed. Please fix the issues above.', 'red');
    log('\nQuick fixes:', 'yellow');
    log('• Run: node setup.js (for automated setup)');
    log('• Run: npm run install-all (to install dependencies)');
    log('• Run: npm run compile (to compile contracts)');
  }

  process.exit(allPassed ? 0 : 1);
}

main();