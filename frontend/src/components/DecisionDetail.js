import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { decisionService, meetingService, teamService } from '../services/api';

function DecisionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [decision, setDecision] = useState(null);
  const [meetings, setMeetings] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    meetingId: '',
    teamId: ''
  });

  useEffect(() => {
    loadDecision();
    loadMeetings();
    loadTeams();
  }, [id]);

  const loadDecision = async () => {
    try {
      const response = await decisionService.getById(id);
      setDecision(response.data);
      setFormData({
        title: response.data.title,
        description: response.data.description || '',
        date: response.data.date ? response.data.date.split('T')[0] : '',
        meetingId: response.data.meetingId || '',
        teamId: response.data.teamId || ''
      });
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors du chargement de la décision');
    } finally {
      setLoading(false);
    }
  };

  const loadMeetings = async () => {
    try {
      const response = await meetingService.getAll();
      setMeetings(response.data);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const loadTeams = async () => {
    try {
      const response = await teamService.getAll();
      setTeams(response.data);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await decisionService.update(id, formData);
      setEditing(false);
      loadDecision();
    } catch (error) {
      alert(error.response?.data?.error || 'Erreur lors de la mise à jour');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Voulez-vous vraiment supprimer cette décision ?')) {
      try {
        await decisionService.delete(id);
        navigate('/decisions');
      } catch (error) {
        alert(error.response?.data?.error || 'Erreur lors de la suppression');
      }
    }
  };

  if (loading) return <div className="loading">Chargement...</div>;
  if (!decision) return <div>Décision non trouvée</div>;

  return (
    <div className="detail-page">
      <div className="detail-header">
        <button onClick={() => navigate('/decisions')} className="btn-back">
          ← Retour aux décisions
        </button>
        <div className="detail-actions">
          {!editing && (
            <>
              <button onClick={() => setEditing(true)} className="btn-primary">
                Modifier
              </button>
              <button onClick={handleDelete} className="btn-danger">
                Supprimer
              </button>
            </>
          )}
        </div>
      </div>

      {editing ? (
        <form onSubmit={handleSubmit} className="detail-form">
          <div className="form-group">
            <label>Titre</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="6"
            />
          </div>

          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Réunion associée</label>
            <select
              value={formData.meetingId}
              onChange={(e) => setFormData({ ...formData, meetingId: e.target.value })}
            >
              <option value="">Aucune réunion</option>
              {meetings.map((meeting) => (
                <option key={meeting.id} value={meeting.id}>
                  {meeting.title} - {new Date(meeting.date).toLocaleDateString()}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Équipe</label>
            <select
              value={formData.teamId}
              onChange={(e) => setFormData({ ...formData, teamId: e.target.value })}
              required
            >
              <option value="">Sélectionner une équipe</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary">
              Enregistrer
            </button>
            <button type="button" onClick={() => setEditing(false)} className="btn-secondary">
              Annuler
            </button>
          </div>
        </form>
      ) : (
        <div className="detail-content">
          <div className="detail-card">
            <h1>{decision.title}</h1>

            <div className="detail-badges">
              {decision.team && (
                <span className="badge" style={{ backgroundColor: decision.team.color, color: '#fff' }}>
                  {decision.team.name}
                </span>
              )}
              <span className="badge badge-date">
                {new Date(decision.date).toLocaleDateString()}
              </span>
            </div>

            {decision.description && (
              <div className="detail-section">
                <h3>Description</h3>
                <p style={{ whiteSpace: 'pre-wrap' }}>{decision.description}</p>
              </div>
            )}

            <div className="detail-section">
              <h3>Détails</h3>
              <div className="detail-info">
                <div className="info-item">
                  <strong>Date de la décision :</strong>
                  <span>{new Date(decision.date).toLocaleDateString()}</span>
                </div>
                <div className="info-item">
                  <strong>Équipe :</strong>
                  <span>{decision.team?.name || '-'}</span>
                </div>
                {decision.meeting && (
                  <div className="info-item">
                    <strong>Réunion associée :</strong>
                    <Link to={`/meetings/${decision.meeting.id}`} className="link">
                      {decision.meeting.title} - {new Date(decision.meeting.date).toLocaleDateString()}
                    </Link>
                  </div>
                )}
                <div className="info-item">
                  <strong>Créée le :</strong>
                  <span>{new Date(decision.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="info-item">
                  <strong>Dernière modification :</strong>
                  <span>{new Date(decision.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DecisionDetail;
