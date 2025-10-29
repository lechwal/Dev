import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { taskService, meetingService, decisionService } from '../services/api';

function Dashboard() {
  const { user, isDirection } = useAuth();
  const [stats, setStats] = useState({
    tasks: [],
    meetings: [],
    decisions: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [tasksRes, meetingsRes, decisionsRes] = await Promise.all([
        taskService.getAll(),
        meetingService.getAll(),
        decisionService.getAll()
      ]);

      setStats({
        tasks: tasksRes.data,
        meetings: meetingsRes.data,
        decisions: decisionsRes.data
      });
    } catch (error) {
      console.error('Erreur lors du chargement du tableau de bord:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Chargement...</div>;
  }

  const todoTasks = stats.tasks.filter(t => t.status === 'TODO');
  const inProgressTasks = stats.tasks.filter(t => t.status === 'IN_PROGRESS');
  const upcomingMeetings = stats.meetings
    .filter(m => new Date(m.date) > new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 5);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Tableau de bord</h1>
        <div className="user-info">
          <p>Bonjour, {user.firstName} {user.lastName}</p>
          <p className="user-role">{isDirection() ? 'Direction' : user.team?.name || 'Aucune équipe'}</p>
        </div>
      </div>

      <div className="stats-grid">
        <Link to="/tasks" className="stat-card">
          <h3>Tâches à faire</h3>
          <div className="stat-number">{todoTasks.length}</div>
        </Link>

        <Link to="/tasks" className="stat-card">
          <h3>Tâches en cours</h3>
          <div className="stat-number">{inProgressTasks.length}</div>
        </Link>

        <Link to="/meetings" className="stat-card">
          <h3>Réunions</h3>
          <div className="stat-number">{stats.meetings.length}</div>
        </Link>

        <Link to="/decisions" className="stat-card">
          <h3>Décisions</h3>
          <div className="stat-number">{stats.decisions.length}</div>
        </Link>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-section">
          <h2>Prochaines réunions</h2>
          {upcomingMeetings.length === 0 ? (
            <p>Aucune réunion planifiée</p>
          ) : (
            <ul className="meeting-list">
              {upcomingMeetings.map(meeting => (
                <li key={meeting.id}>
                  <Link to={`/meetings/${meeting.id}`}>
                    <strong>{meeting.title}</strong>
                    <span className="meeting-date">
                      {new Date(meeting.date).toLocaleDateString('fr-FR')}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="dashboard-section">
          <h2>Tâches urgentes</h2>
          {stats.tasks.filter(t => t.priority === 'URGENT' && t.status !== 'DONE').length === 0 ? (
            <p>Aucune tâche urgente</p>
          ) : (
            <ul className="task-list">
              {stats.tasks
                .filter(t => t.priority === 'URGENT' && t.status !== 'DONE')
                .slice(0, 5)
                .map(task => (
                  <li key={task.id}>
                    <Link to={`/tasks/${task.id}`}>
                      <strong>{task.title}</strong>
                      <span className={`task-status ${task.status.toLowerCase()}`}>
                        {task.status}
                      </span>
                    </Link>
                  </li>
                ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
