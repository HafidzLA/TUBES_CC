import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import StarRating from '../components/StarRating';
import ReviewCard from '../components/ReviewCard';
import { Heart, Plus, Check, Star, MessageSquare, Award, Clock } from 'lucide-react';
import './MovieDetails.css';

const MovieDetails = ({ onOpenLogModal }) => {
  const { id } = useParams();
  const { user, token, API_URL } = useAuth();
  
  const [movie, setMovie] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [userState, setUserState] = useState({ liked: false, watchlisted: false, logged: false, userRating: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({ reviewCount: 0, likesCount: 0, ratingDistribution: {} });

  const fetchMovieData = async () => {
    try {
      // Set authorization headers if user is logged in
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Fetch movie detail & user interaction state
      const movieResponse = await fetch(`${API_URL}/api/movies/${id}`, { headers });
      if (!movieResponse.ok) {
        throw new Error('Movie not found');
      }
      const movieData = await movieResponse.json();
      setMovie(movieData.movie);
      setUserState(movieData.userState);

      // Fetch reviews
      const reviewsResponse = await fetch(`${API_URL}/api/movies/${id}/reviews`);
      if (reviewsResponse.ok) {
        const reviewsData = await reviewsResponse.json();
        setReviews(reviewsData);
        
        // Calculate dynamic stats based on reviews
        const totalReviews = reviewsData.length;
        const totalLikes = reviewsData.filter(r => r.is_liked).length;
        
        // Compile rating distribution
        const dist = { "0.5": 0, "1.0": 0, "1.5": 0, "2.0": 0, "2.5": 0, "3.0": 0, "3.5": 0, "4.0": 0, "4.5": 0, "5.0": 0 };
        reviewsData.forEach(r => {
          const rStr = parseFloat(r.rating).toFixed(1);
          if (dist[rStr] !== undefined) dist[rStr]++;
        });

        setStats({
          reviewCount: totalReviews,
          likesCount: totalLikes,
          ratingDistribution: dist
        });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovieData();
  }, [id, token]);

  const handleToggleLike = async () => {
    if (!user) return;
    try {
      const response = await fetch(`${API_URL}/api/movies/${id}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUserState(prev => ({ ...prev, liked: data.liked }));
        setStats(prev => ({
          ...prev,
          likesCount: data.liked ? prev.likesCount + 1 : Math.max(0, prev.likesCount - 1)
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleWatchlist = async () => {
    if (!user) return;
    try {
      const response = await fetch(`${API_URL}/api/movies/${id}/watchlist`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUserState(prev => ({ ...prev, watchlisted: data.watchlisted }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="container home-loading">
        <div className="spinner"></div>
        <p>Polishing the lenses...</p>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="container movie-error-page">
        <h2>We searched the reels but came up empty.</h2>
        <p>{error || 'Movie not found.'}</p>
        <Link to="/" className="btn btn-primary">Go Home</Link>
      </div>
    );
  }

  // Find max count in distribution to scale graph bars
  const maxDistributionCount = Math.max(...Object.values(stats.ratingDistribution), 1);

  return (
    <div className="movie-details-page">
      {/* 1. CINEMATIC BACKDROP BANNER */}
      <div className="movie-backdrop-wrapper">
        <div className="movie-backdrop" style={{ backgroundImage: `url(${movie.backdrop_url})` }}></div>
        <div className="backdrop-gradient-bottom"></div>
        <div className="backdrop-gradient-radial"></div>
      </div>

      <div className="movie-details-content container">
        <div className="movie-layout-grid">
          
          {/* Left Column: Poster */}
          <div className="movie-left-col">
            <div className="details-poster-card">
              <img 
                src={movie.poster_url} 
                alt={movie.title} 
                className="details-poster" 
                onError={(e) => { e.target.src = 'https://via.placeholder.com/220x330/1c252d/ffffff?text=' + encodeURIComponent(movie.title) }}
              />
            </div>
          </div>

          {/* Center Column: Synopsis and details */}
          <div className="movie-center-col">
            <div className="movie-title-header">
              <h1>{movie.title}</h1>
              <div className="title-meta">
                <span className="movie-year">{movie.release_year}</span>
                <span className="movie-director-label">Directed by <span className="director-name">{movie.director}</span></span>
              </div>
            </div>

            {/* Genres Tag list */}
            <div className="genres-list">
              {movie.genres.split(',').map((g, i) => (
                <span key={i} className="genre-tag">{g.trim()}</span>
              ))}
            </div>

            <p className="movie-synopsis">{movie.synopsis}</p>

            <div className="cast-section">
              <h3>Cast</h3>
              <p className="cast-list">{movie.cast_members}</p>
            </div>

            {/* 4. REVIEWS SECTION */}
            <div className="movie-reviews-section">
              <h2>Recent Reviews</h2>
              <div className="movie-reviews-list">
                {reviews.length > 0 ? (
                  reviews.map((review) => (
                    <ReviewCard key={review.id} review={review} showMoviePoster={false} />
                  ))
                ) : (
                  <div className="no-reviews-box glass-card">
                    <MessageSquare size={32} />
                    <p>No reviews yet for {movie.title}. Be the first to share your thoughts!</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Actions sidecar and stats */}
          <div className="movie-right-col">
            
            {/* Log / Interaction widget */}
            {user ? (
              <div className="interaction-card glass-card">
                {userState.logged ? (
                  <div className="user-rating-box">
                    <span className="logged-label">You logged this</span>
                    <StarRating rating={userState.userRating} size={18} />
                  </div>
                ) : (
                  <div className="unlogged-label">Not logged yet</div>
                )}

                <div className="action-buttons-row">
                  <button 
                    className={`btn-action ${userState.watchlisted ? 'active' : ''}`}
                    onClick={handleToggleWatchlist}
                  >
                    {userState.watchlisted ? <Check size={18} className="green-icon" /> : <Plus size={18} />}
                    <span>Watchlist</span>
                  </button>

                  <button 
                    className={`btn-action ${userState.liked ? 'active' : ''}`}
                    onClick={handleToggleLike}
                  >
                    <Heart size={18} className={userState.liked ? 'liked-icon' : ''} fill={userState.liked ? 'currentColor' : 'none'} />
                    <span>Like</span>
                  </button>
                </div>

                <button 
                  className="btn btn-green btn-full-width btn-log-action"
                  onClick={() => onOpenLogModal({ id: movie.id, title: movie.title, director: movie.director, release_year: movie.release_year, poster_url: movie.poster_url })}
                >
                  {userState.logged ? 'Edit rating or review' : 'Log / Review film'}
                </button>
              </div>
            ) : (
              <div className="interaction-card-logged-out glass-card">
                <p>Sign in to log, rate, and review this film.</p>
                <Link to="/login" className="btn btn-primary btn-full-width">Sign In</Link>
              </div>
            )}

            {/* Movie Stats card */}
            <div className="movie-stats-card glass-card">
              <div className="stats-row">
                <div className="stat-box">
                  <span className="stat-value">{stats.reviewCount}</span>
                  <span className="stat-label">Logs</span>
                </div>
                <div className="stat-box border-sides">
                  <span className="stat-value">{stats.likesCount}</span>
                  <span className="stat-label">Likes</span>
                </div>
                <div className="stat-box">
                  <span className="stat-value rating-val">
                    <Star size={14} fill="currentColor" className="star-icon-small" />
                    {parseFloat(movie.average_rating).toFixed(1)}
                  </span>
                  <span className="stat-label">Average</span>
                </div>
              </div>

              {/* Rating Distribution Graph */}
              {stats.reviewCount > 0 && (
                <div className="rating-graph-container">
                  <h4>Rating Curve</h4>
                  <div className="rating-bar-graph">
                    {Object.keys(stats.ratingDistribution).map((rate) => {
                      const count = stats.ratingDistribution[rate];
                      const heightPercent = (count / maxDistributionCount) * 100;
                      return (
                        <div key={rate} className="graph-bar-col" title={`${rate} stars: ${count} reviews`}>
                          <div className="graph-bar-wrapper">
                            <div 
                              className="graph-bar-fill" 
                              style={{ height: `${Math.max(heightPercent, 2)}%` }}
                            ></div>
                          </div>
                          {/* Show rating ticks for select stars */}
                          <span className="graph-bar-tick">
                            {rate === "1.0" || rate === "3.0" || rate === "5.0" ? parseInt(rate) : ''}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default MovieDetails;
