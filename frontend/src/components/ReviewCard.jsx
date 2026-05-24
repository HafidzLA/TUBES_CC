import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import StarRating from './StarRating';
import { Heart, Eye, EyeOff } from 'lucide-react';
import UserAvatar from './UserAvatar';
import './ReviewCard.css';

const ReviewCard = ({ review, showMoviePoster = false }) => {
  const [revealSpoilers, setRevealSpoilers] = useState(false);

  const formattedDate = new Date(review.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  const shouldHideContent = review.contains_spoilers && !revealSpoilers;

  return (
    <div className="review-card glass-card">
      <div className="review-card-layout">
        {/* Optional Movie Poster (e.g. for Home feed) */}
        {showMoviePoster && (
          <div className="review-movie-poster-wrapper">
            <Link to={`/movies/${review.movie_id}`}>
              <img 
                src={review.poster_url} 
                alt={review.title} 
                className="review-movie-poster" 
                onError={(e) => { e.target.src = 'https://via.placeholder.com/60x90/1c252d/ffffff?text=Film' }}
              />
            </Link>
          </div>
        )}

        <div className="review-content-section">
          {/* Header Row */}
          <div className="review-header">
            <div className="review-user-info">
              <UserAvatar username={review.username} avatarUrl={review.avatar_url} size={32} className="review-avatar" />
              <div className="review-meta-text">
                <span className="review-by">Review by </span>
                <Link to={`/users/${review.username}`} className="review-username">
                  {review.username}
                </Link>
                {showMoviePoster && (
                  <span className="review-movie-link">
                    &nbsp;on <Link to={`/movies/${review.movie_id}`} className="movie-title-span">{review.title}</Link>
                  </span>
                )}
              </div>
            </div>
            
            <div className="review-meta-aside">
              <span className="review-date">{formattedDate}</span>
            </div>
          </div>

          {/* Rating and Likes Row */}
          <div className="review-stars-likes">
            <StarRating rating={parseFloat(review.rating)} size={14} />
            {review.is_liked && <Heart size={14} className="review-heart-icon" fill="currentColor" />}
          </div>

          {/* Spoiler Warning overlay */}
          {review.contains_spoilers && (
            <div className={`spoiler-banner ${revealSpoilers ? 'revealed' : ''}`}>
              <span className="spoiler-tag">SPOILERS</span>
              <button 
                className="btn-reveal-spoilers" 
                onClick={() => setRevealSpoilers(!revealSpoilers)}
              >
                {revealSpoilers ? (
                  <>
                    <EyeOff size={12} /> Hide spoilers
                  </>
                ) : (
                  <>
                    <Eye size={12} /> Click to reveal review
                  </>
                )}
              </button>
            </div>
          )}

          {/* Review Text */}
          <p className={`review-text ${shouldHideContent ? 'content-hidden' : ''}`}>
            {review.content || <em>Logged without written review.</em>}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReviewCard;
