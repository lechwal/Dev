import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { taskService, userService, meetingService } from '../services/api';

function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [users, setUsers] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'TODO',
    priority: 'MEDIUM',
    dueDate: '',
    assignedToId: '',
    meetingId: ''
  });

  useEffect(() => {
    loadTask();
    loadUsers();
    loadMeetings();
  }, [id]);

  const loadTask = async () => {
    try {
      const response = await taskService.getById(id);
      setTask(response.data);
      setFormData({
        title: response.data.title,
        description: response.data.description || '',
        status: response.data.status,
        priority: response.data.priority,
        dueDate: response.data.dueDate ? response.data.dueDate.split('T')[0] : '',
        assignedToId: response.data.assignedToId || '',
        meetingId: response.data.meetingId || ''
      });
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors du chargement de la tâche');
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

  const loadMeetings = async () => {
    try {
      const response = await meetingService.getAll();
      setMeetings(response.data);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await taskService.update(id, formData);
      setEditing(false);
      loadTask();
    } catch (error) {
      alert(error.response?.data?.error || 'Erreur lors de la mise à jour');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Voulez-vous vraiment supprimer cette tâche ?')) {
      try {
        await taskService.delete(id);
        navigate('/tasks');
      } catch (error) {
        alert(error.response?.data?.error || 'Erreur lors de la suppression');
      }
    }
  };

  if (loading) return <div className="loading">Chargement...</div>;
  if (!task) return <div>Tâche non trouvée</div>;

  return (
    <div className="detail-page">
      <div className="detail-header">
        <button onClick={() => navigate('/tasks')} className="btn-back">
          ← Retour aux tâches
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
              rows="4"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Statut</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="TODO">À faire</option>
                <option value="IN_PROGRESS">En cours</option>
                <option value="DONE">Terminé</option>
                <option value="CANCELLED">Annulé</option>
              </select>
            </div>

            <div className="form-group">
              <label>Priorité</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                <option value="LOW">Basse</option>
                <option value="MEDIUM">Moyenne</option>
                <option value="HIGH">Haute</option>
                <option value="URGENT">Urgente</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Date d'échéance</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Assignée à</label>
              <select
                value={formData.assignedToId}
                onChange={(e) => setFormData({ ...formData, assignedToId: e.target.value })}
              >
                <option value="">Non assignée</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.firstName} {user.lastName}
                  </option>
                ))}
              </select>
            </div>
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
            <h1>{task.title}</h1>

            <div className="detail-badges">
              <span className={`badge badge-status-${task.status.toLowerCase()}`}>
                {task.status === 'TODO' ? 'À faire' : task.status === 'IN_PROGRESS' ? 'En cours' : task.status === 'DONE' ? 'Terminé' : 'Annulé'}
              </span>
              <span className={`badge badge-priority-${task.priority.toLowerCase()}`}>
                {task.priority === 'LOW' ? 'Basse' : task.priority === 'MEDIUM' ? 'Moyenne' : task.priority === 'HIGH' ? 'Haute' : 'Urgente'}
              </span>
              {task.team && (
                <span className="badge" style={{ backgroundColor: task.team.color, color: '#fff' }}>
                  {task.team.name}
                </span>
              )}
            </div>

            {task.description && (
              <div className="detail-section">
                <h3>Description</h3>
                <p>{task.description}</p>
              </div>
            )}

            <div className="detail-section">
              <h3>Détails</h3>
              <div className="detail-info">
                <div className="info-item">
                  <strong>Date d'échéance :</strong>
                  <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Non définie'}</span>
                </div>
                <div className="info-item">
                  <strong>Assignée à :</strong>
                  <span>
                    {task.assignedTo
                      ? `${task.assignedTo.firstName} ${task.assignedTo.lastName}`
                      : 'Non assignée'}
                  </span>
                </div>
                <div className="info-item">
                  <strong>Équipe :</strong>
                  <span>{task.team?.name || '-'}</span>
                </div>
                {task.meeting && (
                  <div className="info-item">
                    <strong>Réunion associée :</strong>
                    <Link to={`/meetings/${task.meeting.id}`} className="link">
                      {task.meeting.title} - {new Date(task.meeting.date).toLocaleDateString()}
                    </Link>
                  </div>
                )}
                <div className="info-item">
                  <strong>Créée le :</strong>
                  <span>{new Date(task.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="info-item">
                  <strong>Dernière modification :</strong>
                  <span>{new Date(task.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TaskDetail;
