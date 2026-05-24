const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get User Profile Metadata and Statistics
router.get('/:username', async (req, res) => {
  const { username } = req.params;

  try {
    // Get user details
    const userResult = await db.query(
      'SELECT id, username, bio, avatar_url, created_at FROM users WHERE username = $1',
      [username]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const user = userResult.rows[0];
    const userId = user.id;

    // Get count of movies watched (reviews count)
    const watchedCountResult = await db.query(
      'SELECT COUNT(DISTINCT movie_id) FROM reviews WHERE user_id = $1',
      [userId]
    );
    const watchedCount = parseInt(watchedCountResult.rows[0].count);

    // Get count of liked movies
    const likesCountResult = await db.query(
      'SELECT COUNT(*) FROM likes WHERE user_id = $1',
      [userId]
    );
    const likesCount = parseInt(likesCountResult.rows[0].count);

    // Get count of watchlist items
    const watchlistCountResult = await db.query(
      'SELECT COUNT(*) FROM watchlists WHERE user_id = $1',
      [userId]
    );
    const watchlistCount = parseInt(watchlistCountResult.rows[0].count);

    // Get rating distribution (10 ratings from 0.5 to 5.0 in 0.5 increments)
    const ratingDistResult = await db.query(
      `SELECT rating, COUNT(*) as count 
       FROM reviews 
       WHERE user_id = $1 
       GROUP BY rating 
       ORDER BY rating ASC`,
      [userId]
    );

    // Initialize rating distribution dictionary
    const ratingDistribution = {
      "0.5": 0, "1.0": 0, "1.5": 0, "2.0": 0, "2.5": 0,
      "3.0": 0, "3.5": 0, "4.0": 0, "4.5": 0, "5.0": 0
    };

    ratingDistResult.rows.forEach(row => {
      const ratingStr = parseFloat(row.rating).toFixed(1);
      if (ratingDistribution[ratingStr] !== undefined) {
        ratingDistribution[ratingStr] = parseInt(row.count);
      }
    });

    res.json({
      user: {
        id: user.id,
        username: user.username,
        bio: user.bio,
        avatar_url: user.avatar_url,
        created_at: user.created_at
      },
      stats: {
        watchedCount,
        likesCount,
        watchlistCount,
        ratingDistribution
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error. Failed to load user profile statistics.' });
  }
});

// Get User Watchlist
router.get('/:username/watchlist', async (req, res) => {
  const { username } = req.params;

  try {
    const userCheck = await db.query('SELECT id FROM users WHERE username = $1', [username]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }
    const userId = userCheck.rows[0].id;

    const result = await db.query(
      `SELECT m.id, m.title, m.release_year, m.poster_url, m.average_rating, w.added_at
       FROM watchlists w
       JOIN movies m ON w.movie_id = m.id
       WHERE w.user_id = $1
       ORDER BY w.added_at DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error. Failed to load watchlist.' });
  }
});

// Get User Diary (Reviews history)
router.get('/:username/diary', async (req, res) => {
  const { username } = req.params;

  try {
    const userCheck = await db.query('SELECT id FROM users WHERE username = $1', [username]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }
    const userId = userCheck.rows[0].id;

    const result = await db.query(
      `SELECT r.id, r.rating, r.content, r.is_liked, r.contains_spoilers, r.created_at,
              m.id as movie_id, m.title, m.release_year, m.poster_url, m.director
       FROM reviews r
       JOIN movies m ON r.movie_id = m.id
       WHERE r.user_id = $1
       ORDER BY r.created_at DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error. Failed to load review diary.' });
  }
});

// Get User Liked Movies
router.get('/:username/likes', async (req, res) => {
  const { username } = req.params;

  try {
    const userCheck = await db.query('SELECT id FROM users WHERE username = $1', [username]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }
    const userId = userCheck.rows[0].id;

    const result = await db.query(
      `SELECT m.id, m.title, m.release_year, m.poster_url, m.average_rating
       FROM likes l
       JOIN movies m ON l.movie_id = m.id
       WHERE l.user_id = $1
       ORDER BY l.created_at DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error. Failed to load liked movies.' });
  }
});

module.exports = router;
