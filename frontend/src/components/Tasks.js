import React, { useState, useEffect } from 'react';
import { taskService, teamService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

function Tasks() {
  const { user, isDirection } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'TODO',
    priority: 'MEDIUM',
    dueDate: '',
    teamId: user?.teamId || '',
    assignedToId: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [tasksRes, teamsRes] = await Promise.all([
        taskService.getAll(),
        teamService.getAll()
      ]);
      setTasks(tasksRes.data);
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
      await taskService.create(formData);
      setShowForm(false);
      setFormData({
        title: '',
        description: '',
        status: 'TODO',
        priority: 'MEDIUM',
        dueDate: '',
        teamId: user?.teamId || '',
        assignedToId: ''
      });
      loadData();
    } catch (error) {
      alert(error.response?.data?.error || 'Erreur lors de la création');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Voulez-vous vraiment supprimer cette tâche ?')) {
      try {
        await taskService.delete(id);
        loadData();
      } catch (error) {
        alert(error.response?.data?.error || 'Erreur lors de la suppression');
      }
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await taskService.update(id, { status: newStatus });
      loadData();
    } catch (error) {
      alert(error.response?.data?.error || 'Erreur lors de la mise à jour');
    }
  };

  if (loading) return <div className="loading">Chargement...</div>;

  return (
    <div className="tasks-page">
      <div className="page-header">
        <h1>Tâches</h1>
        <button onClick={() => setShowForm(!showForm)} className={showForm ? "btn-compact btn-secondary" : "btn-compact"}>
          {showForm ? 'Annuler' : '+ Nouvelle tâche'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="task-form">
          <div className="form-row">
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
              <label>Priorité</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: e.target.value})}
              >
                <option value="LOW">Basse</option>
                <option value="MEDIUM">Moyenne</option>
                <option value="HIGH">Haute</option>
                <option value="URGENT">Urgente</option>
              </select>
            </div>
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
              <label>Date d'échéance</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
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

          <button type="submit" className="btn-primary">Créer la tâche</button>
        </form>
      )}

      <div className="tasks-grid">
        {['TODO', 'IN_PROGRESS', 'DONE'].map(status => (
          <div key={status} className="task-column">
            <h2 className={`column-header ${status.toLowerCase()}`}>
              {status === 'TODO' ? 'À faire' : status === 'IN_PROGRESS' ? 'En cours' : 'Terminées'}
            </h2>
            {tasks.filter(t => t.status === status).map(task => (
              <div key={task.id} className={`task-card priority-${task.priority.toLowerCase()}`}>
                <h3>{task.title}</h3>
                {task.description && <p>{task.description}</p>}
                <div className="task-meta">
                  <span className="task-priority">{task.priority}</span>
                  {task.team && <span className="task-team">{task.team.name}</span>}
                </div>
                {task.dueDate && (
                  <div className="task-date">
                    Échéance: {new Date(task.dueDate).toLocaleDateString('fr-FR')}
                  </div>
                )}
                <div className="task-actions">
                  {status !== 'DONE' && (
                    <select
                      value={status}
                      onChange={(e) => handleStatusChange(task.id, e.target.value)}
                      className="status-select"
                    >
                      <option value="TODO">À faire</option>
                      <option value="IN_PROGRESS">En cours</option>
                      <option value="DONE">Terminée</option>
                      <option value="CANCELLED">Annulée</option>
                    </select>
                  )}
                  <button onClick={() => handleDelete(task.id)} className="btn-danger">
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Tasks;
