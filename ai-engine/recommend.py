import sqlite3
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import sys
import json
import os
from datetime import datetime, timedelta

# Import new AI engine modules
from data_preparation import DataPreparator
from embedding_generator import EmbeddingGenerator
from similarity_search import SimilaritySearchEngine
from personalization import PersonalizationEngine

def get_recommendations_for_user(user_address, k=10):
    """
    Enhanced recommendation system using the new AI engine architecture.
    
    Args:
        user_address: User's wallet address
        k: Number of recommendations to return
        
    Returns:
        List of personalized recommendations
    """
    try:
        # Initialize components
        generator = EmbeddingGenerator()
        search_engine = SimilaritySearchEngine()
        personalizer = PersonalizationEngine()
        
        # Load or generate embeddings
        embedding_data = generator.get_latest_embeddings()
        
        if embedding_data is None:
            # Generate new embeddings if none exist
            preparator = DataPreparator()
            df = preparator.prepare_posts_data()
            
            if df.empty:
                return []
            
            embedding_data = generator.generate_post_embeddings(df)
            generator.save_embeddings(embedding_data)
        
        # Build search index
        search_engine.build_index(embedding_data, index_type='auto')
        
        # Get user's interaction history to create user profile
        conn = sqlite3.connect(os.path.join(os.path.dirname(__file__), 'database.sqlite'))
        cursor = conn.cursor()
        
        # Get user's liked posts for profile creation
        cursor.execute("""
            SELECT p.content FROM interactions i
            JOIN posts p ON i.post_id = p.id
            WHERE i.user_address = ? AND i.interaction_type = 'like'
            ORDER BY i.timestamp DESC LIMIT 10
        """, (user_address,))
        
        liked_posts = cursor.fetchall()
        conn.close()
        
        if not liked_posts:
            # No interaction history, return popular recent posts
            return get_popular_posts(k)
        
        # Create user profile from liked posts
        liked_texts = [post[0] for post in liked_posts]
        user_profile_text = ' '.join(liked_texts)
        
        # Generate embedding for user profile
        user_embedding = generator.generate_embeddings([user_profile_text])[0]
        
        # Get raw recommendations
        raw_recommendations = search_engine.get_recommendations(
            user_embedding, k=k*2  # Get more to account for filtering
        )
        
        # Apply personalization
        personalized_recs = personalizer.personalize_recommendations(
            raw_recommendations, user_address
        )
        
        # Return top k recommendations
        return personalized_recs[:k]
        
    except Exception as e:
        print(f"Error in enhanced recommendation system: {e}")
        # Fallback to original system
        return get_recommendations_legacy(user_address)

def get_popular_posts(k=10):
    """
    Get popular recent posts for users with no interaction history.
    
    Args:
        k: Number of posts to return
        
    Returns:
        List of popular post recommendations
    """
    db_path = os.path.join(os.path.dirname(__file__), 'database.sqlite')
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Get recent posts with high engagement
    cursor.execute("""
        SELECT 
            p.id as post_id,
            p.author_address,
            p.content,
            p.timestamp,
            COUNT(i.id) as engagement_count
        FROM posts p
        LEFT JOIN interactions i ON p.id = i.post_id
        WHERE p.timestamp > ? 
        GROUP BY p.id
        ORDER BY engagement_count DESC, p.timestamp DESC
        LIMIT ?
    """, (int((datetime.now() - timedelta(days=7)).timestamp()), k))
    
    results = cursor.fetchall()
    conn.close()
    
    recommendations = []
    for i, (post_id, author, content, timestamp, engagement) in enumerate(results):
        recommendations.append({
            'post_id': int(post_id),
            'similarity_score': 1.0 - (i * 0.1),  # Decreasing score
            'author_address': author,
            'content': content,
            'timestamp': timestamp,
            'engagement_count': engagement,
            'rank': i + 1,
            'recommendation_type': 'popular'
        })
    
    return recommendations

def get_recommendations_legacy(user_address):
    """
    Legacy recommendation system using TF-IDF (fallback method).
    """
    # Connect to the database
    db_path = os.path.join(os.path.dirname(__file__), 'database.sqlite')
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Fetch user's liked posts
    cursor.execute("""
        SELECT p.content 
        FROM interactions i
        JOIN posts p ON i.post_id = p.id
        WHERE i.user_address = ? AND i.interaction_type = 'like'
    """, (user_address,))
    liked_posts = cursor.fetchall()
    liked_texts = [post[0] for post in liked_posts]

    if not liked_texts:
        return get_popular_posts(5)

    # Fetch all posts (excluding ones user already liked)
    cursor.execute("""
        SELECT p.id, p.content 
        FROM posts p
        WHERE p.id NOT IN (
            SELECT i.post_id 
            FROM interactions i 
            WHERE i.user_address = ? AND i.interaction_type = 'like'
        )
    """, (user_address,))
    all_posts = cursor.fetchall()
    post_ids = [post[0] for post in all_posts]
    post_texts = [post[1] for post in all_posts]

    if not post_texts:
        return []

    # Combine user's liked posts and all other posts
    all_texts = liked_texts + post_texts
    
    # Create TF-IDF vectors
    vectorizer = TfidfVectorizer(stop_words='english', max_features=1000)
    tfidf_matrix = vectorizer.fit_transform(all_texts)
    
    # Calculate user profile as average of liked posts' vectors
    user_profile = tfidf_matrix[:len(liked_texts)].mean(axis=0)
    
    # Calculate similarity between user profile and all posts
    similarities = cosine_similarity(user_profile, tfidf_matrix[len(liked_texts):])[0]

    # Get top 5 recommendations
    recommended_indices = np.argsort(similarities)[::-1][:5]
    recommendations = []
    for idx in recommended_indices:
        recommendations.append({
            "post_id": int(post_ids[idx]),
            "similarity_score": float(similarities[idx]),
            "recommendation_type": "legacy"
        })

    conn.close()
    return recommendations

# Maintain backward compatibility
def get_recommendations(user_address):
    """
    Main recommendation function - uses enhanced system by default.
    """
    return get_recommendations_for_user(user_address)

if __name__ == "__main__":
    if len(sys.argv) > 1:
        user_address = sys.argv[1]
        k = int(sys.argv[2]) if len(sys.argv) > 2 else 10
        
        print(f"Generating recommendations for user: {user_address}")
        recommendations = get_recommendations_for_user(user_address, k)
        
        print(f"Generated {len(recommendations)} recommendations")
        print(json.dumps(recommendations, indent=2))
    else:
        print("Usage: python recommend.py <user_address> [num_recommendations]")
        print("Example: python recommend.py 0x123abc 5")