import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { meetingService, userService, taskService, decisionService, teamService } from '../services/api';
import api from '../services/api';

function MeetingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [meeting, setMeeting] = useState(null);
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('info');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    notes: '',
    teamId: ''
  });

  // État pour les participants
  const [showAddParticipant, setShowAddParticipant] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');

  // État pour l'ordre du jour
  const [showAddAgenda, setShowAddAgenda] = useState(false);
  const [agendaFormData, setAgendaFormData] = useState({
    title: '',
    description: ''
  });

  // État pour les tâches
  const [showAddTask, setShowAddTask] = useState(false);
  const [taskFormData, setTaskFormData] = useState({
    title: '',
    description: '',
    status: 'TODO',
    priority: 'MEDIUM',
    dueDate: '',
    assignedToId: ''
  });

  // État pour les décisions
  const [showAddDecision, setShowAddDecision] = useState(false);
  const [decisionFormData, setDecisionFormData] = useState({
    title: '',
    description: '',
    date: ''
  });

  useEffect(() => {
    loadMeeting();
    loadUsers();
    loadTeams();
  }, [id]);

  const loadMeeting = async () => {
    try {
      const response = await meetingService.getById(id);
      setMeeting(response.data);
      setFormData({
        title: response.data.title,
        description: response.data.description || '',
        date: response.data.date ? response.data.date.split('T')[0] : '',
        notes: response.data.notes || '',
        teamId: response.data.teamId || ''
      });
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors du chargement de la réunion');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await userService.getAll();
      setUsers(response.data);
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
      await meetingService.update(id, formData);
      setEditing(false);
      loadMeeting();
    } catch (error) {
      alert(error.response?.data?.error || 'Erreur lors de la mise à jour');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Voulez-vous vraiment supprimer cette réunion ?')) {
      try {
        await meetingService.delete(id);
        navigate('/meetings');
      } catch (error) {
        alert(error.response?.data?.error || 'Erreur lors de la suppression');
      }
    }
  };

  // Gestion des participants
  const handleAddParticipant = async (e) => {
    e.preventDefault();
    if (!selectedUserId) return;

    try {
      await api.post(`/meetings/${id}/participants`, { userId: parseInt(selectedUserId) });
      setSelectedUserId('');
      setShowAddParticipant(false);
      loadMeeting();
    } catch (error) {
      alert(error.response?.data?.error || 'Erreur lors de l\'ajout du participant');
    }
  };

  const handleRemoveParticipant = async (participantId) => {
    if (window.confirm('Retirer ce participant ?')) {
      try {
        await api.delete(`/meetings/${id}/participants/${participantId}`);
        loadMeeting();
      } catch (error) {
        alert(error.response?.data?.error || 'Erreur lors du retrait');
      }
    }
  };

  // Gestion de l'ordre du jour
  const handleAddAgendaItem = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/meetings/${id}/agenda`, agendaFormData);
      setAgendaFormData({ title: '', description: '' });
      setShowAddAgenda(false);
      loadMeeting();
    } catch (error) {
      alert(error.response?.data?.error || 'Erreur lors de l\'ajout');
    }
  };

  const handleToggleAgendaItem = async (agendaId, completed) => {
    try {
      await api.put(`/meetings/${id}/agenda/${agendaId}`, { completed: !completed });
      loadMeeting();
    } catch (error) {
      alert(error.response?.data?.error || 'Erreur lors de la mise à jour');
    }
  };

  const handleDeleteAgendaItem = async (agendaId) => {
    if (window.confirm('Supprimer ce point ?')) {
      try {
        await api.delete(`/meetings/${id}/agenda/${agendaId}`);
        loadMeeting();
      } catch (error) {
        alert(error.response?.data?.error || 'Erreur lors de la suppression');
      }
    }
  };

  // Gestion des tâches
  const handleAddTask = async (e) => {
    e.preventDefault();
    try {
      await taskService.create({
        ...taskFormData,
        teamId: meeting.teamId,
        meetingId: parseInt(id)
      });
      setTaskFormData({
        title: '',
        description: '',
        status: 'TODO',
        priority: 'MEDIUM',
        dueDate: '',
        assignedToId: ''
      });
      setShowAddTask(false);
      loadMeeting();
    } catch (error) {
      alert(error.response?.data?.error || 'Erreur lors de la création');
    }
  };

  // Gestion des décisions
  const handleAddDecision = async (e) => {
    e.preventDefault();
    try {
      await decisionService.create({
        ...decisionFormData,
        teamId: meeting.teamId,
        meetingId: parseInt(id)
      });
      setDecisionFormData({ title: '', description: '', date: '' });
      setShowAddDecision(false);
      loadMeeting();
    } catch (error) {
      alert(error.response?.data?.error || 'Erreur lors de la création');
    }
  };

  if (loading) return <div className="loading">Chargement...</div>;
  if (!meeting) return <div>Réunion non trouvée</div>;

  // Filtrer les utilisateurs non participants
  const availableUsers = users.filter(
    u => !meeting.participants?.some(p => p.user.id === u.id)
  );

  return (
    <div className="detail-page">
      <div className="detail-header">
        <button onClick={() => navigate('/meetings')} className="btn-back">
          ← Retour aux réunions
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
              rows="3"
            />
          </div>

          <div className="form-group">
            <label>Date et heure</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows="8"
              placeholder="Notes prises pendant la réunion..."
            />
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
        <>
          <div className="detail-content">
            <div className="detail-card">
              <h1>{meeting.title}</h1>

              <div className="detail-badges">
                {meeting.team && (
                  <span className="badge" style={{ backgroundColor: meeting.team.color, color: '#fff' }}>
                    {meeting.team.name}
                  </span>
                )}
                <span className="badge badge-date">
                  {new Date(meeting.date).toLocaleDateString()}
                </span>
              </div>

              {meeting.description && (
                <div className="detail-section">
                  <p>{meeting.description}</p>
                </div>
              )}

              {/* Onglets */}
              <div className="detail-tabs">
                <button
                  className={`tab-button ${activeTab === 'info' ? 'active' : ''}`}
                  onClick={() => setActiveTab('info')}
                >
                  Informations
                </button>
                <button
                  className={`tab-button ${activeTab === 'participants' ? 'active' : ''}`}
                  onClick={() => setActiveTab('participants')}
                >
                  Participants ({meeting.participants?.length || 0})
                </button>
                <button
                  className={`tab-button ${activeTab === 'agenda' ? 'active' : ''}`}
                  onClick={() => setActiveTab('agenda')}
                >
                  Ordre du jour ({meeting.agendaItems?.length || 0})
                </button>
                <button
                  className={`tab-button ${activeTab === 'tasks' ? 'active' : ''}`}
                  onClick={() => setActiveTab('tasks')}
                >
                  Tâches ({meeting.tasks?.length || 0})
                </button>
                <button
                  className={`tab-button ${activeTab === 'decisions' ? 'active' : ''}`}
                  onClick={() => setActiveTab('decisions')}
                >
                  Décisions ({meeting.decisions?.length || 0})
                </button>
                <button
                  className={`tab-button ${activeTab === 'notes' ? 'active' : ''}`}
                  onClick={() => setActiveTab('notes')}
                >
                  Notes
                </button>
              </div>

              {/* Contenu des onglets */}
              {activeTab === 'info' && (
                <div className="detail-section">
                  <h3>Détails</h3>
                  <div className="detail-info">
                    <div className="info-item">
                      <strong>Date :</strong>
                      <span>{new Date(meeting.date).toLocaleDateString()}</span>
                    </div>
                    <div className="info-item">
                      <strong>Équipe :</strong>
                      <span>{meeting.team?.name || '-'}</span>
                    </div>
                    <div className="info-item">
                      <strong>Créée le :</strong>
                      <span>{new Date(meeting.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="info-item">
                      <strong>Dernière modification :</strong>
                      <span>{new Date(meeting.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'participants' && (
                <div className="detail-section">
                  <div className="section-header">
                    <h3>Participants</h3>
                    <button
                      onClick={() => setShowAddParticipant(!showAddParticipant)}
                      className={showAddParticipant ? "btn-compact btn-secondary" : "btn-compact"}
                    >
                      {showAddParticipant ? 'Annuler' : '+ Ajouter'}
                    </button>
                  </div>

                  {showAddParticipant && (
                    <form onSubmit={handleAddParticipant} className="inline-form">
                      <select
                        value={selectedUserId}
                        onChange={(e) => setSelectedUserId(e.target.value)}
                        required
                      >
                        <option value="">Sélectionner un utilisateur</option>
                        {availableUsers.map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.firstName} {user.lastName}
                          </option>
                        ))}
                      </select>
                      <button type="submit" className="btn-primary">Ajouter</button>
                    </form>
                  )}

                  <div className="participants-list">
                    {meeting.participants?.length > 0 ? (
                      meeting.participants.map((participant) => (
                        <div key={participant.id} className="participant-item">
                          <div>
                            <strong>{participant.user.name}</strong>
                            <span className="participant-email">{participant.user.email}</span>
                          </div>
                          <button
                            onClick={() => handleRemoveParticipant(participant.id)}
                            className="btn-remove"
                          >
                            ×
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="empty-message">Aucun participant</p>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'agenda' && (
                <div className="detail-section">
                  <div className="section-header">
                    <h3>Ordre du jour</h3>
                    <button
                      onClick={() => setShowAddAgenda(!showAddAgenda)}
                      className={showAddAgenda ? "btn-compact btn-secondary" : "btn-compact"}
                    >
                      {showAddAgenda ? 'Annuler' : '+ Ajouter un point'}
                    </button>
                  </div>

                  {showAddAgenda && (
                    <form onSubmit={handleAddAgendaItem} className="inline-form">
                      <input
                        type="text"
                        placeholder="Titre du point"
                        value={agendaFormData.title}
                        onChange={(e) => setAgendaFormData({ ...agendaFormData, title: e.target.value })}
                        required
                      />
                      <textarea
                        placeholder="Description (optionnel)"
                        value={agendaFormData.description}
                        onChange={(e) => setAgendaFormData({ ...agendaFormData, description: e.target.value })}
                        rows="2"
                      />
                      <button type="submit" className="btn-primary">Ajouter</button>
                    </form>
                  )}

                  <div className="agenda-list">
                    {meeting.agendaItems?.length > 0 ? (
                      meeting.agendaItems.map((item, index) => (
                        <div key={item.id} className={`agenda-item ${item.completed ? 'completed' : ''}`}>
                          <div className="agenda-number">{index + 1}</div>
                          <div className="agenda-content">
                            <div className="agenda-title">
                              <input
                                type="checkbox"
                                checked={item.completed}
                                onChange={() => handleToggleAgendaItem(item.id, item.completed)}
                              />
                              <span>{item.title}</span>
                            </div>
                            {item.description && <p className="agenda-description">{item.description}</p>}
                          </div>
                          <button
                            onClick={() => handleDeleteAgendaItem(item.id)}
                            className="btn-remove"
                          >
                            ×
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="empty-message">Aucun point à l'ordre du jour</p>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'tasks' && (
                <div className="detail-section">
                  <div className="section-header">
                    <h3>Tâches</h3>
                    <button
                      onClick={() => setShowAddTask(!showAddTask)}
                      className={showAddTask ? "btn-compact btn-secondary" : "btn-compact"}
                    >
                      {showAddTask ? 'Annuler' : '+ Créer une tâche'}
                    </button>
                  </div>

                  {showAddTask && (
                    <form onSubmit={handleAddTask} className="inline-form">
                      <input
                        type="text"
                        placeholder="Titre de la tâche"
                        value={taskFormData.title}
                        onChange={(e) => setTaskFormData({ ...taskFormData, title: e.target.value })}
                        required
                      />
                      <textarea
                        placeholder="Description"
                        value={taskFormData.description}
                        onChange={(e) => setTaskFormData({ ...taskFormData, description: e.target.value })}
                        rows="2"
                      />
                      <div className="form-row">
                        <select
                          value={taskFormData.priority}
                          onChange={(e) => setTaskFormData({ ...taskFormData, priority: e.target.value })}
                        >
                          <option value="LOW">Basse</option>
                          <option value="MEDIUM">Moyenne</option>
                          <option value="HIGH">Haute</option>
                          <option value="URGENT">Urgente</option>
                        </select>
                        <input
                          type="date"
                          value={taskFormData.dueDate}
                          onChange={(e) => setTaskFormData({ ...taskFormData, dueDate: e.target.value })}
                        />
                        <select
                          value={taskFormData.assignedToId}
                          onChange={(e) => setTaskFormData({ ...taskFormData, assignedToId: e.target.value })}
                        >
                          <option value="">Non assignée</option>
                          {users.map((user) => (
                            <option key={user.id} value={user.id}>
                              {user.firstName} {user.lastName}
                            </option>
                          ))}
                        </select>
                      </div>
                      <button type="submit" className="btn-primary">Créer</button>
                    </form>
                  )}

                  <div className="linked-items-list">
                    {meeting.tasks?.length > 0 ? (
                      meeting.tasks.map((task) => (
                        <div key={task.id} className="linked-item">
                          <div>
                            <Link to={`/tasks/${task.id}`} className="item-title">
                              {task.title}
                            </Link>
                            <div className="item-meta">
                              <span className={`badge badge-status-${task.status.toLowerCase()}`}>
                                {task.status}
                              </span>
                              {task.assignee && (
                                <span>{task.assignee.name}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="empty-message">Aucune tâche créée</p>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'decisions' && (
                <div className="detail-section">
                  <div className="section-header">
                    <h3>Décisions</h3>
                    <button
                      onClick={() => setShowAddDecision(!showAddDecision)}
                      className={showAddDecision ? "btn-compact btn-secondary" : "btn-compact"}
                    >
                      {showAddDecision ? 'Annuler' : '+ Créer une décision'}
                    </button>
                  </div>

                  {showAddDecision && (
                    <form onSubmit={handleAddDecision} className="inline-form">
                      <input
                        type="text"
                        placeholder="Titre de la décision"
                        value={decisionFormData.title}
                        onChange={(e) => setDecisionFormData({ ...decisionFormData, title: e.target.value })}
                        required
                      />
                      <textarea
                        placeholder="Description"
                        value={decisionFormData.description}
                        onChange={(e) => setDecisionFormData({ ...decisionFormData, description: e.target.value })}
                        rows="3"
                      />
                      <input
                        type="date"
                        value={decisionFormData.date}
                        onChange={(e) => setDecisionFormData({ ...decisionFormData, date: e.target.value })}
                      />
                      <button type="submit" className="btn-primary">Créer</button>
                    </form>
                  )}

                  <div className="linked-items-list">
                    {meeting.decisions?.length > 0 ? (
                      meeting.decisions.map((decision) => (
                        <div key={decision.id} className="linked-item">
                          <div>
                            <Link to={`/decisions/${decision.id}`} className="item-title">
                              {decision.title}
                            </Link>
                            <div className="item-meta">
                              <span>{new Date(decision.date).toLocaleDateString()}</span>
                              {decision.createdBy && (
                                <span>Par {decision.createdBy.name}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="empty-message">Aucune décision prise</p>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'notes' && (
                <div className="detail-section">
                  <h3>Notes de réunion</h3>
                  {meeting.notes ? (
                    <div className="notes-content">
                      <p style={{ whiteSpace: 'pre-wrap' }}>{meeting.notes}</p>
                    </div>
                  ) : (
                    <p className="empty-message">Aucune note. Cliquez sur "Modifier" pour ajouter des notes.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default MeetingDetail;
