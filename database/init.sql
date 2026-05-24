-- Drop tables if they exist
DROP TABLE IF EXISTS likes CASCADE;
DROP TABLE IF EXISTS watchlists CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS movies CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    bio TEXT DEFAULT '',
    avatar_url VARCHAR(255) DEFAULT '/avatars/default.png',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Movies Table
CREATE TABLE movies (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    release_year INT NOT NULL,
    director VARCHAR(255) NOT NULL,
    cast_members TEXT NOT NULL,
    genres VARCHAR(255) NOT NULL,
    synopsis TEXT NOT NULL,
    poster_url VARCHAR(255) NOT NULL,
    backdrop_url VARCHAR(255) NOT NULL,
    average_rating DECIMAL(3, 2) DEFAULT 0.00,
    tmdb_id INT UNIQUE
);

-- Reviews Table
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    movie_id INT REFERENCES movies(id) ON DELETE CASCADE,
    rating DECIMAL(2, 1) CHECK (rating >= 0.5 AND rating <= 5.0) NOT NULL,
    content TEXT DEFAULT '',
    is_liked BOOLEAN DEFAULT FALSE,
    contains_spoilers BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Watchlists Table (Junction)
CREATE TABLE watchlists (
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    movie_id INT REFERENCES movies(id) ON DELETE CASCADE,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, movie_id)
);

-- Likes Table (Junction for users liking movies directly)
CREATE TABLE likes (
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    movie_id INT REFERENCES movies(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, movie_id)
);

-- Index for speed
CREATE INDEX idx_reviews_movie_id ON reviews(movie_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);

-- Seed Movies
INSERT INTO movies (title, release_year, director, cast_members, genres, synopsis, poster_url, backdrop_url, average_rating) VALUES
(
    'Parasite', 
    2019, 
    'Bong Joon Ho', 
    'Song Kang-ho, Lee Sun-kyun, Cho Yeo-jeong, Choi Woo-shik, Park So-dam', 
    'Thriller, Drama, Comedy', 
    'Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.', 
    '/posters/parasite.jpg', 
    '/backdrops/parasite.jpg',
    4.60
),
(
    'Inception', 
    2010, 
    'Christopher Nolan', 
    'Leonardo DiCaprio, Ken Watanabe, Joseph Gordon-Levitt, Marion Cotillard, Elliot Page', 
    'Sci-Fi, Action, Thriller', 
    'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.', 
    '/posters/inception.jpg', 
    '/backdrops/inception.jpg',
    4.45
),
(
    'Pulp Fiction', 
    1994, 
    'Quentin Tarantino', 
    'John Travolta, Samuel L. Jackson, Uma Thurman, Bruce Willis, Ving Rhames', 
    'Crime, Thriller', 
    'The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.', 
    '/posters/pulp_fiction.jpg', 
    '/backdrops/pulp_fiction.jpg',
    4.55
),
(
    'Spirited Away', 
    2001, 
    'Hayao Miyazaki', 
    'Rumi Hiiragi, Miyu Irino, Mari Natsuki, Takashi Naito, Yasuko Sawaguchi', 
    'Animation, Fantasy, Family', 
    'During her family''s move to the suburbs, a sullen 10-year-old girl wanders into a world ruled by gods, witches, and spirits, and where humans are changed into beasts.', 
    '/posters/spirited_away.jpg', 
    '/backdrops/spirited_away.jpg',
    4.65
),
(
    'The Dark Knight', 
    2008, 
    'Christopher Nolan', 
    'Christian Bale, Heath Ledger, Aaron Eckhart, Maggie Gyllenhaal, Gary Oldman', 
    'Action, Crime, Drama', 
    'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.', 
    '/posters/the_dark_knight.jpg', 
    '/backdrops/the_dark_knight.jpg',
    4.70
),
(
    'Interstellar', 
    2014, 
    'Christopher Nolan', 
    'Matthew McConaughey, Anne Hathaway, Jessica Chastain, Bill Irwin, Ellen Burstyn', 
    'Sci-Fi, Drama, Adventure', 
    'When Earth becomes uninhabitable, a team of explorers travels through a wormhole in space in an attempt to ensure humanity''s survival.', 
    '/posters/interstellar.jpg', 
    '/backdrops/interstellar.jpg',
    4.50
),
(
    'Everything Everywhere All at Once', 
    2022, 
    'Daniel Kwan, Daniel Scheinert', 
    'Michelle Yeoh, Ke Huy Quan, Stephanie Hsu, Jenny Slate, Jamie Lee Curtis', 
    'Sci-Fi, Comedy, Action, Drama', 
    'A middle-aged Chinese immigrant is swept up into an insane adventure in which she alone can save existence by exploring other universes and connecting with the lives she could have led.', 
    '/posters/everything_everywhere.jpg', 
    '/backdrops/everything_everywhere.jpg',
    4.40
),
(
    'Whiplash', 
    2014, 
    'Damien Chazelle', 
    'Miles Teller, J.K. Simmons, Paul Reiser, Melissa Benoist, Austin Stowell', 
    'Drama, Music', 
    'A promising young drummer enrolls at a cut-throat music conservatory where his dreams of greatness are mentored by an instructor who will stop at nothing to realize a student''s potential.', 
    '/posters/whiplash.jpg', 
    '/backdrops/whiplash.jpg',
    4.60
);

