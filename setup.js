#!/usr/bin/env node

/**
 * SmartBlock Setup Script
 * This script helps set up the decentralized social media platform
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up SmartBlock - Decentralized Social Media Platform\n');

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

function checkPrerequisites() {
  log('📋 Checking prerequisites...', 'blue');

  // Check Node.js
  try {
    const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
    log(`✅ Node.js: ${nodeVersion}`, 'green');
  } catch (error) {
    log('❌ Node.js is not installed. Please install Node.js 18 or higher.', 'red');
    process.exit(1);
  }

  // Check npm
  try {
    const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
    log(`✅ npm: v${npmVersion}`, 'green');
  } catch (error) {
    log('❌ npm is not installed.', 'red');
    process.exit(1);
  }

  // Check if Hardhat is available
  try {
    const hardhatPath = path.join(__dirname, 'Project_Backend', 'node_modules', '.bin', 'hardhat');
    if (fs.existsSync(hardhatPath) || fs.existsSync(hardhatPath + '.cmd')) {
      log('✅ Hardhat detected', 'green');
    } else {
      log('⚠️  Hardhat not found in Project_Backend. Will install dependencies.', 'yellow');
    }
  } catch (error) {
    log('⚠️  Unable to check Hardhat installation.', 'yellow');
  }
}

function installDependencies() {
  log('\n📦 Installing dependencies...', 'blue');

  // Install backend dependencies
  log('Installing backend dependencies...', 'yellow');
  try {
    execSync('npm install', {
      cwd: path.join(__dirname, 'Project_Backend'),
      stdio: 'inherit'
    });
    log('✅ Backend dependencies installed', 'green');
  } catch (error) {
    log('❌ Failed to install backend dependencies', 'red');
    process.exit(1);
  }

  // Install frontend dependencies
  log('Installing frontend dependencies...', 'yellow');
  try {
    execSync('npm install', {
      cwd: path.join(__dirname, 'frontend'),
      stdio: 'inherit'
    });
    log('✅ Frontend dependencies installed', 'green');
  } catch (error) {
    log('❌ Failed to install frontend dependencies', 'red');
    process.exit(1);
  }
}

function compileContracts() {
  log('\n🔧 Compiling smart contracts...', 'blue');

  try {
    execSync('npm run compile', {
      cwd: path.join(__dirname, 'Project_Backend'),
      stdio: 'inherit'
    });
    log('✅ Smart contracts compiled successfully', 'green');
  } catch (error) {
    log('❌ Failed to compile smart contracts', 'red');
    process.exit(1);
  }
}

function startLocalNetwork() {
  log('\n🌐 Starting local Hardhat network...', 'blue');
  log('⚠️  Keep this terminal open while developing', 'yellow');
  log('⚠️  Open a new terminal to continue with deployment', 'yellow');

  try {
    execSync('npm run node', {
      cwd: path.join(__dirname, 'Project_Backend'),
      stdio: 'inherit'
    });
  } catch (error) {
    log('❌ Failed to start local network', 'red');
    process.exit(1);
  }
}

function deployContracts() {
  log('\n🚀 Deploying contracts to local network...', 'blue');

  try {
    execSync('npm run deploy:local', {
      cwd: path.join(__dirname, 'Project_Backend'),
      stdio: 'inherit'
    });
    log('✅ Contracts deployed successfully', 'green');
  } catch (error) {
    log('❌ Failed to deploy contracts', 'red');
    log('Make sure the local Hardhat network is running in another terminal', 'yellow');
    process.exit(1);
  }
}

function createFrontendConfig() {
  log('\n⚙️  Creating frontend configuration...', 'blue');

  const frontendDir = path.join(__dirname, 'frontend');
  const envExamplePath = path.join(frontendDir, '.env.example');
  const envLocalPath = path.join(frontendDir, '.env.local');

  if (fs.existsSync(envLocalPath)) {
    log('✅ Frontend configuration already exists', 'green');
    return;
  }

  if (fs.existsSync(envExamplePath)) {
    try {
      fs.copyFileSync(envExamplePath, envLocalPath);
      log('✅ Created .env.local from .env.example', 'green');
      log('📝 Please edit frontend/.env.local with your specific configuration', 'yellow');
    } catch (error) {
      log('❌ Failed to create frontend configuration', 'red');
    }
  } else {
    log('⚠️  No .env.example found. Configuration will be created during deployment.', 'yellow');
  }
}

function printInstructions() {
  log('\n🎉 Setup Complete! Here\'s how to get started:', 'green');
  log('\n📝 Next Steps:', 'blue');
  log('1. For Local Development:', 'yellow');
  log('   • Open a new terminal and run: cd Project_Backend && npm run node');
  log('   • Open another terminal and run: cd Project_Backend && npm run deploy:local');
  log('   • Start the frontend: cd frontend && npm run dev');
  log('');
  log('2. For Sepolia Testnet:', 'yellow');
  log('   • Add your private key to Project_Backend/.env');
  log('   • Get Sepolia ETH from a faucet');
  log('   • Deploy: cd Project_Backend && npm run deploy:sepolia');
  log('   • Update frontend/.env.local with the deployed contract address');
  log('');
  log('3. Available Scripts:', 'yellow');
  log('   Backend (Project_Backend/):');
  log('   • npm run compile - Compile contracts');
  log('   • npm run test - Run tests');
  log('   • npm run node - Start local network');
  log('   • npm run deploy:local - Deploy to local network');
  log('   • npm run deploy:sepolia - Deploy to Sepolia testnet');
  log('');
  log('   Frontend (frontend/):');
  log('   • npm run dev - Start development server');
  log('   • npm run build - Build for production');
  log('   • npm run preview - Preview production build');
  log('');
  log('🌐 Local Development URLs:', 'blue');
  log('   • Frontend: http://localhost:5173');
  log('   • Hardhat Network: http://localhost:8545');
  log('   • Chain ID: 31337');
  log('');
  log('📚 For more information, check the README files in each directory.', 'yellow');
}

// Main execution
async function main() {
  try {
    checkPrerequisites();
    installDependencies();
    compileContracts();
    createFrontendConfig();

    // Ask user if they want to start local network
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });

    readline.question('\nWould you like to start the local Hardhat network now? (y/N): ', (answer) => {
      readline.close();

      if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
        startLocalNetwork();
      } else {
        printInstructions();
      }
    });

  } catch (error) {
    log(`❌ Setup failed: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  log('\n⚠️  Setup interrupted by user', 'yellow');
  process.exit(0);
});

main();