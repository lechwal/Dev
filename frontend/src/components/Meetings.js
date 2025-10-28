import React, { useState, useEffect } from 'react';
import { meetingService, teamService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

function Meetings() {
  const { user, isDirection } = useAuth();
  const [meetings, setMeetings] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    teamId: user?.teamId || ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [meetingsRes, teamsRes] = await Promise.all([
        meetingService.getAll(),
        teamService.getAll()
      ]);
      setMeetings(meetingsRes.data);
      setTeams(teamsRes.data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await meetingService.create(formData);
      setShowForm(false);
      setFormData({
        title: '',
        description: '',
        date: '',
        teamId: user?.teamId || ''
      });
      loadData();
    } catch (error) {
      alert(error.response?.data?.error || 'Erreur lors de la création');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Voulez-vous vraiment supprimer cette réunion ?')) {
      try {
        await meetingService.delete(id);
        loadData();
      } catch (error) {
        alert(error.response?.data?.error || 'Erreur lors de la suppression');
      }
    }
  };

  if (loading) return <div className="loading">Chargement...</div>;

  const upcomingMeetings = meetings.filter(m => new Date(m.date) >= new Date());
  const pastMeetings = meetings.filter(m => new Date(m.date) < new Date());

  return (
    <div className="meetings-page">
      <div className="page-header">
        <h1>Réunions</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? 'Annuler' : 'Nouvelle réunion'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="meeting-form">
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
              rows="3"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Date et heure</label>
              <input
                type="datetime-local"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                required
              />
            </div>

            {isDirection() && (
              <div className="form-group">
                <label>Équipe</label>
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
              </div>
            )}
          </div>

          <button type="submit" className="btn-primary">Créer la réunion</button>
        </form>
      )}

      <div className="meetings-section">
        <h2>Prochaines réunions ({upcomingMeetings.length})</h2>
        <div className="meetings-list">
          {upcomingMeetings.length === 0 ? (
            <p>Aucune réunion planifiée</p>
          ) : (
            upcomingMeetings.map(meeting => (
              <div key={meeting.id} className="meeting-card upcoming">
                <div className="meeting-header">
                  <h3>{meeting.title}</h3>
                  <span className="meeting-date">
                    {new Date(meeting.date).toLocaleString('fr-FR')}
                  </span>
                </div>
                {meeting.description && <p>{meeting.description}</p>}
                <div className="meeting-footer">
                  {meeting.team && <span className="meeting-team">{meeting.team.name}</span>}
                  <button onClick={() => handleDelete(meeting.id)} className="btn-danger">
                    Supprimer
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="meetings-section">
        <h2>Réunions passées ({pastMeetings.length})</h2>
        <div className="meetings-list">
          {pastMeetings.length === 0 ? (
            <p>Aucune réunion passée</p>
          ) : (
            pastMeetings.map(meeting => (
              <div key={meeting.id} className="meeting-card past">
                <div className="meeting-header">
                  <h3>{meeting.title}</h3>
                  <span className="meeting-date">
                    {new Date(meeting.date).toLocaleString('fr-FR')}
                  </span>
                </div>
                {meeting.description && <p>{meeting.description}</p>}
                <div className="meeting-footer">
                  {meeting.team && <span className="meeting-team">{meeting.team.name}</span>}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Meetings;
