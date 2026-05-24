import React, { useState } from 'react';
import { Star } from 'lucide-react';
import './StarRating.css';

const StarRating = ({ rating, onChange, interactive = false, size = 18 }) => {
  const [hoverRating, setHoverRating] = useState(null);
  
  const displayRating = hoverRating !== null ? hoverRating : rating;

  const handleHalfClick = (val) => {
    if (interactive && onChange) {
      onChange(val);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(null);
    }
  };

  const handleMouseEnterHalf = (val) => {
    if (interactive) {
      setHoverRating(val);
    }
  };

  // Render 5 stars
  const stars = [];
  for (let i = 0; i < 5; i++) {
    const starIndex = i + 1;
    // Determine how much of this star is filled
    let fillType = 'empty'; // 'empty', 'half', 'full'
    
    if (displayRating >= starIndex) {
      fillType = 'full';
    } else if (displayRating >= starIndex - 0.5) {
      fillType = 'half';
    }

    stars.push(
      <div 
        key={i} 
        className={`star-wrapper ${interactive ? 'interactive' : ''}`}
        style={{ width: size, height: size }}
      >
        {/* Full Star SVG */}
        <svg 
          viewBox="0 0 24 24" 
          className={`star-svg ${fillType}`}
          width={size}
          height={size}
        >
          {fillType === 'half' ? (
            <>
              {/* Left Half (Filled) */}
              <path 
                d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
                fill="currentColor"
                clipPath="url(#left-half-clip)"
              />
              {/* Right Half (Empty) */}
              <path 
                d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
                fill="none"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="1.5"
                clipPath="url(#right-half-clip)"
              />
            </>
          ) : (
            <path 
              d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
              fill={fillType === 'full' ? 'currentColor' : 'none'}
              stroke={fillType === 'full' ? 'currentColor' : 'rgba(255,255,255,0.2)'}
              strokeWidth="1.5"
            />
          )}
        </svg>

        {interactive && (
          <>
            {/* Left click/hover trigger (0.5 value) */}
            <div 
              className="star-trigger left" 
              onClick={() => handleHalfClick(starIndex - 0.5)}
              onMouseEnter={() => handleMouseEnterHalf(starIndex - 0.5)}
            />
            {/* Right click/hover trigger (1.0 value) */}
            <div 
              className="star-trigger right" 
              onClick={() => handleHalfClick(starIndex)}
              onMouseEnter={() => handleMouseEnterHalf(starIndex)}
            />
          </>
        )}
      </div>
    );
  }

  return (
    <div className="star-rating-container" onMouseLeave={handleMouseLeave}>
      {/* Clip paths for half stars */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <clipPath id="left-half-clip">
            <rect x="0" y="0" width="12" height="24" />
          </clipPath>
          <clipPath id="right-half-clip">
            <rect x="12" y="0" width="12" height="24" />
          </clipPath>
        </defs>
      </svg>
      {stars}
    </div>
  );
};

export default StarRating;
