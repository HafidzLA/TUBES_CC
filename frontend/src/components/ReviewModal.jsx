import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import StarRating from './StarRating';
import { X, Heart, Search, Film } from 'lucide-react';
import './ReviewModal.css';

const ReviewModal = ({ movie, isOpen, onClose, onReviewSuccess }) => {
  const { token, API_URL } = useAuth();
  
  // Movie selection state (if no movie is passed)
  const [selectedMovie, setSelectedMovie] = useState(movie);
  const [movieSearch, setMovieSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  
  // Review form states
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [containsSpoilers, setContainsSpoilers] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Reset states when opening/closing or movie changes
  useEffect(() => {
    if (isOpen) {
      setSelectedMovie(movie);
      setMovieSearch('');
      setSearchResults([]);
      setError('');
      
      if (movie) {
        // If movie is pre-selected, let's check if the user already reviewed it to pre-populate!
        fetchExistingReview(movie.id);
      } else {
        setRating(0);
        setContent('');
        setIsLiked(false);
        setContainsSpoilers(false);
      }
    }
  }, [isOpen, movie]);

  const fetchExistingReview = async (movieId) => {
    try {
      const response = await fetch(`${API_URL}/api/movies/${movieId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.userState && data.userState.logged) {
          setRating(data.userState.userRating);
          setIsLiked(data.userState.liked);
          
          // Let's fetch the review details to populate the content
          const reviewsResponse = await fetch(`${API_URL}/api/movies/${movieId}/reviews`);
          if (reviewsResponse.ok) {
            const reviews = await reviewsResponse.json();
            // Find current user's review
            // For now, if we don't have user ID immediately available, we can rely on username or just grab the content we saved.
            // Let's check userState to fetch.
          }
        } else {
          setRating(0);
          setContent('');
          setIsLiked(false);
          setContainsSpoilers(false);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Search inside modal
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (!selectedMovie && movieSearch.trim().length > 1) {
        try {
          const response = await fetch(`${API_URL}/api/movies/search?q=${encodeURIComponent(movieSearch)}`);
          if (response.ok) {
            const data = await response.json();
            setSearchResults(data);
          }
        } catch (err) {
          console.error(err);
        }
      } else {
        setSearchResults([]);
      }
    }, 250);

    return () => clearTimeout(delayDebounce);
  }, [movieSearch, selectedMovie]);

  const handleSelectMovie = (m) => {
    setSelectedMovie(m);
    fetchExistingReview(m.id);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMovie) {
      setError('Please select a movie to log.');
      return;
    }
    if (rating === 0) {
      setError('Please provide a star rating (0.5 to 5.0).');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          movie_id: selectedMovie.id,
          rating,
          content,
          is_liked: isLiked,
          contains_spoilers: containsSpoilers
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit review');
      }

      if (onReviewSuccess) {
        onReviewSuccess(selectedMovie.id);
      }
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container glass-card animate-fade-in">
        <button className="modal-close-btn" onClick={onClose}>
          <X size={20} />
        </button>

        <h2 className="modal-title">
          {selectedMovie ? `Log ${selectedMovie.title}` : 'Log a Movie'}
        </h2>

        {error && <div className="modal-error">{error}</div>}

        {/* 1. MOVIE SELECTOR (if no movie is passed) */}
        {!selectedMovie ? (
          <div className="modal-search-section">
            <div className="search-input-wrapper">
              <Search className="search-icon" size={16} />
              <input
                type="text"
                placeholder="Search film to log..."
                value={movieSearch}
                onChange={(e) => setMovieSearch(e.target.value)}
                className="form-control"
              />
            </div>
            {searchResults.length > 0 && (
              <div className="modal-search-results">
                {searchResults.map((m) => (
                  <div
                    key={m.id}
                    className="modal-search-item"
                    onClick={() => handleSelectMovie(m)}
                  >
                    <img src={m.poster_url} alt={m.title} className="modal-result-poster" />
                    <div className="modal-result-info">
                      <span className="modal-result-title">{m.title}</span>
                      <span className="modal-result-year">{m.release_year}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* 2. THE LOG/REVIEW FORM */
          <form onSubmit={handleSubmit} className="modal-form">
            <div className="modal-movie-summary">
              <img 
                src={selectedMovie.poster_url} 
                alt={selectedMovie.title} 
                className="modal-movie-poster" 
              />
              <div className="modal-movie-info">
                <h3>{selectedMovie.title}</h3>
                <p className="modal-movie-meta">{selectedMovie.release_year} • Dir. {selectedMovie.director}</p>
                
                {/* Remove movie button in search-mode */}
                {!movie && (
                  <button 
                    type="button" 
                    className="btn-change-movie"
                    onClick={() => setSelectedMovie(null)}
                  >
                    Change Movie
                  </button>
                )}
              </div>
            </div>

            {/* Ratings and Likes Row */}
            <div className="modal-row">
              <div className="form-group">
                <label>Rating</label>
                <StarRating 
                  rating={rating} 
                  onChange={setRating} 
                  interactive={true} 
                  size={28} 
                />
              </div>

              <div className="like-toggle-container">
                <button
                  type="button"
                  className={`like-toggle-btn ${isLiked ? 'liked' : ''}`}
                  onClick={() => setIsLiked(!isLiked)}
                >
                  <Heart size={20} className={isLiked ? 'heart-filled' : ''} />
                  <span>{isLiked ? 'Liked' : 'Like'}</span>
                </button>
              </div>
            </div>

            {/* Review Content */}
            <div className="form-group">
              <label>Review</label>
              <textarea
                className="form-control text-area-review"
                placeholder="Write your review here... (optional)"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
              />
            </div>

            {/* Spoiler Checkbox */}
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={containsSpoilers}
                  onChange={(e) => setContainsSpoilers(e.target.checked)}
                />
                <span className="checkbox-custom" />
                <span>This review contains spoilers</span>
              </label>
            </div>

            {/* Actions */}
            <div className="modal-actions">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-green"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Log'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ReviewModal;
