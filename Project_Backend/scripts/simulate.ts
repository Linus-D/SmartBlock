const { ethers } = require("hardhat");
const { BigNumber } = require("ethers");

async function main() {
  // Get available signers (simulated users)
  const [owner, user1, user2, user3] = await ethers.getSigners();
  console.log("Simulating with account:", owner.address);

  // 1. DEPLOY CONTRACT (or attach to existing one)
  const SocialMediaPlatform = await ethers.getContractFactory("SocialMediaPlatform");
  const socialMedia = await SocialMediaPlatform.deploy();
  await socialMedia.deployed();
  console.log("Contract deployed to:", socialMedia.address);

  // 2. SIMULATE USER REGISTRATION
  console.log("\n1. Simulating user registration...");
  await socialMedia.connect(user1).registerUser("alice");
  await socialMedia.connect(user2).registerUser("bob123");
  await socialMedia.connect(user3).registerUser("charlie");
  console.log("Users registered successfully!");

  // 3. SIMULATE CREATING POSTS
  console.log("\n2. Simulating post creation...");
  await socialMedia.connect(user1).createPost("My first post on the blockchain!", "QmHash1");
  await socialMedia.connect(user2).createPost("Hello decentralized world!", "QmHash2");
  await socialMedia.connect(user3).createPost("Testing out this new social platform.", "QmHash3");
  console.log("Posts created!");

  // 4. SIMULATE FOLLOWING
  console.log("\n3. Simulating social graph...");
  await socialMedia.connect(user1).followUser(user2.address);
  await socialMedia.connect(user1).followUser(user3.address);
  await socialMedia.connect(user2).followUser(user1.address);
  console.log("Users followed each other!");

  // 5. SIMULATE LIKES AND COMMENTS
  console.log("\n4. Simulating engagement...");
  await socialMedia.connect(user2).likePost(0); // Bob likes Alice's post (ID 0)
  await socialMedia.connect(user3).likePost(0); // Charlie likes Alice's post
  await socialMedia.connect(user1).addComment(0, "Thanks for the likes!"); // Alice comments on her own post
  console.log("Likes and comments added!");

  // 6. SIMULATE MESSAGING
  console.log("\n5. Simulating messaging...");
  await socialMedia.connect(user1).createChat(user2.address); // Alice starts a chat with Bob
  const chatId = await socialMedia.connect(user1).getChatWithUser(user2.address);
  await socialMedia.connect(user1).sendMessage(chatId, "Hey Bob, nice post!");
  // Respect cooldown with a delay if needed
  await new Promise(resolve => setTimeout(resolve, 6000)); // Wait 6 seconds (MESSAGE_COOLDOWN is 5 sec)
  await socialMedia.connect(user2).sendMessage(chatId, "Thanks Alice! Welcome to the platform.");
  console.log("Messages sent!");

  // 7. QUERY THE STATE
  console.log("\n6. Querying final state...");
  const post = await socialMedia.getPost(0);
  console.log(`Post 0 has ${post.likeCount} likes and ${post.commentCount} comments.`);

  const alicesFollowers = await socialMedia.getFollowers(user1.address);
  console.log(`Alice has ${alicesFollowers.length} followers.`);

  const bobsChats = await socialMedia.connect(user2).getUserChats();
  console.log(`Bob is part of ${bobsChats.length} chats.`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
