import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { TimerProvider } from './context/TimerContext';
import { AuthProvider } from './hooks/useAuth';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import ConnectUs from './pages/ConnectUs';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';
import Planner from './pages/Planner';
import Timer from './pages/Timer';
import CreativeZone from './pages/CreativeZone';
import Admin from './pages/Admin';
import PageTransition from './components/PageTransition';

function App() {
  const location = useLocation();

  return (
    <AuthProvider>
      <TimerProvider>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route element={<Layout />}>
              <Route path="/" element={<PageTransition><Home /></PageTransition>} />
              <Route path="/connectus" element={<PageTransition><ConnectUs /></PageTransition>} />
              <Route path="/signup" element={<PageTransition><SignUp /></PageTransition>} />
              <Route path="/forgot-password" element={<PageTransition><ForgotPassword /></PageTransition>} />
              <Route path="/planner" element={<ProtectedRoute><PageTransition><Planner /></PageTransition></ProtectedRoute>} />
              <Route path="/timer" element={<ProtectedRoute><PageTransition><Timer /></PageTransition></ProtectedRoute>} />
              <Route path="/creativezone" element={<ProtectedRoute><PageTransition><CreativeZone /></PageTransition></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute requireAdmin={true}><PageTransition><Admin /></PageTransition></ProtectedRoute>} />
              <Route path="*" element={<Navigate to="/" />} />
            </Route>
          </Routes>
        </AnimatePresence>
      </TimerProvider>
    </AuthProvider>
  );
}

export default App;