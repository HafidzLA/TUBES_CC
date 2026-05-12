#!/bin/bash
set -e

echo "=== [DB VM] Installing MySQL ==="

export DEBIAN_FRONTEND=noninteractive

apt-get update -qq
apt-get install -y mysql-server

# Allow remote connections
sed -i "s/bind-address\s*=\s*127.0.0.1/bind-address = 0.0.0.0/" /etc/mysql/mysql.conf.d/mysqld.cnf

systemctl restart mysql
systemctl enable mysql

echo "=== [DB VM] Setting up database and user ==="

mysql -u root <<EOF
CREATE DATABASE IF NOT EXISTS letterboxd CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'appuser'@'%' IDENTIFIED BY 'AppPass123!';
GRANT ALL PRIVILEGES ON letterboxd.* TO 'appuser'@'%';
FLUSH PRIVILEGES;

USE letterboxd;

CREATE TABLE IF NOT EXISTS movies (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  title       VARCHAR(255) NOT NULL,
  year        YEAR NOT NULL,
  director    VARCHAR(255) NOT NULL,
  genre       VARCHAR(100),
  synopsis    TEXT,
  poster_url  VARCHAR(500),
  backdrop_url VARCHAR(500),
  rating_avg  DECIMAL(3,2) DEFAULT 0,
  rating_count INT DEFAULT 0,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  username   VARCHAR(50) UNIQUE NOT NULL,
  email      VARCHAR(255) UNIQUE NOT NULL,
  avatar_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reviews (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  movie_id   INT NOT NULL,
  user_id    INT NOT NULL,
  rating     TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body       TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id)  REFERENCES users(id)  ON DELETE CASCADE,
  UNIQUE KEY unique_review (movie_id, user_id)
);

CREATE TABLE IF NOT EXISTS watchlist (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  movie_id   INT NOT NULL,
  user_id    INT NOT NULL,
  added_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id)  REFERENCES users(id)  ON DELETE CASCADE,
  UNIQUE KEY unique_watchlist (movie_id, user_id)
);

-- Seed default user
INSERT IGNORE INTO users (id, username, email, avatar_url) VALUES
(1, 'cinephile', 'cinephile@letterboxd.local', 'https://api.dicebear.com/7.x/avataaars/svg?seed=cinephile');

-- Seed movies
INSERT IGNORE INTO movies (id, title, year, director, genre, synopsis, poster_url, backdrop_url) VALUES
(1, 'Inception', 2010, 'Christopher Nolan', 'Sci-Fi Thriller',
 'A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
 'https://image.tmdb.org/t/p/w500/ljsZTbVsrQSqZgWeep2B1QiDKuh.jpg',
 'https://image.tmdb.org/t/p/w1280/s3TBrRGB1iav7gFOCNx3H31MoES.jpg'),
(2, 'The Godfather', 1972, 'Francis Ford Coppola', 'Crime Drama',
 'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.',
 'https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsLeFHIKxD963.jpg',
 'https://image.tmdb.org/t/p/w1280/tmU7GeKVybMWFButWEGl2M4GeiP.jpg'),
(3, 'Interstellar', 2014, 'Christopher Nolan', 'Sci-Fi Adventure',
 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity''s survival.',
 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
 'https://image.tmdb.org/t/p/w1280/xJHokMbljvjADYdit5fK5VQsXEG.jpg'),
(4, 'Parasite', 2019, 'Bong Joon-ho', 'Thriller Drama',
 'Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.',
 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
 'https://image.tmdb.org/t/p/w1280/TU9NIjwzjoKPwQHoHshkFcQUCG.jpg'),
(5, 'The Dark Knight', 2008, 'Christopher Nolan', 'Action Thriller',
 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests.',
 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
 'https://image.tmdb.org/t/p/w1280/hqkIcbrOHL86UncnHIsHVcVmzue.jpg'),
(6, 'Spirited Away', 2001, 'Hayao Miyazaki', 'Animation Fantasy',
 'During her family''s move to the suburbs, a sullen 10-year-old girl wanders into a world ruled by gods, witches, and spirits.',
 'https://image.tmdb.org/t/p/w500/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg',
 'https://image.tmdb.org/t/p/w1280/bSavCvLrFNRZFNBYkZxhFxST8xS.jpg'),
(7, 'Pulp Fiction', 1994, 'Quentin Tarantino', 'Crime Drama',
 'The lives of two mob hitmen, a boxer, a gangster and his wife intertwine in four tales of violence and redemption.',
 'https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
 'https://image.tmdb.org/t/p/w1280/suaEOtk1N1sgg2MTM7oZd2cfVp3.jpg'),
(8, 'Whiplash', 2014, 'Damien Chazelle', 'Drama',
 'A promising young drummer enrolls at a cut-throat music conservatory where his dreams of greatness are mentored by an abusive instructor.',
 'https://image.tmdb.org/t/p/w500/7fn624j5lj3xTme2SgiLCeuedmO.jpg',
 'https://image.tmdb.org/t/p/w1280/fRGxZuo7jJUWQsVg9PREb98Aclp.jpg'),
(9, '2001: A Space Odyssey', 1968, 'Stanley Kubrick', 'Sci-Fi',
 'After discovering a mysterious artifact buried beneath the Lunar surface, mankind sets off on a quest to find its origins.',
 'https://image.tmdb.org/t/p/w500/ve72VxNqjGM69Uky4WTo2bK6rfq.jpg',
 'https://image.tmdb.org/t/p/w1280/bSavCvLrFNRZFNBYkZxhFxST8xS.jpg'),
(10, 'Oldboy', 2003, 'Park Chan-wook', 'Mystery Thriller',
 'After being kidnapped and imprisoned for fifteen years, Oh Dae-Su is released, only to find that he must find his captor in five days.',
 'https://image.tmdb.org/t/p/w500/pWDtjs568ZfOTMbURQBYuT4Qxka.jpg',
 'https://image.tmdb.org/t/p/w1280/qJ2tW6WMUDux911r6m7haRef0WH.jpg'),
(11, 'The Grand Budapest Hotel', 2014, 'Wes Anderson', 'Comedy Drama',
 'A writer encounters the owner of an aging European hotel between the wars who tells him of his early years serving as a lobby boy.',
 'https://image.tmdb.org/t/p/w500/eWdyYQreja6JGCzqHWXpWHDrrPo.jpg',
 'https://image.tmdb.org/t/p/w1280/vSNFBnIBgHEbzHXm4W2RRKEPxNS.jpg'),
(12, 'Blade Runner 2049', 2017, 'Denis Villeneuve', 'Sci-Fi Noir',
 'A young blade runner''s discovery of a long-buried secret leads him to track down former blade runner Rick Deckard.',
 'https://image.tmdb.org/t/p/w500/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg',
 'https://image.tmdb.org/t/p/w1280/ilRyazdMJwN3JLOP3BbdTGmKdgS.jpg');

EOF

echo "=== [DB VM] MySQL setup complete! ==="
