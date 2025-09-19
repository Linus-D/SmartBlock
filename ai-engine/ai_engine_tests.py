"""
SmartBlock AI Engine - Comprehensive Testing Framework
Tests for data preparation, embedding generation, similarity search, and personalization.
"""

import unittest
import numpy as np
import pandas as pd
import os
import tempfile
import shutil
import sqlite3
import json
from datetime import datetime, timedelta
import logging

# Import modules to test
from data_preparation import DataPreparator
from embedding_generator import EmbeddingGenerator
from similarity_search import SimilaritySearchEngine
from personalization import PersonalizationEngine

# Configure logging for tests
logging.basicConfig(level=logging.WARNING)  # Reduce noise during testing

class TestDataPreparation(unittest.TestCase):
    """Test cases for data preparation module."""
    
    def setUp(self):
        """Set up test database and data."""
        self.test_db = tempfile.NamedTemporaryFile(delete=False, suffix='.sqlite')
        self.test_db.close()
        
        # Create test database with sample data
        self.create_test_database()
        self.preparator = DataPreparator(self.test_db.name)
    
    def tearDown(self):
        """Clean up test files."""
        if os.path.exists(self.test_db.name):
            os.unlink(self.test_db.name)
    
    def create_test_database(self):
        """Create test database with sample posts and users."""
        conn = sqlite3.connect(self.test_db.name)
        cursor = conn.cursor()
        
        # Create tables
        cursor.execute("""
            CREATE TABLE users (
                id INTEGER PRIMARY KEY,
                address TEXT UNIQUE,
                username TEXT
            )
        """)
        
        cursor.execute("""
            CREATE TABLE posts (
                id INTEGER PRIMARY KEY,
                on_chain_id INTEGER,
                author_address TEXT,
                content TEXT,
                timestamp INTEGER,
                ipfs_hash TEXT
            )
        """)
        
        cursor.execute("""
            CREATE TABLE interactions (
                id INTEGER PRIMARY KEY,
                user_address TEXT,
                post_id INTEGER,
                interaction_type TEXT,
                timestamp INTEGER
            )
        """)
        
        # Insert test data
        test_users = [
            ('0x123', 'alice'),
            ('0x456', 'bob'),
            ('0x789', 'charlie')
        ]
        
        for address, username in test_users:
            cursor.execute("INSERT INTO users (address, username) VALUES (?, ?)", 
                         (address, username))
        
        # Test posts with various content
        test_posts = [
            (1, '0x123', 'This is a great post about blockchain technology!', 1640995200, 'hash1'),
            (2, '0x456', 'SPAM SPAM SPAM BUY NOW!!!', 1640995300, 'hash2'),  # Should be filtered
            (3, '0x789', 'A normal post about daily life and experiences', 1640995400, 'hash3'),
            (4, '0x123', 'Another tech post discussing AI and machine learning', 1640995500, 'hash4'),
            (5, '0x456', 'Short', 1640995600, 'hash5'),  # Too short, should be filtered
            (6, '0x789', 'This is a duplicate post about blockchain technology!', 1640995700, 'hash6'),  # Similar to post 1
        ]
        
        for post_id, author, content, timestamp, ipfs_hash in test_posts:
            cursor.execute("""
                INSERT INTO posts (on_chain_id, author_address, content, timestamp, ipfs_hash)
                VALUES (?, ?, ?, ?, ?)
            """, (post_id, author, content, timestamp, ipfs_hash))
        
        conn.commit()
        conn.close()
    
    def test_text_cleaning(self):
        """Test text cleaning functionality."""
        test_cases = [
            ("Hello World!", "hello world!"),
            ("  Multiple   Spaces  ", "multiple spaces"),
            ("Remove URLs http://example.com here", "remove urls here"),
            ("Special @#$% Characters!", "special characters!"),
            ("", ""),
            (None, "")
        ]
        
        for input_text, expected in test_cases:
            with self.subTest(input_text=input_text):
                result = self.preparator.clean_text(input_text)
                self.assertEqual(result, expected)
    
    def test_english_detection(self):
        """Test English language detection."""
        test_cases = [
            ("This is an English sentence", True),
            ("The quick brown fox", True),
            ("Short", True),  # Short posts assumed English
            ("", False),
            ("这是中文", False),  # Chinese text
        ]
        
        for text, expected in test_cases:
            with self.subTest(text=text):
                result = self.preparator.is_english(text)
                self.assertEqual(result, expected)
    
    def test_safety_filtering(self):
        """Test safety content filtering."""
        test_cases = [
            ("This is a normal post", False),
            ("This is spam content", True),
            ("Buy now limited time offer", True),
            ("Regular discussion about technology", False),
        ]
        
        for text, expected in test_cases:
            with self.subTest(text=text):
                result = self.preparator.contains_blacklisted_content(text)
                self.assertEqual(result, expected)
    
    def test_topic_extraction(self):
        """Test topic extraction from content."""
        test_cases = [
            ("I love #blockchain and #crypto technology", ['blockchain', 'crypto', 'technology']),
            ("This post is about AI and machine learning", ['technology']),
            ("Just a regular post with no topics", []),
            ("Sports and football are great #sports", ['sports']),
        ]
        
        for content, expected_topics in test_cases:
            with self.subTest(content=content):
                result = self.preparator.extract_topics_from_content(content)
                # Check if expected topics are present (order doesn't matter)
                for topic in expected_topics:
                    self.assertIn(topic, result)
    
    def test_data_preparation_pipeline(self):
        """Test complete data preparation pipeline."""
        df = self.preparator.prepare_posts_data()
        
        # Should have filtered out spam and short posts
        self.assertGreater(len(df), 0)
        self.assertLess(len(df), 6)  # Should filter some posts
        
        # Check required columns
        required_columns = ['post_id', 'cleaned_text', 'topics', 'days_old']
        for col in required_columns:
            self.assertIn(col, df.columns)
        
        # Check text cleaning applied
        for _, row in df.iterrows():
            self.assertIsInstance(row['cleaned_text'], str)
            self.assertGreater(len(row['cleaned_text']), 0)


