const express = require('express');
const router  = express.Router();
const db      = require('../db');
const { getOrCreateMovieId } = require('../utils/movieHelper');

// GET /api/reviews/tmdb/:tmdbId  — reviews for a TMDB movie
router.get('/tmdb/:tmdbId', async (req, res, next) => {
  try {
    const [rows] = await db.query(`
      SELECT r.*, u.username, u.avatar_url
      FROM   reviews r
      JOIN   movies  m ON m.id = r.movie_id
      JOIN   users   u ON u.id = r.user_id
      WHERE  m.tmdb_id = ?
      ORDER BY r.created_at DESC
    `, [req.params.tmdbId]);
    res.json(rows);
  } catch (err) { next(err); }
});

// GET /api/reviews/:movieId  — reviews by local movie_id (legacy)
router.get('/:movieId', async (req, res, next) => {
  try {
    const [rows] = await db.query(`
      SELECT r.*, u.username, u.avatar_url
      FROM   reviews r
      JOIN   users   u ON u.id = r.user_id
      WHERE  r.movie_id = ?
      ORDER BY r.created_at DESC
    `, [req.params.movieId]);
    res.json(rows);
  } catch (err) { next(err); }
});

// POST /api/reviews
// Body: { tmdb_id, movie_data{}, rating, body }  OR  { movie_id, rating, body }
router.post('/', async (req, res, next) => {
  const { movie_id, tmdb_id, movie_data, rating, body, user_id = 1 } = req.body;
  if (!rating || rating < 1 || rating > 5)
    return res.status(400).json({ error: 'rating (1-5) required' });

  try {
    let localMovieId = movie_id;
    if (!localMovieId && tmdb_id) {
      localMovieId = await getOrCreateMovieId({ tmdb_id, ...(movie_data || {}) });
    }
    if (!localMovieId) return res.status(400).json({ error: 'movie_id or tmdb_id required' });

    await db.query(`
      INSERT INTO reviews (movie_id, user_id, rating, body)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE rating = VALUES(rating), body = VALUES(body), created_at = NOW()
    `, [localMovieId, user_id, rating, body || null]);

    res.status(201).json({ message: 'Review saved' });
  } catch (err) { next(err); }
});

// DELETE /api/reviews/tmdb/:tmdbId  — delete by TMDB id
router.delete('/tmdb/:tmdbId', async (req, res, next) => {
  const user_id = 1;
  try {
    await db.query(`
      DELETE r FROM reviews r
      JOIN   movies m ON m.id = r.movie_id
      WHERE  m.tmdb_id = ? AND r.user_id = ?
    `, [req.params.tmdbId, user_id]);
    res.json({ message: 'Review deleted' });
  } catch (err) { next(err); }
});

// DELETE /api/reviews/:movieId  — delete by local movie_id (legacy)
router.delete('/:movieId', async (req, res, next) => {
  const user_id = 1;
  try {
    await db.query(
      'DELETE FROM reviews WHERE movie_id = ? AND user_id = ?',
      [req.params.movieId, user_id]
    );
    res.json({ message: 'Review deleted' });
  } catch (err) { next(err); }
});

module.exports = router;
