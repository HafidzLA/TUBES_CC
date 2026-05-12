import { useState, useEffect, useCallback } from 'react';
import MovieCard from '../components/MovieCard';
import { useToast } from '../components/ToastContext';
import { tmdb, fromTmdb } from '../utils/tmdb';
import { apiFetch } from '../utils/api';

const TABS = [
  { id: 'popular',    label: '🔥 Popular'    },
  { id: 'top_rated',  label: '⭐ Top Rated'  },
  { id: 'now_playing',label: '🎬 Now Playing' },
  { id: 'upcoming',   label: '🗓 Upcoming'    },
  { id: 'search',     label: '🔍 Search'      },
];

const fetchTab = (tab, query, page) => {
  if (tab === 'search')     return tmdb.search(query, page);
  if (tab === 'top_rated')  return tmdb.topRated(page);
  if (tab === 'now_playing')return tmdb.nowPlaying(page);
  if (tab === 'upcoming')   return tmdb.upcoming(page);
  return tmdb.popular(page);
};

export default function Home() {
  const [tab,       setTab]       = useState('popular');
  const [query,     setQuery]     = useState('');
  const [movies,    setMovies]    = useState([]);
  const [page,      setPage]      = useState(1);
  const [totalPages,setTotalPages]= useState(1);
  const [loading,   setLoading]   = useState(true);
  const [loadingMore,setLoadingMore]=useState(false);
  const [watchlist, setWatchlist] = useState([]);
  const { addToast }              = useToast();
  const noKey = !tmdb.hasKey();

  // Load watchlist once
  useEffect(() => {
    apiFetch('/api/watchlist/1').then(r => r.json())
      .then(w => setWatchlist(w.map(m => m.tmdb_id).filter(Boolean)))
      .catch(() => {});
  }, []);

  const loadMovies = useCallback(async (newTab, newQuery, newPage, append = false) => {
    if (newTab === 'search' && !newQuery.trim()) {
      setMovies([]); setLoading(false); return;
    }
    append ? setLoadingMore(true) : setLoading(true);
    try {
      const data = await fetchTab(newTab, newQuery, newPage);
      const mapped = (data.results || []).map(fromTmdb);
      setMovies(prev => append ? [...prev, ...mapped] : mapped);
      setTotalPages(data.total_pages || 1);
    } catch {
      addToast('Failed to load movies', 'error');
    } finally {
      setLoading(false); setLoadingMore(false);
    }
  }, []);

  // Re-fetch when tab changes (not search – search is debounced)
  useEffect(() => {
    if (tab === 'search') return;
    setPage(1); loadMovies(tab, '', 1);
  }, [tab]);

  // Debounced search
  useEffect(() => {
    if (tab !== 'search') return;
    const t = setTimeout(() => { setPage(1); loadMovies('search', query, 1); }, 450);
    return () => clearTimeout(t);
  }, [query, tab]);

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    loadMovies(tab, query, next, true);
  };

  const handleWatchlistToggle = async (movie) => {
    const isIn = watchlist.includes(movie.tmdb_id);
    try {
      if (isIn) {
        await apiFetch(`/api/watchlist/tmdb/${movie.tmdb_id}`, { method: 'DELETE' });
        setWatchlist(prev => prev.filter(id => id !== movie.tmdb_id));
        addToast(`Removed "${movie.title}"`, 'default');
      } else {
        await apiFetch('/api/watchlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tmdb_id: movie.tmdb_id,
            movie_data: movie,
          }),
        });
        setWatchlist(prev => [...prev, movie.tmdb_id]);
        addToast(`Added "${movie.title}" to watchlist 🔖`, 'success');
      }
    } catch { addToast('Action failed', 'error'); }
  };

  return (
    <div className="page-enter">
      {/* Hero */}
      <div className="home-hero">
        <div className="container">
          <p className="home-hero__eyebrow">Film Discovery</p>
          <h1 className="home-hero__title">Track Films You Love.</h1>
          <p className="home-hero__sub">
            Rate, review, and remember every film — powered by TMDB.
          </p>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 36, paddingBottom: 60 }}>

        {/* TMDB key missing warning */}
        {noKey && (
          <div className="api-warning">
            <strong>⚠️ TMDB API key missing.</strong>{' '}
            Create <code>frontend/.env</code> with <code>VITE_TMDB_KEY=your_key</code>.{' '}
            Get a free key at{' '}
            <a href="https://www.themoviedb.org/settings/api" target="_blank" rel="noreferrer" style={{ color: 'var(--accent)' }}>
              themoviedb.org
            </a>
            . Then run <code>vagrant provision frontend</code>.
          </div>
        )}

        {/* Tabs */}
        <div className="tabs" role="tablist">
          {TABS.map(t => (
            <button
              key={t.id}
              id={`tab-${t.id}`}
              role="tab"
              aria-selected={tab === t.id}
              className={'tab' + (tab === t.id ? ' tab--active' : '')}
              onClick={() => { setTab(t.id); if (t.id !== 'search') setQuery(''); }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Search input (only in search tab) */}
        {tab === 'search' && (
          <div className="search-bar" style={{ marginTop: 20 }}>
            <span className="search-bar__icon">🔍</span>
            <input
              id="search-input"
              autoFocus
              className="search-bar__input"
              placeholder="Search any film on TMDB…"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            {query && (
              <button onClick={() => setQuery('')} style={{ color: 'var(--text-muted)' }}>✕</button>
            )}
          </div>
        )}

        {/* Section header */}
        <div className="section-header" style={{ marginTop: 28 }}>
          <h2 className="section-title">
            {TABS.find(t => t.id === tab)?.label}
          </h2>
          {!loading && movies.length > 0 && (
            <span className="section-count">{movies.length} shown</span>
          )}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="movie-grid">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="skeleton skeleton-card" />
            ))}
          </div>
        ) : movies.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">🎬</div>
            <div className="empty-state__title">
              {tab === 'search' && !query ? 'Type to search films' : 'No films found'}
            </div>
            <div className="empty-state__sub">
              {tab === 'search' && !query ? 'Start typing a film title' : 'Try a different search'}
            </div>
          </div>
        ) : (
          <>
            <div className="movie-grid">
              {movies.map((movie, i) => (
                <MovieCard
                  key={`${movie.tmdb_id}-${i}`}
                  movie={movie}
                  isWatchlisted={watchlist.includes(movie.tmdb_id)}
                  onWatchlistToggle={handleWatchlistToggle}
                />
              ))}
            </div>

            {/* Load more */}
            {page < totalPages && (
              <div style={{ textAlign: 'center', marginTop: 40 }}>
                <button
                  className="btn btn--ghost"
                  onClick={loadMore}
                  disabled={loadingMore}
                  id="load-more-btn"
                >
                  {loadingMore ? 'Loading…' : `Load More (Page ${page + 1} of ${totalPages})`}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
