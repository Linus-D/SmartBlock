// src/utils/integrationTest.ts
import { contractService } from '../lib/contractService';
import { CONTRACT_CONFIG, isSupportedNetwork } from '../lib/contractConfig';

export interface IntegrationTestResult {
  configurationValid: boolean;
  contractAddressValid: boolean;
  networkSupported: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Performs basic integration tests to ensure frontend-backend connection
 */
export async function runIntegrationTest(
  provider?: any,
  chainId?: number
): Promise<IntegrationTestResult> {
  const result: IntegrationTestResult = {
    configurationValid: false,
    contractAddressValid: false,
    networkSupported: false,
    errors: [],
    warnings: []
  };

  // Test 1: Check configuration
  try {
    if (!CONTRACT_CONFIG.address) {
      result.errors.push('Contract address not configured in environment variables');
    } else if (CONTRACT_CONFIG.address.length !== 42 || !CONTRACT_CONFIG.address.startsWith('0x')) {
      result.errors.push('Invalid contract address format');
    } else {
      result.contractAddressValid = true;
    }

    if (CONTRACT_CONFIG.abi.length === 0) {
      result.errors.push('Contract ABI is empty or invalid');
    }

    result.configurationValid = result.contractAddressValid && CONTRACT_CONFIG.abi.length > 0;
  } catch (error: any) {
    result.errors.push(`Configuration error: ${error.message}`);
  }

  // Test 2: Check network support
  if (chainId) {
    result.networkSupported = isSupportedNetwork(chainId);
    if (!result.networkSupported) {
      result.warnings.push(`Network ${chainId} is not supported. Supported networks: ${CONTRACT_CONFIG.supportedChainIds.join(', ')}`);
    }
  } else {
    result.warnings.push('No network information provided');
  }

  // Test 3: Try to initialize contract service
  if (provider && result.configurationValid) {
    try {
      contractService.initializeWithProvider(provider);
      result.warnings.push('Contract service initialized successfully with provider');
    } catch (error: any) {
      result.errors.push(`Failed to initialize contract service: ${error.message}`);
    }
  }

  return result;
}

/**
 * Logs integration test results to console with colored output
 */
export function logTestResults(results: IntegrationTestResult): void {
  console.group('🔧 SmartBlock Integration Test Results');

  if (results.configurationValid) {
    console.log('✅ Configuration: Valid');
  } else {
    console.log('❌ Configuration: Invalid');
  }

  if (results.contractAddressValid) {
    console.log('✅ Contract Address: Valid');
  } else {
    console.log('❌ Contract Address: Invalid');
  }

  if (results.networkSupported) {
    console.log('✅ Network: Supported');
  } else {
    console.log('⚠️  Network: Not supported or unknown');
  }

  if (results.errors.length > 0) {
    console.group('❌ Errors:');
    results.errors.forEach(error => console.error(`  • ${error}`));
    console.groupEnd();
  }

  if (results.warnings.length > 0) {
    console.group('⚠️  Warnings:');
    results.warnings.forEach(warning => console.warn(`  • ${warning}`));
    console.groupEnd();
  }

  if (results.errors.length === 0 && results.configurationValid) {
    console.log('🎉 Integration test passed! Frontend-backend connection ready.');
  } else {
    console.log('🚨 Integration test failed. Please check configuration.');
  }

  console.groupEnd();
}

/**
 * Quick validation function for use in components
 */
export function validateIntegration(): boolean {
  try {
    const hasAddress = !!CONTRACT_CONFIG.address && CONTRACT_CONFIG.address.length === 42;
    const hasABI = CONTRACT_CONFIG.abi.length > 0;
    return hasAddress && hasABI;
  } catch {
    return false;
  }
}