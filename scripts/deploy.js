import fs from 'fs';
import path from 'path';
import solc from 'solc';
import { ethers } from 'ethers';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const RPC_URL = process.env.RPC_URL || 'https://rpc.bohr.life';
const CHAIN_ID = parseInt(process.env.CHAIN_ID || '968', 10);
const PRIVATE_KEY = process.env.PRIVATE_KEY;

async function getProvider() {
  const fetchReq = new ethers.FetchRequest(RPC_URL);
  fetchReq.timeout = 60000; // 60s timeout
  return new ethers.JsonRpcProvider(fetchReq, undefined, { staticNetwork: true });
}

async function compileContract() {
  const contractPath = path.resolve(__dirname, '../contracts/AnonBOT.sol');
  const source = fs.readFileSync(contractPath, 'utf8');

  const input = {
    language: 'Solidity',
    sources: {
      'AnonBOT.sol': {
        content: source,
      },
    },
    settings: {
      outputSelection: {
        '*': {
          '*': ['abi', 'evm.bytecode'],
        },
      },
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  };

  console.log('📦 Compiling AnonBOT.sol...');
  const output = JSON.parse(solc.compile(JSON.stringify(input)));

  if (output.errors) {
    let hasError = false;
    output.errors.forEach((err) => {
      if (err.severity === 'error') {
        console.error('❌ Compilation Error:', err.formattedMessage);
        hasError = true;
      } else {
        console.warn('⚠️ Warning:', err.formattedMessage);
      }
    });
    if (hasError) throw new Error('Contract compilation failed.');
  }

  const contract = output.contracts['AnonBOT.sol']['AnonBOT'];
  return {
    abi: contract.abi,
    bytecode: contract.evm.bytecode.object,
  };
}

async function main() {
  console.log('==============================================');
  console.log('🚀 AnonBOT Deployment to BOTChain Testnet');
  console.log('==============================================');

  if (!PRIVATE_KEY || PRIVATE_KEY === 'your_private_key_here') {
    console.error('❌ Error: PRIVATE_KEY is missing in your .env file.');
    process.exit(1);
  }

  const { abi, bytecode } = await compileContract();

  const provider = await getProvider();
  const formattedKey = PRIVATE_KEY.startsWith('0x') ? PRIVATE_KEY : `0x${PRIVATE_KEY}`;
  const wallet = new ethers.Wallet(formattedKey, provider);

  console.log(`🔑 Deployer Address: ${wallet.address}`);
  
  console.log(`⏳ Checking balance on BOTChain Testnet (${RPC_URL})...`);
  let balance;
  try {
    balance = await provider.getBalance(wallet.address);
    console.log(`💰 Deployer Balance: ${ethers.formatEther(balance)} BOT`);
  } catch (err) {
    console.error(`\n❌ Failed to connect to RPC endpoint: ${RPC_URL}`);
    console.error(`Reason: ${err.message}`);
    console.error(`\n💡 Tip: Check your network/VPN, or verify the exact RPC URL configured in your wallet settings (MetaMask).`);
    process.exit(1);
  }

  if (balance === 0n) {
    console.error('❌ Insufficient funds. Please fund this wallet with testnet BOT tokens to pay for gas.');
    process.exit(1);
  }

  console.log('✍️ Deploying contract to BOTChain...');
  const factory = new ethers.ContractFactory(abi, bytecode, wallet);
  const contract = await factory.deploy();
  
  console.log(`📡 Deployment Tx Hash: ${contract.deploymentTransaction()?.hash}`);
  console.log('⏳ Waiting for block confirmation...');
  await contract.waitForDeployment();

  const deployedAddress = await contract.getAddress();
  const receipt = await contract.deploymentTransaction()?.getTransaction();

  console.log('==============================================');
  console.log(`🎉 AnonBOT deployed successfully to BOTChain Testnet!`);
  console.log(`📍 Contract Address: ${deployedAddress}`);
  console.log(`📜 Tx Hash: ${txHash}`);
  if (receipt?.blockNumber) {
    console.log(`🧱 Block Number: ${parseInt(receipt.blockNumber, 16)}`);
    console.log(`⛽ Gas Used: ${parseInt(receipt.gasUsed, 16)}`);
  }
  console.log(`🌐 Explorer: https://explorer.bohr.life/address/${deployedAddress}`);
  console.log('==============================================\n');

  // Update src/services/botchain.ts
  const botchainServicePath = path.resolve(__dirname, '../src/services/botchain.ts');
  if (fs.existsSync(botchainServicePath)) {
    let serviceCode = fs.readFileSync(botchainServicePath, 'utf8');
    serviceCode = serviceCode.replace(
      /contractAddress:\s*'0x[a-fA-F0-9]+'/,
      `contractAddress: '${deployedAddress}'`
    );
    fs.writeFileSync(botchainServicePath, serviceCode, 'utf8');
    console.log(`✅ Updated contract address in src/services/botchain.ts`);
  }

  // Update README.md
  const readmePath = path.resolve(__dirname, '../README.md');
  if (fs.existsSync(readmePath)) {
    let readmeCode = fs.readFileSync(readmePath, 'utf8');
    readmeCode = readmeCode.replace(
      /Contract Address\*\*:\s*`0x[a-fA-F0-9]+`/,
      `Contract Address**: \`${deployedAddress}\``
    );
    fs.writeFileSync(readmePath, readmeCode, 'utf8');
    console.log(`✅ Updated contract address in README.md`);
  }
}

main().catch((err) => {
  console.error('❌ Deployment failed:', err);
  process.exit(1);
});
