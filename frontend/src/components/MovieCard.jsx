import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Heart } from 'lucide-react';
import './MovieCard.css';

const MovieCard = ({ movie, ratingOverlay = true }) => {
  return (
    <Link to={`/movies/${movie.id}`} className="movie-card-link">
      <div className="movie-card">
        {/* Poster Image */}
        <div className="poster-wrapper">
          <img
            src={movie.poster_url}
            alt={movie.title}
            className="movie-poster"
            loading="lazy"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/200x300/1c252d/ffffff?text=' + encodeURIComponent(movie.title);
            }}
          />
          {/* Hover Overlay */}
          <div className="poster-overlay">
            <span className="view-link">View Info</span>
          </div>
        </div>

        {/* Movie Info */}
        <div className="movie-card-info">
          <h3 className="movie-card-title">{movie.title}</h3>
          <div className="movie-card-meta">
            <span className="movie-card-year">{movie.release_year}</span>
            {ratingOverlay && movie.average_rating > 0 && (
              <span className="movie-card-rating">
                <Star size={12} className="star-icon" />
                {parseFloat(movie.average_rating).toFixed(1)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default MovieCard;
