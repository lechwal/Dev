import React, { useState, useEffect } from 'react';
import { userService, teamService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

function Admin() {
  const { isDirection } = useAuth();
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUserForm, setShowUserForm] = useState(false);
  const [showTeamForm, setShowTeamForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editingTeam, setEditingTeam] = useState(null);

  const [userFormData, setUserFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'MEMBRE',
    teamId: ''
  });

  const [teamFormData, setTeamFormData] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    if (!isDirection()) {
      return;
    }
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'users') {
        const usersRes = await userService.getAll();
        setUsers(usersRes.data);
      } else {
        const teamsRes = await teamService.getAll();
        setTeams(teamsRes.data);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  // Gestion des utilisateurs
  const handleUserSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await userService.update(editingUser.id, userFormData);
      } else {
        await userService.create(userFormData);
      }
      setShowUserForm(false);
      setEditingUser(null);
      setUserFormData({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        role: 'MEMBRE',
        teamId: ''
      });
      loadData();
    } catch (error) {
      alert(error.response?.data?.error || 'Erreur lors de l\'opération');
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setUserFormData({
      email: user.email,
      password: '',
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      teamId: user.teamId || ''
    });
    setShowUserForm(true);
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('Voulez-vous vraiment supprimer cet utilisateur ?')) {
      try {
        await userService.delete(id);
        loadData();
      } catch (error) {
        alert(error.response?.data?.error || 'Erreur lors de la suppression');
      }
    }
  };

  // Gestion des équipes
  const handleTeamSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTeam) {
        await teamService.update(editingTeam.id, teamFormData);
      } else {
        await teamService.create(teamFormData);
      }
      setShowTeamForm(false);
      setEditingTeam(null);
      setTeamFormData({ name: '', description: '' });
      loadData();
    } catch (error) {
      alert(error.response?.data?.error || 'Erreur lors de l\'opération');
    }
  };

  const handleEditTeam = (team) => {
    setEditingTeam(team);
    setTeamFormData({
      name: team.name,
      description: team.description || ''
    });
    setShowTeamForm(true);
  };

  const handleDeleteTeam = async (id) => {
    if (window.confirm('Voulez-vous vraiment supprimer cette équipe ? Tous les utilisateurs seront dissociés.')) {
      try {
        await teamService.delete(id);
        loadData();
      } catch (error) {
        alert(error.response?.data?.error || 'Erreur lors de la suppression');
      }
    }
  };

  if (!isDirection()) {
    return (
      <div className="admin-page">
        <div className="access-denied">
          <h2>Accès refusé</h2>
          <p>Cette page est réservée à la direction.</p>
        </div>
      </div>
    );
  }

  if (loading) return <div className="loading">Chargement...</div>;

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>Panneau d'Administration</h1>
      </div>

      <div className="admin-tabs">
        <button
          className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Utilisateurs ({users.length})
        </button>
        <button
          className={`tab-button ${activeTab === 'teams' ? 'active' : ''}`}
          onClick={() => setActiveTab('teams')}
        >
          Équipes ({teams.length})
        </button>
      </div>

      {/* Gestion des utilisateurs */}
      {activeTab === 'users' && (
        <div className="admin-section">
          <div className="section-header">
            <h2>Gestion des Utilisateurs</h2>
            <button
              onClick={() => {
                setEditingUser(null);
                setUserFormData({
                  email: '',
                  password: '',
                  firstName: '',
                  lastName: '',
                  role: 'MEMBRE',
                  teamId: ''
                });
                setShowUserForm(!showUserForm);
              }}
              className="btn-primary"
            >
              {showUserForm ? 'Annuler' : 'Nouvel utilisateur'}
            </button>
          </div>

          {showUserForm && (
            <form onSubmit={handleUserSubmit} className="admin-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Prénom</label>
                  <input
                    type="text"
                    value={userFormData.firstName}
                    onChange={(e) =>
                      setUserFormData({ ...userFormData, firstName: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Nom</label>
                  <input
                    type="text"
                    value={userFormData.lastName}
                    onChange={(e) =>
                      setUserFormData({ ...userFormData, lastName: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={userFormData.email}
                    onChange={(e) =>
                      setUserFormData({ ...userFormData, email: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Mot de passe {editingUser && '(laisser vide pour ne pas modifier)'}</label>
                  <input
                    type="password"
                    value={userFormData.password}
                    onChange={(e) =>
                      setUserFormData({ ...userFormData, password: e.target.value })
                    }
                    required={!editingUser}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Rôle</label>
                  <select
                    value={userFormData.role}
                    onChange={(e) =>
                      setUserFormData({ ...userFormData, role: e.target.value })
                    }
                  >
                    <option value="MEMBRE">Membre</option>
                    <option value="DIRECTION">Direction</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Équipe</label>
                  <select
                    value={userFormData.teamId}
                    onChange={(e) =>
                      setUserFormData({ ...userFormData, teamId: e.target.value })
                    }
                  >
                    <option value="">Aucune équipe</option>
                    {teams.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button type="submit" className="btn-primary">
                {editingUser ? 'Mettre à jour' : 'Créer'}
              </button>
            </form>
          )}

          <div className="admin-table">
            <table>
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Email</th>
                  <th>Rôle</th>
                  <th>Équipe</th>
                  <th>Tâches</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      {user.firstName} {user.lastName}
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`badge badge-${user.role.toLowerCase()}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>{user.team?.name || '-'}</td>
                    <td>{user._count?.assignedTasks || 0}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="btn-edit"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="btn-danger"
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Gestion des équipes */}
      {activeTab === 'teams' && (
        <div className="admin-section">
          <div className="section-header">
            <h2>Gestion des Équipes</h2>
            <button
              onClick={() => {
                setEditingTeam(null);
                setTeamFormData({ name: '', description: '' });
                setShowTeamForm(!showTeamForm);
              }}
              className="btn-primary"
            >
              {showTeamForm ? 'Annuler' : 'Nouvelle équipe'}
            </button>
          </div>

          {showTeamForm && (
            <form onSubmit={handleTeamSubmit} className="admin-form">
              <div className="form-group">
                <label>Nom de l'équipe</label>
                <input
                  type="text"
                  value={teamFormData.name}
                  onChange={(e) =>
                    setTeamFormData({ ...teamFormData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={teamFormData.description}
                  onChange={(e) =>
                    setTeamFormData({ ...teamFormData, description: e.target.value })
                  }
                  rows="3"
                />
              </div>

              <button type="submit" className="btn-primary">
                {editingTeam ? 'Mettre à jour' : 'Créer'}
              </button>
            </form>
          )}

          <div className="admin-grid">
            {teams.map((team) => (
              <div key={team.id} className="team-admin-card">
                <h3>{team.name}</h3>
                {team.description && <p>{team.description}</p>}
                <div className="team-stats">
                  <span>Membres: {team._count?.members || 0}</span>
                  <span>Réunions: {team._count?.meetings || 0}</span>
                  <span>Tâches: {team._count?.tasks || 0}</span>
                  <span>Décisions: {team._count?.decisions || 0}</span>
                </div>
                <div className="action-buttons">
                  <button onClick={() => handleEditTeam(team)} className="btn-edit">
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDeleteTeam(team.id)}
                    className="btn-danger"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Admin;