class TestEmbeddingGeneration(unittest.TestCase):
    """Test cases for embedding generation module."""
    
    def setUp(self):
        """Set up test data."""
        self.generator = EmbeddingGenerator()
        self.test_texts = [
            "This is a test sentence about technology",
            "Another sentence about different topics",
            "A third sentence for testing embeddings"
        ]
        
        # Create test DataFrame
        self.test_df = pd.DataFrame({
            'post_id': [1, 2, 3],
            'author_address': ['0x123', '0x456', '0x789'],
            'cleaned_text': self.test_texts,
            'topics': [['tech'], ['general'], ['test']],
            'timestamp': [1640995200, 1640995300, 1640995400]
        })
    
    def test_embedding_generation(self):
        """Test basic embedding generation."""
        embeddings = self.generator.generate_embeddings(self.test_texts)
        
        # Check shape
        self.assertEqual(embeddings.shape[0], len(self.test_texts))
        self.assertEqual(embeddings.shape[1], self.generator.embedding_dim)
        
        # Check data type
        self.assertEqual(embeddings.dtype, np.float32)
        
        # Check embeddings are different
        self.assertFalse(np.array_equal(embeddings[0], embeddings[1]))
    
    def test_empty_input(self):
        """Test handling of empty input."""
        embeddings = self.generator.generate_embeddings([])
        self.assertEqual(embeddings.shape[0], 0)
        self.assertEqual(embeddings.shape[1], self.generator.embedding_dim)
    
    def test_post_embeddings_generation(self):
        """Test embedding generation for posts DataFrame."""
        embedding_data = self.generator.generate_post_embeddings(self.test_df)
        
        # Check structure
        self.assertIn('embeddings', embedding_data)
        self.assertIn('metadata', embedding_data)
        self.assertIn('post_data', embedding_data)
        
        # Check embeddings
        embeddings = embedding_data['embeddings']
        self.assertEqual(embeddings.shape[0], len(self.test_df))
        
        # Check metadata
        metadata = embedding_data['metadata']
        self.assertEqual(len(metadata['post_ids']), len(self.test_df))
        self.assertEqual(metadata['embedding_dim'], self.generator.embedding_dim)


