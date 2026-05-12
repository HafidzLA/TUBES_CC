import { NavLink } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="container navbar__inner">
        <NavLink to="/" className="navbar__logo">Filmlog</NavLink>

        <div className="navbar__nav">
          <NavLink to="/" end className={({ isActive }) => 'navbar__link' + (isActive ? ' active' : '')}>
            Films
          </NavLink>
          <NavLink to="/watchlist" className={({ isActive }) => 'navbar__link' + (isActive ? ' active' : '')}>
            Watchlist
          </NavLink>
          <NavLink to="/profile"   className={({ isActive }) => 'navbar__link' + (isActive ? ' active' : '')}>
            Profile
          </NavLink>
        </div>

        <NavLink to="/profile">
          <img
            className="navbar__avatar"
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=cinephile"
            alt="User avatar"
          />
        </NavLink>
      </div>
    </nav>
  );
}
