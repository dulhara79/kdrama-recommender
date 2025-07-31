# KDrama Recommender System

A full-stack machine learning project for recommending Korean dramas (K-Dramas) using content-based filtering and modern web technologies.

## Project Structure

```
root/
│
├── backend/         # Flask API for recommendations
│   ├── app.py       # Main backend application
│   └── requirements.txt
│
├── frontend/        # React + Vite + Tailwind CSS frontend
│   ├── src/         # React source code
│   ├── public/      # Static assets
│   ├── package.json # Frontend dependencies
│   └── ...
│
├── data/            # Serialized models and processed data
│   ├── drama_recommender_v2.joblib
│   ├── final_preprocessed_df.pkl
│   └── clean_drama_dataset.pkl
│
├── csv/             # Raw and preprocessed CSV datasets
│   ├── clean_drama_dataset.csv
│   └── preprocessed_dataset.csv
│
├── notebook/        # Jupyter notebook for EDA and model development
│   └── Drama_Recommendation_System.ipynb
│
└── README.md        # Project documentation (this file)
```

## Features
- **Personalized K-Drama recommendations** using content-based ML models
- **Modern UI** built with React, Vite, and Tailwind CSS
- **REST API** powered by Flask
- **Interactive Jupyter notebook** for data exploration and model building

## Getting Started

### 1. Backend Setup (Flask)
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # On Windows
pip install -r requirements.txt
python app.py
```
- The backend runs on `http://localhost:5000` by default.

### 2. Frontend Setup (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
- The frontend runs on `http://localhost:5173` by default.

### 3. Data & Model Files
- Preprocessed data and trained model files are stored in the `data/` directory.
- If you want to retrain or explore, use the Jupyter notebook in `notebook/`.

## API Endpoints
- `POST /recommend` — Get recommendations. Example payload:
  ```json
  { "title": "Crash Landing on You", "n_recommendations": 5 }
  ```
- `GET /health` — Health check for backend and model status.

## Customization
- Add or update K-Drama data in `csv/` and retrain using the notebook.
- Tweak frontend UI in `frontend/src/`.

## Credits
- Built with [Flask](https://flask.palletsprojects.com/), [React](https://react.dev/), [Vite](https://vitejs.dev/), [Tailwind CSS](https://tailwindcss.com/), and [scikit-learn](https://scikit-learn.org/).

## License
MIT
