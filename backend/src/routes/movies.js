const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authenticateToken = require('../middleware/auth');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'shutter_score_secret_jwt_key_2026';

// Helper to check token optionally
const getOptionalUser = (req) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
};

// Get Movies (List with sorting & filtering)
router.get('/', async (req, res) => {
  const { genre, sort, limit = 20 } = req.query;
  let queryText = 'SELECT * FROM movies';
  let queryParams = [];

  if (genre) {
    queryText += ' WHERE genres ILIKE $1';
    queryParams.push(`%${genre}%`);
  }

  if (sort === 'rating') {
    queryText += ' ORDER BY average_rating DESC';
  } else if (sort === 'year') {
    queryText += ' ORDER BY release_year DESC';
  } else {
    queryText += ' ORDER BY id ASC';
  }

  queryText += ` LIMIT $${queryParams.length + 1}`;
  queryParams.push(limit);

  try {
    const result = await db.query(queryText, queryParams);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error. Failed to fetch movies.' });
  }
});

// Helper to resolve TMDB ID or Local ID to Local DB primary key ID
const resolveMovieId = async (id) => {
  const parsedId = parseInt(id);
  if (isNaN(parsedId)) return null;
  
  // Check if it is a local primary key first
  let result = await db.query('SELECT id FROM movies WHERE id = $1', [parsedId]);
  if (result.rows.length > 0) {
    return result.rows[0].id;
  }
  
  // Check if it matches tmdb_id
  result = await db.query('SELECT id FROM movies WHERE tmdb_id = $1', [parsedId]);
  if (result.rows.length > 0) {
    return result.rows[0].id;
  }
  
  return null;
};

// Search Movies (Local DB + TMDb API)
router.get('/search', async (req, res) => {
  const { q } = req.query;

  if (!q) {
    return res.json([]);
  }

  try {
    // 1. Search local database
    const localResults = await db.query(
      'SELECT * FROM movies WHERE title ILIKE $1 OR director ILIKE $1 OR genres ILIKE $1 LIMIT 10',
      [`%${q}%`]
    );
    let movies = localResults.rows;

    // 2. Search TMDb API if key is available
    if (process.env.TMDB_API_KEY) {
      try {
        const tmdbRes = await fetch(
          `https://api.themoviedb.org/3/search/movie?api_key=${process.env.TMDB_API_KEY}&query=${encodeURIComponent(q)}`
        );
        if (tmdbRes.ok) {
          const tmdbData = await tmdbRes.json();
          const tmdbMovies = tmdbData.results.slice(0, 8).map(m => ({
            id: m.id, // TMDb ID used to fetch details later
            title: m.title,
            release_year: m.release_date ? parseInt(m.release_date.split('-')[0]) : 0,
            director: 'TMDb Movie',
            genres: 'Film',
            synopsis: m.overview || '',
            poster_url: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : 'https://via.placeholder.com/200x300/1c252d/ffffff?text=No+Poster',
            backdrop_url: m.backdrop_path ? `https://image.tmdb.org/t/p/w1280${m.backdrop_path}` : '',
            average_rating: m.vote_average ? (m.vote_average / 2).toFixed(1) : '0.00', // Scale 10 to 5 stars
            is_tmdb: true
          }));

          // Filter out TMDb movies that already exist locally (by matching tmdb_id)
          const localTmdbIds = movies.map(lm => lm.tmdb_id).filter(id => id !== null);
          const filteredTmdbMovies = tmdbMovies.filter(tm => !localTmdbIds.includes(tm.id));

          movies = [...movies, ...filteredTmdbMovies];
        }
      } catch (tmdbErr) {
        console.error('TMDb search error:', tmdbErr);
      }
    }

    res.json(movies);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error. Search failed.' });
  }
});

