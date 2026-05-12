const express = require('express');
const router  = express.Router();
const db      = require('../db');

// GET /api/movies  — list all movies with avg rating
router.get('/', async (_req, res, next) => {
  try {
    const [rows] = await db.query(`
      SELECT m.*,
             ROUND(COALESCE(AVG(r.rating), 0), 2) AS rating_avg,
             COUNT(r.id)                            AS rating_count
      FROM   movies m
      LEFT JOIN reviews r ON r.movie_id = m.id
      GROUP BY m.id
      ORDER BY m.title
    `);
    res.json(rows);
  } catch (err) { next(err); }
});

// GET /api/movies/:id  — single movie detail
router.get('/:id', async (req, res, next) => {
  try {
    const [[movie]] = await db.query(`
      SELECT m.*,
             ROUND(COALESCE(AVG(r.rating), 0), 2) AS rating_avg,
             COUNT(r.id)                            AS rating_count
      FROM   movies m
      LEFT JOIN reviews r ON r.movie_id = m.id
      WHERE  m.id = ?
      GROUP BY m.id
    `, [req.params.id]);

    if (!movie) return res.status(404).json({ error: 'Movie not found' });
    res.json(movie);
  } catch (err) { next(err); }
});

module.exports = router;
