import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <div className={`px-5 py-3 rounded-full shadow-lg flex items-center gap-2 ${
          type === 'success' ? 'bg-primary text-on-primary' : 'bg-error-container text-on-error-container'
        }`}>
          <span className="material-symbols-outlined text-sm">
            {type === 'success' ? 'check_circle' : 'error'}
          </span>
          <span className="font-body-md text-body-md">{message}</span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Toast;