-- Seed Users
-- Passwords are encrypted hashes of 'password123'
INSERT INTO users (username, email, password_hash, bio, avatar_url) VALUES
(
    'cinephile99', 
    'cinephile99@shutterscore.com', 
    '$2a$10$7zB3LshbY/C.2471Gq5fQeF75jS2Z79VnL9fM.Xw10U.146kU9iG.', -- bcrypt hash of 'password123'
    'Watching movies is my full-time personality. Nolan fanboy, Miyazaki lover, Tarantino apologist.', 
    '/avatars/user1.png'
),
(
    'filmgirl', 
    'filmgirl@shutterscore.com', 
    '$2a$10$7zB3LshbY/C.2471Gq5fQeF75jS2Z79VnL9fM.Xw10U.146kU9iG.', -- bcrypt hash of 'password123'
    'Just someone who loves storytelling in all forms. Parasite changed my life.', 
    '/avatars/user2.png'
),
(
    'shutter_admin',
    'admin@shutterscore.com',
    '$2a$10$7zB3LshbY/C.2471Gq5fQeF75jS2Z79VnL9fM.Xw10U.146kU9iG.', -- bcrypt hash of 'password123'
    'Official admin of ShutterScore. Welcome to the cinema club!',
    '/avatars/admin.png'
);

-- Seed Reviews
INSERT INTO reviews (user_id, movie_id, rating, content, is_liked, contains_spoilers) VALUES
(1, 1, 5.0, 'An absolute masterpiece of modern cinema. Bong Joon Ho seamlessly blends genres—comedy, thriller, tragedy—to paint a biting critique of capitalism. The editing is perfect, the acting is top-tier, and the basement reveal is one of the greatest cinematic moments of the century.', TRUE, TRUE),
(1, 2, 4.5, 'Christopher Nolan at his absolute peak of narrative complexity. The dream levels are perfectly designed, and Hans Zimmers score is legendary. Mind-bending and emotionally resonant.', TRUE, FALSE),
(1, 5, 5.0, 'Heath Ledgers Joker is the greatest villain performance of all time. The film transcends the superhero genre and is a masterpiece of crime drama.', TRUE, FALSE),
(2, 1, 4.5, 'Incredible storytelling. Bong Joon Ho uses architectural space to display class disparity in a way that feels organic and terrifying. Left me speechless.', TRUE, FALSE),
(2, 4, 5.0, 'My absolute favorite film of all time. Miyazaki creates a magical, immersive world that feels so real. A beautiful coming-of-age story filled with wonder and depth.', TRUE, FALSE),
(2, 8, 4.5, 'Intense, electrifying, and exhausting in the best way. J.K. Simmons is absolutely terrifying. The final drum solo is one of the most stressful and thrilling sequences in film history.', TRUE, FALSE),
(3, 3, 4.5, 'Quintessential Tarantino. The dialogue, the non-linear structure, and the iconic soundtrack make this an endlessly rewatchable classic.', TRUE, FALSE);

-- Seed Watchlist
INSERT INTO watchlists (user_id, movie_id) VALUES
(1, 4),
(1, 6),
(2, 2),
(2, 7);

-- Seed Likes
INSERT INTO likes (user_id, movie_id) VALUES
(1, 1),
(1, 2),
(1, 5),
(2, 1),
(2, 4),
(2, 8);
