"""
SmartBlock AI Engine - Data Preparation Module
Handles preprocessing of posts for embedding generation and recommendation system.
"""

import sqlite3
import pandas as pd
import re
import json
import os
from typing import List, Dict, Tuple
import numpy as np
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DataPreparator:
    """
    Handles data preparation for the SmartBlock recommendation system.
    Implements text cleaning, deduplication, language filtering, and truncation.
    """
    
    def __init__(self, db_path: str = None):
        """Initialize with database connection."""
        if db_path is None:
            db_path = os.path.join(os.path.dirname(__file__), 'database.sqlite')
        self.db_path = db_path
        self.max_post_length = 500  # Maximum characters per post
        self.min_post_length = 10   # Minimum characters per post
        
        # Safety filters - offensive/blacklisted words
        self.blacklisted_words = {
            'spam', 'scam', 'fake', 'bot', 'advertisement', 'ad',
            # Add more as needed for your platform
        }
        
    def connect_db(self) -> sqlite3.Connection:
        """Create database connection."""
        return sqlite3.connect(self.db_path)
    
    def clean_text(self, text: str) -> str:
        """
        Clean and preprocess text content.
        
        Args:
            text: Raw text content
            
        Returns:
            Cleaned text
        """
        if not text or not isinstance(text, str):
            return ""
        
        # Convert to lowercase
        text = text.lower()
        
        # Remove excessive whitespace
        text = re.sub(r'\s+', ' ', text)
        
        # Remove URLs
        text = re.sub(r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+', '', text)
        
        # Remove special characters but keep basic punctuation
        text = re.sub(r'[^a-zA-Z0-9\s.,!?;:-]', '', text)
        
        # Remove excessive punctuation
        text = re.sub(r'[.,!?;:-]{2,}', '.', text)
        
        # Strip whitespace
        text = text.strip()
        
        return text
    
    def is_english(self, text: str) -> bool:
        """
        Simple English language detection.
        
        Args:
            text: Text to check
            
        Returns:
            True if text appears to be English
        """
        if not text:
            return False
        
        # Check for common English words
        english_indicators = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']
        words = text.lower().split()
        
        if len(words) < 3:
            return True  # Assume short posts are English
        
        english_word_count = sum(1 for word in words if word in english_indicators)
        return english_word_count / len(words) > 0.1  # At least 10% common English words
    
    def contains_blacklisted_content(self, text: str) -> bool:
        """
        Check if text contains blacklisted words.
        
        Args:
            text: Text to check
            
        Returns:
            True if text contains blacklisted content
        """
        text_lower = text.lower()
        return any(word in text_lower for word in self.blacklisted_words)
    
    def extract_topics_from_content(self, content: str) -> List[str]:
        """
        Extract potential topics from post content using simple keyword extraction.
        
        Args:
            content: Post content
            
        Returns:
            List of extracted topics
        """
        # Simple hashtag extraction
        hashtags = re.findall(r'#(\w+)', content.lower())
        
        # Common topic keywords
        topic_keywords = {
            'technology': ['tech', 'ai', 'blockchain', 'crypto', 'web3', 'defi'],
            'sports': ['football', 'basketball', 'soccer', 'tennis', 'game'],
            'entertainment': ['movie', 'music', 'show', 'celebrity', 'film'],
            'news': ['breaking', 'update', 'announcement', 'news'],
            'lifestyle': ['food', 'travel', 'fashion', 'health', 'fitness']
        }
        
        content_lower = content.lower()
        extracted_topics = []
        
        # Add hashtags
        extracted_topics.extend(hashtags)
        
        # Add topic keywords found in content
        for topic, keywords in topic_keywords.items():
            if any(keyword in content_lower for keyword in keywords):
                extracted_topics.append(topic)
        
        return list(set(extracted_topics))  # Remove duplicates
    
    def prepare_posts_data(self) -> pd.DataFrame:
        """
        Prepare posts data from database with all preprocessing steps.
        
        Returns:
            DataFrame with prepared posts data
        """
        logger.info("Starting data preparation...")
        
        conn = self.connect_db()
        
        # Fetch posts with user information
        query = """
        SELECT 
            p.id as post_id,
            p.on_chain_id,
            p.author_address,
            u.username as author_username,
            p.content as post_text,
            p.timestamp,
            p.ipfs_hash
        FROM posts p
        LEFT JOIN users u ON p.author_address = u.address
        ORDER BY p.timestamp DESC
        """
        
        df = pd.read_sql_query(query, conn)
        conn.close()
        
        logger.info(f"Loaded {len(df)} posts from database")
        
        if df.empty:
            logger.warning("No posts found in database")
            return pd.DataFrame()
        
        # Data preprocessing steps
        original_count = len(df)
        
        # 1. Text cleaning
        logger.info("Cleaning text content...")
        df['cleaned_text'] = df['post_text'].apply(self.clean_text)
        
        # 2. Remove posts that are too short or too long
        df = df[
            (df['cleaned_text'].str.len() >= self.min_post_length) &
            (df['cleaned_text'].str.len() <= self.max_post_length)
        ]
        logger.info(f"After length filtering: {len(df)} posts (removed {original_count - len(df)})")
        
        # 3. Language filtering (English only)
        logger.info("Filtering for English content...")
        df['is_english'] = df['cleaned_text'].apply(self.is_english)
        df = df[df['is_english']]
        logger.info(f"After English filtering: {len(df)} posts")
        
        # 4. Safety filtering
        logger.info("Applying safety filters...")
        df['is_safe'] = ~df['cleaned_text'].apply(self.contains_blacklisted_content)
        df = df[df['is_safe']]
        logger.info(f"After safety filtering: {len(df)} posts")
        
        # 5. Deduplication based on cleaned text
        logger.info("Removing duplicates...")
        before_dedup = len(df)
        df = df.drop_duplicates(subset=['cleaned_text'], keep='first')
        logger.info(f"After deduplication: {len(df)} posts (removed {before_dedup - len(df)} duplicates)")
        
        # 6. Extract topics
        logger.info("Extracting topics...")
        df['topics'] = df['cleaned_text'].apply(self.extract_topics_from_content)
        df['topics_json'] = df['topics'].apply(json.dumps)
        
        # 7. Add timestamp features
        df['timestamp_dt'] = pd.to_datetime(df['timestamp'], unit='s')
        df['days_old'] = (datetime.now() - df['timestamp_dt']).dt.days
        
        # Select final columns
        final_df = df[[
            'post_id', 'on_chain_id', 'author_address', 'author_username',
            'post_text', 'cleaned_text', 'topics', 'topics_json',
            'timestamp', 'timestamp_dt', 'days_old', 'ipfs_hash'
        ]].copy()
        
        logger.info(f"Data preparation complete. Final dataset: {len(final_df)} posts")
        
        return final_df
    
    def export_to_formats(self, df: pd.DataFrame, output_dir: str = None) -> Dict[str, str]:
        """
        Export prepared data to CSV and JSON formats.
        
        Args:
            df: Prepared DataFrame
            output_dir: Output directory path
            
        Returns:
            Dictionary with file paths
        """
        if output_dir is None:
            output_dir = os.path.join(os.path.dirname(__file__), 'data')
        
        os.makedirs(output_dir, exist_ok=True)
        
        # Export to CSV
        csv_path = os.path.join(output_dir, 'prepared_posts.csv')
        df.to_csv(csv_path, index=False)
        
        # Export to JSON
        json_path = os.path.join(output_dir, 'prepared_posts.json')
        df.to_json(json_path, orient='records', indent=2)
        
        # Export summary statistics
        stats_path = os.path.join(output_dir, 'data_stats.json')
        stats = {
            'total_posts': len(df),
            'unique_authors': df['author_address'].nunique(),
            'avg_post_length': df['cleaned_text'].str.len().mean(),
            'date_range': {
                'earliest': df['timestamp_dt'].min().isoformat(),
                'latest': df['timestamp_dt'].max().isoformat()
            },
            'top_topics': df['topics'].explode().value_counts().head(10).to_dict()
        }
        
        with open(stats_path, 'w') as f:
            json.dump(stats, f, indent=2, default=str)
        
        logger.info(f"Data exported to: {output_dir}")
        
        return {
            'csv': csv_path,
            'json': json_path,
            'stats': stats_path
        }

def main():
    """Main function for testing data preparation."""
    preparator = DataPreparator()
    df = preparator.prepare_posts_data()
    
    if not df.empty:
        file_paths = preparator.export_to_formats(df)
        print("Data preparation completed successfully!")
        print(f"Files saved:")
        for format_type, path in file_paths.items():
            print(f"  {format_type.upper()}: {path}")
    else:
        print("No data to prepare. Please ensure posts exist in the database.")

if __name__ == "__main__":
    main()
