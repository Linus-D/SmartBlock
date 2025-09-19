import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import { ethers } from 'ethers';
import { insertEvent, upsertUser, insertPost } from './db.js';

dotenv.config();

const RPC_URL = process.env.RPC_URL;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const ABI_PATH = process.env.ABI_PATH || './Project_Backend/frontend/constants/abi.json';

if (!RPC_URL || !CONTRACT_ADDRESS) {
  console.error('Indexer missing RPC_URL or CONTRACT_ADDRESS in .env');
  process.exit(1);
}

let abi;
try {
  const abiPath = path.resolve(process.cwd(), ABI_PATH);
  
  // Check if file exists
  if (!fs.existsSync(abiPath)) {
    console.error(`ABI file not found at: ${abiPath}`);
    console.error('Please ensure the ABI file exists or set the correct ABI_PATH in .env');
    process.exit(1);
  }
  
  const abiContent = fs.readFileSync(abiPath, 'utf8');
  
  // Validate JSON content
  if (!abiContent.trim()) {
    console.error('ABI file is empty');
    process.exit(1);
  }
  
  abi = JSON.parse(abiContent);
  
  // Validate ABI structure
  if (!Array.isArray(abi)) {
    console.error('Invalid ABI format: expected an array');
    process.exit(1);
  }
  
  console.log(`Successfully loaded ABI from: ${abiPath}`);
} catch (error) {
  console.error('Failed to load ABI file:', error.message);
  console.error('ABI Path:', path.resolve(process.cwd(), ABI_PATH));
  process.exit(1);
}

async function main() {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, provider);

  console.log('Indexer connected to', CONTRACT_ADDRESS);

  // Helper to store events
  async function storeEvent(eventName, log, dataObj) {
    try {
      insertEvent.run(eventName, log.transactionHash, Number(log.blockNumber), JSON.stringify(dataObj));
    } catch (e) {
      // ignore duplicate unique constraints
    }
  }

  // UserRegistered(address user, string username)
  contract.on('UserRegistered', async (user) => {
    // v6 event args are not indexed the same if no ABI fragment; we use logs parsing via interface if needed
  });

  contract.on(contract.filters.UserRegistered(), async (...args) => {
    const event = args.pop();
    const [user, username] = event.args;
    upsertUser.run(String(user).toLowerCase(), String(username));
    await storeEvent('UserRegistered', event.log, { user, username });
    console.log('UserRegistered', user, username);
  });

  // PostCreated(uint256 postId, address author, string content, string ipfsHash)
  contract.on(contract.filters.PostCreated(), async (...args) => {
    const event = args.pop();
    const [postId, author, content, ipfsHash] = event.args;
    insertPost.run(String(author).toLowerCase(), String(content), String(ipfsHash || ''));
    await storeEvent('PostCreated', event.log, { postId: Number(postId), author, content, ipfsHash });
    console.log('PostCreated', Number(postId), author);
  });

  // CommentAdded(uint256 postId, address commenter, string commentText)
  contract.on(contract.filters.CommentAdded(), async (...args) => {
    const event = args.pop();
    const [postId, commenter, commentText] = event.args;
    await storeEvent('CommentAdded', event.log, { postId: Number(postId), commenter, commentText });
    console.log('CommentAdded', Number(postId), commenter);
  });

  // PostLiked(uint256 postId, address liker)
  contract.on(contract.filters.PostLiked(), async (...args) => {
    const event = args.pop();
    const [postId, liker] = event.args;
    await storeEvent('PostLiked', event.log, { postId: Number(postId), liker });
    console.log('PostLiked', Number(postId), liker);
  });

  // UserFollowed(address follower, address followed)
  contract.on(contract.filters.UserFollowed(), async (...args) => {
    const event = args.pop();
    const [follower, followed] = event.args;
    await storeEvent('UserFollowed', event.log, { follower, followed });
    console.log('UserFollowed', follower, followed);
  });
}

main().catch((e) => {
  console.error('Indexer failed:', e);
  process.exit(1);
});