// Get popular movies
router.get('/popular', async (req, res) => {
  const limit = parseInt(req.query.limit) || 20;
  if (process.env.TMDB_API_KEY) {
    try {
      const tmdbRes = await fetch(
        `https://api.themoviedb.org/3/movie/popular?api_key=${process.env.TMDB_API_KEY}&page=1`
      );
      if (tmdbRes.ok) {
        const tmdbData = await tmdbRes.json();
        const movies = tmdbData.results.slice(0, limit).map(m => ({
          id: m.id,
          title: m.title,
          release_year: m.release_date ? parseInt(m.release_date.split('-')[0]) : 0,
          director: 'TMDb Movie',
          genres: 'Film',
          synopsis: m.overview || '',
          poster_url: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : 'https://via.placeholder.com/200x300/1c252d/ffffff?text=No+Poster',
          backdrop_url: m.backdrop_path ? `https://image.tmdb.org/t/p/w1280${m.backdrop_path}` : '',
          average_rating: m.vote_average ? (m.vote_average / 2).toFixed(1) : '0.00',
          is_tmdb: true
        }));
        return res.json(movies);
      }
    } catch (err) {
      console.error('TMDb popular fetch error:', err);
    }
  }

  // Fallback to local DB
  try {
    const result = await db.query('SELECT * FROM movies ORDER BY average_rating DESC LIMIT $1', [limit]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// Get top rated movies
router.get('/top-rated', async (req, res) => {
  const limit = parseInt(req.query.limit) || 20;
  if (process.env.TMDB_API_KEY) {
    try {
      const tmdbRes = await fetch(
        `https://api.themoviedb.org/3/movie/top_rated?api_key=${process.env.TMDB_API_KEY}&page=1`
      );
      if (tmdbRes.ok) {
        const tmdbData = await tmdbRes.json();
        const movies = tmdbData.results.slice(0, limit).map(m => ({
          id: m.id,
          title: m.title,
          release_year: m.release_date ? parseInt(m.release_date.split('-')[0]) : 0,
          director: 'TMDb Movie',
          genres: 'Film',
          synopsis: m.overview || '',
          poster_url: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : 'https://via.placeholder.com/200x300/1c252d/ffffff?text=No+Poster',
          backdrop_url: m.backdrop_path ? `https://image.tmdb.org/t/p/w1280${m.backdrop_path}` : '',
          average_rating: m.vote_average ? (m.vote_average / 2).toFixed(1) : '0.00',
          is_tmdb: true
        }));
        return res.json(movies);
      }
    } catch (err) {
      console.error('TMDb top_rated fetch error:', err);
    }
  }

  // Fallback to local DB
  try {
    const result = await db.query('SELECT * FROM movies ORDER BY average_rating DESC LIMIT $1', [limit]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// Get now playing movies
router.get('/now-playing', async (req, res) => {
  const limit = parseInt(req.query.limit) || 20;
  if (process.env.TMDB_API_KEY) {
    try {
      const tmdbRes = await fetch(
        `https://api.themoviedb.org/3/movie/now_playing?api_key=${process.env.TMDB_API_KEY}&page=1`
      );
      if (tmdbRes.ok) {
        const tmdbData = await tmdbRes.json();
        const movies = tmdbData.results.slice(0, limit).map(m => ({
          id: m.id,
          title: m.title,
          release_year: m.release_date ? parseInt(m.release_date.split('-')[0]) : 0,
          director: 'TMDb Movie',
          genres: 'Film',
          synopsis: m.overview || '',
          poster_url: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : 'https://via.placeholder.com/200x300/1c252d/ffffff?text=No+Poster',
          backdrop_url: m.backdrop_path ? `https://image.tmdb.org/t/p/w1280${m.backdrop_path}` : '',
          average_rating: m.vote_average ? (m.vote_average / 2).toFixed(1) : '0.00',
          is_tmdb: true
        }));
        return res.json(movies);
      }
    } catch (err) {
      console.error('TMDb now_playing fetch error:', err);
    }
  }

  // Fallback to local DB
  try {
    const result = await db.query('SELECT * FROM movies ORDER BY release_year DESC LIMIT $1', [limit]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// Get Movie Details by ID (Dynamically imports from TMDb if missing)
router.get('/:id', async (req, res) => {
  const idParam = parseInt(req.params.id);
  if (isNaN(idParam)) {
    return res.status(400).json({ error: 'Invalid movie ID.' });
  }

  try {
    // 1. Try to find movie locally (either by serial ID or tmdb_id)
    let movieResult = await db.query('SELECT * FROM movies WHERE id = $1', [idParam]);
    if (movieResult.rows.length === 0) {
      movieResult = await db.query('SELECT * FROM movies WHERE tmdb_id = $1', [idParam]);
    }

    // 2. If not found locally, fetch from TMDb and save it
    if (movieResult.rows.length === 0 && process.env.TMDB_API_KEY) {
      try {
        const detailsRes = await fetch(
          `https://api.themoviedb.org/3/movie/${idParam}?api_key=${process.env.TMDB_API_KEY}`
        );
        
        if (detailsRes.ok) {
          const detail = await detailsRes.json();
          
          let director = 'Unknown';
          let cast = 'Unknown';
          
          const creditsRes = await fetch(
            `https://api.themoviedb.org/3/movie/${idParam}/credits?api_key=${process.env.TMDB_API_KEY}`
          );
          if (creditsRes.ok) {
            const credits = await creditsRes.json();
            const dirObj = credits.crew.find(c => c.job === 'Director');
            if (dirObj) director = dirObj.name;
            cast = credits.cast.slice(0, 5).map(c => c.name).join(', ');
          }

          const genresList = detail.genres.map(g => g.name).join(', ') || 'Drama';
          const releaseYear = detail.release_date ? parseInt(detail.release_date.split('-')[0]) : 0;
          const posterUrl = detail.poster_path ? `https://image.tmdb.org/t/p/w500${detail.poster_path}` : 'https://via.placeholder.com/200x300/1c252d/ffffff?text=No+Poster';
          const backdropUrl = detail.backdrop_path ? `https://image.tmdb.org/t/p/w1280${detail.backdrop_path}` : '';

          const insertResult = await db.query(
            `INSERT INTO movies (title, release_year, director, cast_members, genres, synopsis, poster_url, backdrop_url, average_rating, tmdb_id)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
             RETURNING *`,
            [detail.title, releaseYear, director, cast, genresList, detail.overview || '', posterUrl, backdropUrl, 0.00, idParam]
          );
          
          movieResult = insertResult;
        }
      } catch (tmdbErr) {
        console.error('TMDb details fetch failed:', tmdbErr);
      }
    }

    if (movieResult.rows.length === 0) {
      return res.status(404).json({ error: 'Movie not found.' });
    }

    const movie = movieResult.rows[0];
    const localId = movie.id; // Always use the local primary key ID for reviews/likes/watchlists
    let userState = { liked: false, watchlisted: false, logged: false, userRating: 0 };

    // Check optional user session
    const userSession = getOptionalUser(req);
    if (userSession) {
      const likeCheck = await db.query(
        'SELECT 1 FROM likes WHERE user_id = $1 AND movie_id = $2',
        [userSession.id, localId]
      );
      userState.liked = likeCheck.rows.length > 0;

      const watchlistCheck = await db.query(
        'SELECT 1 FROM watchlists WHERE user_id = $1 AND movie_id = $2',
        [userSession.id, localId]
      );
      userState.watchlisted = watchlistCheck.rows.length > 0;

      const reviewCheck = await db.query(
        'SELECT rating FROM reviews WHERE user_id = $1 AND movie_id = $2 LIMIT 1',
        [userSession.id, localId]
      );
      if (reviewCheck.rows.length > 0) {
        userState.logged = true;
        userState.userRating = parseFloat(reviewCheck.rows[0].rating);
      }
    }

    res.json({ movie, userState });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error. Failed to fetch movie details.' });
  }
});

// Get Movie Reviews
router.get('/:id/reviews', async (req, res) => {
  try {
    const localId = await resolveMovieId(req.params.id);
    if (!localId) {
      return res.json([]);
    }

    const result = await db.query(
      `SELECT r.id, r.rating, r.content, r.is_liked, r.contains_spoilers, r.created_at,
              u.id as user_id, u.username, u.avatar_url
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.movie_id = $1
       ORDER BY r.created_at DESC`,
      [localId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error. Failed to fetch reviews.' });
  }
});

// Toggle Like
router.post('/:id/like', authenticateToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const localId = await resolveMovieId(req.params.id);
    if (!localId) {
      return res.status(404).json({ error: 'Movie not found.' });
    }

    const check = await db.query(
      'SELECT 1 FROM likes WHERE user_id = $1 AND movie_id = $2',
      [userId, localId]
    );

    if (check.rows.length > 0) {
      await db.query(
        'DELETE FROM likes WHERE user_id = $1 AND movie_id = $2',
        [userId, localId]
      );
      res.json({ liked: false, message: 'Unliked movie.' });
    } else {
      await db.query(
        'INSERT INTO likes (user_id, movie_id) VALUES ($1, $2)',
        [userId, localId]
      );
      res.json({ liked: true, message: 'Liked movie.' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error. Action failed.' });
  }
});

// Toggle Watchlist
router.post('/:id/watchlist', authenticateToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const localId = await resolveMovieId(req.params.id);
    if (!localId) {
      return res.status(404).json({ error: 'Movie not found.' });
    }

    const check = await db.query(
      'SELECT 1 FROM watchlists WHERE user_id = $1 AND movie_id = $2',
      [userId, localId]
    );

    if (check.rows.length > 0) {
      await db.query(
        'DELETE FROM watchlists WHERE user_id = $1 AND movie_id = $2',
        [userId, localId]
      );
      res.json({ watchlisted: false, message: 'Removed from watchlist.' });
    } else {
      await db.query(
        'INSERT INTO watchlists (user_id, movie_id) VALUES ($1, $2)',
        [userId, localId]
      );
      res.json({ watchlisted: true, message: 'Added to watchlist.' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error. Action failed.' });
  }
});

module.exports = router;
