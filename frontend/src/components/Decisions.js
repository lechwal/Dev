import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { decisionService, meetingService, teamService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

function Decisions() {
  const { user, isDirection } = useAuth();
  const [decisions, setDecisions] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    teamId: user?.teamId || '',
    meetingId: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  // Initialiser teamId quand user est chargé
  useEffect(() => {
    if (user && !isDirection() && user.teamId) {
      setFormData(prev => ({ ...prev, teamId: user.teamId }));
    }
  }, [user, isDirection]);

  const loadData = async () => {
    try {
      const [decisionsRes, meetingsRes, teamsRes] = await Promise.all([
        decisionService.getAll(),
        meetingService.getAll(),
        teamService.getAll()
      ]);
      setDecisions(decisionsRes.data);
      setMeetings(meetingsRes.data);
      setTeams(teamsRes.data);
      console.log('Équipes chargées (Decisions):', teamsRes.data); // Debug
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        meetingId: formData.meetingId || null
      };
      await decisionService.create(data);
      setShowForm(false);
      setFormData({
        title: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        teamId: user?.teamId || '',
        meetingId: ''
      });
      loadData();
    } catch (error) {
      alert(error.response?.data?.error || 'Erreur lors de la création');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Voulez-vous vraiment supprimer cette décision ?')) {
      try {
        await decisionService.delete(id);
        loadData();
      } catch (error) {
        alert(error.response?.data?.error || 'Erreur lors de la suppression');
      }
    }
  };

  if (loading) return <div className="loading">Chargement...</div>;

  return (
    <div className="decisions-page">
      <div className="page-header">
        <h1>Décisions</h1>
        <button onClick={() => setShowForm(!showForm)} className={showForm ? "btn-compact btn-secondary" : "btn-compact"}>
          {showForm ? 'Annuler' : '+ Nouvelle décision'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="decision-form">
          <div className="form-group">
            <label>Titre</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows="4"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label>Équipe</label>
              {isDirection() ? (
                <select
                  value={formData.teamId}
                  onChange={(e) => setFormData({...formData, teamId: e.target.value})}
                  required
                >
                  <option value="">Sélectionner une équipe</option>
                  {teams.map(team => (
                    <option key={team.id} value={team.id}>{team.name}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={user?.team?.name || 'Aucune équipe'}
                  disabled
                  style={{ backgroundColor: 'var(--bg-secondary)', cursor: 'not-allowed' }}
                />
              )}
            </div>
          </div>

          <div className="form-group">
            <label>Réunion associée (optionnel)</label>
            <select
              value={formData.meetingId}
              onChange={(e) => setFormData({...formData, meetingId: e.target.value})}
            >
              <option value="">Aucune réunion</option>
              {meetings.map(meeting => (
                <option key={meeting.id} value={meeting.id}>
                  {meeting.title} - {new Date(meeting.date).toLocaleDateString('fr-FR')}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn-primary">Créer la décision</button>
        </form>
      )}

      <div className="decisions-list">
        {decisions.length === 0 ? (
          <p>Aucune décision enregistrée</p>
        ) : (
          decisions.map(decision => (
            <div key={decision.id} className="decision-card">
              <Link to={`/decisions/${decision.id}`} className="card-link">
                <div className="decision-header">
                  <h3>{decision.title}</h3>
                  <span className="decision-date">
                    {new Date(decision.date).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                {decision.description && (
                  <p className="decision-description">{decision.description}</p>
                )}
                <div className="decision-meta">
                  {decision.team && (
                    <span className="decision-team" style={{ backgroundColor: decision.team.color }}>{decision.team.name}</span>
                  )}
                  {decision.meeting && (
                    <span className="decision-meeting">
                      Réunion: {decision.meeting.title}
                    </span>
                  )}
                </div>
              </Link>
              <div className="decision-actions">
                <button onClick={() => handleDelete(decision.id)} className="btn-danger">
                  Supprimer
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Decisions;
