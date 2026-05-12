-- Migration: Add tmdb_id support to movies table
ALTER TABLE movies ADD COLUMN tmdb_id INT UNIQUE NULL AFTER id;
CREATE INDEX idx_tmdb_id ON movies(tmdb_id);

-- Update seed movies with real TMDB IDs
UPDATE movies SET tmdb_id = 62     WHERE title = '2001: A Space Odyssey';
UPDATE movies SET tmdb_id = 335984 WHERE title = 'Blade Runner 2049';
UPDATE movies SET tmdb_id = 27205  WHERE title = 'Inception';
UPDATE movies SET tmdb_id = 238    WHERE title = 'The Godfather';
UPDATE movies SET tmdb_id = 157336 WHERE title = 'Interstellar';
UPDATE movies SET tmdb_id = 496243 WHERE title = 'Parasite';
UPDATE movies SET tmdb_id = 155    WHERE title = 'The Dark Knight';
UPDATE movies SET tmdb_id = 129    WHERE title = 'Spirited Away';
UPDATE movies SET tmdb_id = 680    WHERE title = 'Pulp Fiction';
UPDATE movies SET tmdb_id = 244786 WHERE title = 'Whiplash';
UPDATE movies SET tmdb_id = 9457   WHERE title = 'Oldboy';
UPDATE movies SET tmdb_id = 120467 WHERE title = 'The Grand Budapest Hotel';
