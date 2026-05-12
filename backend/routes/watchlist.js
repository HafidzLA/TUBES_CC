const express = require('express');
const router  = express.Router();
const db      = require('../db');
const { getOrCreateMovieId } = require('../utils/movieHelper');

// GET /api/watchlist/:userId
router.get('/:userId', async (req, res, next) => {
  try {
    const [rows] = await db.query(`
      SELECT m.*, w.added_at
      FROM   watchlist w
      JOIN   movies    m ON m.id = w.movie_id
      WHERE  w.user_id = ?
      ORDER BY w.added_at DESC
    `, [req.params.userId]);
    res.json(rows);
  } catch (err) { next(err); }
});

// POST /api/watchlist
// Body: { tmdb_id, movie_data{} } OR { movie_id }
router.post('/', async (req, res, next) => {
  const { movie_id, tmdb_id, movie_data, user_id = 1 } = req.body;
  try {
    let localMovieId = movie_id;
    if (!localMovieId && tmdb_id) {
      localMovieId = await getOrCreateMovieId({ tmdb_id, ...(movie_data || {}) });
    }
    if (!localMovieId) return res.status(400).json({ error: 'movie_id or tmdb_id required' });

    await db.query(
      'INSERT IGNORE INTO watchlist (movie_id, user_id) VALUES (?, ?)',
      [localMovieId, user_id]
    );
    res.status(201).json({ message: 'Added to watchlist' });
  } catch (err) { next(err); }
});

// DELETE /api/watchlist/tmdb/:tmdbId
router.delete('/tmdb/:tmdbId', async (req, res, next) => {
  const user_id = 1;
  try {
    await db.query(`
      DELETE w FROM watchlist w
      JOIN   movies m ON m.id = w.movie_id
      WHERE  m.tmdb_id = ? AND w.user_id = ?
    `, [req.params.tmdbId, user_id]);
    res.json({ message: 'Removed from watchlist' });
  } catch (err) { next(err); }
});

// DELETE /api/watchlist/:movieId  (legacy)
router.delete('/:movieId', async (req, res, next) => {
  const user_id = 1;
  try {
    await db.query(
      'DELETE FROM watchlist WHERE movie_id = ? AND user_id = ?',
      [req.params.movieId, user_id]
    );
    res.json({ message: 'Removed from watchlist' });
  } catch (err) { next(err); }
});

module.exports = router;
