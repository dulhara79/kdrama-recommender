# app.py - Flask Backend for KDrama Recommendation

import pandas as pd
import numpy as np
import joblib
from flask import Flask, request, jsonify
from flask_cors import CORS
from fuzzywuzzy import process
import os
from scipy.sparse import issparse

app = Flask(__name__)
CORS(app,resources={
    r"/recommend": {
        "origins": ["http://localhost:5173", "http://127.0.0.1:5173"]
    },
    r"/health": {
        "origins": ["http://localhost:5173", "http://127.0.0.1:5173"]
    }
})

# --- Global Variables for Model and Data ---
preprocessed_df = None
similarity_models = None
cleaned_df = None  # To store the clean dataset with ratings

# --- Configuration ---
MODEL_PATH = "../data/drama_recommender_v2.joblib"
PREPROCESSED_DF_PATH = "../data/final_preprocessed_df.pkl"
CLEAN_DRAMA_PATH = "../data/clean_drama_dataset.pkl"

# --- Helper Function to Load Model and Data ---
def load_resources():
    """
    Loads the preprocessed DataFrame and similarity models into global variables.
    """
    global preprocessed_df, similarity_models, cleaned_df

    print("Loading resources...")
    try:
        # Load preprocessed DataFrame
        if os.path.exists(PREPROCESSED_DF_PATH):
            preprocessed_df = joblib.load(PREPROCESSED_DF_PATH)
            print(
                f"Successfully loaded preprocessed DataFrame with shape: {preprocessed_df.shape}"
            )
            print(
                f"DataFrame index range: {preprocessed_df.index.min()} to {preprocessed_df.index.max()}"
            )
            print("Available columns in preprocessed_df:", preprocessed_df.columns.tolist())
        else:
            print(f"Error: Preprocessed DataFrame not found at {PREPROCESSED_DF_PATH}")
            preprocessed_df = None

        # Load clean dataset (for ratings and additional info)
        if os.path.exists(CLEAN_DRAMA_PATH):
            cleaned_df = joblib.load(CLEAN_DRAMA_PATH)
            print(f"\nSuccessfully loaded clean dataset with shape: {cleaned_df.shape}")
            print(f"Columns in clean dataset: {cleaned_df.columns.tolist()}")
            
            # Make sure we have the expected columns
            if 'rating' not in cleaned_df.columns:
                print("Warning: 'rating' column not found in clean dataset")
        else:
            print(f"Error: Clean dataset not found at {CLEAN_DRAMA_PATH}")
            cleaned_df = None

        # Load similarity models
        if os.path.exists(MODEL_PATH):
            loaded_obj = joblib.load(MODEL_PATH)

            if isinstance(loaded_obj, dict):
                similarity_models = loaded_obj
                print("\nLoaded similarity models dictionary:")
                if "similarity_matrix" in similarity_models:
                    matrix = similarity_models["similarity_matrix"]
                    print(f"  similarity_matrix:")
                    print(f"    Type: {type(matrix)}")
                    if hasattr(matrix, "shape"):
                        print(f"    Shape: {matrix.shape}")
                    print(f"    Sparse: {issparse(matrix)}")
            else:
                similarity_models = {"similarity_matrix": loaded_obj}
                print("\nLoaded single similarity matrix:")
                print(f"  Type: {type(loaded_obj)}")
                if hasattr(loaded_obj, "shape"):
                    print(f"  Shape: {loaded_obj.shape}")
                print(f"  Sparse: {issparse(loaded_obj)}")
        else:
            print(f"Error: Model file not found at {MODEL_PATH}")
            similarity_models = None

    except Exception as e:
        print(f"An error occurred during model/data loading: {e}")
        preprocessed_df = None
        similarity_models = None


# Load resources when the app starts
with app.app_context():
    load_resources()

# --- Helper Function to Get Additional Drama Info ---
def get_additional_drama_info(title):
    """
    Gets additional information (like rating) from the clean dataset for a given title.
    Returns a dictionary with the additional info or None if not found.
    """
    if cleaned_df is None:
        return None
        
    # Use fuzzy matching to find the closest title in the clean dataset
    match = process.extractOne(title, cleaned_df['title'].tolist())
    
    if match and match[1] >= 80:  # Only use matches with good confidence
        matched_title, score = match
        matched_row = cleaned_df[cleaned_df['title'] == matched_title].iloc[0]
        
        # Create info dictionary with available data
        info = {'title': matched_title}
        
        if 'rating' in cleaned_df.columns:
            info['rating'] = matched_row['rating']
        if 'genres' in cleaned_df.columns:
            info['genres'] = matched_row['genres']
        if 'original_network' in cleaned_df.columns:
            info['original_network'] = matched_row['original_network']
            
        return info
    
    return None

