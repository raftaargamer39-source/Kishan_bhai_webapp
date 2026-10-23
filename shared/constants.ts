/**
 * Shared Constants for Kishan Bhai
 */

export const ALGORAND_TESTNET_CONFIG = {
  network: 'testnet',
  algodUrl: 'https://testnet-api.algonode.cloud',
  indexerUrl: 'https://testnet-idx.algonode.cloud',
  port: 443,
  // Standard Algorand Testnet USDC Asset ID
  usdcAssetId: 10458941,
  // Platform Merchant / Facilitator Testnet Address
  defaultReceiverAddress: 'KBHAI4O4JYZ4K7V4Z2V3W5QZX3S6N6L2J7R8P9Q1S3T5U7V9W0Y2Z4A6B8',
  faucetUrl: 'https://bank.testnet.algorand.network/',
  explorerBaseUrl: 'https://testnet.explorer.perawallet.app/tx/',
  loraExplorerUrl: 'https://lora.algokit.io/testnet/transaction/',
};

export const GOPLAUSIBLE_CONFIG = {
  facilitatorName: 'GoPlausible Facilitator',
  facilitatorUrl: 'https://testnet.goplausible.xyz',
  verifyEndpoint: '/v1/verify',
  settleEndpoint: '/v1/settle',
  version: '1.0',
};

// All AI crop diagnosis and agronomy services are 100% Free Public Services for farmers
export const DEFAULT_SERVICE_PRICING = {
  'crop-analysis': {
    serviceId: 'crop-analysis',
    name: 'AI Crop Multispectral & Disease Analysis',
    priceUsdc: 0,
    priceMicroUsdc: 0,
    isFree: true,
    description: 'High-resolution pathogen detection, disease severity index, and targeted bio-fertilizer recommendations (100% Free for Farmers).',
  },
  'farm-intelligence': {
    serviceId: 'farm-intelligence',
    name: 'Virtual Cluster Macro Farm Intelligence Report',
    priceUsdc: 0,
    priceMicroUsdc: 0,
    isFree: true,
    description: 'Soil nutrient mapping, regional pest surveillance alerts, and predictive yield forecast.',
  },
  'weather-intelligence': {
    serviceId: 'weather-intelligence',
    name: 'Micro-Climate Hyperlocal Weather Advisory',
    priceUsdc: 0,
    priceMicroUsdc: 0,
    isFree: true,
    description: '14-day precision precipitation and weather models tailored to your cluster acreage.',
  },
} as const;
