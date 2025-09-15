import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { 
  SocialMediaContractHelper, 
  useSocialMediaContract,
  getAllPosts,
  createPost,
  likePost,
  registerUser,
  followUser
} from './contractHelper';

// Example React component showing how to use the contract
export const SocialMediaApp: React.FC = () => {
  const { helper, contract, isConnected, connectWallet } = useSocialMediaContract();
  const [posts, setPosts] = useState<any[]>([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [username, setUsername] = useState('');
  const [userAddress, setUserAddress] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(false);

  // Connect wallet and check user status
  const handleConnectWallet = async () => {
    try {
      setLoading(true);
      await connectWallet();
      
      if (contract) {
        const signer = await contract.runner?.getAddress();
        if (signer) {
          setUserAddress(signer);
          const registered = await helper.isUserRegistered(signer);
          setIsRegistered(registered);
        }
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      alert('Failed to connect wallet. Please make sure MetaMask is installed.');
    } finally {
      setLoading(false);
    }
  };

  // Register user
  const handleRegisterUser = async () => {
    if (!username.trim()) {
      alert('Please enter a username');
      return;
    }

    try {
      setLoading(true);
      await registerUser(helper, username);
      setIsRegistered(true);
      alert('User registered successfully!');
    } catch (error) {
      console.error('Failed to register user:', error);
      alert('Failed to register user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Create a new post
  const handleCreatePost = async () => {
    if (!newPostContent.trim()) {
      alert('Please enter post content');
      return;
    }

    try {
      setLoading(true);
      await createPost(helper, newPostContent);
      setNewPostContent('');
      await loadPosts(); // Refresh posts
      alert('Post created successfully!');
    } catch (error) {
      console.error('Failed to create post:', error);
      alert('Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Like a post
  const handleLikePost = async (postId: number) => {
    try {
      setLoading(true);
      await likePost(helper, postId);
      await loadPosts(); // Refresh posts
    } catch (error) {
      console.error('Failed to like post:', error);
      alert('Failed to like post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load all posts
  const loadPosts = async () => {
    try {
      const allPosts = await getAllPosts(helper);
      setPosts(allPosts);
    } catch (error) {
      console.error('Failed to load posts:', error);
    }
  };

  // Load posts on component mount
  useEffect(() => {
    if (isConnected) {
      loadPosts();
    }
  }, [isConnected]);

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Social Media Platform</h1>
      
      {!isConnected ? (
        <div>
          <p>Connect your wallet to start using the platform</p>
          <button 
            onClick={handleConnectWallet}
            disabled={loading}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            {loading ? 'Connecting...' : 'Connect Wallet'}
          </button>
        </div>
      ) : (
        <div>
          <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
            <p><strong>Connected Address:</strong> {userAddress}</p>
            <p><strong>Registered:</strong> {isRegistered ? 'Yes' : 'No'}</p>
          </div>

          {!isRegistered ? (
            <div style={{ marginBottom: '20px' }}>
              <h3>Register User</h3>
              <input
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ padding: '8px', marginRight: '10px', width: '200px' }}
              />
              <button 
                onClick={handleRegisterUser}
                disabled={loading}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: 'pointer'
                }}
              >
                {loading ? 'Registering...' : 'Register'}
              </button>
            </div>
          ) : (
            <div style={{ marginBottom: '20px' }}>
              <h3>Create New Post</h3>
              <textarea
                placeholder="What's on your mind?"
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                style={{ 
                  width: '100%', 
                  height: '100px', 
                  padding: '10px', 
                  marginBottom: '10px',
                  border: '1px solid #ccc',
                  borderRadius: '5px'
                }}
                maxLength={500}
              />
              <div style={{ textAlign: 'right', marginBottom: '10px' }}>
                {newPostContent.length}/500 characters
              </div>
              <button 
                onClick={handleCreatePost}
                disabled={loading || !newPostContent.trim()}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                {loading ? 'Posting...' : 'Create Post'}
              </button>
            </div>
          )}

          <div>
            <h3>Posts</h3>
            {posts.length === 0 ? (
              <p>No posts yet. Be the first to create one!</p>
            ) : (
              <div>
                {posts.map((post) => (
                  <div 
                    key={post.id} 
                    style={{ 
                      border: '1px solid #ddd', 
                      padding: '15px', 
                      marginBottom: '15px', 
                      borderRadius: '5px',
                      backgroundColor: 'white'
                    }}
                  >
                    <div style={{ marginBottom: '10px' }}>
                      <strong>Author:</strong> {post.author}
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                      {post.content}
                    </div>
                    <div style={{ display: 'flex', gap: '15px', fontSize: '14px', color: '#666' }}>
                      <span>Likes: {post.likeCount}</span>
                      <span>Comments: {post.commentCount}</span>
                      <span>Shares: {post.shareCount}</span>
                      <span>Time: {new Date(post.timestamp * 1000).toLocaleString()}</span>
                    </div>
                    <div style={{ marginTop: '10px' }}>
                      <button 
                        onClick={() => handleLikePost(post.id)}
                        disabled={loading}
                        style={{
                          padding: '5px 10px',
                          backgroundColor: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '3px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        Like
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Example of how to use the contract helper in a custom hook
export const useSocialMediaData = () => {
  const { helper, isConnected } = useSocialMediaContract();
  const [userInfo, setUserInfo] = useState<any>(null);
  const [userPosts, setUserPosts] = useState<number[]>([]);
  const [followers, setFollowers] = useState<string[]>([]);
  const [following, setFollowing] = useState<string[]>([]);

  const loadUserData = async (address: string) => {
    if (!isConnected) return;

    try {
      const [info, posts, followersList, followingList] = await Promise.all([
        helper.getUserInfo(address),
        helper.getUserPosts(address),
        helper.getFollowers(address),
        helper.getFollowing(address)
      ]);

      setUserInfo(info);
      setUserPosts(posts);
      setFollowers(followersList);
      setFollowing(followingList);
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  };

  return {
    userInfo,
    userPosts,
    followers,
    following,
    loadUserData
  };
};
