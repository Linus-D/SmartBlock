#!/bin/bash
# Activate the virtual environment
source venv/bin/activate

# Start the indexer in the background
node index.js &

# Start the API server
node api.js

