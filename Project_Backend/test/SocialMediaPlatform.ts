import { expect } from "chai";
import { ethers } from "hardhat";
import { SocialMediaPlatform } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("SocialMediaPlatform", function () {
  let socialMedia: SocialMediaPlatform;
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  let user3: SignerWithAddress;

  beforeEach(async function () {
    [owner, user1, user2, user3] = await ethers.getSigners();

    const SocialMediaPlatform = await ethers.getContractFactory("SocialMediaPlatform");
    socialMedia = await SocialMediaPlatform.deploy();
    await socialMedia.waitForDeployment();
  });

  describe("User Registration", function () {
    it("Should allow a user to register with a valid username", async function () {
      await socialMedia.connect(user1).registerUser("alice");
      
      const user = await socialMedia.users(user1.address);
      expect(user.username).to.equal("alice");
      expect(user.isRegistered).to.be.true;
      expect(user.registrationDate).to.be.greaterThan(0);
    });

    it("Should not allow a user to register twice", async function () {
      await socialMedia.connect(user1).registerUser("alice");
      
      await expect(
        socialMedia.connect(user1).registerUser("alice2")
      ).to.be.revertedWithCustomError(socialMedia, "UserAlreadyRegistered");
    });

    it("Should not allow username longer than MAX_USERNAME_LENGTH", async function () {
      const longUsername = "a".repeat(51); // MAX_USERNAME_LENGTH is 50
      
      await expect(
        socialMedia.connect(user1).registerUser(longUsername)
      ).to.be.revertedWithCustomError(socialMedia, "ContentTooLong");
    });
  });

  describe("Post Creation", function () {
    beforeEach(async function () {
      await socialMedia.connect(user1).registerUser("alice");
      await socialMedia.connect(user2).registerUser("bob");
    });

    it("Should allow a registered user to create a post", async function () {
      const content = "Hello, world!";
      const ipfsHash = "QmTestHash123";
      
      await socialMedia.connect(user1).createPost(content, ipfsHash);
      
      const post = await socialMedia.getPost(0);
      expect(post.author).to.equal(user1.address);
      expect(post.content).to.equal(content);
      expect(post.ipfsHash).to.equal(ipfsHash);
      expect(post.likeCount).to.equal(0);
      expect(post.commentCount).to.equal(0);
      expect(post.shareCount).to.equal(0);
    });

    it("Should not allow unregistered user to create a post", async function () {
      await expect(
        socialMedia.connect(user3).createPost("Hello", "QmTest")
      ).to.be.revertedWithCustomError(socialMedia, "UserNotRegistered");
    });

    it("Should not allow content longer than MAX_CONTENT_LENGTH", async function () {
      const longContent = "a".repeat(501); // MAX_CONTENT_LENGTH is 500
      
      await expect(
        socialMedia.connect(user1).createPost(longContent, "QmTest")
      ).to.be.revertedWithCustomError(socialMedia, "ContentTooLong");
    });

    it("Should enforce post cooldown", async function () {
      await socialMedia.connect(user1).createPost("First post", "QmTest1");
      
      await expect(
        socialMedia.connect(user1).createPost("Second post", "QmTest2")
      ).to.be.revertedWithCustomError(socialMedia, "CooldownNotOver");
    });
  });

  describe("Post Interactions", function () {
    beforeEach(async function () {
      await socialMedia.connect(user1).registerUser("alice");
      await socialMedia.connect(user2).registerUser("bob");
      await socialMedia.connect(user1).createPost("Test post", "QmTest");
    });

    it("Should allow users to like posts", async function () {
      await socialMedia.connect(user2).likePost(0);
      
      const post = await socialMedia.getPost(0);
      expect(post.likeCount).to.equal(1);
      
      const likes = await socialMedia.getPostLikes(0);
      expect(likes).to.include(user2.address);
    });

    it("Should not allow users to like the same post twice", async function () {
      await socialMedia.connect(user2).likePost(0);
      
      await expect(
        socialMedia.connect(user2).likePost(0)
      ).to.be.revertedWithCustomError(socialMedia, "AlreadyLiked");
    });

    it("Should allow users to unlike posts", async function () {
      await socialMedia.connect(user2).likePost(0);
      await socialMedia.connect(user2).unlikePost(0);
      
      const post = await socialMedia.getPost(0);
      expect(post.likeCount).to.equal(0);
    });

    it("Should allow users to share posts", async function () {
      await socialMedia.connect(user2).sharePost(0);
      
      const post = await socialMedia.getPost(0);
      expect(post.shareCount).to.equal(1);
    });

    it("Should allow users to add comments", async function () {
      await socialMedia.connect(user2).addComment(0, "Great post!");
      
      const post = await socialMedia.getPost(0);
      expect(post.commentCount).to.equal(1);
      
      const comments = await socialMedia.getPostComments(0);
      expect(comments).to.have.length(1);
      expect(comments[0].commenter).to.equal(user2.address);
      expect(comments[0].commentText).to.equal("Great post!");
    });
  });

  describe("User Following", function () {
    beforeEach(async function () {
      await socialMedia.connect(user1).registerUser("alice");
      await socialMedia.connect(user2).registerUser("bob");
    });

    it("Should allow users to follow each other", async function () {
      await socialMedia.connect(user1).followUser(user2.address);
      
      const following = await socialMedia.getFollowing(user1.address);
      const followers = await socialMedia.getFollowers(user2.address);
      
      expect(following).to.include(user2.address);
      expect(followers).to.include(user1.address);
    });

    it("Should not allow users to follow themselves", async function () {
      await expect(
        socialMedia.connect(user1).followUser(user1.address)
      ).to.be.revertedWithCustomError(socialMedia, "CannotFollowSelf");
    });

    it("Should not allow following the same user twice", async function () {
      await socialMedia.connect(user1).followUser(user2.address);
      
      await expect(
        socialMedia.connect(user1).followUser(user2.address)
      ).to.be.revertedWithCustomError(socialMedia, "AlreadyFollowing");
    });

    it("Should allow users to unfollow", async function () {
      await socialMedia.connect(user1).followUser(user2.address);
      await socialMedia.connect(user1).unfollowUser(user2.address);
      
      const following = await socialMedia.getFollowing(user1.address);
      expect(following).to.not.include(user2.address);
    });
  });

  describe("Chat Functionality", function () {
    beforeEach(async function () {
      await socialMedia.connect(user1).registerUser("alice");
      await socialMedia.connect(user2).registerUser("bob");
    });

    it("Should allow users to create a chat", async function () {
      await socialMedia.connect(user1).createChat(user2.address);
      
      const chatId = await socialMedia.connect(user1).getChatWithUser(user2.address);
      expect(chatId).to.equal(0); // First chat should have ID 0
      
      const chat = await socialMedia.connect(user1).getChat(chatId);
      expect(chat.participant1).to.equal(user1.address);
      expect(chat.participant2).to.equal(user2.address);
    });

    it("Should allow chat participants to send messages", async function () {
      await socialMedia.connect(user1).createChat(user2.address);
      const chatId = await socialMedia.connect(user1).getChatWithUser(user2.address);
      
      await socialMedia.connect(user1).sendMessage(chatId, "Hello Bob!");
      
      const messages = await socialMedia.connect(user1).getChatMessages(chatId, 10, 0);
      expect(messages).to.have.length(1);
      expect(messages[0].sender).to.equal(user1.address);
      expect(messages[0].content).to.equal("Hello Bob!");
    });

    it("Should not allow non-participants to send messages", async function () {
      await socialMedia.connect(user1).createChat(user2.address);
      const chatId = await socialMedia.connect(user1).getChatWithUser(user2.address);
      
      // First register user3
      await socialMedia.connect(user3).registerUser("charlie");
      
      await expect(
        socialMedia.connect(user3).sendMessage(chatId, "Hello!")
      ).to.be.revertedWithCustomError(socialMedia, "NotChatParticipant");
    });
  });

  describe("Getter Functions", function () {
    beforeEach(async function () {
      await socialMedia.connect(user1).registerUser("alice");
      await socialMedia.connect(user2).registerUser("bob");
      await socialMedia.connect(user1).createPost("Test post", "QmTest");
    });

    it("Should return correct total posts count", async function () {
      const totalPosts = await socialMedia.getTotalPosts();
      expect(totalPosts).to.equal(1);
    });

    it("Should return user posts", async function () {
      const userPosts = await socialMedia.getUserPosts(user1.address);
      expect(userPosts).to.have.length(1);
      expect(userPosts[0]).to.equal(0);
    });
  });
});
