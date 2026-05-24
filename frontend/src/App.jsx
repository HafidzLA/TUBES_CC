import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import MovieDetails from './pages/MovieDetails';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import Watchlist from './pages/Watchlist';
import ReviewModal from './components/ReviewModal';

function App() {
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [selectedLogMovie, setSelectedLogMovie] = useState(null);

  const handleOpenLogModal = (movie) => {
    setSelectedLogMovie(movie);
    setLogModalOpen(true);
  };

  const handleReviewSuccess = (movieId) => {
    // Reload page to refresh reviews list, rating distributions, and user stats
    window.location.reload();
  };

  return (
    <AuthProvider>
      <Router>
        <div className="app-layout">
          {/* Global Header */}
          <Navbar onOpenLogModal={handleOpenLogModal} />
          
          {/* Main App Routes */}
          <main className="app-main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/movies/:id" element={<MovieDetails onOpenLogModal={handleOpenLogModal} />} />
              <Route path="/users/:username" element={<Profile />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/watchlist" element={<Watchlist />} />
            </Routes>
          </main>

          {/* Global Log / Review modal */}
          <ReviewModal 
            movie={selectedLogMovie} 
            isOpen={logModalOpen} 
            onClose={() => setLogModalOpen(false)} 
            onReviewSuccess={handleReviewSuccess}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
