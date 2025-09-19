"""
SmartBlock AI Engine - Embedding Generation Module
Implements Sentence-BERT for generating dense vector embeddings of posts.
"""

import numpy as np
import pandas as pd
import os
import pickle
import logging
from typing import List, Dict, Tuple, Optional
from sentence_transformers import SentenceTransformer
import torch
from datetime import datetime
import json

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class EmbeddingGenerator:
    """
    Handles embedding generation using Sentence-BERT model.
    Generates 384-dimensional dense vectors for post content.
    """
    
    def __init__(self, model_name: str = 'all-MiniLM-L6-v2'):
        """
        Initialize with Sentence-BERT model.
        
        Args:
            model_name: Name of the sentence transformer model
        """
        self.model_name = model_name
        self.embedding_dim = 384  # Dimension for all-MiniLM-L6-v2
        self.model = None
        self.embeddings_cache = {}
        
        # Paths for storing embeddings
        self.embeddings_dir = os.path.join(os.path.dirname(__file__), 'embeddings')
        os.makedirs(self.embeddings_dir, exist_ok=True)
        
    def load_model(self):
        """Load the Sentence-BERT model."""
        if self.model is None:
            logger.info(f"Loading Sentence-BERT model: {self.model_name}")
            self.model = SentenceTransformer(self.model_name)
            logger.info("Model loaded successfully")
    
    def generate_embeddings(self, texts: List[str], batch_size: int = 32) -> np.ndarray:
        """
        Generate embeddings for a list of texts.
        
        Args:
            texts: List of text strings
            batch_size: Batch size for processing
            
        Returns:
            NumPy array of embeddings (n_texts, embedding_dim)
        """
        if not texts:
            return np.array([]).reshape(0, self.embedding_dim)
        
        self.load_model()
        
        logger.info(f"Generating embeddings for {len(texts)} texts...")
        
        # Generate embeddings in batches
        embeddings = self.model.encode(
            texts,
            batch_size=batch_size,
            show_progress_bar=True,
            convert_to_numpy=True
        )
        
        logger.info(f"Generated embeddings shape: {embeddings.shape}")
        return embeddings
    
    def generate_post_embeddings(self, df: pd.DataFrame) -> Dict[str, np.ndarray]:
        """
        Generate embeddings for posts DataFrame.
        
        Args:
            df: DataFrame with post data
            
        Returns:
            Dictionary with embeddings and metadata
        """
        if df.empty:
            logger.warning("Empty DataFrame provided")
            return {}
        
        # Extract texts for embedding
        texts = df['cleaned_text'].tolist()
        post_ids = df['post_id'].tolist()
        
        # Generate embeddings
        embeddings = self.generate_embeddings(texts)
        
        # Create metadata
        metadata = {
            'post_ids': post_ids,
            'author_addresses': df['author_address'].tolist(),
            'timestamps': df['timestamp'].tolist(),
            'topics': df['topics'].tolist(),
            'embedding_dim': self.embedding_dim,
            'model_name': self.model_name,
            'generated_at': datetime.now().isoformat(),
            'total_posts': len(df)
        }
        
        return {
            'embeddings': embeddings,
            'metadata': metadata,
            'post_data': df
        }
    
    def save_embeddings(self, embedding_data: Dict, filename: str = None) -> str:
        """
        Save embeddings to .npy format with metadata.
        
        Args:
            embedding_data: Dictionary with embeddings and metadata
            filename: Optional filename (auto-generated if None)
            
        Returns:
            Path to saved file
        """
        if filename is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"post_embeddings_{timestamp}"
        
        # Save embeddings as .npy
        embeddings_path = os.path.join(self.embeddings_dir, f"{filename}.npy")
        np.save(embeddings_path, embedding_data['embeddings'])
        
        # Save metadata as JSON
        metadata_path = os.path.join(self.embeddings_dir, f"{filename}_metadata.json")
        with open(metadata_path, 'w') as f:
            # Convert numpy arrays to lists for JSON serialization
            metadata = embedding_data['metadata'].copy()
            json.dump(metadata, f, indent=2, default=str)
        
        # Save post data as pickle for complete preservation
        post_data_path = os.path.join(self.embeddings_dir, f"{filename}_posts.pkl")
        embedding_data['post_data'].to_pickle(post_data_path)
        
        logger.info(f"Embeddings saved to: {embeddings_path}")
        logger.info(f"Metadata saved to: {metadata_path}")
        logger.info(f"Post data saved to: {post_data_path}")
        
        return embeddings_path
    
    def load_embeddings(self, filename: str) -> Dict:
        """
        Load embeddings from saved files.
        
        Args:
            filename: Base filename (without extension)
            
        Returns:
            Dictionary with embeddings and metadata
        """
        embeddings_path = os.path.join(self.embeddings_dir, f"{filename}.npy")
        metadata_path = os.path.join(self.embeddings_dir, f"{filename}_metadata.json")
        post_data_path = os.path.join(self.embeddings_dir, f"{filename}_posts.pkl")
        
        if not os.path.exists(embeddings_path):
            raise FileNotFoundError(f"Embeddings file not found: {embeddings_path}")
        
        # Load embeddings
        embeddings = np.load(embeddings_path)
        
        # Load metadata
        metadata = {}
        if os.path.exists(metadata_path):
            with open(metadata_path, 'r') as f:
                metadata = json.load(f)
        
        # Load post data
        post_data = None
        if os.path.exists(post_data_path):
            post_data = pd.read_pickle(post_data_path)
        
        logger.info(f"Loaded embeddings: {embeddings.shape}")
        
        return {
            'embeddings': embeddings,
            'metadata': metadata,
            'post_data': post_data
        }
    
    def get_latest_embeddings(self) -> Optional[Dict]:
        """
        Get the most recently generated embeddings.
        
        Returns:
            Latest embedding data or None if no embeddings exist
        """
        embedding_files = [f for f in os.listdir(self.embeddings_dir) if f.endswith('.npy')]
        
        if not embedding_files:
            logger.warning("No embedding files found")
            return None
        
        # Sort by modification time and get the latest
        embedding_files.sort(key=lambda x: os.path.getmtime(os.path.join(self.embeddings_dir, x)))
        latest_file = embedding_files[-1]
        filename = latest_file.replace('.npy', '')
        
        logger.info(f"Loading latest embeddings: {filename}")
        return self.load_embeddings(filename)
    
    def update_embeddings_incremental(self, new_posts_df: pd.DataFrame, 
                                    existing_embeddings: Dict = None) -> Dict:
        """
        Update embeddings incrementally with new posts.
        
        Args:
            new_posts_df: DataFrame with new posts
            existing_embeddings: Existing embedding data
            
        Returns:
            Updated embedding data
        """
        if existing_embeddings is None:
            existing_embeddings = self.get_latest_embeddings()
        
        if existing_embeddings is None:
            # No existing embeddings, generate from scratch
            return self.generate_post_embeddings(new_posts_df)
        
        # Generate embeddings for new posts
        new_embedding_data = self.generate_post_embeddings(new_posts_df)
        
        if not new_embedding_data:
            return existing_embeddings
        
        # Combine embeddings
        combined_embeddings = np.vstack([
            existing_embeddings['embeddings'],
            new_embedding_data['embeddings']
        ])
        
        # Combine post data
        combined_post_data = pd.concat([
            existing_embeddings['post_data'],
            new_embedding_data['post_data']
        ], ignore_index=True)
        
        # Update metadata
        combined_metadata = existing_embeddings['metadata'].copy()
        combined_metadata.update({
            'total_posts': len(combined_post_data),
            'last_updated': datetime.now().isoformat(),
            'incremental_update': True
        })
        
        return {
            'embeddings': combined_embeddings,
            'metadata': combined_metadata,
            'post_data': combined_post_data
        }
    
    def compute_similarity_matrix(self, embeddings: np.ndarray) -> np.ndarray:
        """
        Compute cosine similarity matrix for embeddings.
        
        Args:
            embeddings: NumPy array of embeddings
            
        Returns:
            Similarity matrix
        """
        from sklearn.metrics.pairwise import cosine_similarity
        
        logger.info(f"Computing similarity matrix for {embeddings.shape[0]} embeddings...")
        similarity_matrix = cosine_similarity(embeddings)
        logger.info(f"Similarity matrix shape: {similarity_matrix.shape}")
        
        return similarity_matrix
    
    def find_similar_posts(self, query_embedding: np.ndarray, 
                          embeddings: np.ndarray, 
                          post_ids: List[int], 
                          top_k: int = 10) -> List[Tuple[int, float]]:
        """
        Find most similar posts to a query embedding.
        
        Args:
            query_embedding: Query embedding vector
            embeddings: All post embeddings
            post_ids: Corresponding post IDs
            top_k: Number of similar posts to return
            
        Returns:
            List of (post_id, similarity_score) tuples
        """
        from sklearn.metrics.pairwise import cosine_similarity
        
        # Ensure query_embedding is 2D
        if query_embedding.ndim == 1:
            query_embedding = query_embedding.reshape(1, -1)
        
        # Compute similarities
        similarities = cosine_similarity(query_embedding, embeddings)[0]
        
        # Get top-k similar posts
        top_indices = np.argsort(similarities)[::-1][:top_k]
        
        results = []
        for idx in top_indices:
            post_id = post_ids[idx]
            similarity = float(similarities[idx])
            results.append((post_id, similarity))
        
        return results

def main():
    """Main function for testing embedding generation."""
    from data_preparation import DataPreparator
    
    # Prepare data
    preparator = DataPreparator()
    df = preparator.prepare_posts_data()
    
    if df.empty:
        print("No posts found. Please ensure posts exist in the database.")
        return
    
    # Generate embeddings
    generator = EmbeddingGenerator()
    embedding_data = generator.generate_post_embeddings(df)
    
    if embedding_data:
        # Save embeddings
        saved_path = generator.save_embeddings(embedding_data)
        print(f"Embeddings generated and saved successfully!")
        print(f"Embeddings shape: {embedding_data['embeddings'].shape}")
        print(f"Saved to: {saved_path}")
        
        # Test similarity computation
        similarities = generator.compute_similarity_matrix(embedding_data['embeddings'])
        print(f"Similarity matrix computed: {similarities.shape}")
    else:
        print("Failed to generate embeddings.")

if __name__ == "__main__":
    main()