class TestSimilaritySearch(unittest.TestCase):
    """Test cases for similarity search module."""
    
    def setUp(self):
        """Set up test data."""
        self.search_engine = SimilaritySearchEngine(embedding_dim=384)
        
        # Create test embeddings
        np.random.seed(42)  # For reproducible tests
        self.test_embeddings = np.random.randn(10, 384).astype(np.float32)
        
        # Create test embedding data
        self.embedding_data = {
            'embeddings': self.test_embeddings,
            'metadata': {
                'post_ids': list(range(1, 11)),
                'author_addresses': [f'0x{i:03d}' for i in range(1, 11)],
                'embedding_dim': 384,
                'total_posts': 10
            },
            'post_data': pd.DataFrame({
                'post_id': list(range(1, 11)),
                'author_address': [f'0x{i:03d}' for i in range(1, 11)],
                'post_text': [f'Test post {i}' for i in range(1, 11)],
                'cleaned_text': [f'test post {i}' for i in range(1, 11)],
                'topics': [['test'] for _ in range(10)],
                'timestamp': [1640995200 + i*100 for i in range(10)],
                'days_old': [i for i in range(10)]
            })
        }
    
    def test_flat_index_creation(self):
        """Test flat index creation."""
        index = self.search_engine.create_flat_index(self.test_embeddings.copy())
        
        self.assertIsNotNone(index)
        self.assertEqual(index.ntotal, len(self.test_embeddings))
    
    def test_index_building(self):
        """Test index building with different types."""
        for index_type in ['flat', 'auto']:
            with self.subTest(index_type=index_type):
                index = self.search_engine.build_index(self.embedding_data, index_type)
                self.assertIsNotNone(index)
                self.assertEqual(index.ntotal, len(self.test_embeddings))
    
    def test_similarity_search(self):
        """Test similarity search functionality."""
        self.search_engine.build_index(self.embedding_data, 'flat')
        
        # Use first embedding as query
        query_embedding = self.test_embeddings[0]
        similarities, indices = self.search_engine.search(query_embedding, k=5)
        
        # Check results
        self.assertEqual(len(similarities), 5)
        self.assertEqual(len(indices), 5)
        
        # First result should be the query itself (highest similarity)
        self.assertEqual(indices[0], 0)
        self.assertAlmostEqual(similarities[0], 1.0, places=5)
    
    def test_get_recommendations(self):
        """Test recommendation generation."""
        self.search_engine.build_index(self.embedding_data, 'flat')
        
        query_embedding = self.test_embeddings[0]
        recommendations = self.search_engine.get_recommendations(query_embedding, k=3)
        
        # Check structure
        self.assertEqual(len(recommendations), 3)
        
        for rec in recommendations:
            self.assertIn('post_id', rec)
            self.assertIn('similarity_score', rec)
            self.assertIn('author_address', rec)
            self.assertIn('content', rec)


