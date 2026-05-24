import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import MovieCard from '../components/MovieCard';
import ReviewCard from '../components/ReviewCard';
import { Link } from 'react-router-dom';
import { Film, TrendingUp, Star, Play, Heart } from 'lucide-react';
import './Home.css';

const Home = () => {
  const { user, API_URL } = useAuth();
  const [popularMovies, setPopularMovies] = useState([]);
  const [topRatedMovies, setTopRatedMovies] = useState([]);
  const [nowPlayingMovies, setNowPlayingMovies] = useState([]);
  const [recentReviews, setRecentReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        // Fetch popular movies
        const popResponse = await fetch(`${API_URL}/api/movies/popular?limit=6`);
        // Fetch top rated movies
        const topResponse = await fetch(`${API_URL}/api/movies/top-rated?limit=6`);
        // Fetch now playing movies
        const nowResponse = await fetch(`${API_URL}/api/movies/now-playing?limit=6`);
        // Fetch recent reviews
        const revResponse = await fetch(`${API_URL}/api/reviews?limit=5`);

        if (popResponse.ok && topResponse.ok && nowResponse.ok && revResponse.ok) {
          const popData = await popResponse.json();
          const topData = await topResponse.json();
          const nowData = await nowResponse.json();
          const revData = await revResponse.json();
          
          setPopularMovies(popData);
          setTopRatedMovies(topData);
          setNowPlayingMovies(nowData);
          setRecentReviews(revData);
        }
      } catch (err) {
        console.error('Failed to load home page data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  if (loading) {
    return (
      <div className="container home-loading">
        <div className="spinner"></div>
        <p>Loading the cinema marquee...</p>
      </div>
    );
  }

  return (
    <div className="home-page animate-fade-in">
      {/* 1. HERO SECTION (if not logged in) */}
      {!user && (
        <section className="home-hero">
          <div className="hero-overlay"></div>
          <div className="hero-content container">
            <h1>Track films you’ve watched.<br />Save those you want to see.<br />Tell your friends what’s good.</h1>
            <p className="hero-subtext">The social network for film lovers. Welcome to ShutterScore.</p>
            <div className="hero-buttons">
              <Link to="/register" className="btn btn-primary btn-large">Get Started — It's Free!</Link>
            </div>
          </div>
        </section>
      )}

      <div className="home-content-wrapper container">
        {/* Main Grid: Movies Left, Reviews Right */}
        <div className="home-main-layout">
          <div className="movies-column">
            {/* 2. POPULAR MOVIES SECTION */}
            <section className="home-section">
              <div className="section-header">
                <TrendingUp size={20} className="section-icon orange" />
                <h2>Popular Films</h2>
                <span className="section-line"></span>
              </div>
              <div className="movie-grid-layout">
                {popularMovies.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>
            </section>

            {/* 3. TOP RATED MOVIES SECTION */}
            <section className="home-section">
              <div className="section-header">
                <Star size={20} className="section-icon yellow" fill="currentColor" />
                <h2>Top Rated Films</h2>
                <span className="section-line"></span>
              </div>
              <div className="movie-grid-layout">
                {topRatedMovies.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>
            </section>

            {/* 4. NOW PLAYING SECTION */}
            <section className="home-section">
              <div className="section-header">
                <Play size={18} className="section-icon blue" fill="currentColor" />
                <h2>Now Playing</h2>
                <span className="section-line"></span>
              </div>
              <div className="movie-grid-layout">
                {nowPlayingMovies.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>
            </section>
          </div>

          {/* 5. RECENT REVIEWS FEED COLUMN */}
          <div className="reviews-column">
            <section className="home-section">
              <div className="section-header">
                <Heart size={20} className="section-icon green" fill="currentColor" />
                <h2>Recent Reviews</h2>
                <span className="section-line"></span>
              </div>
              <div className="reviews-list">
                {recentReviews.length > 0 ? (
                  recentReviews.map((review) => (
                    <ReviewCard key={review.id} review={review} showMoviePoster={true} />
                  ))
                ) : (
                  <div className="no-reviews-box glass-card">
                    <Film size={32} />
                    <p>No reviews logged yet. Be the first!</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
