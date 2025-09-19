"""
SmartBlock AI Engine - Similarity Search Module
Implements FAISS indexing and similarity search for scalable recommendation system.
"""

import numpy as np
import pandas as pd
import os
import pickle
import logging
from typing import List, Dict, Tuple, Optional, Union
import faiss
from datetime import datetime
import json

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SimilaritySearchEngine:
    """
    Handles similarity search using FAISS for scalable approximate nearest neighbors.
    Supports both brute-force and indexed search methods.
    """
    
    def __init__(self, embedding_dim: int = 384, use_gpu: bool = False):
        """
        Initialize similarity search engine.
        
        Args:
            embedding_dim: Dimension of embeddings
            use_gpu: Whether to use GPU acceleration
        """
        self.embedding_dim = embedding_dim
        self.use_gpu = use_gpu and faiss.get_num_gpus() > 0
        self.index = None
        self.embeddings = None
        self.metadata = None
        self.post_data = None
        
        # Index storage
        self.index_dir = os.path.join(os.path.dirname(__file__), 'indexes')
        os.makedirs(self.index_dir, exist_ok=True)
        
        logger.info(f"Initialized SimilaritySearchEngine (GPU: {self.use_gpu})")
    
    def create_flat_index(self, embeddings: np.ndarray) -> faiss.Index:
        """
        Create a flat (brute-force) FAISS index for small datasets.
        
        Args:
            embeddings: NumPy array of embeddings
            
        Returns:
            FAISS index
        """
        logger.info("Creating flat index for brute-force search...")
        
        # Create flat index (exact search)
        index = faiss.IndexFlatIP(self.embedding_dim)  # Inner product (cosine similarity)
        
        # Normalize embeddings for cosine similarity
        faiss.normalize_L2(embeddings)
        
        # Add embeddings to index
        index.add(embeddings.astype(np.float32))
        
        if self.use_gpu:
            # Move to GPU
            res = faiss.StandardGpuResources()
            index = faiss.index_cpu_to_gpu(res, 0, index)
        
        logger.info(f"Flat index created with {index.ntotal} vectors")
        return index
    
    def create_ivf_index(self, embeddings: np.ndarray, nlist: int = 100) -> faiss.Index:
        """
        Create an IVF (Inverted File) index for larger datasets.
        
        Args:
            embeddings: NumPy array of embeddings
            nlist: Number of clusters for IVF
            
        Returns:
            FAISS index
        """
        logger.info(f"Creating IVF index with {nlist} clusters...")
        
        # Create IVF index
        quantizer = faiss.IndexFlatIP(self.embedding_dim)
        index = faiss.IndexIVFFlat(quantizer, self.embedding_dim, nlist)
        
        # Normalize embeddings
        faiss.normalize_L2(embeddings)
        
        # Train the index
        logger.info("Training IVF index...")
        index.train(embeddings.astype(np.float32))
        
        # Add embeddings
        index.add(embeddings.astype(np.float32))
        
        # Set search parameters
        index.nprobe = min(10, nlist)  # Number of clusters to search
        
        if self.use_gpu:
            # Move to GPU
            res = faiss.StandardGpuResources()
            index = faiss.index_cpu_to_gpu(res, 0, index)
        
        logger.info(f"IVF index created with {index.ntotal} vectors")
        return index
    
    def create_hnsw_index(self, embeddings: np.ndarray, M: int = 16) -> faiss.Index:
        """
        Create an HNSW (Hierarchical Navigable Small World) index.
        
        Args:
            embeddings: NumPy array of embeddings
            M: Number of connections per layer
            
        Returns:
            FAISS index
        """
        logger.info(f"Creating HNSW index with M={M}...")
        
        # Create HNSW index
        index = faiss.IndexHNSWFlat(self.embedding_dim, M)
        index.hnsw.efConstruction = 200  # Construction parameter
        index.hnsw.efSearch = 50  # Search parameter
        
        # Normalize embeddings
        faiss.normalize_L2(embeddings)
        
        # Add embeddings
        index.add(embeddings.astype(np.float32))
        
        logger.info(f"HNSW index created with {index.ntotal} vectors")
        return index
    
    def build_index(self, embedding_data: Dict, index_type: str = 'auto') -> faiss.Index:
        """
        Build appropriate FAISS index based on dataset size.
        
        Args:
            embedding_data: Dictionary with embeddings and metadata
            index_type: Type of index ('flat', 'ivf', 'hnsw', 'auto')
            
        Returns:
            FAISS index
        """
        embeddings = embedding_data['embeddings']
        n_vectors = embeddings.shape[0]
        
        logger.info(f"Building index for {n_vectors} vectors...")
        
        # Store data
        self.embeddings = embeddings
        self.metadata = embedding_data['metadata']
        self.post_data = embedding_data['post_data']
        
        # Choose index type automatically if not specified
        if index_type == 'auto':
            if n_vectors < 1000:
                index_type = 'flat'
            elif n_vectors < 10000:
                index_type = 'ivf'
            else:
                index_type = 'hnsw'
        
        logger.info(f"Using {index_type} index for {n_vectors} vectors")
        
        # Create appropriate index
        if index_type == 'flat':
            self.index = self.create_flat_index(embeddings.copy())
        elif index_type == 'ivf':
            nlist = min(int(np.sqrt(n_vectors)), 1000)
            self.index = self.create_ivf_index(embeddings.copy(), nlist)
        elif index_type == 'hnsw':
            self.index = self.create_hnsw_index(embeddings.copy())
        else:
            raise ValueError(f"Unknown index type: {index_type}")
        
        return self.index
    
    def search(self, query_embedding: np.ndarray, k: int = 10) -> Tuple[np.ndarray, np.ndarray]:
        """
        Search for similar vectors.
        
        Args:
            query_embedding: Query embedding vector
            k: Number of similar vectors to return
            
        Returns:
            Tuple of (similarities, indices)
        """
        if self.index is None:
            raise ValueError("Index not built. Call build_index() first.")
        
        # Ensure query is 2D and normalized
        if query_embedding.ndim == 1:
            query_embedding = query_embedding.reshape(1, -1)
        
        query_embedding = query_embedding.astype(np.float32)
        faiss.normalize_L2(query_embedding)
        
        # Search
        similarities, indices = self.index.search(query_embedding, k)
        
        return similarities[0], indices[0]
    
    def get_recommendations(self, query_embedding: np.ndarray, 
                          k: int = 10, 
                          exclude_post_ids: List[int] = None) -> List[Dict]:
        """
        Get post recommendations based on query embedding.
        
        Args:
            query_embedding: Query embedding vector
            k: Number of recommendations
            exclude_post_ids: Post IDs to exclude from results
            
        Returns:
            List of recommendation dictionaries
        """
        if exclude_post_ids is None:
            exclude_post_ids = []
        
        # Search for more candidates to account for exclusions
        search_k = min(k * 3, len(self.metadata['post_ids']))
        similarities, indices = self.search(query_embedding, search_k)
        
        recommendations = []
        post_ids = self.metadata['post_ids']
        
        for i, (similarity, idx) in enumerate(zip(similarities, indices)):
            if idx >= len(post_ids):
                continue
                
            post_id = post_ids[idx]
            
            # Skip excluded posts
            if post_id in exclude_post_ids:
                continue
            
            # Get post data
            post_row = self.post_data[self.post_data['post_id'] == post_id].iloc[0]
            
            recommendation = {
                'post_id': int(post_id),
                'similarity_score': float(similarity),
                'author_address': post_row['author_address'],
                'author_username': post_row.get('author_username', ''),
                'content': post_row['post_text'],
                'cleaned_content': post_row['cleaned_text'],
                'topics': post_row['topics'],
                'timestamp': int(post_row['timestamp']),
                'days_old': int(post_row['days_old']),
                'rank': len(recommendations) + 1
            }
            
            recommendations.append(recommendation)
            
            if len(recommendations) >= k:
                break
        
        return recommendations
    
    def save_index(self, filename: str = None) -> str:
        """
        Save FAISS index and metadata to disk.
        
        Args:
            filename: Optional filename
            
        Returns:
            Path to saved index
        """
        if self.index is None:
            raise ValueError("No index to save")
        
        if filename is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"faiss_index_{timestamp}"
        
        # Save FAISS index
        index_path = os.path.join(self.index_dir, f"{filename}.faiss")
        
        # Move to CPU if on GPU for saving
        if self.use_gpu:
            cpu_index = faiss.index_gpu_to_cpu(self.index)
            faiss.write_index(cpu_index, index_path)
        else:
            faiss.write_index(self.index, index_path)
        
        # Save metadata
        metadata_path = os.path.join(self.index_dir, f"{filename}_metadata.pkl")
        with open(metadata_path, 'wb') as f:
            pickle.dump({
                'metadata': self.metadata,
                'embeddings_shape': self.embeddings.shape,
                'index_type': type(self.index).__name__,
                'created_at': datetime.now().isoformat()
            }, f)
        
        # Save post data
        post_data_path = os.path.join(self.index_dir, f"{filename}_posts.pkl")
        self.post_data.to_pickle(post_data_path)
        
        logger.info(f"Index saved to: {index_path}")
        return index_path
    
    def load_index(self, filename: str) -> bool:
        """
        Load FAISS index and metadata from disk.
        
        Args:
            filename: Base filename (without extension)
            
        Returns:
            True if loaded successfully
        """
        index_path = os.path.join(self.index_dir, f"{filename}.faiss")
        metadata_path = os.path.join(self.index_dir, f"{filename}_metadata.pkl")
        post_data_path = os.path.join(self.index_dir, f"{filename}_posts.pkl")
        
        if not os.path.exists(index_path):
            logger.error(f"Index file not found: {index_path}")
            return False
        
        try:
            # Load FAISS index
            self.index = faiss.read_index(index_path)
            
            # Move to GPU if available
            if self.use_gpu:
                res = faiss.StandardGpuResources()
                self.index = faiss.index_cpu_to_gpu(res, 0, self.index)
            
            # Load metadata
            if os.path.exists(metadata_path):
                with open(metadata_path, 'rb') as f:
                    saved_data = pickle.load(f)
                    self.metadata = saved_data['metadata']
            
            # Load post data
            if os.path.exists(post_data_path):
                self.post_data = pd.read_pickle(post_data_path)
            
            logger.info(f"Index loaded successfully: {self.index.ntotal} vectors")
            return True
            
        except Exception as e:
            logger.error(f"Error loading index: {e}")
            return False
    
    def get_index_stats(self) -> Dict:
        """
        Get statistics about the current index.
        
        Returns:
            Dictionary with index statistics
        """
        if self.index is None:
            return {}
        
        stats = {
            'total_vectors': self.index.ntotal,
            'embedding_dimension': self.embedding_dim,
            'index_type': type(self.index).__name__,
            'is_trained': getattr(self.index, 'is_trained', True),
            'using_gpu': self.use_gpu
        }
        
        # Add type-specific stats
        if hasattr(self.index, 'nprobe'):
            stats['nprobe'] = self.index.nprobe
        if hasattr(self.index, 'nlist'):
            stats['nlist'] = self.index.nlist
        if hasattr(self.index, 'hnsw'):
            stats['hnsw_M'] = self.index.hnsw.M
            stats['hnsw_efSearch'] = self.index.hnsw.efSearch
        
        return stats