class TestPersonalization(unittest.TestCase):
    """Test cases for personalization module."""
    
    def setUp(self):
        """Set up test database and personalization engine."""
        self.test_db = tempfile.NamedTemporaryFile(delete=False, suffix='.sqlite')
        self.test_db.close()
        
        self.create_test_database()
        self.personalizer = PersonalizationEngine(self.test_db.name)
        
        # Create test recommendations
        self.test_recommendations = [
            {
                'post_id': 1,
                'similarity_score': 0.8,
                'author_address': '0x123',
                'content': 'Tech post about blockchain',
                'cleaned_content': 'tech post about blockchain',
                'topics': ['technology', 'blockchain'],
                'timestamp': int((datetime.now() - timedelta(days=1)).timestamp()),
                'days_old': 1
            },
            {
                'post_id': 2,
                'similarity_score': 0.7,
                'author_address': '0x456',
                'content': 'Old post about sports',
                'cleaned_content': 'old post about sports',
                'topics': ['sports'],
                'timestamp': int((datetime.now() - timedelta(days=30)).timestamp()),
                'days_old': 30
            },
            {
                'post_id': 3,
                'similarity_score': 0.6,
                'author_address': '0x123',  # Same author as post 1
                'content': 'Another tech post',
                'cleaned_content': 'another tech post',
                'topics': ['technology'],
                'timestamp': int((datetime.now() - timedelta(days=5)).timestamp()),
                'days_old': 5
            }
        ]
    
    def tearDown(self):
        """Clean up test files."""
        if os.path.exists(self.test_db.name):
            os.unlink(self.test_db.name)
    
    def create_test_database(self):
        """Create test database for personalization."""
        conn = sqlite3.connect(self.test_db.name)
        cursor = conn.cursor()
        
        # Create tables
        cursor.execute("""
            CREATE TABLE user_interests (
                user_address TEXT,
                interest TEXT
            )
        """)
        
        cursor.execute("""
            CREATE TABLE topics (
                id INTEGER PRIMARY KEY,
                name TEXT
            )
        """)
        
        cursor.execute("""
            CREATE TABLE user_topics (
                user_address TEXT,
                topic_id INTEGER
            )
        """)
        
        cursor.execute("""
            CREATE TABLE interactions (
                user_address TEXT,
                post_id INTEGER,
                interaction_type TEXT,
                timestamp INTEGER
            )
        """)
        
        # Insert test data
        cursor.execute("INSERT INTO user_interests VALUES ('0x999', 'technology')")
        cursor.execute("INSERT INTO topics VALUES (1, 'technology')")
        cursor.execute("INSERT INTO user_topics VALUES ('0x999', 1)")
        
        conn.commit()
        conn.close()
    
    def test_recency_boost(self):
        """Test recency boost calculation."""
        recommendations = self.personalizer.calculate_recency_boost(
            self.test_recommendations.copy()
        )
        
        # Recent post should have higher boost
        recent_post = next(rec for rec in recommendations if rec['days_old'] == 1)
        old_post = next(rec for rec in recommendations if rec['days_old'] == 30)
        
        self.assertGreater(recent_post['recency_boost'], old_post['recency_boost'])
    
    def test_topic_boost(self):
        """Test topic boost calculation."""
        user_interests = ['technology']
        subscribed_topics = ['blockchain']
        
        recommendations = self.personalizer.calculate_topic_boost(
            self.test_recommendations.copy(),
            user_interests,
            subscribed_topics
        )
        
        # Posts with matching topics should have boost > 1.0
        for rec in recommendations:
            if any(topic in ['technology', 'blockchain'] for topic in rec['topics']):
                self.assertGreater(rec['topic_boost'], 1.0)
    
    def test_diversity_enforcement(self):
        """Test diversity enforcement."""
        recommendations = self.personalizer.enforce_diversity(
            self.test_recommendations.copy()
        )
        
        # Should limit posts from same author
        author_counts = {}
        for rec in recommendations:
            author = rec['author_address']
            author_counts[author] = author_counts.get(author, 0) + 1
        
        # No author should have more than max_posts_per_author
        for count in author_counts.values():
            self.assertLessEqual(count, self.personalizer.max_posts_per_author)
    
    def test_safety_filters(self):
        """Test safety filtering."""
        unsafe_rec = {
            'post_id': 99,
            'content': 'SPAM BUY NOW LIMITED TIME OFFER!!!',
            'cleaned_content': 'spam buy now limited time offer',
            'similarity_score': 0.9
        }
        
        test_recs = self.test_recommendations + [unsafe_rec]
        filtered_recs = self.personalizer.apply_safety_filters(test_recs)
        
        # Unsafe post should be filtered out
        filtered_ids = [rec['post_id'] for rec in filtered_recs]
        self.assertNotIn(99, filtered_ids)
    
    def test_full_personalization_pipeline(self):
        """Test complete personalization pipeline."""
        user_address = '0x999'
        personalized_recs = self.personalizer.personalize_recommendations(
            self.test_recommendations.copy(),
            user_address
        )
        
        # Should return some recommendations
        self.assertGreater(len(personalized_recs), 0)
        
        # Should have final ranks
        for rec in personalized_recs:
            self.assertIn('final_rank', rec)
        
        # Should be sorted by similarity score (descending)
        scores = [rec['similarity_score'] for rec in personalized_recs]
        self.assertEqual(scores, sorted(scores, reverse=True))


