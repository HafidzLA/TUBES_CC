import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MovieCard from '../components/MovieCard';
import StarRating from '../components/StarRating';
import { User, Film, BookOpen, Heart, Eye, ListVideo, Calendar } from 'lucide-react';
import UserAvatar from '../components/UserAvatar';
import './Profile.css';

const Profile = () => {
  const { username } = useParams();
  const { user: currentUser, token, API_URL } = useAuth();
  
  const [profileData, setProfileData] = useState(null);
  const [activeTab, setActiveTab] = useState('diary'); // 'diary', 'watchlist', 'likes'
  const [diary, setDiary] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [likes, setLikes] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      
      // Fetch user profile info and stats
      const profileResponse = await fetch(`${API_URL}/api/users/${username}`);
      if (!profileResponse.ok) {
        throw new Error('User not found');
      }
      const data = await profileResponse.json();
      setProfileData(data);

      // Fetch diary logs
      const diaryResponse = await fetch(`${API_URL}/api/users/${username}/diary`);
      if (diaryResponse.ok) {
        const diaryData = await diaryResponse.json();
        setDiary(diaryData);
      }

      // Fetch watchlist
      const watchlistResponse = await fetch(`${API_URL}/api/users/${username}/watchlist`);
      if (watchlistResponse.ok) {
        const watchlistData = await watchlistResponse.json();
        setWatchlist(watchlistData);
      }

      // Fetch liked movies
      const likesResponse = await fetch(`${API_URL}/api/users/${username}/likes`);
      if (likesResponse.ok) {
        const likesData = await likesResponse.json();
        setLikes(likesData);
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [username]);

  if (loading) {
    return (
      <div className="container home-loading">
        <div className="spinner"></div>
        <p>Loading filmmaker portfolio...</p>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="container profile-error-page">
        <h2>We ran the credits but couldn't find the user.</h2>
        <p>{error || 'User not found.'}</p>
        <Link to="/" className="btn btn-primary">Go Home</Link>
      </div>
    );
  }

  const { user, stats } = profileData;
  const maxRatingCount = Math.max(...Object.values(stats.ratingDistribution), 1);
  const joinDate = new Date(user.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long'
  });

  return (
    <div className="profile-page animate-fade-in">
      
      {/* 1. HEADER PROFILE CARD */}
      <header className="profile-header-banner">
        <div className="container header-container">
          <div className="profile-info-block">
            <UserAvatar username={user.username} avatarUrl={user.avatar_url} size={80} className="profile-avatar-large" />
            <div className="profile-text">
              <h1 className="profile-username">{user.username}</h1>
              <p className="profile-join-date">
                <Calendar size={14} />
                Joined {joinDate}
              </p>
              {user.bio && <p className="profile-bio">{user.bio}</p>}
            </div>
          </div>

          {/* 2. STATS DASHBOARD STRIP */}
          <div className="profile-stats-strip">
            <div className="profile-stat-box">
              <span className="profile-stat-val">{stats.watchedCount}</span>
              <span className="profile-stat-lbl">Films</span>
            </div>
            <div className="profile-stat-box">
              <span className="profile-stat-val">{stats.likesCount}</span>
              <span className="profile-stat-lbl">Likes</span>
            </div>
            <div className="profile-stat-box">
              <span className="profile-stat-val">{stats.watchlistCount}</span>
              <span className="profile-stat-lbl">Watchlist</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container profile-content-layout">
        
        {/* Main Columns: Left/Bottom items, Right side stats */}
        <div className="profile-grid">
          
          <div className="profile-main-column">
            {/* 3. TABS SELECTOR */}
            <div className="profile-tabs">
              <button 
                className={`tab-btn ${activeTab === 'diary' ? 'active' : ''}`}
                onClick={() => setActiveTab('diary')}
              >
                <BookOpen size={16} />
                <span>Diary ({diary.length})</span>
              </button>
              <button 
                className={`tab-btn ${activeTab === 'watchlist' ? 'active' : ''}`}
                onClick={() => setActiveTab('watchlist')}
              >
                <ListVideo size={16} />
                <span>Watchlist ({watchlist.length})</span>
              </button>
              <button 
                className={`tab-btn ${activeTab === 'likes' ? 'active' : ''}`}
                onClick={() => setActiveTab('likes')}
              >
                <Heart size={16} />
                <span>Likes ({likes.length})</span>
              </button>
            </div>

            {/* 4. TAB CONTENTS */}
            <div className="tab-pane">
              
              {/* Diary Tab */}
              {activeTab === 'diary' && (
                <div className="diary-pane animate-fade-in">
                  {diary.length > 0 ? (
                    <div className="diary-list">
                      {diary.map((item) => (
                        <div key={item.id} className="diary-item glass-card">
                          <img 
                            src={item.poster_url} 
                            alt={item.title} 
                            className="diary-poster"
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/60x90/1c252d/ffffff?text=Film' }}
                          />
                          <div className="diary-details">
                            <div className="diary-movie-header">
                              <Link to={`/movies/${item.movie_id}`} className="diary-movie-title">
                                {item.title}
                              </Link>
                              <span className="diary-movie-year">{item.release_year}</span>
                            </div>
                            <div className="diary-rating-row">
                              <StarRating rating={parseFloat(item.rating)} size={14} />
                              {item.is_liked && <Heart size={14} className="diary-heart-icon" fill="currentColor" />}
                            </div>
                            {item.content && (
                              <p className="diary-review-snippet">
                                {item.contains_spoilers ? <span className="diary-spoiler-warning">[SPOILERS REVEALED IN POST] </span> : ''}
                                {item.content}
                              </p>
                            )}
                          </div>
                          <div className="diary-date">
                            {new Date(item.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="profile-empty-state glass-card">
                      <BookOpen size={48} />
                      <p>You haven’t logged any movies in your diary yet.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Watchlist Tab */}
              {activeTab === 'watchlist' && (
                <div className="watchlist-pane animate-fade-in">
                  {watchlist.length > 0 ? (
                    <div className="movie-grid-layout">
                      {watchlist.map((movie) => (
                        <MovieCard key={movie.id} movie={movie} />
                      ))}
                    </div>
                  ) : (
                    <div className="profile-empty-state glass-card">
                      <ListVideo size={48} />
                      <p>Your watchlist is empty.</p>
                      <Link to="/" className="btn btn-primary">Find Films to Watch</Link>
                    </div>
                  )}
                </div>
              )}

              {/* Likes Tab */}
              {activeTab === 'likes' && (
                <div className="likes-pane animate-fade-in">
                  {likes.length > 0 ? (
                    <div className="movie-grid-layout">
                      {likes.map((movie) => (
                        <MovieCard key={movie.id} movie={movie} />
                      ))}
                    </div>
                  ) : (
                    <div className="profile-empty-state glass-card">
                      <Heart size={48} />
                      <p>You haven’t liked any movies yet.</p>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>

          {/* Right Column: Profile rating distribution curve */}
          <div className="profile-side-column">
            <div className="profile-curve-card glass-card">
              <h3>Ratings Curve</h3>
              {stats.watchedCount > 0 ? (
                <div className="profile-graph">
                  {Object.keys(stats.ratingDistribution).map((rate) => {
                    const count = stats.ratingDistribution[rate];
                    const heightPercent = (count / maxRatingCount) * 100;
                    return (
                      <div key={rate} className="profile-graph-col" title={`${rate} stars: ${count} ratings`}>
                        <div className="profile-graph-bar-wrapper">
                          <div 
                            className="profile-graph-bar-fill" 
                            style={{ height: `${Math.max(heightPercent, 2)}%` }}
                          ></div>
                        </div>
                        <span className="profile-graph-bar-tick">
                          {rate === "1.0" || rate === "3.0" || rate === "5.0" ? parseInt(rate) : ''}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="no-ratings-curve-text">Rate movies to see your distribution curve.</p>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Profile;