def main():
    """Main function for testing similarity search."""
    from embedding_generator import EmbeddingGenerator
    from data_preparation import DataPreparator
    
    # Load or generate embeddings
    generator = EmbeddingGenerator()
    embedding_data = generator.get_latest_embeddings()
    
    if embedding_data is None:
        print("No embeddings found. Generating new embeddings...")
        preparator = DataPreparator()
        df = preparator.prepare_posts_data()
        
        if df.empty:
            print("No posts found. Please ensure posts exist in the database.")
            return
        
        embedding_data = generator.generate_post_embeddings(df)
        generator.save_embeddings(embedding_data)
    
    # Create similarity search engine
    search_engine = SimilaritySearchEngine()
    
    # Build index
    index = search_engine.build_index(embedding_data, index_type='auto')
    
    # Save index
    index_path = search_engine.save_index()
    print(f"Index built and saved: {index_path}")
    
    # Test search
    if len(embedding_data['embeddings']) > 0:
        # Use first embedding as query
        query_embedding = embedding_data['embeddings'][0]
        recommendations = search_engine.get_recommendations(query_embedding, k=5)
        
        print(f"\nTest recommendations:")
        for rec in recommendations:
            print(f"  Post {rec['post_id']}: {rec['similarity_score']:.3f} - {rec['content'][:100]}...")
    
    # Print index stats
    stats = search_engine.get_index_stats()
    print(f"\nIndex Statistics:")
    for key, value in stats.items():
        print(f"  {key}: {value}")

if __name__ == "__main__":
    main()
