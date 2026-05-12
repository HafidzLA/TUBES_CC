// TMDB API helper
// Get your FREE key at: https://www.themoviedb.org/settings/api
const KEY  = import.meta.env.VITE_TMDB_KEY;
const BASE = 'https://api.themoviedb.org/3';
export const IMG  = (path, size = 'w500') =>
  path ? `https://image.tmdb.org/t/p/${size}${path}` : null;

// Fallback data if API key fails
const MOCK_MOVIES = [
  { id: 27205, title: 'Inception', release_date: '2010-07-15', overview: 'A thief who steals corporate secrets through dream-sharing technology...', poster_path: '/ljsZTbVsrQSqZgWeep2B1QiDKuh.jpg', backdrop_path: '/s3TBrRGB1iav7gFOCNx3H31MoES.jpg', vote_average: 8.4, vote_count: 34000 },
  { id: 157336, title: 'Interstellar', release_date: '2014-11-05', overview: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.', poster_path: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg', backdrop_path: '/xJHokMbljvjADYdit5fK5VQsXEG.jpg', vote_average: 8.6, vote_count: 31000 },
  { id: 496243, title: 'Parasite', release_date: '2019-05-30', overview: 'All unemployed, Ki-taek\'s family takes peculiar interest in the wealthy and glamorous Parks for their livelihood until they get entangled in an unexpected incident.', poster_path: '/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg', backdrop_path: '/TU9NIjwzjoKPwQHoHshkFcQUCG.jpg', vote_average: 8.5, vote_count: 15000 },
  { id: 155, title: 'The Dark Knight', release_date: '2008-07-16', overview: 'Batman raises the stakes in his war on crime. With the help of Lt. Jim Gordon and District Attorney Harvey Dent, Batman sets out to dismantle the remaining criminal organizations that plague the streets.', poster_path: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg', backdrop_path: '/hqkIcbrOHL86UncnHIsHVcVmzue.jpg', vote_average: 8.5, vote_count: 30000 },
  { id: 335984, title: 'Blade Runner 2049', release_date: '2017-10-04', overview: 'Thirty years after the events of the first film, a new blade runner, LAPD Officer K, unearths a long-buried secret that has the potential to plunge what\'s left of society into chaos.', poster_path: '/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg', backdrop_path: '/ilRyazdMJwN3JLOP3BbdTGmKdgS.jpg', vote_average: 7.6, vote_count: 12000 },
  { id: 244786, title: 'Whiplash', release_date: '2014-10-10', overview: 'Under the direction of a ruthless instructor, a talented young drummer begins to pursue perfection at any cost, even his humanity.', poster_path: '/7fn624j5lj3xTme2SgiLCeuedmO.jpg', backdrop_path: '/fRGxZuo7jJUWQsVg9PREb98Aclp.jpg', vote_average: 8.4, vote_count: 13000 }
];

const req = async (path, params = {}) => {
  const url = new URL(BASE + path);
  url.searchParams.set('api_key', KEY);
  url.searchParams.set('language', 'en-US');
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('API Error');
    return await res.json();
  } catch (err) {
    console.warn("TMDB API failed/missing key. Using fallback mock data.");
    
    // Check if path is a specific movie ID (contains numbers at the end)
    const isDetail = /\/movie\/\d+/.test(path);
    
    if (isDetail) {
      const id = parseInt(path.split('/').pop());
      const mockMovie = MOCK_MOVIES.find(m => m.id === id) || MOCK_MOVIES[0];
      return mockMovie;
    }
    
    // Otherwise it's a list (popular, search, etc)
    return {
      page: 1,
      results: MOCK_MOVIES.sort(() => Math.random() - 0.5),
      total_pages: 1,
      total_results: MOCK_MOVIES.length
    };
  }
};

export const tmdb = {
  popular:    (page = 1) => req('/movie/popular',    { page }),
  topRated:   (page = 1) => req('/movie/top_rated',  { page }),
  nowPlaying: (page = 1) => req('/movie/now_playing', { page }),
  upcoming:   (page = 1) => req('/movie/upcoming',   { page }),
  search:     (query, page = 1) => req('/search/movie', { query, page }),
  detail:     (id)       => req(`/movie/${id}`, { append_to_response: 'credits' }),
  hasKey: () => !!KEY,
};

/** Transform TMDB movie to our app format */
export function fromTmdb(m) {
  const director = m.credits?.crew?.find(c => c.job === 'Director');
  return {
    tmdb_id:      m.id,
    title:        m.title,
    year:         m.release_date ? new Date(m.release_date).getFullYear() : 0,
    director:     director?.name || 'Unknown',
    genre:        (m.genres || []).map(g => g.name).join(', ') || m.genre_ids?.join(', ') || '',
    synopsis:     m.overview || '',
    poster_url:   IMG(m.poster_path),
    backdrop_url: IMG(m.backdrop_path, 'w1280'),
    rating_avg:   m.vote_average,
    rating_count: m.vote_count,
  };
}
