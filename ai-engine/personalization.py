"""
SmartBlock AI Engine - Personalization Module
Implements personalization rules for recommendation system including recency boost,
topic boost, diversity enforcement, and safety filters.
"""

import numpy as np
import pandas as pd
import sqlite3
import os
import logging
from typing import List, Dict, Tuple, Set
from datetime import datetime, timedelta
import json
from collections import defaultdict, Counter

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class PersonalizationEngine:
    """
    Handles personalization rules for the SmartBlock recommendation system.
    Applies recency boost, topic preferences, diversity enforcement, and safety filters.
    """
    
    def __init__(self, db_path: str = None):
        """
        Initialize personalization engine.
        
        Args:
            db_path: Path to SQLite database
        """
        if db_path is None:
            db_path = os.path.join(os.path.dirname(__file__), 'database.sqlite')
        self.db_path = db_path
        
        # Personalization parameters
        self.recency_decay_days = 30  # Days for recency decay
        self.topic_boost_factor = 1.5  # Boost for subscribed topics
        self.diversity_penalty = 0.8   # Penalty for repeated authors
        self.max_posts_per_author = 2  # Max posts from same author in recommendations
        
        # Safety filters
        self.safety_keywords = {
            'spam', 'scam', 'fake', 'bot', 'advertisement', 'ad', 'promotion',
            'click here', 'buy now', 'limited time', 'urgent', 'winner',
            'congratulations', 'free money', 'get rich', 'investment opportunity'
        }
        
    def connect_db(self) -> sqlite3.Connection:
        """Create database connection."""
        return sqlite3.connect(self.db_path)
    
    def get_user_interests(self, user_address: str) -> List[str]:
        """
        Get user's interests from database.
        
        Args:
            user_address: User's wallet address
            
        Returns:
            List of user interests
        """
        conn = self.connect_db()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT interest FROM user_interests 
            WHERE user_address = ?
        """, (user_address,))
        
        interests = [row[0] for row in cursor.fetchall()]
        conn.close()
        
        return interests
    
    def get_user_subscribed_topics(self, user_address: str) -> List[str]:
        """
        Get topics user is subscribed to.
        
        Args:
            user_address: User's wallet address
            
        Returns:
            List of subscribed topics
        """
        conn = self.connect_db()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT t.name FROM user_topics ut
            JOIN topics t ON ut.topic_id = t.id
            WHERE ut.user_address = ?
        """, (user_address,))
        
        topics = [row[0] for row in cursor.fetchall()]
        conn.close()
        
        return topics
    
    def get_user_interaction_history(self, user_address: str) -> Dict[str, List[int]]:
        """
        Get user's interaction history.
        
        Args:
            user_address: User's wallet address
            
        Returns:
            Dictionary with interaction types and post IDs
        """
        conn = self.connect_db()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT interaction_type, post_id FROM interactions
            WHERE user_address = ?
            ORDER BY timestamp DESC
        """, (user_address,))
        
        interactions = defaultdict(list)
        for interaction_type, post_id in cursor.fetchall():
            interactions[interaction_type].append(post_id)
        
        conn.close()
        return dict(interactions)
    
    def calculate_recency_boost(self, recommendations: List[Dict]) -> List[Dict]:
        """
        Apply recency boost to favor newer posts.
        
        Args:
            recommendations: List of recommendation dictionaries
            
        Returns:
            Updated recommendations with recency boost
        """
        current_time = datetime.now()
        
        for rec in recommendations:
            days_old = rec['days_old']
            
            # Calculate recency boost (exponential decay)
            if days_old <= 1:
                recency_boost = 1.2  # Strong boost for posts < 1 day
            elif days_old <= 7:
                recency_boost = 1.1  # Medium boost for posts < 1 week
            elif days_old <= self.recency_decay_days:
                # Linear decay over decay period
                recency_boost = 1.0 + 0.1 * (1 - days_old / self.recency_decay_days)
            else:
                recency_boost = 1.0  # No boost for old posts
            
            # Apply boost
            rec['similarity_score'] *= recency_boost
            rec['recency_boost'] = recency_boost
        
        logger.info("Applied recency boost to recommendations")
        return recommendations
    
    def calculate_topic_boost(self, recommendations: List[Dict], 
                            user_interests: List[str], 
                            subscribed_topics: List[str]) -> List[Dict]:
        """
        Apply topic boost for user's interests and subscribed topics.
        
        Args:
            recommendations: List of recommendation dictionaries
            user_interests: User's interests
            subscribed_topics: User's subscribed topics
            
        Returns:
            Updated recommendations with topic boost
        """
        all_preferred_topics = set(user_interests + subscribed_topics)
        
        for rec in recommendations:
            post_topics = set(rec.get('topics', []))
            
            # Calculate topic overlap
            topic_overlap = len(post_topics.intersection(all_preferred_topics))
            
            if topic_overlap > 0:
                # Apply boost based on number of matching topics
                topic_boost = 1.0 + (self.topic_boost_factor - 1.0) * min(topic_overlap / 3, 1.0)
                rec['similarity_score'] *= topic_boost
                rec['topic_boost'] = topic_boost
                rec['matching_topics'] = list(post_topics.intersection(all_preferred_topics))
            else:
                rec['topic_boost'] = 1.0
                rec['matching_topics'] = []
        
        logger.info("Applied topic boost to recommendations")
        return recommendations
    
    def enforce_diversity(self, recommendations: List[Dict]) -> List[Dict]:
        """
        Enforce diversity by limiting posts from the same author.
        
        Args:
            recommendations: List of recommendation dictionaries
            
        Returns:
            Filtered recommendations with diversity enforcement
        """
        author_counts = Counter()
        filtered_recommendations = []
        
        # Sort by similarity score (descending) to prioritize best matches
        sorted_recs = sorted(recommendations, key=lambda x: x['similarity_score'], reverse=True)
        
        for rec in sorted_recs:
            author = rec['author_address']
            
            if author_counts[author] < self.max_posts_per_author:
                # Apply diversity penalty for repeated authors
                if author_counts[author] > 0:
                    rec['similarity_score'] *= self.diversity_penalty
                    rec['diversity_penalty'] = self.diversity_penalty
                else:
                    rec['diversity_penalty'] = 1.0
                
                filtered_recommendations.append(rec)
                author_counts[author] += 1
        
        logger.info(f"Applied diversity enforcement: {len(filtered_recommendations)} recommendations kept")
        return filtered_recommendations
    
    def apply_safety_filters(self, recommendations: List[Dict]) -> List[Dict]:
        """
        Apply safety filters to remove potentially harmful content.
        
        Args:
            recommendations: List of recommendation dictionaries
            
        Returns:
            Filtered recommendations after safety checks
        """
        safe_recommendations = []
        
        for rec in recommendations:
            content = rec.get('content', '').lower()
            cleaned_content = rec.get('cleaned_content', '').lower()
            
            # Check for safety keywords
            is_safe = True
            for keyword in self.safety_keywords:
                if keyword in content or keyword in cleaned_content:
                    is_safe = False
                    break
            
            # Additional safety checks
            if is_safe:
                # Check for excessive capitalization (potential spam)
                if len(content) > 20:
                    caps_ratio = sum(1 for c in rec.get('content', '') if c.isupper()) / len(content)
                    if caps_ratio > 0.5:  # More than 50% caps
                        is_safe = False
                
                # Check for excessive punctuation
                punct_count = sum(1 for c in content if c in '!?.')
                if punct_count > len(content) * 0.1:  # More than 10% punctuation
                    is_safe = False
            
            if is_safe:
                rec['safety_passed'] = True
                safe_recommendations.append(rec)
            else:
                rec['safety_passed'] = False
                logger.debug(f"Filtered unsafe content: {content[:50]}...")
        
        logger.info(f"Applied safety filters: {len(safe_recommendations)} safe recommendations")
        return safe_recommendations
    
    def calculate_engagement_boost(self, recommendations: List[Dict]) -> List[Dict]:
        """
        Apply boost based on post engagement (likes, comments, shares).
        
        Args:
            recommendations: List of recommendation dictionaries
            
        Returns:
            Updated recommendations with engagement boost
        """
        conn = self.connect_db()
        cursor = conn.cursor()
        
        for rec in recommendations:
            post_id = rec['post_id']
            
            # Get engagement metrics
            cursor.execute("""
                SELECT 
                    COUNT(CASE WHEN interaction_type = 'like' THEN 1 END) as likes,
                    COUNT(CASE WHEN interaction_type = 'comment' THEN 1 END) as comments,
                    COUNT(CASE WHEN interaction_type = 'share' THEN 1 END) as shares
                FROM interactions 
                WHERE post_id = ?
            """, (post_id,))
            
            result = cursor.fetchone()
            likes, comments, shares = result if result else (0, 0, 0)
            
            # Calculate engagement score
            engagement_score = likes + (comments * 2) + (shares * 3)  # Weight comments and shares more
            
            # Apply engagement boost (logarithmic to prevent extreme values)
            if engagement_score > 0:
                engagement_boost = 1.0 + 0.1 * np.log(1 + engagement_score)
            else:
                engagement_boost = 1.0
            
            rec['similarity_score'] *= engagement_boost
            rec['engagement_boost'] = engagement_boost
            rec['engagement_metrics'] = {
                'likes': likes,
                'comments': comments,
                'shares': shares,
                'total_score': engagement_score
            }
        
        conn.close()
        logger.info("Applied engagement boost to recommendations")
        return recommendations
    
    def personalize_recommendations(self, recommendations: List[Dict], 
                                  user_address: str) -> List[Dict]:
        """
        Apply all personalization rules to recommendations.
        
        Args:
            recommendations: List of recommendation dictionaries
            user_address: User's wallet address
            
        Returns:
            Personalized recommendations
        """
        if not recommendations:
            return recommendations
        
        logger.info(f"Personalizing {len(recommendations)} recommendations for user {user_address}")
        
        # Get user preferences
        user_interests = self.get_user_interests(user_address)
        subscribed_topics = self.get_user_subscribed_topics(user_address)
        interaction_history = self.get_user_interaction_history(user_address)
        
        # Exclude posts user has already interacted with
        interacted_posts = set()
        for post_ids in interaction_history.values():
            interacted_posts.update(post_ids)
        
        # Filter out already interacted posts
        recommendations = [rec for rec in recommendations 
                         if rec['post_id'] not in interacted_posts]
        
        if not recommendations:
            logger.info("No new recommendations after filtering interacted posts")
            return recommendations
        
        # Apply personalization rules
        recommendations = self.calculate_recency_boost(recommendations)
        recommendations = self.calculate_topic_boost(recommendations, user_interests, subscribed_topics)
        recommendations = self.calculate_engagement_boost(recommendations)
        recommendations = self.apply_safety_filters(recommendations)
        recommendations = self.enforce_diversity(recommendations)
        
        # Re-sort by final similarity score
        recommendations.sort(key=lambda x: x['similarity_score'], reverse=True)
        
        # Update ranks
        for i, rec in enumerate(recommendations):
            rec['final_rank'] = i + 1
        
        logger.info(f"Personalization complete: {len(recommendations)} final recommendations")
        return recommendations
    
    def get_personalization_stats(self, recommendations: List[Dict]) -> Dict:
        """
        Get statistics about applied personalization rules.
        
        Args:
            recommendations: Personalized recommendations
            
        Returns:
            Dictionary with personalization statistics
        """
        if not recommendations:
            return {}
        
        stats = {
            'total_recommendations': len(recommendations),
            'avg_similarity_score': np.mean([rec['similarity_score'] for rec in recommendations]),
            'avg_recency_boost': np.mean([rec.get('recency_boost', 1.0) for rec in recommendations]),
            'avg_topic_boost': np.mean([rec.get('topic_boost', 1.0) for rec in recommendations]),
            'avg_engagement_boost': np.mean([rec.get('engagement_boost', 1.0) for rec in recommendations]),
            'posts_with_topic_match': sum(1 for rec in recommendations if rec.get('matching_topics')),
            'unique_authors': len(set(rec['author_address'] for rec in recommendations)),
            'safety_pass_rate': sum(1 for rec in recommendations if rec.get('safety_passed', True)) / len(recommendations)
        }
        
        return stats

def main():
    """Main function for testing personalization."""
    from similarity_search import SimilaritySearchEngine
    from embedding_generator import EmbeddingGenerator
    
    # Initialize components
    generator = EmbeddingGenerator()
    search_engine = SimilaritySearchEngine()
    personalizer = PersonalizationEngine()
    
    # Load embeddings and build index
    embedding_data = generator.get_latest_embeddings()
    if embedding_data is None:
        print("No embeddings found. Please run embedding generation first.")
        return
    
    search_engine.build_index(embedding_data)
    
    # Test with a sample user (use first post's author as test user)
    if embedding_data['post_data'].empty:
        print("No post data available for testing.")
        return
    
    test_user = embedding_data['post_data'].iloc[0]['author_address']
    query_embedding = embedding_data['embeddings'][0]
    
    # Get raw recommendations
    raw_recommendations = search_engine.get_recommendations(query_embedding, k=10)
    
    # Apply personalization
    personalized_recs = personalizer.personalize_recommendations(raw_recommendations, test_user)
    
    # Display results
    print(f"Personalization test for user: {test_user}")
    print(f"Raw recommendations: {len(raw_recommendations)}")
    print(f"Personalized recommendations: {len(personalized_recs)}")
    
    if personalized_recs:
        print("\nTop 5 personalized recommendations:")
        for i, rec in enumerate(personalized_recs[:5]):
            print(f"  {i+1}. Post {rec['post_id']} (Score: {rec['similarity_score']:.3f})")
            print(f"     Content: {rec['content'][:100]}...")
            print(f"     Boosts: Recency={rec.get('recency_boost', 1.0):.2f}, "
                  f"Topic={rec.get('topic_boost', 1.0):.2f}, "
                  f"Engagement={rec.get('engagement_boost', 1.0):.2f}")
            print()
    
    # Print statistics
    stats = personalizer.get_personalization_stats(personalized_recs)
    print("Personalization Statistics:")
    for key, value in stats.items():
        print(f"  {key}: {value}")

if __name__ == "__main__":
    main()
