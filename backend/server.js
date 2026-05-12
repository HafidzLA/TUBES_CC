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