# --- Main Recommendation Function ---
def get_recommendations_backend(title, n_recommendations=5):
    """
    Generates content-based recommendations for a given drama title.
    """
    try:
        if preprocessed_df is None or similarity_models is None or cleaned_df is None:
            error_msg = "Recommendation system not fully initialized. Required data not loaded."
            print(error_msg)
            return {"error": error_msg}, 500

        if "similarity_matrix" not in similarity_models:
            error_msg = "Similarity matrix not found in loaded models."
            print(error_msg)
            return {"error": error_msg}, 400

        similarity_matrix = similarity_models["similarity_matrix"]

        # Check if 'title' column exists
        if "title" not in preprocessed_df.columns:
            error_msg = "Preprocessed DataFrame missing 'title' column."
            print(error_msg)
            return {"error": error_msg}, 500

        # Use fuzzy matching to find the closest title
        match = process.extractOne(title, preprocessed_df["title"].tolist())

        if not match:
            error_msg = f"No match found for '{title}' in the dataset."
            print(error_msg)
            return {"error": error_msg}, 404

        matched_title, score = match
        if score < 80:  # Threshold for a good match
            error_msg = f"No close match found for '{title}'. Closest match: '{matched_title}' (Confidence: {score}). Try a different title."
            print(error_msg)
            return {"error": error_msg}, 404

        print(f"Found match for '{title}': '{matched_title}' (Confidence: {score})")

        # Get the positional index of the matched title
        try:
            pos_idx = preprocessed_df.index.get_indexer_for(
                preprocessed_df[preprocessed_df["title"] == matched_title].index
            )[0]
        except Exception as e:
            error_msg = f"Error finding index for matched title: {str(e)}"
            print(error_msg)
            return {"error": error_msg}, 500

        # Handle sparse matrices
        if issparse(similarity_matrix):
            similarity_matrix = similarity_matrix.toarray()

        # Check if index is within bounds
        if pos_idx >= similarity_matrix.shape[0]:
            error_msg = f"Index {pos_idx} out of bounds for similarity matrix (size: {similarity_matrix.shape[0]})"
            print(error_msg)
            return {"error": error_msg}, 500

        # Get similarity scores
        try:
            sim_scores = list(enumerate(similarity_matrix[pos_idx]))
        except Exception as e:
            error_msg = f"Error accessing similarity scores: {str(e)}"
            print(error_msg)
            return {"error": error_msg}, 500

        # Sort by similarity score
        sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)

        # Get top N recommendations (excluding the drama itself)
        sim_scores = sim_scores[1:n_recommendations + 1]
        recommended_pos_indices = [i[0] for i in sim_scores]
        drama_similarity_scores = [i[1] for i in sim_scores]

        # Get recommended dramas from preprocessed data
        recommended_dramas = preprocessed_df.iloc[recommended_pos_indices].copy()
        recommended_dramas["similarity_score"] = drama_similarity_scores

        # Enrich with data from clean dataset
        final_recommendations = []
        for _, row in recommended_dramas.iterrows():
            drama_title = row['title']
            additional_info = get_additional_drama_info(drama_title) or {}
            
            # Create the recommendation entry
            recommendation = {
                'title': drama_title,
                'content_rating': row.get('content_rating', None),
                'similarity_score': row['similarity_score']
            }
            
            # Add available additional info
            if 'rating' in additional_info:
                recommendation['rating'] = additional_info['rating']
            if 'genres' in additional_info:
                recommendation['genres'] = additional_info['genres']
            if 'original_network' in additional_info:
                recommendation['original_network'] = additional_info['original_network']
            
            final_recommendations.append(recommendation)

        return final_recommendations, 200

    except Exception as e:
        error_msg = f"Unexpected error in recommendation process: {str(e)}"
        print(error_msg)
        return {"error": error_msg}, 500


# --- Flask API Endpoint ---
@app.route("/recommend", methods=["POST"])
def recommend_drama():
    """
    API endpoint to get KDrama recommendations.
    Expects JSON payload with 'title' and optionally 'n_recommendations'.
    Example: {'title': 'Crash Landing on You', 'n_recommendations': 5}
    """
    data = request.get_json()
    if not data or "title" not in data:
        return jsonify({"error": "Missing 'title' in request body."}), 400

    title = data["title"]
    n_recommendations = data.get("n_recommendations", 5)  # Default to 5

    recommendations, status_code = get_recommendations_backend(title, n_recommendations)
    return jsonify(recommendations), status_code


# --- Health Check Endpoint ---
@app.route("/health", methods=["GET"])
def health_check():
    """
    Health check endpoint to verify server status and model loading.
    """
    status = {
        "status": "healthy",
        "model_loaded": preprocessed_df is not None and similarity_models is not None,
        "dataframe_shape": preprocessed_df.shape
        if preprocessed_df is not None
        else "Not loaded",
        "similarity_matrix_loaded": "similarity_matrix" in similarity_models
        if similarity_models
        else False,
        "similarity_matrix_shape": similarity_models["similarity_matrix"].shape
        if similarity_models and "similarity_matrix" in similarity_models
        else "Not loaded",
    }
    return jsonify(status), 200


# --- Main entry point ---
if __name__ == "__main__":
    app.run(debug=True)
