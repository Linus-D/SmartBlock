"""
SmartBlock AI Engine - Evaluation Metrics Module
Implements comprehensive evaluation metrics for recommendation system performance.
"""

import numpy as np
import pandas as pd
import sqlite3
import os
import json
import time
import logging
from typing import List, Dict, Tuple, Optional
from datetime import datetime, timedelta
from collections import defaultdict
import matplotlib.pyplot as plt
import seaborn as sns

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class RecommendationEvaluator:
    """
    Comprehensive evaluation system for SmartBlock AI Engine.
    Measures precision, recall, latency, relevance, and user engagement metrics.
    """
    
    def __init__(self, db_path: str = None):
        """
        Initialize evaluator with database connection.
        
        Args:
            db_path: Path to SQLite database
        """
        if db_path is None:
            db_path = os.path.join(os.path.dirname(__file__), 'database.sqlite')
        self.db_path = db_path
        
        # Evaluation parameters
        self.k_values = [1, 3, 5, 10]  # Top-k values for evaluation
        self.relevance_threshold = 0.5  # Minimum similarity for relevance
        
    def connect_db(self) -> sqlite3.Connection:
        """Create database connection."""
        return sqlite3.connect(self.db_path)
    
    def generate_synthetic_dataset(self, num_users: int = 100, num_posts: int = 1000) -> Dict:
        """
        Generate synthetic dataset for evaluation.
        
        Args:
            num_users: Number of synthetic users
            num_posts: Number of synthetic posts
            
        Returns:
            Dictionary with synthetic data
        """
        logger.info(f"Generating synthetic dataset: {num_users} users, {num_posts} posts")
        
        # Topic categories for realistic content
        topics = ['technology', 'sports', 'entertainment', 'news', 'lifestyle', 'science', 'politics', 'art']
        
        # Generate synthetic posts
        synthetic_posts = []
        for i in range(num_posts):
            topic = np.random.choice(topics)
            post = {
                'post_id': i + 1,
                'author_address': f'0x{np.random.randint(1000, 9999):04x}',
                'content': f'This is a synthetic post about {topic} with content {i}',
                'topics': [topic],
                'timestamp': int((datetime.now() - timedelta(days=np.random.randint(0, 365))).timestamp()),
                'engagement_score': np.random.exponential(2.0)  # Realistic engagement distribution
            }
            synthetic_posts.append(post)
        
        # Generate synthetic users with preferences
        synthetic_users = []
        for i in range(num_users):
            # Users have 1-3 preferred topics
            num_interests = np.random.randint(1, 4)
            interests = np.random.choice(topics, num_interests, replace=False)
            
            user = {
                'user_address': f'0x{i:04x}',
                'interests': interests.tolist(),
                'activity_level': np.random.choice(['low', 'medium', 'high'], p=[0.3, 0.5, 0.2])
            }
            synthetic_users.append(user)
        
        # Generate synthetic interactions based on user preferences
        synthetic_interactions = []
        for user in synthetic_users:
            user_address = user['user_address']
            user_interests = set(user['interests'])
            activity_multiplier = {'low': 0.1, 'medium': 0.3, 'high': 0.6}[user['activity_level']]
            
            # Number of interactions based on activity level
            num_interactions = int(num_posts * activity_multiplier * np.random.uniform(0.5, 1.5))
            
            for _ in range(num_interactions):
                # Bias towards posts matching user interests
                if np.random.random() < 0.7:  # 70% chance to interact with relevant content
                    relevant_posts = [p for p in synthetic_posts if set(p['topics']).intersection(user_interests)]
                    if relevant_posts:
                        post = np.random.choice(relevant_posts)
                    else:
                        post = np.random.choice(synthetic_posts)
                else:
                    post = np.random.choice(synthetic_posts)
                
                interaction = {
                    'user_address': user_address,
                    'post_id': post['post_id'],
                    'interaction_type': np.random.choice(['like', 'comment', 'share'], p=[0.7, 0.2, 0.1]),
                    'timestamp': post['timestamp'] + np.random.randint(0, 86400),  # Within 24h of post
                    'relevance_score': 1.0 if set(post['topics']).intersection(user_interests) else 0.3
                }
                synthetic_interactions.append(interaction)
        
        return {
            'posts': synthetic_posts,
            'users': synthetic_users,
            'interactions': synthetic_interactions
        }
    
    def calculate_precision_at_k(self, recommendations: List[Dict], 
                                ground_truth: List[int], k: int) -> float:
        """
        Calculate Precision@K metric.
        
        Args:
            recommendations: List of recommendation dictionaries
            ground_truth: List of relevant post IDs
            k: Number of top recommendations to consider
            
        Returns:
            Precision@K score
        """
        if not recommendations or k == 0:
            return 0.0
        
        top_k_recs = recommendations[:k]
        recommended_ids = [rec['post_id'] for rec in top_k_recs]
        relevant_in_top_k = len(set(recommended_ids).intersection(set(ground_truth)))
        
        return relevant_in_top_k / min(k, len(recommendations))
    
    def calculate_recall_at_k(self, recommendations: List[Dict], 
                             ground_truth: List[int], k: int) -> float:
        """
        Calculate Recall@K metric.
        
        Args:
            recommendations: List of recommendation dictionaries
            ground_truth: List of relevant post IDs
            k: Number of top recommendations to consider
            
        Returns:
            Recall@K score
        """
        if not ground_truth:
            return 0.0
        
        top_k_recs = recommendations[:k]
        recommended_ids = [rec['post_id'] for rec in top_k_recs]
        relevant_in_top_k = len(set(recommended_ids).intersection(set(ground_truth)))
        
        return relevant_in_top_k / len(ground_truth)
    
    def calculate_ndcg_at_k(self, recommendations: List[Dict], 
                           ground_truth: Dict[int, float], k: int) -> float:
        """
        Calculate Normalized Discounted Cumulative Gain@K.
        
        Args:
            recommendations: List of recommendation dictionaries
            ground_truth: Dictionary mapping post_id to relevance score
            k: Number of top recommendations to consider
            
        Returns:
            NDCG@K score
        """
        if not recommendations or k == 0:
            return 0.0
        
        # Calculate DCG
        dcg = 0.0
        for i, rec in enumerate(recommendations[:k]):
            post_id = rec['post_id']
            relevance = ground_truth.get(post_id, 0.0)
            if i == 0:
                dcg += relevance
            else:
                dcg += relevance / np.log2(i + 1)
        
        # Calculate IDCG (Ideal DCG)
        ideal_relevances = sorted(ground_truth.values(), reverse=True)[:k]
        idcg = 0.0
        for i, relevance in enumerate(ideal_relevances):
            if i == 0:
                idcg += relevance
            else:
                idcg += relevance / np.log2(i + 1)
        
        return dcg / idcg if idcg > 0 else 0.0
    
    def measure_query_latency(self, recommendation_function, user_address: str, 
                             num_trials: int = 10) -> Dict[str, float]:
        """
        Measure recommendation query latency.
        
        Args:
            recommendation_function: Function to test
            user_address: Test user address
            num_trials: Number of trials for averaging
            
        Returns:
            Dictionary with latency statistics
        """
        latencies = []
        
        for _ in range(num_trials):
            start_time = time.time()
            try:
                recommendations = recommendation_function(user_address)
                end_time = time.time()
                latencies.append((end_time - start_time) * 1000)  # Convert to milliseconds
            except Exception as e:
                logger.warning(f"Query failed: {e}")
                continue
        
        if not latencies:
            return {'mean': 0, 'std': 0, 'min': 0, 'max': 0, 'p95': 0}
        
        return {
            'mean': np.mean(latencies),
            'std': np.std(latencies),
            'min': np.min(latencies),
            'max': np.max(latencies),
            'p95': np.percentile(latencies, 95)
        }
    
    def evaluate_recommendation_system(self, recommendation_function, 
                                     test_users: List[str], 
                                     synthetic_data: Dict = None) -> Dict:
        """
        Comprehensive evaluation of recommendation system.
        
        Args:
            recommendation_function: Function to evaluate
            test_users: List of user addresses to test
            synthetic_data: Optional synthetic dataset
            
        Returns:
            Dictionary with evaluation results
        """
        logger.info(f"Evaluating recommendation system with {len(test_users)} users")
        
        results = {
            'precision_at_k': {k: [] for k in self.k_values},
            'recall_at_k': {k: [] for k in self.k_values},
            'ndcg_at_k': {k: [] for k in self.k_values},
            'latency_stats': [],
            'coverage': 0.0,
            'diversity': 0.0,
            'novelty': 0.0
        }
        
        all_recommended_posts = set()
        all_available_posts = set()
        
        # Get ground truth from database or synthetic data
        conn = self.connect_db()
        cursor = conn.cursor()
        
        for user_address in test_users:
            try:
                # Get user's ground truth (posts they actually interacted with)
                cursor.execute("""
                    SELECT post_id, 
                           CASE 
                               WHEN interaction_type = 'like' THEN 1.0
                               WHEN interaction_type = 'comment' THEN 0.8
                               WHEN interaction_type = 'share' THEN 0.9
                               ELSE 0.5
                           END as relevance
                    FROM interactions 
                    WHERE user_address = ?
                """, (user_address,))
                
                ground_truth_tuples = cursor.fetchall()
                ground_truth_ids = [row[0] for row in ground_truth_tuples]
                ground_truth_scores = {row[0]: row[1] for row in ground_truth_tuples}
                
                if not ground_truth_ids:
                    continue
                
                # Get recommendations
                start_time = time.time()
                recommendations = recommendation_function(user_address)
                query_time = (time.time() - start_time) * 1000
                
                if not recommendations:
                    continue
                
                # Collect recommended posts for coverage analysis
                recommended_post_ids = [rec['post_id'] for rec in recommendations]
                all_recommended_posts.update(recommended_post_ids)
                
                # Calculate metrics for different k values
                for k in self.k_values:
                    precision_k = self.calculate_precision_at_k(recommendations, ground_truth_ids, k)
                    recall_k = self.calculate_recall_at_k(recommendations, ground_truth_ids, k)
                    ndcg_k = self.calculate_ndcg_at_k(recommendations, ground_truth_scores, k)
                    
                    results['precision_at_k'][k].append(precision_k)
                    results['recall_at_k'][k].append(recall_k)
                    results['ndcg_at_k'][k].append(ndcg_k)
                
                results['latency_stats'].append(query_time)
                
            except Exception as e:
                logger.warning(f"Evaluation failed for user {user_address}: {e}")
                continue
        
        # Get total available posts for coverage calculation
        cursor.execute("SELECT COUNT(DISTINCT id) FROM posts")
        total_posts = cursor.fetchone()[0]
        all_available_posts = set(range(1, total_posts + 1))
        
        conn.close()
        
        # Calculate aggregate metrics
        final_results = {}
        
        # Average precision, recall, NDCG
        for k in self.k_values:
            final_results[f'precision_at_{k}'] = np.mean(results['precision_at_k'][k]) if results['precision_at_k'][k] else 0.0
            final_results[f'recall_at_{k}'] = np.mean(results['recall_at_k'][k]) if results['recall_at_k'][k] else 0.0
            final_results[f'ndcg_at_{k}'] = np.mean(results['ndcg_at_k'][k]) if results['ndcg_at_k'][k] else 0.0
        
        # Latency statistics
        if results['latency_stats']:
            final_results['avg_latency_ms'] = np.mean(results['latency_stats'])
            final_results['p95_latency_ms'] = np.percentile(results['latency_stats'], 95)
        else:
            final_results['avg_latency_ms'] = 0.0
            final_results['p95_latency_ms'] = 0.0
        
        # Coverage (percentage of catalog recommended)
        final_results['coverage'] = len(all_recommended_posts) / len(all_available_posts) if all_available_posts else 0.0
        
        # Additional metrics
        final_results['total_users_evaluated'] = len([u for u in test_users if any(results['precision_at_k'][k] for k in self.k_values)])
        final_results['evaluation_timestamp'] = datetime.now().isoformat()
        
        logger.info("Evaluation completed")
        return final_results
    
    def generate_evaluation_report(self, results: Dict, output_file: str = None) -> str:
        """
        Generate comprehensive evaluation report.
        
        Args:
            results: Evaluation results dictionary
            output_file: Optional output file path
            
        Returns:
            Report content as string
        """
        report_lines = [
            "SmartBlock AI Engine - Evaluation Report",
            "=" * 50,
            f"Generated: {results.get('evaluation_timestamp', 'Unknown')}",
            f"Users Evaluated: {results.get('total_users_evaluated', 0)}",
            "",
            "PRECISION METRICS",
            "-" * 20
        ]
        
        # Precision metrics
        for k in self.k_values:
            precision = results.get(f'precision_at_{k}', 0.0)
            report_lines.append(f"Precision@{k}: {precision:.3f}")
        
        report_lines.extend([
            "",
            "RECALL METRICS", 
            "-" * 20
        ])
        
        # Recall metrics
        for k in self.k_values:
            recall = results.get(f'recall_at_{k}', 0.0)
            report_lines.append(f"Recall@{k}: {recall:.3f}")
        
        report_lines.extend([
            "",
            "NDCG METRICS",
            "-" * 20
        ])
        
        # NDCG metrics
        for k in self.k_values:
            ndcg = results.get(f'ndcg_at_{k}', 0.0)
            report_lines.append(f"NDCG@{k}: {ndcg:.3f}")
        
        report_lines.extend([
            "",
            "PERFORMANCE METRICS",
            "-" * 20,
            f"Average Latency: {results.get('avg_latency_ms', 0.0):.1f}ms",
            f"95th Percentile Latency: {results.get('p95_latency_ms', 0.0):.1f}ms",
            f"Coverage: {results.get('coverage', 0.0):.1%}",
            "",
            "QUALITY ASSESSMENT",
            "-" * 20
        ])
        
        # Quality assessment
        avg_precision_5 = results.get('precision_at_5', 0.0)
        avg_latency = results.get('avg_latency_ms', 0.0)
        
        if avg_precision_5 >= 0.8:
            quality = "Excellent"
        elif avg_precision_5 >= 0.6:
            quality = "Good"
        elif avg_precision_5 >= 0.4:
            quality = "Fair"
        else:
            quality = "Poor"
        
        if avg_latency <= 100:
            performance = "Excellent"
        elif avg_latency <= 500:
            performance = "Good"
        elif avg_latency <= 1000:
            performance = "Fair"
        else:
            performance = "Poor"
        
        report_lines.extend([
            f"Recommendation Quality: {quality} (Precision@5: {avg_precision_5:.3f})",
            f"System Performance: {performance} (Latency: {avg_latency:.1f}ms)",
            "",
            "RECOMMENDATIONS",
            "-" * 20
        ])
        
        # Recommendations for improvement
        if avg_precision_5 < 0.6:
            report_lines.append("• Consider improving content similarity algorithms")
            report_lines.append("• Enhance user profiling and personalization")
        
        if avg_latency > 200:
            report_lines.append("• Optimize embedding generation and indexing")
            report_lines.append("• Consider caching frequently requested recommendations")
        
        if results.get('coverage', 0.0) < 0.1:
            report_lines.append("• Improve recommendation diversity")
            report_lines.append("• Consider popularity-based fallbacks")
        
        report_content = "\n".join(report_lines)
        
        # Save to file if specified
        if output_file:
            with open(output_file, 'w') as f:
                f.write(report_content)
            logger.info(f"Evaluation report saved to: {output_file}")
        
        return report_content
    
    def create_evaluation_plots(self, results: Dict, output_dir: str = None):
        """
        Create visualization plots for evaluation results.
        
        Args:
            results: Evaluation results dictionary
            output_dir: Output directory for plots
        """
        if output_dir is None:
            output_dir = os.path.join(os.path.dirname(__file__), 'evaluation_plots')
        
        os.makedirs(output_dir, exist_ok=True)
        
        # Set style
        plt.style.use('seaborn-v0_8')
        
        # 1. Precision@K plot
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 5))
        
        k_values = self.k_values
        precision_values = [results.get(f'precision_at_{k}', 0.0) for k in k_values]
        recall_values = [results.get(f'recall_at_{k}', 0.0) for k in k_values]
        
        ax1.plot(k_values, precision_values, marker='o', linewidth=2, markersize=8)
        ax1.set_xlabel('K (Top-K Recommendations)')
        ax1.set_ylabel('Precision@K')
        ax1.set_title('Precision@K Performance')
        ax1.grid(True, alpha=0.3)
        ax1.set_ylim(0, 1)
        
        ax2.plot(k_values, recall_values, marker='s', linewidth=2, markersize=8, color='orange')
        ax2.set_xlabel('K (Top-K Recommendations)')
        ax2.set_ylabel('Recall@K')
        ax2.set_title('Recall@K Performance')
        ax2.grid(True, alpha=0.3)
        ax2.set_ylim(0, 1)
        
        plt.tight_layout()
        plt.savefig(os.path.join(output_dir, 'precision_recall_curves.png'), dpi=300, bbox_inches='tight')
        plt.close()
        
        # 2. Performance summary
        fig, ax = plt.subplots(1, 1, figsize=(8, 6))
        
        metrics = ['Precision@5', 'Recall@5', 'NDCG@5', 'Coverage']
        values = [
            results.get('precision_at_5', 0.0),
            results.get('recall_at_5', 0.0),
            results.get('ndcg_at_5', 0.0),
            results.get('coverage', 0.0)
        ]
        
        bars = ax.bar(metrics, values, color=['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728'])
        ax.set_ylabel('Score')
        ax.set_title('AI Engine Performance Summary')
        ax.set_ylim(0, 1)
        
        # Add value labels on bars
        for bar, value in zip(bars, values):
            height = bar.get_height()
            ax.text(bar.get_x() + bar.get_width()/2., height + 0.01,
                   f'{value:.3f}', ha='center', va='bottom')
        
        plt.xticks(rotation=45)
        plt.tight_layout()
        plt.savefig(os.path.join(output_dir, 'performance_summary.png'), dpi=300, bbox_inches='tight')
        plt.close()
        
        logger.info(f"Evaluation plots saved to: {output_dir}")

def main():
    """Main function for running evaluation."""
    evaluator = RecommendationEvaluator()
    
    # Generate synthetic dataset for testing
    synthetic_data = evaluator.generate_synthetic_dataset(100, 1000)
    print(f"Generated synthetic dataset: {len(synthetic_data['users'])} users, {len(synthetic_data['posts'])} posts")
    
    # Test with actual recommendation function
    try:
        from recommend import get_recommendations_for_user
        
        # Get test users from database
        conn = evaluator.connect_db()
        cursor = conn.cursor()
        cursor.execute("SELECT DISTINCT user_address FROM interactions LIMIT 10")
        test_users = [row[0] for row in cursor.fetchall()]
        conn.close()
        
        if test_users:
            print(f"Evaluating with {len(test_users)} real users...")
            results = evaluator.evaluate_recommendation_system(
                get_recommendations_for_user, test_users
            )
            
            # Generate report
            report = evaluator.generate_evaluation_report(results)
            print("\n" + report)
            
            # Create plots
            evaluator.create_evaluation_plots(results)
            
        else:
            print("No users found in database for evaluation")
            
    except ImportError:
        print("Recommendation system not available for testing")

if __name__ == "__main__":
    main()
