#!/usr/bin/env python3
"""
Simple recommendation system for SmartBlock
Provides basic content and user recommendations without complex ML
"""

import sqlite3
import json
import random
from datetime import datetime, timedelta
from typing import List, Dict

class SimpleRecommendationEngine:
    def __init__(self, db_path: str = "database.sqlite"):
        self.db_path = db_path

    def get_db_connection(self):
        return sqlite3.connect(self.db_path)

    def get_popular_users(self, limit: int = 5) -> List[Dict]:
        """Get most popular users by follower count"""
        try:
            with self.get_db_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    SELECT address, username, bio, followers_count, posts_count
                    FROM users
                    WHERE followers_count > 0
                    ORDER BY followers_count DESC
                    LIMIT ?
                """, (limit,))

                users = []
                for row in cursor.fetchall():
                    address, username, bio, followers, posts = row
                    users.append({
                        'address': address,
                        'username': username,
                        'bio': bio,
                        'followers': followers,
                        'posts': posts,
                        'recommendation_reason': 'Popular user'
                    })

                return users
        except Exception as e:
            print(f"Error getting popular users: {e}")
            return []

    def get_recent_active_posts(self, hours: int = 24, limit: int = 10) -> List[Dict]:
        """Get recently active posts with good engagement"""
        try:
            with self.get_db_connection() as conn:
                cursor = conn.cursor()

                cutoff_time = datetime.now() - timedelta(hours=hours)

                cursor.execute("""
                    SELECT
                        p.id,
                        p.content,
                        p.author_address,
                        p.timestamp,
                        u.username,
                        COUNT(DISTINCT l.user_address) as likes,
                        COUNT(DISTINCT c.id) as comments
                    FROM posts p
                    JOIN users u ON p.author_address = u.address
                    LEFT JOIN likes l ON p.id = l.post_id
                    LEFT JOIN comments c ON p.id = c.post_id
                    WHERE p.timestamp > ?
                    GROUP BY p.id
                    HAVING likes > 0 OR comments > 0
                    ORDER BY (likes + comments * 2) DESC
                    LIMIT ?
                """, (cutoff_time, limit))

                posts = []
                for row in cursor.fetchall():
                    post_id, content, author_address, timestamp, username, likes, comments = row
                    posts.append({
                        'id': post_id,
                        'content': content[:200] + '...' if len(content) > 200 else content,
                        'author_address': author_address,
                        'author_username': username,
                        'timestamp': timestamp,
                        'likes': likes,
                        'comments': comments,
                        'engagement_score': likes + comments * 2,
                        'recommendation_reason': 'Recently active'
                    })

                return posts
        except Exception as e:
            print(f"Error getting active posts: {e}")
            return []

    def get_random_suggestions(self, user_id: str, limit: int = 3) -> List[Dict]:
        """Get random content suggestions for discovery"""
        try:
            with self.get_db_connection() as conn:
                cursor = conn.cursor()

                # Get random users (excluding current user)
                cursor.execute("""
                    SELECT address, username, bio, followers_count
                    FROM users
                    WHERE address != ?
                    ORDER BY RANDOM()
                    LIMIT ?
                """, (user_id, limit))

                suggestions = []
                for row in cursor.fetchall():
                    address, username, bio, followers = row
                    suggestions.append({
                        'type': 'user',
                        'address': address,
                        'username': username,
                        'bio': bio,
                        'followers': followers,
                        'recommendation_reason': 'Discover new creators'
                    })

                return suggestions
        except Exception as e:
            print(f"Error getting random suggestions: {e}")
            return []

    def generate_simple_recommendations(self, user_id: str) -> Dict:
        """Generate simple recommendations without complex algorithms"""
        try:
            # Get different types of recommendations
            popular_users = self.get_popular_users(limit=3)
            active_posts = self.get_recent_active_posts(hours=48, limit=5)
            random_suggestions = self.get_random_suggestions(user_id, limit=2)

            return {
                'user_id': user_id,
                'timestamp': datetime.now().isoformat(),
                'recommendations': {
                    'popular_users': popular_users,
                    'active_posts': active_posts,
                    'discover': random_suggestions
                },
                'algorithm': 'simple',
                'status': 'success'
            }

        except Exception as e:
            return {
                'user_id': user_id,
                'timestamp': datetime.now().isoformat(),
                'error': str(e),
                'algorithm': 'simple',
                'status': 'error'
            }

def get_simple_recommendations(user_id: str) -> str:
    """Get simple recommendations as JSON string"""
    engine = SimpleRecommendationEngine()
    recommendations = engine.generate_simple_recommendations(user_id)
    return json.dumps(recommendations, indent=2)

if __name__ == "__main__":
    # Test the simple recommendation engine
    test_user_id = "0x742d35Cc6bF7e45B1BC5E7c0F8b7e4b4b7e4b4b7e4b4b7e4"
    print("Testing Simple Recommendation Engine...")
    print("=" * 40)

    result = get_simple_recommendations(test_user_id)
    print(result)