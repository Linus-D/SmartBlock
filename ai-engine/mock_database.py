#!/usr/bin/env python3
"""
Mock database setup and population for SmartBlock AI Engine
Creates sample data for testing recommendation algorithms
"""

import sqlite3
import json
from datetime import datetime, timedelta
import random

class MockDatabaseSetup:
    def __init__(self, db_path: str = "database.sqlite"):
        self.db_path = db_path

    def create_tables(self):
        """Create necessary tables for the recommendation system"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()

            # Users table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    address TEXT PRIMARY KEY,
                    username TEXT UNIQUE NOT NULL,
                    email TEXT,
                    bio TEXT,
                    avatar_url TEXT,
                    cover_image_url TEXT,
                    followers_count INTEGER DEFAULT 0,
                    following_count INTEGER DEFAULT 0,
                    posts_count INTEGER DEFAULT 0,
                    verified BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)

            # Posts table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS posts (
                    id TEXT PRIMARY KEY,
                    author_address TEXT,
                    content TEXT NOT NULL,
                    images TEXT,  -- JSON array of image URLs
                    tags TEXT,   -- JSON array of tags
                    token_reward INTEGER DEFAULT 0,
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (author_address) REFERENCES users (address)
                )
            """)

            # Likes table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS likes (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_address TEXT,
                    post_id TEXT,
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_address) REFERENCES users (address),
                    FOREIGN KEY (post_id) REFERENCES posts (id),
                    UNIQUE(user_address, post_id)
                )
            """)

            # Comments table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS comments (
                    id TEXT PRIMARY KEY,
                    post_id TEXT,
                    author_address TEXT,
                    content TEXT NOT NULL,
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (post_id) REFERENCES posts (id),
                    FOREIGN KEY (author_address) REFERENCES users (address)
                )
            """)

            # Follows table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS follows (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    follower_address TEXT,
                    following_address TEXT,
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (follower_address) REFERENCES users (address),
                    FOREIGN KEY (following_address) REFERENCES users (address),
                    UNIQUE(follower_address, following_address)
                )
            """)

            # Shares table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS shares (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_address TEXT,
                    post_id TEXT,
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_address) REFERENCES users (address),
                    FOREIGN KEY (post_id) REFERENCES posts (id),
                    UNIQUE(user_address, post_id)
                )
            """)

            conn.commit()
            print("Database tables created successfully!")

    def populate_mock_data(self):
        """Populate database with mock data for testing"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()

            # Mock users data
            mock_users = [
                {
                    'address': '0x742d35Cc6bF7e45B1BC5E7c0F8b7e4b4b7e4b4b7e4b4b7e4',
                    'username': 'alice_crypto',
                    'email': 'alice@example.com',
                    'bio': 'Blockchain developer & DeFi enthusiast. Building the future of finance.',
                    'avatar_url': 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
                    'followers_count': 12500,
                    'following_count': 850,
                    'posts_count': 342,
                    'verified': True
                },
                {
                    'address': '0x8ba1f109551bD432803012645Hac136c22C57592',
                    'username': 'bob_defi',
                    'email': 'bob@example.com',
                    'bio': 'Smart contract auditor | Security researcher | Web3 advocate',
                    'avatar_url': 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
                    'followers_count': 8900,
                    'following_count': 1200,
                    'posts_count': 156,
                    'verified': True
                },
                {
                    'address': '0x123def456ghi789jkl012mno345pqr678stu901vwx',
                    'username': 'sarah_nft',
                    'email': 'sarah@example.com',
                    'bio': 'Digital artist creating NFTs | Metaverse explorer',
                    'avatar_url': 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
                    'followers_count': 15600,
                    'following_count': 680,
                    'posts_count': 89,
                    'verified': False
                },
                {
                    'address': '0xabcdef123456789012345678901234567890abcd',
                    'username': 'crypto_trader',
                    'email': 'trader@example.com',
                    'bio': 'Professional crypto trader | Market analyst | DeFi strategist',
                    'followers_count': 25000,
                    'following_count': 500,
                    'posts_count': 234,
                    'verified': True
                },
                {
                    'address': '0x987654321098765432109876543210987654321',
                    'username': 'web3_dev',
                    'email': 'dev@example.com',
                    'bio': 'Full-stack Web3 developer | Building dApps | Smart contract specialist',
                    'followers_count': 7800,
                    'following_count': 1500,
                    'posts_count': 178,
                    'verified': False
                }
            ]

            # Insert users
            for user in mock_users:
                cursor.execute("""
                    INSERT OR REPLACE INTO users
                    (address, username, email, bio, avatar_url, followers_count, following_count, posts_count, verified)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    user['address'], user['username'], user['email'], user['bio'],
                    user['avatar_url'], user['followers_count'], user['following_count'],
                    user['posts_count'], user['verified']
                ))

            # Mock posts data
            mock_posts = [
                {
                    'id': 'post1',
                    'author_address': mock_users[0]['address'],
                    'content': 'Just deployed my first smart contract on the testnet! 🚀 The future of decentralized applications is here.',
                    'images': json.dumps(['https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600']),
                    'tags': json.dumps(['blockchain', 'smartcontracts', 'web3']),
                    'token_reward': 25
                },
                {
                    'id': 'post2',
                    'author_address': mock_users[1]['address'],
                    'content': 'Security audit completed for @DeFiProtocol ✅ Found 3 medium-risk vulnerabilities, all now patched.',
                    'tags': json.dumps(['security', 'audit', 'defi']),
                    'token_reward': 50
                },
                {
                    'id': 'post3',
                    'author_address': mock_users[2]['address'],
                    'content': 'New NFT collection dropping next week! 🎨 Each piece tells a story about digital art evolution.',
                    'images': json.dumps([
                        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600',
                        'https://images.unsplash.com/photo-1617791160536-598cf32026fb?w=600'
                    ]),
                    'tags': json.dumps(['nft', 'art', 'metaverse']),
                    'token_reward': 35
                },
                {
                    'id': 'post4',
                    'author_address': mock_users[3]['address'],
                    'content': 'Market analysis: Bitcoin showing strong support at $45k. DeFi tokens gaining momentum. What are your thoughts?',
                    'tags': json.dumps(['trading', 'bitcoin', 'defi', 'analysis']),
                    'token_reward': 40
                },
                {
                    'id': 'post5',
                    'author_address': mock_users[4]['address'],
                    'content': 'Building a new dApp with React and ethers.js. The developer experience in Web3 keeps getting better!',
                    'tags': json.dumps(['development', 'react', 'web3', 'dapp']),
                    'token_reward': 30
                }
            ]

            # Insert posts with realistic timestamps
            for i, post in enumerate(mock_posts):
                # Create posts with timestamps spread over the last few days
                timestamp = datetime.now() - timedelta(hours=random.randint(1, 72))
                cursor.execute("""
                    INSERT OR REPLACE INTO posts
                    (id, author_address, content, images, tags, token_reward, timestamp)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (
                    post['id'], post['author_address'], post['content'],
                    post.get('images'), post['tags'], post['token_reward'], timestamp
                ))

            # Generate mock interactions
            self.generate_mock_interactions(cursor, mock_users, mock_posts)

            conn.commit()
            print("Mock data populated successfully!")

    def generate_mock_interactions(self, cursor, users, posts):
        """Generate mock likes, comments, and follows"""

        # Generate follows
        for i, user in enumerate(users):
            for j, target_user in enumerate(users):
                if i != j and random.random() < 0.3:  # 30% chance of following
                    try:
                        cursor.execute("""
                            INSERT OR IGNORE INTO follows (follower_address, following_address)
                            VALUES (?, ?)
                        """, (user['address'], target_user['address']))
                    except:
                        pass

        # Generate likes
        for post in posts:
            # Each post gets random number of likes
            like_count = random.randint(10, 200)
            for _ in range(like_count):
                liker = random.choice(users)
                if liker['address'] != post['author_address']:  # Don't like own posts
                    try:
                        like_time = datetime.now() - timedelta(hours=random.randint(1, 48))
                        cursor.execute("""
                            INSERT OR IGNORE INTO likes (user_address, post_id, timestamp)
                            VALUES (?, ?, ?)
                        """, (liker['address'], post['id'], like_time))
                    except:
                        pass

        # Generate comments
        sample_comments = [
            "Great post! Thanks for sharing.",
            "This is really insightful. Could you elaborate more?",
            "I completely agree with your analysis.",
            "Interesting perspective. I hadn't thought of it that way.",
            "Thanks for the detailed explanation!",
            "This helped me understand the concept better.",
            "Looking forward to more content like this.",
            "Excellent work! Keep it up.",
            "Could you share more resources on this topic?",
            "This is exactly what I was looking for."
        ]

        for post in posts:
            # Each post gets random number of comments
            comment_count = random.randint(2, 25)
            for i in range(comment_count):
                commenter = random.choice(users)
                if commenter['address'] != post['author_address']:  # Don't comment on own posts
                    try:
                        comment_time = datetime.now() - timedelta(hours=random.randint(1, 36))
                        cursor.execute("""
                            INSERT OR IGNORE INTO comments (id, post_id, author_address, content, timestamp)
                            VALUES (?, ?, ?, ?, ?)
                        """, (
                            f"comment_{post['id']}_{i}",
                            post['id'],
                            commenter['address'],
                            random.choice(sample_comments),
                            comment_time
                        ))
                    except:
                        pass

def setup_mock_database():
    """Setup and populate mock database"""
    setup = MockDatabaseSetup()
    print("Creating database tables...")
    setup.create_tables()
    print("Populating with mock data...")
    setup.populate_mock_data()
    print("Mock database setup complete!")

if __name__ == "__main__":
    setup_mock_database()