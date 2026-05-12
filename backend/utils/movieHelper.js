const db = require('../db');

/**
 * Ensures a TMDB movie exists in the local DB.
 * Returns the local movie_id.
 * data: { tmdb_id, title, year, director, genre, synopsis, poster_url, backdrop_url }
 */
async function getOrCreateMovieId(data) {
  if (!data.tmdb_id) throw new Error('tmdb_id is required');

  const [rows] = await db.query('SELECT id FROM movies WHERE tmdb_id = ?', [data.tmdb_id]);
  if (rows.length > 0) return rows[0].id;

  const [result] = await db.query(
    `INSERT INTO movies (tmdb_id, title, year, director, genre, synopsis, poster_url, backdrop_url)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.tmdb_id,
      data.title,
      data.year || 0,
      data.director || '',
      data.genre || '',
      data.synopsis || '',
      data.poster_url || '',
      data.backdrop_url || '',
    ]
  );
  return result.insertId;
}

module.exports = { getOrCreateMovieId };
