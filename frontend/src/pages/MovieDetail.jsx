import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StarRating from '../components/StarRating';
import ReviewSection from '../components/ReviewSection';
import { useToast } from '../components/ToastContext';
import { tmdb, fromTmdb } from '../utils/tmdb';
import { apiFetch } from '../utils/api';

export default function MovieDetail() {
  const { id }   = useParams();          // This is the TMDB movie id
  const navigate = useNavigate();
  const [movie,       setMovie]       = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [watchlisted, setWatchlisted] = useState(false);
  const { addToast }                  = useToast();

  useEffect(() => {
    window.scrollTo(0, 0);
    const loadData = async () => {
      try {
        // Fetch movie detail from TMDB
        const [tmdbData, wl] = await Promise.all([
          tmdb.detail(id),
          apiFetch('/api/watchlist/1').then(r => r.json()),
        ]);
        if (tmdbData.success === false) { navigate('/'); return; }
        const m = fromTmdb(tmdbData);
        setMovie(m);
        setWatchlisted(wl.some(w => w.tmdb_id === m.tmdb_id));
      } catch { navigate('/'); }
      finally  { setLoading(false); }
    };
    loadData();
  }, [id]);

  const toggleWatchlist = async () => {
    if (!movie) return;
    try {
      if (watchlisted) {
        await apiFetch(`/api/watchlist/tmdb/${movie.tmdb_id}`, { method: 'DELETE' });
        setWatchlisted(false);
        addToast('Removed from watchlist', 'default');
      } else {
        await apiFetch('/api/watchlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tmdb_id: movie.tmdb_id, movie_data: movie }),
        });
        setWatchlisted(true);
        addToast('Added to watchlist 🔖', 'success');
      }
    } catch { addToast('Action failed', 'error'); }
  };

  if (loading) return (
    <div className="container" style={{ paddingTop: 40 }}>
      <div className="skeleton" style={{ height: 380, borderRadius: 'var(--radius-lg)', marginBottom: 32 }} />
    </div>
  );
  if (!movie) return null;

  const avg = parseFloat(movie.rating_avg) || 0;

  return (
    <div className="page-enter">
      <div className="hero">
        <img className="hero__backdrop" src={movie.backdrop_url} alt="" aria-hidden />
        <div className="hero__overlay" />
      </div>

      <div className="container">
        <div className="detail-layout">
          <div>
            <img
              className="detail-poster"
              src={movie.poster_url}
              alt={`${movie.title} poster`}
              onError={e => {
                e.target.src = `https://placehold.co/260x390/1c2230/8b949e?text=${encodeURIComponent(movie.title)}`;
              }}
            />
          </div>

          <div className="detail-info">
            {movie.genre && <div className="detail-genre-tag">{movie.genre.split(',')[0]}</div>}
            <h1 className="detail-title">{movie.title}</h1>

            <div className="detail-meta-row">
              <span>{movie.year}</span>
              {movie.director && movie.director !== 'Unknown' && (
                <><span>·</span><span>Directed by <span className="detail-director">{movie.director}</span></span></>
              )}
            </div>

            <p className="detail-synopsis">{movie.synopsis}</p>

            <div className="detail-stats">
              <div>
                <div className="detail-stat__value">
                  {avg > 0 ? (
                    <><StarRating value={Math.round(avg / 2)} readOnly size="sm" /><span>{avg.toFixed(1)}</span></>
                  ) : '—'}
                </div>
                <div className="detail-stat__label">TMDB Rating</div>
              </div>
              <div>
                <div className="detail-stat__value">{movie.rating_count?.toLocaleString?.() ?? '—'}</div>
                <div className="detail-stat__label">TMDB Votes</div>
              </div>
            </div>

            <div className="detail-actions">
              <button id="watchlist-toggle-btn" className={`btn ${watchlisted ? 'btn--green' : 'btn--ghost'}`} onClick={toggleWatchlist}>
                {watchlisted ? '✓ In Watchlist' : '+ Add to Watchlist'}
              </button>
              <button className="btn btn--ghost" onClick={() => navigate(-1)}>← Back</button>
            </div>
          </div>
        </div>

        <ReviewSection tmdbId={parseInt(id)} movieData={movie} />
      </div>
    </div>
  );
}
