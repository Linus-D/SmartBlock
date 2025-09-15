// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title SocialMediaPlatform
 * @dev A comprehensive contract for a decentralized social media platform
 * combining user management, post creation, social interactions, and chat functionality.
 */
contract SocialMediaPlatform {
    uint256 private _postIdCounter;
    uint256 private _chatIdCounter;

    // Constants
    uint256 public constant MAX_CONTENT_LENGTH = 500;
    uint256 public constant MAX_COMMENT_LENGTH = 280;
    uint256 public constant MAX_USERNAME_LENGTH = 50;
    uint256 public constant POST_COOLDOWN = 30 seconds;
    uint256 public constant COMMENT_COOLDOWN = 10 seconds;
    uint256 public constant MESSAGE_COOLDOWN = 5 seconds;

    // Structs
    struct User {
        string username;
        string profilePictureHash;
        bool isRegistered;
        uint256 registrationDate;
    }
    
    struct Post {
        address author;
        string content;
        string ipfsHash;
        uint256 timestamp;
        uint256 likeCount;
        uint256 commentCount;
        uint256 shareCount;
    }
    
    struct Comment {
        address commenter;
        string commentText;
        uint256 timestamp;
    }

    struct Chat {
        address participant1;
        address participant2;
        uint256 lastActivity;
    }

    struct Message {
        address sender;
        string content;
        uint256 timestamp;
        bool read;
    }

    // Mappings
    mapping(address => User) public users;
    mapping(uint256 => Post) public posts;
    mapping(uint256 => Comment[]) private _postComments;
    mapping(uint256 => address[]) private _postLikes;
    mapping(uint256 => address[]) private _postShares;
    mapping(address => uint256[]) private _userPosts;
    mapping(address => uint256) private _lastPostTime;
    mapping(address => uint256) private _lastCommentTime;
    mapping(address => uint256) private _lastMessageTime;
    mapping(address => address[]) private _userFollowers;
    mapping(address => address[]) private _userFollowing;
    mapping(uint256 => Chat) private _chats;
    mapping(address => uint256[]) private _userChats;
    mapping(address => mapping(address => uint256)) private _chatLookup;
    mapping(uint256 => Message[]) private _chatMessages;

    // Events
    event UserRegistered(address indexed user, string username);
    event UserProfileUpdated(address indexed user);
    event PostCreated(uint256 indexed postId, address indexed author, string content, string ipfsHash);
    event PostLiked(uint256 indexed postId, address indexed liker);
    event PostShared(uint256 indexed postId, address indexed sharer);
    event CommentAdded(uint256 indexed postId, address indexed commenter, string commentText);
    event UserFollowed(address indexed follower, address indexed followed);
    event UserUnfollowed(address indexed follower, address indexed unfollowed);
    event ChatCreated(uint256 indexed chatId, address indexed participant1, address indexed participant2);
    event MessageSent(uint256 indexed chatId, address indexed sender, string content);

    // Errors
    error UserAlreadyRegistered();
    error UserNotRegistered();
    error InvalidUsername();
    error PostDoesNotExist();
    error AlreadyLiked();
    error NotLiked();
    error ContentTooLong();
    error CooldownNotOver();
    error NotChatParticipant();
    error ChatDoesNotExist();
    error CannotFollowSelf();
    error AlreadyFollowing();
    error NotFollowing();

    // Modifiers
    modifier onlyRegisteredUser() {
        if (!users[msg.sender].isRegistered) revert UserNotRegistered();
        _;
    }
    
    modifier postExists(uint256 postId) {
        if (posts[postId].author == address(0)) revert PostDoesNotExist();
        _;
    }
    
    modifier validStringLength(string memory str, uint256 maxLength) {
        if (bytes(str).length > maxLength) revert ContentTooLong();
        _;
    }

    modifier chatExists(uint256 chatId) {
        if (_chats[chatId].participant1 == address(0)) revert ChatDoesNotExist();
        _;
    }

    modifier onlyChatParticipant(uint256 chatId) {
        Chat storage chat = _chats[chatId];
        if (chat.participant1 != msg.sender && chat.participant2 != msg.sender) 
            revert NotChatParticipant();
        _;
    }

    // User Management Functions
    function registerUser(string memory username) 
        external 
        validStringLength(username, MAX_USERNAME_LENGTH) 
    {
        if (users[msg.sender].isRegistered) revert UserAlreadyRegistered();
        
        users[msg.sender] = User({
            username: username,
            profilePictureHash: "",
            isRegistered: true,
            registrationDate: block.timestamp
        });
        
        emit UserRegistered(msg.sender, username);
    }

    function updateProfile(string memory profilePictureHash) 
        external 
        onlyRegisteredUser 
    {
        users[msg.sender].profilePictureHash = profilePictureHash;
        emit UserProfileUpdated(msg.sender);
    }

    // Follow/Unfollow Functions
    function followUser(address userToFollow) external onlyRegisteredUser {
        if (userToFollow == msg.sender) revert CannotFollowSelf();
        if (!users[userToFollow].isRegistered) revert UserNotRegistered();
        
        // Check if already following
        address[] storage following = _userFollowing[msg.sender];
        for (uint i = 0; i < following.length; i++) {
            if (following[i] == userToFollow) revert AlreadyFollowing();
        }
        
        _userFollowers[userToFollow].push(msg.sender);
        _userFollowing[msg.sender].push(userToFollow);
        
        emit UserFollowed(msg.sender, userToFollow);
    }

    function unfollowUser(address userToUnfollow) external onlyRegisteredUser {
        address[] storage following = _userFollowing[msg.sender];
        bool found = false;
        
        for (uint i = 0; i < following.length; i++) {
            if (following[i] == userToUnfollow) {
                following[i] = following[following.length - 1];
                following.pop();
                found = true;
                break;
            }
        }
        
        if (!found) revert NotFollowing();
        
        // Remove from follower list of the other user
        address[] storage followers = _userFollowers[userToUnfollow];
        for (uint i = 0; i < followers.length; i++) {
            if (followers[i] == msg.sender) {
                followers[i] = followers[followers.length - 1];
                followers.pop();
                break;
            }
        }
        
        emit UserUnfollowed(msg.sender, userToUnfollow);
    }

    function getFollowers(address user) external view returns (address[] memory) {
        return _userFollowers[user];
    }

    function getFollowing(address user) external view returns (address[] memory) {
        return _userFollowing[user];
    }

    // Post Management Functions
    function createPost(
        string memory content,
        string memory ipfsHash
    ) 
        external 
        onlyRegisteredUser 
        validStringLength(content, MAX_CONTENT_LENGTH) 
    {
        if (block.timestamp < _lastPostTime[msg.sender] + POST_COOLDOWN) {
            revert CooldownNotOver();
        }

        uint256 postId = _postIdCounter;
        _postIdCounter++;

        posts[postId] = Post({
            author: msg.sender,
            content: content,
            ipfsHash: ipfsHash,
            timestamp: block.timestamp,
            likeCount: 0,
            commentCount: 0,
            shareCount: 0
        });

        _userPosts[msg.sender].push(postId);
        _lastPostTime[msg.sender] = block.timestamp;

        emit PostCreated(postId, msg.sender, content, ipfsHash);
    }

    function likePost(uint256 postId) 
        external 
        onlyRegisteredUser 
        postExists(postId) 
    {
        address[] storage likes = _postLikes[postId];
        for (uint i = 0; i < likes.length; i++) {
            if (likes[i] == msg.sender) revert AlreadyLiked();
        }
        
        posts[postId].likeCount++;
        likes.push(msg.sender);
        emit PostLiked(postId, msg.sender);
    }

    function unlikePost(uint256 postId) 
        external 
        onlyRegisteredUser 
        postExists(postId) 
    {
        address[] storage likes = _postLikes[postId];
        bool found = false;
        
        for (uint i = 0; i < likes.length; i++) {
            if (likes[i] == msg.sender) {
                likes[i] = likes[likes.length - 1];
                likes.pop();
                found = true;
                break;
            }
        }
        
        if (!found) revert NotLiked();
        
        posts[postId].likeCount--;
    }

    function sharePost(uint256 postId) 
        external 
        onlyRegisteredUser 
        postExists(postId) 
    {
        posts[postId].shareCount++;
        _postShares[postId].push(msg.sender);
        emit PostShared(postId, msg.sender);
    }

    function addComment(uint256 postId, string memory commentText)
        external
        onlyRegisteredUser
        postExists(postId)
        validStringLength(commentText, MAX_COMMENT_LENGTH)
    {
        if (block.timestamp < _lastCommentTime[msg.sender] + COMMENT_COOLDOWN) {
            revert CooldownNotOver();
        }
        
        _postComments[postId].push(Comment(msg.sender, commentText, block.timestamp));
        posts[postId].commentCount++;
        _lastCommentTime[msg.sender] = block.timestamp;
        emit CommentAdded(postId, msg.sender, commentText);
    }

    // Chat Functions
    function createChat(address participant) external onlyRegisteredUser {
        if (!users[participant].isRegistered) revert UserNotRegistered();
        if (participant == msg.sender) revert CannotFollowSelf();
        
        // Check if chat already exists
        uint256 existingChatId = _chatLookup[msg.sender][participant];
        if (existingChatId != 0) return;
        
        uint256 chatId = _chatIdCounter;
        _chatIdCounter++;
        
        _chats[chatId] = Chat({
            participant1: msg.sender,
            participant2: participant,
            lastActivity: block.timestamp
        });
        
        _userChats[msg.sender].push(chatId);
        _userChats[participant].push(chatId);
        
        _chatLookup[msg.sender][participant] = chatId;
        _chatLookup[participant][msg.sender] = chatId;
        
        emit ChatCreated(chatId, msg.sender, participant);
    }

    function sendMessage(uint256 chatId, string memory content)
        external
        onlyRegisteredUser
        chatExists(chatId)
        onlyChatParticipant(chatId)
        validStringLength(content, MAX_CONTENT_LENGTH)
    {
        if (block.timestamp < _lastMessageTime[msg.sender] + MESSAGE_COOLDOWN) {
            revert CooldownNotOver();
        }
        
        _chatMessages[chatId].push(Message({
            sender: msg.sender,
            content: content,
            timestamp: block.timestamp,
            read: false
        }));
        
        _chats[chatId].lastActivity = block.timestamp;
        _lastMessageTime[msg.sender] = block.timestamp;
        
        emit MessageSent(chatId, msg.sender, content);
    }

    // Getter Functions
    function getPost(uint256 postId) external view postExists(postId) returns (Post memory) {
        return posts[postId];
    }

    function getPostLikes(uint256 postId) external view postExists(postId) returns (address[] memory) {
        return _postLikes[postId];
    }

    function getPostComments(uint256 postId) external view postExists(postId) returns (Comment[] memory) {
        return _postComments[postId];
    }

    function getUserPosts(address user) external view returns (uint256[] memory) {
        return _userPosts[user];
    }

    function getTotalPosts() external view returns (uint256) {
        return _postIdCounter;
    }

    function getChat(uint256 chatId) 
        external 
        view 
        chatExists(chatId) 
        onlyChatParticipant(chatId) 
        returns (Chat memory) 
    {
        return _chats[chatId];
    }

    function getChatMessages(uint256 chatId, uint256 limit, uint256 offset) 
        external 
        view 
        chatExists(chatId) 
        onlyChatParticipant(chatId) 
        returns (Message[] memory) 
    {
        uint256 totalMessages = _chatMessages[chatId].length;
        uint256 resultSize = limit;
        
        if (offset >= totalMessages) {
            return new Message[](0);
        }
        
        if (offset + limit > totalMessages) {
            resultSize = totalMessages - offset;
        }
        
        Message[] memory result = new Message[](resultSize);
        
        for (uint256 i = 0; i < resultSize; i++) {
            result[i] = _chatMessages[chatId][offset + i];
        }
        
        return result;
    }

    function getUserChats() external view onlyRegisteredUser returns (uint256[] memory) {
        return _userChats[msg.sender];
    }

    function getChatWithUser(address user) external view returns (uint256) {
        return _chatLookup[msg.sender][user];
    }
}
