import { useState, useEffect, useRef } from 'react';
import StarRating from './StarRating';
import { useToast } from './ToastContext';
import { apiFetch } from '../utils/api';

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function ReviewSection({ tmdbId, movieData }) {
  const [reviews, setReviews] = useState([]);
  const [rating,  setRating]  = useState(0);
  const [body,    setBody]    = useState('');
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const { addToast }          = useToast();

  const fetchReviews = async () => {
    try {
      const res  = await apiFetch(`/api/reviews/tmdb/${tmdbId}`);
      const data = await res.json();
      setReviews(Array.isArray(data) ? data : []);
    } catch { /* silent */ } finally { setLoading(false); }
  };

  useEffect(() => { fetchReviews(); }, [tmdbId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) { addToast('Please select a rating', 'error'); return; }
    setSaving(true);
    try {
      const res = await apiFetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tmdb_id:    tmdbId,
          movie_data: movieData,
          rating,
          body,
        }),
      });
      if (!res.ok) throw new Error();
      addToast('Review saved! ★', 'success');
      setRating(0); setBody('');
      fetchReviews();
    } catch { addToast('Failed to save review', 'error'); }
    finally  { setSaving(false); }
  };

  const handleDelete = async () => {
    try {
      await apiFetch(`/api/reviews/tmdb/${tmdbId}`, { method: 'DELETE' });
      addToast('Review deleted', 'default');
      fetchReviews();
    } catch { addToast('Failed to delete', 'error'); }
  };

  return (
    <div className="reviews-section">
      <div className="section-header">
        <h2 className="section-title">Reviews</h2>
        {!loading && <span className="section-count">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</span>}
      </div>

      <form className="review-form" onSubmit={handleSubmit}>
        <div className="review-form__title">Write a review</div>
        <div className="review-form__label">Your Rating</div>
        <div className="review-form__stars"><StarRating value={rating} onChange={setRating} size="lg" /></div>
        <div className="review-form__label">Thoughts (optional)</div>
        <textarea
          className="review-form__textarea"
          placeholder="What did you think?"
          value={body}
          onChange={e => setBody(e.target.value)}
          maxLength={1000}
        />
        <div className="review-form__footer">
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{body.length}/1000</span>
          <button type="submit" className="btn btn--primary" disabled={saving} id="submit-review-btn">
            {saving ? 'Saving…' : 'Save Review'}
          </button>
        </div>
      </form>

      {loading ? (
        <div className="review-list">
          {[1,2].map(i => <div key={i} className="review-card skeleton" style={{ height: 100 }} />)}
        </div>
      ) : reviews.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon">📝</div>
          <div className="empty-state__title">No reviews yet</div>
          <div className="empty-state__sub">Be the first!</div>
        </div>
      ) : (
        <div className="review-list">
          {reviews.map(review => (
            <div key={review.id} className="review-card">
              <div className="review-card__header">
                <img
                  className="review-card__avatar"
                  src={review.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${review.username}`}
                  alt={review.username}
                />
                <div>
                  <div className="review-card__user">{review.username}</div>
                  <div className="review-card__date">{formatDate(review.created_at)}</div>
                </div>
                <div className="review-card__stars"><StarRating value={review.rating} readOnly size="sm" /></div>
                <button className="btn btn--ghost btn--sm" style={{ marginLeft: 'auto' }} onClick={handleDelete} title="Delete">🗑</button>
              </div>
              {review.body && <div className="review-card__body">"{review.body}"</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
