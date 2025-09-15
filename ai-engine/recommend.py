import sqlite3
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import sys
import json
import os

def get_recommendations(user_address):
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
        return []

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
            "score": float(similarities[idx])
        })

    conn.close()
    return recommendations

if __name__ == "__main__":
    user_address = sys.argv[1]
    recommendations = get_recommendations(user_address)
    print(json.dumps(recommendations))