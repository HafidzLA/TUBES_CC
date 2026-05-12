import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/ToastContext';

export default function Watchlist() {
  const [movies,  setMovies]  = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast }          = useToast();
  const navigate              = useNavigate();

  const fetchWatchlist = () =>
    fetch('/api/watchlist/1')
      .then(r => r.json())
      .then(setMovies)
      .catch(() => addToast('Failed to load watchlist', 'error'))
      .finally(() => setLoading(false));

  useEffect(() => { fetchWatchlist(); }, []);

  const remove = async (movie) => {
    try {
      await fetch(`/api/watchlist/${movie.id}`, { method: 'DELETE' });
      setMovies(prev => prev.filter(m => m.id !== movie.id));
      addToast(`Removed "${movie.title}"`, 'default');
    } catch {
      addToast('Failed to remove', 'error');
    }
  };

  return (
    <div className="page-enter">
      <div className="container">
        <div className="page-header">
          <h1 className="page-header__title">Your Watchlist</h1>
          <p className="page-header__sub">Films you want to see — {loading ? '…' : `${movies.length} film${movies.length !== 1 ? 's' : ''}`}</p>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[1,2,3].map(i => (
              <div key={i} className="skeleton" style={{ height: 100, borderRadius: 'var(--radius-md)' }} />
            ))}
          </div>
        ) : movies.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">🎬</div>
            <div className="empty-state__title">Your watchlist is empty</div>
            <div className="empty-state__sub">Browse films and click "+ Watch" to add them here.</div>
            <button className="btn btn--primary" style={{ marginTop: 20 }} onClick={() => navigate('/')}>
              Browse Films
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 60 }}>
            {movies.map(movie => (
              <div
                key={movie.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '70px 1fr auto',
                  gap: 20,
                  alignItems: 'center',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px 20px',
                  cursor: 'pointer',
                  transition: 'border-color var(--dur) var(--ease), transform var(--dur) var(--ease)',
                }}
                onClick={() => navigate(`/movie/${movie.id}`)}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--border-hover)';
                  e.currentTarget.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <img
                  src={movie.poster_url}
                  alt={movie.title}
                  style={{ width: 70, aspectRatio: '2/3', objectFit: 'cover', borderRadius: 8 }}
                  onError={e => {
                    e.target.src = `https://placehold.co/70x105/1c2230/8b949e?text=?`;
                  }}
                />
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>{movie.title}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {movie.year} · {movie.director} · <span style={{ color: 'var(--accent)' }}>{movie.genre}</span>
                  </div>
                </div>
                <button
                  className="btn btn--ghost btn--sm"
                  onClick={e => { e.stopPropagation(); remove(movie); }}
                  title="Remove from watchlist"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
