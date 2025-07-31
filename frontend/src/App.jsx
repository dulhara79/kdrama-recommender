import React, { useState } from 'react';
import './App.css';

// Main App component
function App() {
  // State variables for input, loading status, error messages, and recommendations
  const [dramaTitle, setDramaTitle] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Function to handle getting recommendations from the backend
  const getRecommendations = async () => {
    // Clear previous recommendations and errors
    setRecommendations([]);
    setError('');
    setLoading(true); // Set loading state to true

    // Basic input validation
    if (!dramaTitle.trim()) {
      setError('Please enter a drama title.');
      setLoading(false);
      return;
    }

    try {
      // Make a POST request to the Flask backend's /recommend endpoint
      const response = await fetch('http://localhost:5000/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Send the drama title and desired number of recommendations in the request body
        body: JSON.stringify({ title: dramaTitle, n_recommendations: 5 }),
      });

      // Check if the response was successful
      if (!response.ok) {
        // Parse error message from the backend if available
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      // Parse the JSON response
      const data = await response.json();

      // Update recommendations state
      if (data.length === 0) {
        setError('No recommendations found for this title. Try another one!');
      } else {
        setRecommendations(data);
        console.log("Recommendations received:", data);
      }
    } catch (err) {
      // Catch and display any errors during the fetch operation
      setError(`An unexpected error occurred: ${err.message}. Make sure the Flask backend is running.`);
      console.error('Fetch error:', err);
    } finally {
      setLoading(false); // Set loading state to false regardless of success or failure
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute bg-purple-500 rounded-full -top-40 -right-40 w-80 h-80 mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute delay-1000 bg-pink-500 rounded-full -bottom-40 -left-40 w-80 h-80 mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute delay-500 bg-blue-500 rounded-full top-40 left-1/2 w-80 h-80 mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      </div>
      
      <div className="relative flex items-center justify-center min-h-screen p-4">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-8 md:p-12 w-full max-w-4xl text-center transform transition-all duration-500 hover:scale-[1.01] hover:shadow-purple-500/25">
          {/* Header Section */}
          <div className="mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 mb-6 shadow-lg bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <h1 className="mb-4 text-6xl font-black tracking-tight text-transparent bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text">
              KDrama
            </h1>
            <h2 className="mb-6 text-2xl font-bold text-white/90">
              Recommendation Engine
            </h2>
            <p className="max-w-2xl mx-auto text-lg leading-relaxed text-white/70">
              Discover your next obsession with AI-powered recommendations tailored to your taste. Enter any KDrama title and unlock a world of cinematic excellence.
            </p>
          </div>

          {/* Search Section */}
          <div className="mb-12">
            <div className="flex flex-col items-center justify-center max-w-2xl gap-4 mx-auto lg:flex-row">
              <div className="relative flex-grow w-full lg:w-auto">
                <input
                  type="text"
                  className="w-full p-4 pl-12 text-lg text-white transition-all duration-300 border bg-white/10 backdrop-blur-sm border-white/20 rounded-2xl placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent hover:bg-white/15"
                  placeholder="Enter a drama title... (e.g., Goblin, Crash Landing on You)"
                  value={dramaTitle}
                  onChange={(e) => setDramaTitle(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      getRecommendations();
                    }
                  }}
                />
                <svg className="absolute w-5 h-5 transform -translate-y-1/2 left-4 top-1/2 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <button
                onClick={getRecommendations}
                className="w-full px-8 py-4 font-bold text-white transition-all duration-300 ease-in-out transform shadow-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-2xl hover:-translate-y-1 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none lg:w-auto min-w-48"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-3 -ml-1 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analyzing...
                  </div>
                ) : (
                  'Get Recommendations'
                )}
              </button>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center my-8 text-lg font-medium text-white/80">
              <div className="relative">
                <div className="w-16 h-16 mb-4 border-4 rounded-full border-purple-500/30 border-t-purple-500 animate-spin"></div>
                <div className="absolute inset-0 w-16 h-16 border-4 rounded-full border-pink-500/30 border-b-pink-500 animate-spin animation-delay-150"></div>
              </div>
              <p className="text-xl">Discovering perfect matches...</p>
              <p className="mt-2 text-sm text-white/60">Analyzing thousands of dramas for you</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="relative max-w-2xl px-6 py-4 mx-auto my-8 text-red-300 border bg-red-500/10 backdrop-blur-sm border-red-500/20 rounded-2xl" role="alert">
              <div className="flex items-center">
                <svg className="flex-shrink-0 w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div>
                  <strong className="font-bold">Oops!</strong>
                  <span className="block ml-2 sm:inline">{error}</span>
                </div>
              </div>
            </div>
          )}

          {/* Recommendations Section */}
          {recommendations.length > 0 && (
            <div className="mt-12 duration-700 animate-in slide-in-from-bottom">
              <div className="mb-8 text-center">
                <h2 className="mb-2 text-4xl font-bold text-transparent bg-gradient-to-r from-white to-purple-200 bg-clip-text">
                  Perfect Matches
                </h2>
                <p className="text-white/60">Curated recommendations just for you</p>
              </div>
              
              <div className="grid max-w-4xl gap-6 mx-auto">
                {recommendations.map((drama, index) => (
                  <div
                    key={index}
                    className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-left transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-500/10"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-grow">
                        <h3 className="mb-2 text-2xl font-bold text-white transition-colors duration-300 group-hover:text-purple-200">
                          {drama.title}
                        </h3>
                        <div className="flex items-center mb-3 space-x-4 text-sm text-white/60">
                          {drama.rating && (
                            <div className="flex items-center">
                              <svg className="w-4 h-4 mr-1 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              <span>{drama.rating}</span>
                            </div>
                          )}
                          {drama.content_rating && (
                            <span className="px-2 py-1 text-xs font-medium rounded-lg bg-white/10">
                              {drama.content_rating}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center px-3 py-2 ml-4 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl">
                        <span className="mr-1 text-xs font-medium text-white/80">Match</span>
                        <span className="text-lg font-bold text-white">
                          {(drama.similarity_score * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                      <div>
                        <span className="font-medium text-white/50">Genres:</span>
                        <p className="mt-1 font-medium text-white/80">
                          {Array.isArray(drama.genres) ? drama.genres.join(', ') : drama.genres || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-white/50">Network:</span>
                        <p className="mt-1 font-medium text-white/80">{drama.original_network || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 text-center">
                <p className="text-sm text-white/50">
                  Powered by advanced machine learning algorithms
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;