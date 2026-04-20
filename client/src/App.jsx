import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SignedIn, SignedOut, RedirectToSignIn, useUser, useAuth } from '@clerk/clerk-react';
import api from './api/axios.js';
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
import GurkulWeekPage from './pages/GurkulWeekPage.jsx';
import AskRishiPage from './pages/AskRishiPage.jsx';
import MeditationPage from './pages/MeditationPage.jsx';
import ChakraMeditationPage from './pages/ChakraMeditationPage.jsx';
import JournalPage from './pages/JournalPage.jsx';
import AffirmationPage from './pages/AffirmationPage.jsx';
import SupportPage from './pages/SupportPage.jsx';
import TermsPage from './pages/TermsPage.jsx';
import PrivacyPage from './pages/PrivacyPage.jsx';
import ContributionPage from './pages/ContributionPage.jsx';
import SoulOnboarding from './pages/SoulOnboarding.jsx';
import SoulProfile   from './pages/SoulProfile.jsx';
import DailyReflection from './pages/DailyReflection.jsx';
import ChangePhase from './pages/ChangePhase.jsx';
import DanaPage from './pages/DanaPage.jsx';
import SoulDebugGallery from './pages/SoulDebugGallery.jsx';

import { useLocation } from 'react-router-dom';

// Any logged-in user
const ProtectedRoute = ({ children }) => {
  const { user, isLoaded } = useUser();
  const location = useLocation();

  if (!isLoaded) return null;

  // Gatekeeping: redirect to onboarding if no soul profile exists
  const hasProfile = user?.publicMetadata?.hasSoulProfile;
  if (user && !hasProfile && location.pathname !== '/soul-onboarding') {
    return <Navigate to="/soul-onboarding" replace />;
  }

  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
};

const AuthOnlyRoute = ({ children }) => {
  const { isLoaded } = useUser();
  if (!isLoaded) return null;

  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
};

// Admin-only route (using publicMetadata or simple check for now)
const AdminRoute = ({ children }) => {
  const { user, isLoaded } = useUser();
  if (!isLoaded) return null;
  
  const isAdmin = user?.publicMetadata?.role === 'admin' || user?.emailAddresses[0]?.emailAddress === 'admin@devlok.com'; // Fallback check

  return (
    <>
      <SignedIn>
        {isAdmin ? children : <Navigate to="/" />}
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
};

function App() {
  const { getToken } = useAuth();

  React.useEffect(() => {
    const interceptor = api.interceptors.request.use(async (config) => {
      const token = await getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    return () => api.interceptors.request.eject(interceptor);
  }, [getToken]);

  return (
    <Router>
      <OrientationBanner />
      <Routes>
        <Route path="/" element={<GraphPage />} />
        <Route path="/character/:id" element={<CharacterPage />} />
        <Route path="/today" element={<ConceptPage />} />
        <Route path="/gurukul" element={<GurkulPage />} />
        <Route path="/gurukul/week/:n" element={<GurkulWeekPage />} />
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
        <Route path="/ask" element={<AskRishiPage />} />
        <Route path="/meditate" element={<MeditationPage />} />
        <Route path="/chakra-meditate" element={<ChakraMeditationPage />} />
        <Route
          path="/journal"
          element={
            <ProtectedRoute>
              <JournalPage />
            </ProtectedRoute>
          }
        />
        <Route path="/affirmations" element={<AffirmationPage />} />
        <Route path="/support"      element={<SupportPage />} />
        <Route path="/terms"        element={<TermsPage />} />
        <Route path="/privacy"      element={<PrivacyPage />} />
        <Route
          path="/soul-onboarding"
          element={
            <ProtectedRoute>
              <SoulOnboarding />
            </ProtectedRoute>
          }
        />
        <Route
          path="/soul"
          element={
            <ProtectedRoute>
              <SoulProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reflect"
          element={
            <ProtectedRoute>
              <DailyReflection />
            </ProtectedRoute>
          }
        />
        <Route
          path="/soul/phase"
          element={
            <ProtectedRoute>
              <ChangePhase />
            </ProtectedRoute>
          }
        />
        <Route path="/dana" element={<DanaPage />} />
        <Route
          path="/contribute"
          element={
            <AuthOnlyRoute>
              <ContributionPage />
            </AuthOnlyRoute>
          }
        />
        <Route path="/soul-debug" element={<SoulDebugGallery />} />
        <Route 
          path="/admin" 
          element={
            <AdminRoute>
              <AdminPanel />
            </AdminRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
