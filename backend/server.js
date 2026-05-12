const express    = require('express');
const cors       = require('cors');
const moviesRouter    = require('./routes/movies');
const reviewsRouter   = require('./routes/reviews');
const watchlistRouter = require('./routes/watchlist');
const profileRouter   = require('./routes/profile');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: '*' }));
app.use(express.json());

app.use('/api/movies',    moviesRouter);
app.use('/api/reviews',   reviewsRouter);
app.use('/api/watchlist', watchlistRouter);
app.use('/api/profile',   profileRouter);

app.get('/api/health', (_req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));

// Auto-setup endpoint for Cloud Database (Aiven)
app.get('/api/setup', async (req, res) => {
  try {
    const db = require('./db');
    await db.query(`
      CREATE TABLE IF NOT EXISTS movies (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tmdb_id INT UNIQUE NULL,
        title VARCHAR(255) NOT NULL,
        year YEAR NOT NULL,
        director VARCHAR(255) NOT NULL,
        genre VARCHAR(100),
        synopsis TEXT,
        poster_url VARCHAR(500),
        backdrop_url VARCHAR(500),
        rating_avg DECIMAL(3,2) DEFAULT 0,
        rating_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        avatar_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        movie_id INT NOT NULL,
        user_id INT NOT NULL,
        rating TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
        body TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_review (movie_id, user_id)
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS watchlist (
        id INT AUTO_INCREMENT PRIMARY KEY,
        movie_id INT NOT NULL,
        user_id INT NOT NULL,
        added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_watchlist (movie_id, user_id)
      )
    `);

    await db.query(`
      INSERT IGNORE INTO users (id, username, email, avatar_url) VALUES 
      (1, 'cinephile', 'cinephile@letterboxd.local', 'https://api.dicebear.com/7.x/avataaars/svg?seed=cinephile')
    `);

    res.json({ message: "Database tables created successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to setup database: " + error.message });
  }
});

app.use((_req, res) => res.status(404).json({ error: 'Not found' }));
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Export for Vercel serverless
module.exports = app;

if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🎬  Letterboxd API → http://0.0.0.0:${PORT}`);
  });
}
