const db = require('../src/config/db');

const queries = [
  "UPDATE movies SET poster_url = 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg', backdrop_url = 'https://image.tmdb.org/t/p/w1280/TU9NIjwzjoKPwQHoHshkFcQUCG.jpg' WHERE title = 'Parasite'",
  "UPDATE movies SET poster_url = 'https://image.tmdb.org/t/p/w500/ljsZTbVsrQSqZgWeep2B1QiDKuh.jpg', backdrop_url = 'https://image.tmdb.org/t/p/w1280/s3TBrRGB1iav7gFOCNx3H31MoES.jpg' WHERE title = 'Inception'",
  "UPDATE movies SET poster_url = 'https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg', backdrop_url = 'https://image.tmdb.org/t/p/w1280/suaEOtk1N1sgg2MTM7oZd2cfVp3.jpg' WHERE title = 'Pulp Fiction'",
  "UPDATE movies SET poster_url = 'https://image.tmdb.org/t/p/w500/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg', backdrop_url = 'https://image.tmdb.org/t/p/w1280/bSavCvLrFNRZFNBYkZxhFxST8xS.jpg' WHERE title = 'Spirited Away'",
  "UPDATE movies SET poster_url = 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg', backdrop_url = 'https://image.tmdb.org/t/p/w1280/hqkIcbrOHL86UncnHIsHVcVmzue.jpg' WHERE title = 'The Dark Knight'",
  "UPDATE movies SET poster_url = 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg', backdrop_url = 'https://image.tmdb.org/t/p/w1280/xJHokMbljvjADYdit5fK5VQsXEG.jpg' WHERE title = 'Interstellar'",
  "UPDATE movies SET poster_url = 'https://image.tmdb.org/t/p/w500/7WsyChwLEasfb6o31k408e9z1kF.jpg', backdrop_url = 'https://image.tmdb.org/t/p/w1280/8s4X96gh9STui0SSZqJmRszF823.jpg' WHERE title = 'Everything Everywhere All at Once'",
  "UPDATE movies SET poster_url = 'https://image.tmdb.org/t/p/w500/7fn624j5lj3xTme2SgiLCeuedmO.jpg', backdrop_url = 'https://image.tmdb.org/t/p/w1280/fRGxZuo7jJUWQsVg9PREb98Aclp.jpg' WHERE title = 'Whiplash'"
];

async function fixUrls() {
  try {
    console.log('Executing DB updates...');
    for (const q of queries) {
      await db.query(q);
    }
    console.log('Database URLs updated successfully!');
  } catch (err) {
    console.error('Error updating URLs:', err);
  } finally {
    process.exit(0);
  }
}

fixUrls();
