# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS  # Important for frontend communication
import json
# Import your core recommendation function from your module
# Replace 'recommend' with the actual name of your Python file (without the .py)
from recommend import get_recommendations_for_user

app = Flask(__name__)
# Enable CORS to allow requests from your frontend (e.g., React on localhost:3000)
CORS(app)

# Optional: Connect to blockchain from within the AI engine if needed for complex logic
# from web3 import Web3
# ganache_url = "http://localhost:8545"
# w3 = Web3(Web3.HTTPProvider(ganache_url))
# contract_address = "YOUR_CONTRACT_ADDRESS"
# with open('../artifacts/contracts/SocialMediaPlatform.sol/SocialMediaPlatform.json') as f:
#     contract_abi = json.load(f)['abi']
# contract = w3.eth.contract(address=contract_address, abi=contract_abi)

@app.route('/api/health', methods=['GET'])
def health_check():
    """Simple endpoint to check if the AI server is running"""
    return jsonify({"status": "OK", "message": "AI Recommendation Server is live"})

@app.route('/api/recommendations/<user_address>', methods=['GET'])
def get_recommendations(user_address):
    """
    Main API endpoint for getting recommendations.
    The frontend calls this with a user's wallet address.
    """
    print(f"📡 Received recommendation request for user: {user_address}")
    
    try:
        # This calls your existing function from recommend.py
        recommendations = get_recommendations_for_user(user_address)
        
        # Format the response
        response = {
            "success": True,
            "user_address": user_address,
            "recommended_posts": recommendations
        }
        
        print(f"✅ Recommendations generated: {len(recommendations)} posts found")
        return jsonify(response)
        
    except Exception as e:
        # Log the error and return a friendly message
        print(f"❌ Error generating recommendations: {str(e)}")
        return jsonify({
            "success": False,
            "error": "Could not generate recommendations. Please try again."
        }), 500 # Internal Server Error code

if __name__ == '__main__':
    print("🤖 Starting AI Recommendation Server...")
    # Run the Flask app. debug=True is useful for development.
    app.run(debug=True, host='0.0.0.0', port=5000)
