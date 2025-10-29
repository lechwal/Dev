import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Tasks from './components/Tasks';
import TaskDetail from './components/TaskDetail';
import Meetings from './components/Meetings';
import MeetingDetail from './components/MeetingDetail';
import Decisions from './components/Decisions';
import DecisionDetail from './components/DecisionDetail';
import Admin from './components/Admin';
import Navbar from './components/Navbar';
import './App.css';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Chargement...</div>;
  }

  return user ? children : <Navigate to="/login" />;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Router>
      {user && <Navbar />}
      <Routes>
        <Route
          path="/login"
          element={user ? <Navigate to="/" /> : <Login />}
        />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/tasks"
          element={
            <PrivateRoute>
              <Tasks />
            </PrivateRoute>
          }
        />
        <Route
          path="/tasks/:id"
          element={
            <PrivateRoute>
              <TaskDetail />
            </PrivateRoute>
          }
        />
        <Route
          path="/meetings"
          element={
            <PrivateRoute>
              <Meetings />
            </PrivateRoute>
          }
        />
        <Route
          path="/meetings/:id"
          element={
            <PrivateRoute>
              <MeetingDetail />
            </PrivateRoute>
          }
        />
        <Route
          path="/decisions"
          element={
            <PrivateRoute>
              <Decisions />
            </PrivateRoute>
          }
        />
        <Route
          path="/decisions/:id"
          element={
            <PrivateRoute>
              <DecisionDetail />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <Admin />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
