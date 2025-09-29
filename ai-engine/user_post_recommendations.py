#!/usr/bin/env python3
"""
AI-powered user and post recommendation system for SmartBlock
Uses collaborative filtering and content-based recommendation algorithms
"""

import sqlite3
import json
import numpy as np
from datetime import datetime, timedelta
from typing import List, Dict, Tuple, Optional
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SmartBlockRecommendationEngine:
    def __init__(self, db_path: str = "database.sqlite"):
        """Initialize the recommendation engine with database connection"""
        self.db_path = db_path
        self.min_interactions = 3  # Minimum interactions for recommendations

    def get_db_connection(self):
        """Get database connection"""
        return sqlite3.connect(self.db_path)

    def get_user_interactions(self, user_id: str) -> Dict:
        """Get all user interactions (likes, comments, follows)"""
        with self.get_db_connection() as conn:
            cursor = conn.cursor()

            # Get liked posts
            cursor.execute("""
                SELECT post_id, timestamp FROM likes
                WHERE user_address = ?
                ORDER BY timestamp DESC
            """, (user_id,))
            likes = cursor.fetchall()

            # Get commented posts
            cursor.execute("""
                SELECT post_id, timestamp FROM comments
                WHERE author_address = ?
                ORDER BY timestamp DESC
            """, (user_id,))
            comments = cursor.fetchall()

            # Get followed users
            cursor.execute("""
                SELECT following_address, timestamp FROM follows
                WHERE follower_address = ?
                ORDER BY timestamp DESC
            """, (user_id,))
            follows = cursor.fetchall()

            return {
                'likes': likes,
                'comments': comments,
                'follows': follows
            }

    def calculate_user_similarity(self, user1_id: str, user2_id: str) -> float:
        """Calculate similarity between two users based on their interactions"""
        try:
            user1_interactions = self.get_user_interactions(user1_id)
            user2_interactions = self.get_user_interactions(user2_id)

            # Get liked post IDs for both users
            user1_likes = set([like[0] for like in user1_interactions['likes']])
            user2_likes = set([like[0] for like in user2_interactions['likes']])

            # Calculate Jaccard similarity
            if len(user1_likes) == 0 and len(user2_likes) == 0:
                return 0.0

            intersection = len(user1_likes.intersection(user2_likes))
            union = len(user1_likes.union(user2_likes))

            jaccard_similarity = intersection / union if union > 0 else 0.0

            # Boost similarity if users follow similar people
            user1_follows = set([follow[0] for follow in user1_interactions['follows']])
            user2_follows = set([follow[0] for follow in user2_interactions['follows']])

            follow_intersection = len(user1_follows.intersection(user2_follows))
            follow_union = len(user1_follows.union(user2_follows))
            follow_similarity = follow_intersection / follow_union if follow_union > 0 else 0.0

            # Weighted combination
            final_similarity = 0.7 * jaccard_similarity + 0.3 * follow_similarity

            return min(final_similarity, 1.0)

        except Exception as e:
            logger.error(f"Error calculating user similarity: {e}")
            return 0.0

    def get_trending_posts(self, hours: int = 24, limit: int = 10) -> List[Dict]:
        """Get trending posts based on recent engagement"""
        with self.get_db_connection() as conn:
            cursor = conn.cursor()

            cutoff_time = datetime.now() - timedelta(hours=hours)

            # Get posts with engagement metrics from the last N hours
            cursor.execute("""
                SELECT
                    p.id,
                    p.content,
                    p.author_address,
                    p.timestamp,
                    COUNT(DISTINCT l.user_address) as like_count,
                    COUNT(DISTINCT c.id) as comment_count,
                    COUNT(DISTINCT s.user_address) as share_count
                FROM posts p
                LEFT JOIN likes l ON p.id = l.post_id AND l.timestamp > ?
                LEFT JOIN comments c ON p.id = c.post_id AND c.timestamp > ?
                LEFT JOIN shares s ON p.id = s.post_id AND s.timestamp > ?
                WHERE p.timestamp > ?
                GROUP BY p.id
                ORDER BY (like_count * 3 + comment_count * 5 + share_count * 2) DESC
                LIMIT ?
            """, (cutoff_time, cutoff_time, cutoff_time, cutoff_time, limit))

            results = cursor.fetchall()

            trending_posts = []
            for row in results:
                post_id, content, author_address, timestamp, likes, comments, shares = row

                # Calculate engagement score
                engagement_score = likes * 3 + comments * 5 + shares * 2

                trending_posts.append({
                    'id': post_id,
                    'content': content,
                    'author_address': author_address,
                    'timestamp': timestamp,
                    'likes': likes,
                    'comments': comments,
                    'shares': shares,
                    'engagement_score': engagement_score,
                    'trending_rank': len(trending_posts) + 1
                })

            return trending_posts

    def recommend_users(self, user_id: str, limit: int = 5) -> List[Dict]:
        """Recommend users based on collaborative filtering"""
        try:
            with self.get_db_connection() as conn:
                cursor = conn.cursor()

                # Get all users except the current user
                cursor.execute("""
                    SELECT DISTINCT address, username, bio, followers_count
                    FROM users
                    WHERE address != ?
                    ORDER BY followers_count DESC
                """, (user_id,))

                all_users = cursor.fetchall()

                user_scores = []

                for user_address, username, bio, followers in all_users[:50]:  # Limit for performance
                    similarity = self.calculate_user_similarity(user_id, user_address)

                    # Calculate additional factors
                    follower_score = min(followers / 10000, 1.0) if followers else 0.0
                    activity_score = self.get_user_activity_score(user_address)

                    # Combined score
                    final_score = (
                        similarity * 0.5 +
                        follower_score * 0.3 +
                        activity_score * 0.2
                    )

                    user_scores.append({
                        'address': user_address,
                        'username': username,
                        'bio': bio,
                        'followers': followers,
                        'similarity_score': similarity,
                        'final_score': final_score
                    })

                # Sort by final score and return top recommendations
                user_scores.sort(key=lambda x: x['final_score'], reverse=True)
                return user_scores[:limit]

        except Exception as e:
            logger.error(f"Error in user recommendations: {e}")
            return []

    def get_user_activity_score(self, user_id: str) -> float:
        """Calculate user activity score based on recent interactions"""
        try:
            with self.get_db_connection() as conn:
                cursor = conn.cursor()

                # Count recent posts, likes, and comments (last 7 days)
                recent_cutoff = datetime.now() - timedelta(days=7)

                cursor.execute("""
                    SELECT
                        COUNT(DISTINCT p.id) as post_count,
                        COUNT(DISTINCT l.post_id) as like_count,
                        COUNT(DISTINCT c.id) as comment_count
                    FROM users u
                    LEFT JOIN posts p ON u.address = p.author_address AND p.timestamp > ?
                    LEFT JOIN likes l ON u.address = l.user_address AND l.timestamp > ?
                    LEFT JOIN comments c ON u.address = c.author_address AND c.timestamp > ?
                    WHERE u.address = ?
                """, (recent_cutoff, recent_cutoff, recent_cutoff, user_id))

                result = cursor.fetchone()
                if result:
                    posts, likes, comments = result
                    # Normalize activity score (0-1 range)
                    activity_score = min((posts * 0.5 + likes * 0.2 + comments * 0.3) / 10, 1.0)
                    return activity_score

                return 0.0

        except Exception as e:
            logger.error(f"Error calculating activity score: {e}")
            return 0.0

    def recommend_posts(self, user_id: str, limit: int = 10) -> List[Dict]:
        """Recommend posts based on user preferences and collaborative filtering"""
        try:
            # Get user's interaction history
            user_interactions = self.get_user_interactions(user_id)
            liked_posts = set([like[0] for like in user_interactions['likes']])

            # Get posts from similar users
            similar_users = self.recommend_users(user_id, limit=10)

            with self.get_db_connection() as conn:
                cursor = conn.cursor()

                post_scores = []

                # Get recent posts (last 7 days) excluding user's own posts
                recent_cutoff = datetime.now() - timedelta(days=7)

                cursor.execute("""
                    SELECT
                        p.id,
                        p.content,
                        p.author_address,
                        p.timestamp,
                        COUNT(DISTINCT l.user_address) as like_count,
                        COUNT(DISTINCT c.id) as comment_count,
                        COUNT(DISTINCT s.user_address) as share_count
                    FROM posts p
                    LEFT JOIN likes l ON p.id = l.post_id
                    LEFT JOIN comments c ON p.id = c.post_id
                    LEFT JOIN shares s ON p.id = s.post_id
                    WHERE p.author_address != ?
                    AND p.timestamp > ?
                    AND p.id NOT IN ({})
                    GROUP BY p.id
                    ORDER BY p.timestamp DESC
                """.format(','.join(['?' for _ in liked_posts]) if liked_posts else 'NULL'),
                (user_id, recent_cutoff, *liked_posts))

                recent_posts = cursor.fetchall()

                for post_data in recent_posts:
                    post_id, content, author_address, timestamp, likes, comments, shares = post_data

                    # Calculate base engagement score
                    engagement_score = likes * 2 + comments * 3 + shares * 1

                    # Boost score if post is from similar users
                    author_boost = 0.0
                    for similar_user in similar_users:
                        if similar_user['address'] == author_address:
                            author_boost = similar_user['similarity_score'] * 0.5
                            break

                    # Time decay factor (newer posts get higher scores)
                    post_time = datetime.fromisoformat(timestamp.replace('Z', '+00:00')) if isinstance(timestamp, str) else timestamp
                    hours_old = (datetime.now() - post_time).total_seconds() / 3600
                    time_factor = max(0.1, 1.0 - (hours_old / 168))  # Decay over a week

                    # Content-based factors (simple keyword matching)
                    content_score = self.calculate_content_relevance(content, user_interactions)

                    # Final recommendation score
                    final_score = (
                        engagement_score * 0.4 +
                        author_boost * 30 +
                        time_factor * 20 +
                        content_score * 10
                    )

                    post_scores.append({
                        'id': post_id,
                        'content': content,
                        'author_address': author_address,
                        'timestamp': timestamp,
                        'likes': likes,
                        'comments': comments,
                        'shares': shares,
                        'final_score': final_score,
                        'engagement_score': engagement_score,
                        'author_boost': author_boost,
                        'time_factor': time_factor,
                        'content_score': content_score
                    })

                # Sort by final score and return top recommendations
                post_scores.sort(key=lambda x: x['final_score'], reverse=True)
                return post_scores[:limit]

        except Exception as e:
            logger.error(f"Error in post recommendations: {e}")
            return []

    def calculate_content_relevance(self, content: str, user_interactions: Dict) -> float:
        """Calculate content relevance based on user's interaction history"""
        try:
            # Simple keyword-based relevance (can be enhanced with NLP)
            web3_keywords = [
                'blockchain', 'ethereum', 'bitcoin', 'defi', 'nft', 'web3',
                'smart contract', 'dapp', 'cryptocurrency', 'token', 'dao',
                'metaverse', 'mining', 'staking', 'yield', 'protocol'
            ]

            content_lower = content.lower()
            keyword_matches = sum(1 for keyword in web3_keywords if keyword in content_lower)

            # Normalize keyword score
            keyword_score = min(keyword_matches / 5, 1.0)  # Max score for 5+ keywords

            # Content length factor (medium-length posts often perform better)
            length_factor = 1.0
            content_length = len(content)
            if 50 <= content_length <= 300:
                length_factor = 1.2  # Boost for optimal length
            elif content_length > 500:
                length_factor = 0.8  # Slight penalty for very long posts

            return keyword_score * length_factor

        except Exception as e:
            logger.error(f"Error calculating content relevance: {e}")
            return 0.0

    def get_personalized_recommendations(self, user_id: str) -> Dict:
        """Get comprehensive personalized recommendations"""
        try:
            # Get user recommendations
            recommended_users = self.recommend_users(user_id, limit=5)

            # Get post recommendations
            recommended_posts = self.recommend_posts(user_id, limit=10)

            # Get trending content
            trending_posts = self.get_trending_posts(hours=24, limit=5)

            # Get user engagement stats
            engagement_stats = self.get_user_engagement_stats(user_id)

            return {
                'user_id': user_id,
                'timestamp': datetime.now().isoformat(),
                'recommended_users': recommended_users,
                'recommended_posts': recommended_posts,
                'trending_posts': trending_posts,
                'engagement_stats': engagement_stats,
                'status': 'success'
            }

        except Exception as e:
            logger.error(f"Error generating personalized recommendations: {e}")
            return {
                'user_id': user_id,
                'timestamp': datetime.now().isoformat(),
                'error': str(e),
                'status': 'error'
            }

    def get_user_engagement_stats(self, user_id: str) -> Dict:
        """Get user engagement statistics"""
        try:
            with self.get_db_connection() as conn:
                cursor = conn.cursor()

                # Get user's posts and their engagement
                cursor.execute("""
                    SELECT
                        p.id,
                        COUNT(DISTINCT l.user_address) as likes,
                        COUNT(DISTINCT c.id) as comments,
                        COUNT(DISTINCT s.user_address) as shares
                    FROM posts p
                    LEFT JOIN likes l ON p.id = l.post_id
                    LEFT JOIN comments c ON p.id = c.post_id
                    LEFT JOIN shares s ON p.id = s.post_id
                    WHERE p.author_address = ?
                    GROUP BY p.id
                """, (user_id,))

                user_posts = cursor.fetchall()

                if not user_posts:
                    return {
                        'total_posts': 0,
                        'total_likes': 0,
                        'total_comments': 0,
                        'total_shares': 0,
                        'avg_engagement': 0.0,
                        'engagement_rate': 0.0
                    }

                total_likes = sum(row[1] for row in user_posts)
                total_comments = sum(row[2] for row in user_posts)
                total_shares = sum(row[3] for row in user_posts)
                total_engagement = total_likes + total_comments + total_shares

                avg_engagement = total_engagement / len(user_posts)

                # Get user's follower count for engagement rate calculation
                cursor.execute("SELECT followers_count FROM users WHERE address = ?", (user_id,))
                follower_result = cursor.fetchone()
                followers = follower_result[0] if follower_result else 1

                engagement_rate = (avg_engagement / max(followers, 1)) * 100

                return {
                    'total_posts': len(user_posts),
                    'total_likes': total_likes,
                    'total_comments': total_comments,
                    'total_shares': total_shares,
                    'avg_engagement': round(avg_engagement, 2),
                    'engagement_rate': round(engagement_rate, 2)
                }

        except Exception as e:
            logger.error(f"Error getting engagement stats: {e}")
            return {
                'total_posts': 0,
                'total_likes': 0,
                'total_comments': 0,
                'total_shares': 0,
                'avg_engagement': 0.0,
                'engagement_rate': 0.0
            }

def get_recommendations_for_user(user_id: str) -> str:
    """Main function to get recommendations for a user"""
    engine = SmartBlockRecommendationEngine()
    recommendations = engine.get_personalized_recommendations(user_id)
    return json.dumps(recommendations, indent=2)

if __name__ == "__main__":
    # Test the recommendation engine
    test_user_id = "0x742d35Cc6bF7e45B1BC5E7c0F8b7e4b4b7e4b4b7e4b4b7e4"
    print("Testing SmartBlock Recommendation Engine...")
    print("=" * 50)

    result = get_recommendations_for_user(test_user_id)
    print(result)