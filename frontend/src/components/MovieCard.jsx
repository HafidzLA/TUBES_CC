import { useNavigate } from 'react-router-dom';
import StarRating from './StarRating';

export default function MovieCard({ movie, isWatchlisted, onWatchlistToggle }) {
  const navigate = useNavigate();
  // Use tmdb_id for routing (TMDB movies), fallback to local id
  const movieId = movie.tmdb_id || movie.id;
  const avg = parseFloat(movie.rating_avg) || 0;

  const handleWatchlist = (e) => {
    e.stopPropagation();
    onWatchlistToggle(movie);
  };

  return (
    <div
      className="movie-card"
      onClick={() => navigate(`/movie/${movieId}`)}
      role="button" tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && navigate(`/movie/${movieId}`)}
      aria-label={`View ${movie.title}`}
    >
      <img
        className="movie-card__poster"
        src={movie.poster_url}
        alt={`${movie.title} poster`}
        loading="lazy"
        onError={e => {
          e.target.src = `https://placehold.co/240x360/1c2230/8b949e?text=${encodeURIComponent(movie.title)}`;
        }}
      />

      {avg > 0 && (
        <div className="movie-card__rating-badge">★ {avg.toFixed ? avg.toFixed(1) : avg}</div>
      )}
      {isWatchlisted && (
        <div className="movie-card__watchlist-badge" title="In watchlist">🔖</div>
      )}

      <div className="movie-card__overlay">
        <div className="movie-card__title">{movie.title}</div>
        <div className="movie-card__year">
          {movie.year} {movie.director ? `· ${movie.director}` : ''}
        </div>
        <div className="movie-card__actions">
          <button
            className={`btn btn--sm ${isWatchlisted ? 'btn--green' : 'btn--ghost'}`}
            onClick={handleWatchlist}
          >
            {isWatchlisted ? '✓ Listed' : '+ Watch'}
          </button>
          <button
            className="btn btn--sm btn--primary"
            onClick={e => { e.stopPropagation(); navigate(`/movie/${movieId}`); }}
          >
            Review
          </button>
        </div>
      </div>
    </div>
  );
}
