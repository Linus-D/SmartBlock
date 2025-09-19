#!/usr/bin/env python3
"""
SmartBlock AI Engine Setup Script
Initializes and configures the complete AI recommendation system.
"""

import os
import sys
import subprocess
import sqlite3
import json
import logging
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class AIEngineSetup:
    """Setup and initialization for SmartBlock AI Engine."""
    
    def __init__(self):
        self.ai_engine_dir = Path(__file__).parent
        self.project_root = self.ai_engine_dir.parent
        self.requirements_file = self.ai_engine_dir / 'requirements.txt'
        self.database_file = self.ai_engine_dir / 'database.sqlite'
        
    def check_python_version(self):
        """Check if Python version is compatible."""
        logger.info("Checking Python version...")
        if sys.version_info < (3, 8):
            raise RuntimeError("Python 3.8 or higher is required")
        logger.info(f"Python {sys.version_info.major}.{sys.version_info.minor} detected ✓")
    
    def setup_virtual_environment(self):
        """Create and activate virtual environment if it doesn't exist."""
        venv_path = self.ai_engine_dir / 'venv'
        
        if not venv_path.exists():
            logger.info("Creating virtual environment...")
            subprocess.run([sys.executable, '-m', 'venv', str(venv_path)], check=True)
            logger.info("Virtual environment created ✓")
        else:
            logger.info("Virtual environment already exists ✓")
        
        # Provide activation instructions
        if os.name == 'nt':  # Windows
            activate_script = venv_path / 'Scripts' / 'activate.bat'
        else:  # Unix/Linux/MacOS
            activate_script = venv_path / 'bin' / 'activate'
        
        logger.info(f"To activate virtual environment, run: source {activate_script}")
        return venv_path
    
    def install_dependencies(self):
        """Install required Python packages."""
        if not self.requirements_file.exists():
            logger.error("requirements.txt not found!")
            return False
        
        logger.info("Installing dependencies...")
        try:
            # Use pip to install requirements
            subprocess.run([
                sys.executable, '-m', 'pip', 'install', '-r', str(self.requirements_file)
            ], check=True)
            logger.info("Dependencies installed successfully ✓")
            return True
        except subprocess.CalledProcessError as e:
            logger.error(f"Failed to install dependencies: {e}")
            return False
    
    def check_database_connection(self):
        """Check database connectivity and schema."""
        logger.info("Checking database connection...")
        
        if not self.database_file.exists():
            logger.warning("Database file not found. Make sure to run the blockchain indexer first.")
            return False
        
        try:
            conn = sqlite3.connect(self.database_file)
            cursor = conn.cursor()
            
            # Check if required tables exist
            required_tables = ['users', 'posts', 'interactions', 'user_interests', 'topics', 'user_topics']
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
            existing_tables = [row[0] for row in cursor.fetchall()]
            
            missing_tables = set(required_tables) - set(existing_tables)
            if missing_tables:
                logger.warning(f"Missing database tables: {missing_tables}")
                logger.info("Run the blockchain indexer (index.js) to create required tables")
                return False
            
            # Check data availability
            cursor.execute("SELECT COUNT(*) FROM posts")
            post_count = cursor.fetchone()[0]
            
            cursor.execute("SELECT COUNT(*) FROM users")
            user_count = cursor.fetchone()[0]
            
            logger.info(f"Database ready: {post_count} posts, {user_count} users ✓")
            conn.close()
            return True
            
        except Exception as e:
            logger.error(f"Database connection failed: {e}")
            return False
    
    def test_ai_components(self):
        """Test AI engine components."""
        logger.info("Testing AI engine components...")
        
        try:
            # Test data preparation
            from data_preparation import DataPreparator
            preparator = DataPreparator(str(self.database_file))
            
            # Test with small sample
            df = preparator.prepare_posts_data()
            if df.empty:
                logger.warning("No posts available for processing")
                return False
            
            logger.info(f"Data preparation: {len(df)} posts processed ✓")
            
            # Test embedding generation (with small sample)
            from embedding_generator import EmbeddingGenerator
            generator = EmbeddingGenerator()
            
            # Test with first 5 posts to avoid long processing time
            test_df = df.head(5) if len(df) > 5 else df
            embedding_data = generator.generate_post_embeddings(test_df)
            
            if embedding_data and 'embeddings' in embedding_data:
                logger.info(f"Embedding generation: {embedding_data['embeddings'].shape} ✓")
            else:
                logger.error("Embedding generation failed")
                return False
            
            # Test similarity search
            from similarity_search import SimilaritySearchEngine
            search_engine = SimilaritySearchEngine()
            search_engine.build_index(embedding_data, 'flat')
            
            # Test search
            query_embedding = embedding_data['embeddings'][0]
            recommendations = search_engine.get_recommendations(query_embedding, k=3)
            
            if recommendations:
                logger.info(f"Similarity search: {len(recommendations)} recommendations ✓")
            else:
                logger.error("Similarity search failed")
                return False
            
            # Test personalization
            from personalization import PersonalizationEngine
            personalizer = PersonalizationEngine(str(self.database_file))
            
            # Use first user for testing
            test_user = embedding_data['post_data'].iloc[0]['author_address']
            personalized_recs = personalizer.personalize_recommendations(recommendations, test_user)
            
            logger.info(f"Personalization: {len(personalized_recs)} personalized recommendations ✓")
            
            return True
            
        except ImportError as e:
            logger.error(f"Import error: {e}")
            logger.info("Make sure all dependencies are installed")
            return False
        except Exception as e:
            logger.error(f"Component test failed: {e}")
            return False
    
    def create_config_file(self):
        """Create configuration file for AI engine."""
        config = {
            "database": {
                "path": str(self.database_file),
                "backup_enabled": True
            },
            "embedding": {
                "model_name": "all-MiniLM-L6-v2",
                "embedding_dim": 384,
                "batch_size": 32
            },
            "similarity_search": {
                "index_type": "auto",
                "use_gpu": False,
                "cache_enabled": True
            },
            "personalization": {
                "recency_decay_days": 30,
                "topic_boost_factor": 1.5,
                "diversity_penalty": 0.8,
                "max_posts_per_author": 2
            },
            "api": {
                "host": "0.0.0.0",
                "port": 5000,
                "debug": True,
                "cors_enabled": True
            },
            "logging": {
                "level": "INFO",
                "file": "ai_engine.log"
            }
        }
        
        config_file = self.ai_engine_dir / 'config.json'
        with open(config_file, 'w') as f:
            json.dump(config, f, indent=2)
        
        logger.info(f"Configuration file created: {config_file} ✓")
    
    def create_startup_scripts(self):
        """Create startup scripts for different platforms."""
        
        # Unix/Linux startup script
        unix_script = self.ai_engine_dir / 'start_ai_engine.sh'
        with open(unix_script, 'w') as f:
            f.write("""#!/bin/bash
# SmartBlock AI Engine Startup Script

echo "Starting SmartBlock AI Engine..."

# Activate virtual environment
source venv/bin/activate

# Start blockchain indexer in background
echo "Starting blockchain indexer..."
node index.js &
INDEXER_PID=$!

# Wait a moment for indexer to initialize
sleep 3

# Start AI engine API
echo "Starting AI recommendation API..."
python app.py &
API_PID=$!

echo "AI Engine started successfully!"
echo "Indexer PID: $INDEXER_PID"
echo "API PID: $API_PID"
echo "API available at: http://localhost:5000"

# Keep script running
wait
""")
        
        # Make executable
        os.chmod(unix_script, 0o755)
        
        # Windows startup script
        windows_script = self.ai_engine_dir / 'start_ai_engine.bat'
        with open(windows_script, 'w') as f:
            f.write("""@echo off
REM SmartBlock AI Engine Startup Script

echo Starting SmartBlock AI Engine...

REM Activate virtual environment
call venv\\Scripts\\activate.bat

REM Start blockchain indexer in background
echo Starting blockchain indexer...
start /B node index.js

REM Wait for indexer to initialize
timeout /t 3 /nobreak >nul

REM Start AI engine API
echo Starting AI recommendation API...
start /B python app.py

echo AI Engine started successfully!
echo API available at: http://localhost:5000

pause
""")
        
        logger.info("Startup scripts created ✓")
    
    def run_setup(self):
        """Run complete setup process."""
        logger.info("=" * 50)
        logger.info("SmartBlock AI Engine Setup")
        logger.info("=" * 50)
        
        try:
            # 1. Check Python version
            self.check_python_version()
            
            # 2. Setup virtual environment
            self.setup_virtual_environment()
            
            # 3. Install dependencies
            if not self.install_dependencies():
                logger.error("Setup failed at dependency installation")
                return False
            
            # 4. Check database
            db_ready = self.check_database_connection()
            
            # 5. Test components (only if database is ready)
            if db_ready:
                if not self.test_ai_components():
                    logger.warning("Component tests failed, but setup will continue")
            else:
                logger.warning("Skipping component tests due to database issues")
            
            # 6. Create configuration
            self.create_config_file()
            
            # 7. Create startup scripts
            self.create_startup_scripts()
            
            logger.info("=" * 50)
            logger.info("Setup completed successfully! ✓")
            logger.info("=" * 50)
            
            # Provide next steps
            logger.info("Next steps:")
            logger.info("1. Ensure blockchain indexer is running: node index.js")
            logger.info("2. Start AI engine: python app.py")
            logger.info("3. Or use startup script: ./start_ai_engine.sh")
            logger.info("4. API will be available at: http://localhost:5000")
            
            return True
            
        except Exception as e:
            logger.error(f"Setup failed: {e}")
            return False

def main():
    """Main setup function."""
    setup = AIEngineSetup()
    success = setup.run_setup()
    
    if success:
        print("\n🎉 SmartBlock AI Engine setup completed successfully!")
        print("You can now start the AI recommendation system.")
    else:
        print("\n❌ Setup failed. Please check the logs and try again.")
        sys.exit(1)

if __name__ == "__main__":
    main()
