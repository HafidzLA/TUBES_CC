import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Search, Film, User, LogOut, ChevronDown, Plus } from 'lucide-react';
import UserAvatar from './UserAvatar';
import './Navbar.css';

const Navbar = ({ onOpenLogModal }) => {
  const { user, logout, API_URL } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const userMenuRef = useRef(null);

  // Handle Search Query
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length > 1) {
        try {
          const response = await fetch(`${API_URL}/api/movies/search?q=${encodeURIComponent(searchQuery)}`);
          if (response.ok) {
            const data = await response.json();
            setSearchResults(data);
            setShowDropdown(true);
          }
        } catch (err) {
          console.error('Search error:', err);
        }
      } else {
        setSearchResults([]);
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Close dropdowns on outside clicks
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchResultClick = (movieId) => {
    setSearchQuery('');
    setSearchResults([]);
    setShowDropdown(false);
    navigate(`/movies/${movieId}`);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container container">
        {/* Brand Logo */}
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">🎬</span>
          <span className="logo-text">Shutter<span className="logo-accent">Score</span></span>
        </Link>

        {/* Search Bar Container */}
        <div className="navbar-search" ref={searchRef}>
          <div className="search-input-wrapper">
            <Search className="search-icon" size={16} />
            <input
              type="text"
              placeholder="Search movies, directors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.trim().length > 1 && setShowDropdown(true)}
            />
          </div>

          {/* Autocomplete Dropdown */}
          {showDropdown && searchResults.length > 0 && (
            <div className="search-results-dropdown">
              {searchResults.map((movie) => (
                <div
                  key={movie.id}
                  className="search-result-item"
                  onClick={() => handleSearchResultClick(movie.id)}
                >
                  <img
                    src={movie.poster_url}
                    alt={movie.title}
                    className="result-poster"
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/40x60/1c252d/ffffff?text=Film' }}
                  />
                  <div className="result-info">
                    <div className="result-title">{movie.title}</div>
                    <div className="result-meta">{movie.release_year} • Dir. {movie.director}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {showDropdown && searchQuery.trim().length > 1 && searchResults.length === 0 && (
            <div className="search-results-dropdown">
              <div className="search-no-results">No movies found.</div>
            </div>
          )}
        </div>

        {/* Navigation Actions */}
        <div className="navbar-actions">
          <Link to="/" className="nav-link">
            <Film size={18} />
            <span>Films</span>
          </Link>

          {user ? (
            <>
              {/* User Menu Trigger */}
              <div className="user-menu-container" ref={userMenuRef}>
                <button 
                  className="user-menu-btn" 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  <UserAvatar username={user.username} avatarUrl={user.avatar_url} size={30} className="nav-avatar" />
                  <span className="nav-username">{user.username}</span>
                  <ChevronDown size={14} className={`chevron-icon ${showUserMenu ? 'open' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="user-dropdown-menu">
                    <Link 
                      to={`/users/${user.username}`} 
                      className="dropdown-item" 
                      onClick={() => setShowUserMenu(false)}
                    >
                      <User size={16} />
                      Profile
                    </Link>
                    <Link 
                      to={`/watchlist`} 
                      className="dropdown-item" 
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Film size={16} />
                      Watchlist
                    </Link>
                    <button className="dropdown-item logout" onClick={handleLogout}>
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                )}
              </div>

              {/* Log Button */}
              <button 
                className="btn btn-primary btn-log" 
                onClick={() => onOpenLogModal(null)} // Opens log modal for searching/logging
              >
                <Plus size={16} />
                <span>Log</span>
              </button>
            </>
          ) : (
            <div className="auth-links">
              <Link to="/login" className="nav-link-login">Sign In</Link>
              <Link to="/register" className="btn btn-green">Create Account</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
