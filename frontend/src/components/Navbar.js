import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Navbar() {
  const { user, logout, isDirection } = useAuth();

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
      </div>

      <div className="nav-user">
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
