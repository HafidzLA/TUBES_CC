import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Toast from './components/Toast';
import { ToastProvider } from './components/ToastContext';
import Home from './pages/Home';
import MovieDetail from './pages/MovieDetail';
import Watchlist from './pages/Watchlist';
import Profile from './pages/Profile';

export default function App() {
  return (
    <ToastProvider>
      <Navbar />
      <main>
        <Routes>
          <Route path="/"           element={<Home />} />
          <Route path="/movie/:id"  element={<MovieDetail />} />
          <Route path="/watchlist"  element={<Watchlist />} />
          <Route path="/profile"    element={<Profile />} />
        </Routes>
      </main>
      <Footer />
      <Toast />
    </ToastProvider>
  );
}
