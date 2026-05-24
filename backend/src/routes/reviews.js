const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authenticateToken = require('../middleware/auth');

// Get Recent Reviews (Social Feed)
router.get('/', async (req, res) => {
  const { limit = 10 } = req.query;
  try {
    const result = await db.query(
      `SELECT r.id, r.rating, r.content, r.is_liked, r.contains_spoilers, r.created_at,
              u.username, u.avatar_url,
              m.id as movie_id, m.title, m.release_year, m.poster_url, m.director
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       JOIN movies m ON r.movie_id = m.id
       ORDER BY r.created_at DESC
       LIMIT $1`,
      [limit]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error. Failed to load reviews feed.' });
  }
});

// Submit / Upsert Review
router.post('/', authenticateToken, async (req, res) => {
  const { movie_id, rating, content = '', is_liked = false, contains_spoilers = false } = req.body;
  const userId = req.user.id;

  if (!movie_id || rating === undefined) {
    return res.status(400).json({ error: 'Movie ID and rating are required.' });
  }

  const parsedRating = parseFloat(rating);
  if (isNaN(parsedRating) || parsedRating < 0.5 || parsedRating > 5.0) {
    return res.status(400).json({ error: 'Rating must be between 0.5 and 5.0.' });
  }

  try {
    // Check if user already reviewed this movie. If yes, update it (upsert).
    const checkResult = await db.query(
      'SELECT id FROM reviews WHERE user_id = $1 AND movie_id = $2',
      [userId, movie_id]
    );

    let reviewId;
    if (checkResult.rows.length > 0) {
      reviewId = checkResult.rows[0].id;
      // Update
      await db.query(
        `UPDATE reviews 
         SET rating = $1, content = $2, is_liked = $3, contains_spoilers = $4, created_at = CURRENT_TIMESTAMP
         WHERE id = $5`,
        [parsedRating, content, is_liked, contains_spoilers, reviewId]
      );
    } else {
      // Insert
      const insertResult = await db.query(
        `INSERT INTO reviews (user_id, movie_id, rating, content, is_liked, contains_spoilers)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [userId, movie_id, parsedRating, content, is_liked, contains_spoilers]
      );
      reviewId = insertResult.rows[0].id;
    }

    // Recalculate average rating for the movie
    await db.query(
      `UPDATE movies 
       SET average_rating = (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE movie_id = $1)
       WHERE id = $1`,
      [movie_id]
    );

    // Sync movie like state with general likes table
    if (is_liked) {
      // Add to likes table if not already present
      const likeCheck = await db.query(
        'SELECT 1 FROM likes WHERE user_id = $1 AND movie_id = $2',
        [userId, movie_id]
      );
      if (likeCheck.rows.length === 0) {
        await db.query(
          'INSERT INTO likes (user_id, movie_id) VALUES ($1, $2)',
          [userId, movie_id]
        );
      }
    } else {
      // Remove from likes table
      await db.query(
        'DELETE FROM likes WHERE user_id = $1 AND movie_id = $2',
        [userId, movie_id]
      );
    }

    res.json({ success: true, message: 'Review saved successfully.', reviewId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error. Failed to save review.' });
  }
});

// Delete Review
router.delete('/:id', authenticateToken, async (req, res) => {
  const reviewId = parseInt(req.params.id);
  const userId = req.user.id;

  try {
    // Check ownership
    const check = await db.query(
      'SELECT movie_id FROM reviews WHERE id = $1 AND user_id = $2',
      [reviewId, userId]
    );

    if (check.rows.length === 0) {
      return res.status(403).json({ error: 'Unauthorized to delete this review, or review does not exist.' });
    }

    const movieId = check.rows[0].movie_id;

    // Delete
    await db.query('DELETE FROM reviews WHERE id = $1', [reviewId]);

    // Recalculate average rating for the movie
    await db.query(
      `UPDATE movies 
       SET average_rating = (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE movie_id = $1)
       WHERE id = $1`,
      [movieId]
    );

    res.json({ message: 'Review deleted successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error. Failed to delete review.' });
  }
});

module.exports = router;
