import { Navigate } from 'react-router-dom';
import SkeletonLoader from './SkeletonLoader';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'framer-motion';
import { useState } from 'react';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, loading } = useAuth();
  const [showPopup, setShowPopup] = useState(false);

  if (loading) return <SkeletonLoader type="full" />;

  if (!user) {
    setTimeout(() => setShowPopup(true), 100);
    return (
      <>
        {showPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowPopup(false)}
          >
            <div className="bg-surface-container-lowest rounded-xl p-6 max-w-sm text-center border border-surface-variant" onClick={e => e.stopPropagation()}>
              <span className="material-symbols-outlined text-primary text-5xl mb-3">lock</span>
              <h3 className="font-headline-md text-headline-md text-primary mb-2">Become a member first</h3>
              <p className="text-on-surface-variant mb-4">This area is exclusive for Achievers members only.</p>
              <button onClick={() => setShowPopup(false)} className="bg-primary text-on-primary px-5 py-2 rounded-lg">Close</button>
            </div>
          </motion.div>
        )}
        <Navigate to="/" replace />
      </>
    );
  }

  if (requireAdmin && user.role !== 'admin' && user.role !== 'admin-pending') {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;