class TestIntegration(unittest.TestCase):
    """Integration tests for the complete AI engine pipeline."""
    
    def setUp(self):
        """Set up integration test environment."""
        self.test_dir = tempfile.mkdtemp()
        self.test_db = os.path.join(self.test_dir, 'test.sqlite')
        
        # Create test database with realistic data
        self.create_integration_database()
    
    def tearDown(self):
        """Clean up test environment."""
        shutil.rmtree(self.test_dir)
    
    def create_integration_database(self):
        """Create comprehensive test database."""
        conn = sqlite3.connect(self.test_db)
        cursor = conn.cursor()
        
        # Create all necessary tables
        schema_sql = """
        CREATE TABLE users (
            id INTEGER PRIMARY KEY,
            address TEXT UNIQUE,
            username TEXT
        );
        
        CREATE TABLE posts (
            id INTEGER PRIMARY KEY,
            on_chain_id INTEGER,
            author_address TEXT,
            content TEXT,
            timestamp INTEGER,
            ipfs_hash TEXT
        );
        
        CREATE TABLE interactions (
            id INTEGER PRIMARY KEY,
            user_address TEXT,
            post_id INTEGER,
            interaction_type TEXT,
            timestamp INTEGER
        );
        
        CREATE TABLE user_interests (
            user_address TEXT,
            interest TEXT
        );
        
        CREATE TABLE topics (
            id INTEGER PRIMARY KEY,
            name TEXT
        );
        
        CREATE TABLE user_topics (
            user_address TEXT,
            topic_id INTEGER
        );
        """
        
        cursor.executescript(schema_sql)
        
        # Insert realistic test data
        users = [
            ('0x111', 'alice'),
            ('0x222', 'bob'),
            ('0x333', 'charlie')
        ]
        
        posts = [
            (1, '0x111', 'Exciting developments in blockchain technology and DeFi protocols', 1640995200, 'hash1'),
            (2, '0x222', 'Machine learning algorithms are revolutionizing data analysis', 1640995300, 'hash2'),
            (3, '0x333', 'The future of web3 and decentralized applications looks promising', 1640995400, 'hash3'),
            (4, '0x111', 'Artificial intelligence will transform how we interact with technology', 1640995500, 'hash4'),
            (5, '0x222', 'Cryptocurrency adoption is growing rapidly across different sectors', 1640995600, 'hash5'),
        ]
        
        for address, username in users:
            cursor.execute("INSERT INTO users (address, username) VALUES (?, ?)", (address, username))
        
        for post_id, author, content, timestamp, ipfs_hash in posts:
            cursor.execute("""
                INSERT INTO posts (on_chain_id, author_address, content, timestamp, ipfs_hash)
                VALUES (?, ?, ?, ?, ?)
            """, (post_id, author, content, timestamp, ipfs_hash))
        
        # Add user interests and interactions
        cursor.execute("INSERT INTO user_interests VALUES ('0x111', 'technology')")
        cursor.execute("INSERT INTO topics VALUES (1, 'technology')")
        cursor.execute("INSERT INTO user_topics VALUES ('0x111', 1)")
        cursor.execute("INSERT INTO interactions VALUES ('0x111', 2, 'like', 1640995350)")
        
        conn.commit()
        conn.close()
    
    def test_end_to_end_pipeline(self):
        """Test complete end-to-end AI engine pipeline."""
        # 1. Data Preparation
        preparator = DataPreparator(self.test_db)
        df = preparator.prepare_posts_data()
        self.assertGreater(len(df), 0)
        
        # 2. Embedding Generation
        generator = EmbeddingGenerator()
        embedding_data = generator.generate_post_embeddings(df)
        self.assertIn('embeddings', embedding_data)
        
        # 3. Similarity Search
        search_engine = SimilaritySearchEngine()
        search_engine.build_index(embedding_data, 'flat')
        
        query_embedding = embedding_data['embeddings'][0]
        raw_recommendations = search_engine.get_recommendations(query_embedding, k=3)
        self.assertGreater(len(raw_recommendations), 0)
        
        # 4. Personalization
        personalizer = PersonalizationEngine(self.test_db)
        personalized_recs = personalizer.personalize_recommendations(
            raw_recommendations, '0x111'
        )
        
        # Verify final results
        self.assertGreater(len(personalized_recs), 0)
        
        # Check that all required fields are present
        required_fields = ['post_id', 'similarity_score', 'final_rank']
        for rec in personalized_recs:
            for field in required_fields:
                self.assertIn(field, rec)


