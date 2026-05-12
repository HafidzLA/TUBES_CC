const express = require('express');
const router  = express.Router();
const db      = require('../db');

// GET /api/profile/:userId
router.get('/:userId', async (req, res, next) => {
  const userId = req.params.userId;
  try {
    // User info
    const [[user]] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Stats
    const [[stats]] = await db.query(`
      SELECT
        (SELECT COUNT(*) FROM reviews   WHERE user_id = ?) AS films_logged,
        (SELECT COUNT(*) FROM watchlist WHERE user_id = ?) AS watchlist_count,
        (SELECT ROUND(AVG(rating),2) FROM reviews WHERE user_id = ?) AS avg_rating
    `, [userId, userId, userId]);

    // Recent activity (last 8 reviews with movie info)
    const [recentActivity] = await db.query(`
      SELECT r.id, r.rating, r.body, r.created_at,
             m.id AS movie_id, m.tmdb_id, m.title, m.year, m.poster_url, m.genre
      FROM   reviews r
      JOIN   movies  m ON m.id = r.movie_id
      WHERE  r.user_id = ?
      ORDER BY r.created_at DESC
      LIMIT 8
    `, [userId]);

    // Diary (all reviews, paginated)
    const page     = parseInt(req.query.page) || 1;
    const pageSize = 20;
    const offset   = (page - 1) * pageSize;

    const [diary] = await db.query(`
      SELECT r.id, r.rating, r.body, r.created_at,
             m.id AS movie_id, m.tmdb_id, m.title, m.year, m.director, m.genre, m.poster_url
      FROM   reviews r
      JOIN   movies  m ON m.id = r.movie_id
      WHERE  r.user_id = ?
      ORDER BY r.created_at DESC
      LIMIT ? OFFSET ?
    `, [userId, pageSize, offset]);

    const [[{ total_diary }]] = await db.query(
      'SELECT COUNT(*) AS total_diary FROM reviews WHERE user_id = ?', [userId]
    );

    // Watchlist preview (first 8)
    const [watchlist] = await db.query(`
      SELECT m.id AS movie_id, m.tmdb_id, m.title, m.year, m.poster_url, w.added_at
      FROM   watchlist w
      JOIN   movies    m ON m.id = w.movie_id
      WHERE  w.user_id = ?
      ORDER BY w.added_at DESC
      LIMIT 8
    `, [userId]);

    res.json({
      user,
      stats: { ...stats, films_logged: Number(stats.films_logged), watchlist_count: Number(stats.watchlist_count) },
      recentActivity,
      diary,
      diaryTotal: Number(total_diary),
      diaryPage:  page,
      watchlist,
    });
  } catch (err) { next(err); }
});

module.exports = router;
