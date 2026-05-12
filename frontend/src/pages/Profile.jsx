import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StarRating from '../components/StarRating';
import { apiFetch } from '../utils/api';

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function StatCard({ value, label, icon }) {
  return (
    <div className="profile-stat">
      <div className="profile-stat__icon">{icon}</div>
      <div className="profile-stat__value">{value ?? '—'}</div>
      <div className="profile-stat__label">{label}</div>
    </div>
  );
}

function SectionTitle({ children, action }) {
  return (
    <div className="section-header" style={{ marginBottom: 20 }}>
      <h2 className="section-title">{children}</h2>
      {action}
    </div>
  );
}

export default function Profile() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState('activity'); // activity | diary | watchlist
  const navigate              = useNavigate();

  useEffect(() => {
    apiFetch('/api/profile/1')
      .then(r => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="container" style={{ paddingTop: 60 }}>
      <div className="skeleton" style={{ height: 200, borderRadius: 'var(--radius-lg)', marginBottom: 32 }} />
      <div className="skeleton" style={{ height: 400, borderRadius: 'var(--radius-lg)' }} />
    </div>
  );

  if (!data || data.error) return (
    <div className="container" style={{ paddingTop: 60 }}>
      <div className="empty-state">
        <div className="empty-state__icon">👤</div>
        <div className="empty-state__title">Profile not found</div>
      </div>
    </div>
  );

  const { user, stats, recentActivity, diary, diaryTotal, watchlist } = data;

  return (
    <div className="page-enter">
      {/* ── Profile header ──────────────────────────────── */}
      <div className="profile-header">
        <div className="container profile-header__inner">
          <img
            className="profile-avatar"
            src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
            alt={user.username}
          />
          <div className="profile-info">
            <h1 className="profile-name">{user.username}</h1>
            <p className="profile-joined">Member since {formatDate(user.created_at)}</p>
          </div>
        </div>

        {/* Stats bar */}
        <div className="container">
          <div className="profile-stats">
            <StatCard icon="🎬" value={stats.films_logged}    label="Films Logged" />
            <StatCard icon="⭐" value={stats.avg_rating ? Number(stats.avg_rating).toFixed(1) : '—'} label="Avg. Rating" />
            <StatCard icon="🔖" value={stats.watchlist_count} label="Watchlist" />
          </div>
        </div>
      </div>

      {/* ── Tabs ────────────────────────────────────────── */}
      <div className="container" style={{ paddingBottom: 60 }}>
        <div className="tabs" style={{ marginTop: 32, marginBottom: 32 }}>
          {[
            { id: 'activity', label: '⚡ Recent Activity' },
            { id: 'diary',    label: `📖 Diary (${diaryTotal})` },
            { id: 'watchlist',label: `🔖 Watchlist (${stats.watchlist_count})` },
          ].map(t => (
            <button
              key={t.id}
              className={'tab' + (tab === t.id ? ' tab--active' : '')}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Recent Activity ─────────────────────────── */}
        {tab === 'activity' && (
          <div>
            {recentActivity.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state__icon">⚡</div>
                <div className="empty-state__title">No activity yet</div>
                <div className="empty-state__sub">Start reviewing films to see your activity here.</div>
                <button className="btn btn--primary" style={{ marginTop: 20 }} onClick={() => navigate('/')}>Browse Films</button>
              </div>
            ) : (
              <div className="activity-grid">
                {recentActivity.map(item => (
                  <div
                    key={item.id}
                    className="activity-card"
                    onClick={() => navigate(`/movie/${item.tmdb_id || item.movie_id}`)}
                    role="button" tabIndex={0}
                  >
                    <img
                      className="activity-card__poster"
                      src={item.poster_url}
                      alt={item.title}
                      onError={e => { e.target.src = `https://placehold.co/120x180/1c2230/8b949e?text=?`; }}
                    />
                    <div className="activity-card__body">
                      <div className="activity-card__title">{item.title}</div>
                      <div className="activity-card__meta">{item.year} · {item.genre?.split(',')[0]}</div>
                      <StarRating value={item.rating} readOnly size="sm" />
                      {item.body && (
                        <p className="activity-card__review">"{item.body.slice(0, 100)}{item.body.length > 100 ? '…' : ''}"</p>
                      )}
                      <div className="activity-card__date">{formatDate(item.created_at)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Diary ───────────────────────────────────── */}
        {tab === 'diary' && (
          <div>
            {diary.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state__icon">📖</div>
                <div className="empty-state__title">Your diary is empty</div>
                <div className="empty-state__sub">Films you review will appear here as diary entries.</div>
                <button className="btn btn--primary" style={{ marginTop: 20 }} onClick={() => navigate('/')}>Browse Films</button>
              </div>
            ) : (
              <div className="diary-list">
                {/* Header */}
                <div className="diary-row diary-row--header">
                  <span>DATE</span>
                  <span>FILM</span>
                  <span>RATING</span>
                  <span>REVIEW</span>
                </div>
                {diary.map(entry => (
                  <div
                    key={entry.id}
                    className="diary-row"
                    onClick={() => navigate(`/movie/${entry.tmdb_id || entry.movie_id}`)}
                    role="button" tabIndex={0}
                  >
                    <span className="diary-row__date">{formatDate(entry.created_at)}</span>
                    <div className="diary-row__film">
                      <img
                        className="diary-row__poster"
                        src={entry.poster_url}
                        alt={entry.title}
                        onError={e => { e.target.src = `https://placehold.co/40x60/1c2230/8b949e?text=?`; }}
                      />
                      <div>
                        <div className="diary-row__title">{entry.title}</div>
                        <div className="diary-row__year">{entry.year} · {entry.director}</div>
                      </div>
                    </div>
                    <div className="diary-row__rating">
                      <StarRating value={entry.rating} readOnly size="sm" />
                    </div>
                    <p className="diary-row__review">
                      {entry.body ? `"${entry.body.slice(0, 80)}${entry.body.length > 80 ? '…' : ''}"` : '—'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Watchlist ───────────────────────────────── */}
        {tab === 'watchlist' && (
          <div>
            {watchlist.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state__icon">🔖</div>
                <div className="empty-state__title">Watchlist empty</div>
                <div className="empty-state__sub">Add films to watch later from any movie page.</div>
                <button className="btn btn--primary" style={{ marginTop: 20 }} onClick={() => navigate('/')}>Browse Films</button>
              </div>
            ) : (
              <div className="movie-grid">
                {watchlist.map(m => (
                  <div
                    key={m.tmdb_id || m.movie_id}
                    className="movie-card"
                    onClick={() => navigate(`/movie/${m.tmdb_id || m.movie_id}`)}
                    role="button" tabIndex={0}
                  >
                    <img
                      className="movie-card__poster"
                      src={m.poster_url}
                      alt={m.title}
                      onError={e => { e.target.src = `https://placehold.co/240x360/1c2230/8b949e?text=${encodeURIComponent(m.title)}`; }}
                    />
                    <div className="movie-card__overlay">
                      <div className="movie-card__title">{m.title}</div>
                      <div className="movie-card__year">{m.year}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