def run_performance_tests():
    """Run performance benchmarks for the AI engine."""
    print("\n" + "="*50)
    print("PERFORMANCE BENCHMARKS")
    print("="*50)
    
    # Test embedding generation performance
    generator = EmbeddingGenerator()
    test_texts = [f"Test sentence number {i} for performance testing" for i in range(100)]
    
    import time
    start_time = time.time()
    embeddings = generator.generate_embeddings(test_texts)
    embedding_time = time.time() - start_time
    
    print(f"Embedding Generation:")
    print(f"  - 100 texts in {embedding_time:.2f} seconds")
    print(f"  - {len(test_texts)/embedding_time:.1f} texts/second")
    
    # Test similarity search performance
    search_engine = SimilaritySearchEngine()
    
    # Create larger test dataset
    np.random.seed(42)
    large_embeddings = np.random.randn(1000, 384).astype(np.float32)
    
    embedding_data = {
        'embeddings': large_embeddings,
        'metadata': {
            'post_ids': list(range(1000)),
            'author_addresses': [f'0x{i:03d}' for i in range(1000)],
        },
        'post_data': pd.DataFrame({
            'post_id': list(range(1000)),
            'author_address': [f'0x{i:03d}' for i in range(1000)],
            'post_text': [f'Test post {i}' for i in range(1000)],
            'cleaned_text': [f'test post {i}' for i in range(1000)],
            'topics': [['test'] for _ in range(1000)],
            'timestamp': [1640995200 + i for i in range(1000)],
            'days_old': [i % 100 for i in range(1000)]
        })
    }
    
    start_time = time.time()
    search_engine.build_index(embedding_data, 'flat')
    index_time = time.time() - start_time
    
    print(f"\nIndex Building:")
    print(f"  - 1000 vectors in {index_time:.2f} seconds")
    
    # Test search performance
    query_embedding = large_embeddings[0]
    start_time = time.time()
    for _ in range(100):  # 100 queries
        similarities, indices = search_engine.search(query_embedding, k=10)
    search_time = time.time() - start_time
    
    print(f"\nSimilarity Search:")
    print(f"  - 100 queries in {search_time:.2f} seconds")
    print(f"  - {100/search_time:.1f} queries/second")
    print(f"  - Average latency: {search_time*10:.1f}ms per query")


if __name__ == '__main__':
    # Run unit tests
    print("Running SmartBlock AI Engine Tests...")
    unittest.main(verbosity=2, exit=False)
    
    # Run performance tests
    run_performance_tests()
    
    print("\n" + "="*50)
    print("ALL TESTS COMPLETED")
    print("="*50)
