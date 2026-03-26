import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import GraphPage from './pages/GraphPage.jsx';
import CharacterPage from './pages/CharacterPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import AdminPanel from './pages/AdminPanel.jsx';
import GurkulPage from './pages/GurkulPage.jsx';
import ConceptPage from './pages/ConceptPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import ConstellationPage from './pages/ConstellationPage.jsx';
import OrientationBanner from './components/OrientationLock.jsx';
import { useAuth } from './hooks/useAuth.js';

// Any logged-in user (admin or regular)
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? children : <Navigate to="/signup" />;
};

// Admin-only route
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" />;
  if (user.role !== 'admin') return <Navigate to="/" />;
  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <OrientationBanner />
        <Routes>
          <Route path="/" element={<GraphPage />} />
          <Route path="/character/:id" element={<CharacterPage />} />
          <Route path="/today" element={<ConceptPage />} />
          <Route path="/gurukul" element={<GurkulPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/constellation" 
            element={
              <ProtectedRoute>
                <ConstellationPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin" 
            element={
              <AdminRoute>
                <AdminPanel />
              </AdminRoute>
            } 
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
