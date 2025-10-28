import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

function Navbar() {
  const { user, logout, isDirection } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link to="/">Gestion d'équipes</Link>
      </div>

      <div className="nav-links">
        <Link to="/">Tableau de bord</Link>
        <Link to="/tasks">Tâches</Link>
        <Link to="/meetings">Réunions</Link>
        <Link to="/decisions">Décisions</Link>
        {isDirection() && <Link to="/admin">Administration</Link>}
      </div>

      <div className="nav-user">
        <button onClick={toggleTheme} className="btn-theme" title="Changer de thème">
          {isDark ? '☀️' : '🌙'}
        </button>
        <span className="user-name">
          {user?.firstName} {user?.lastName}
          {isDirection() && <span className="badge-direction">Direction</span>}
        </span>
        <button onClick={logout} className="btn-logout">
          Déconnexion
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
