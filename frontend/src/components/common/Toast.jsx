import { useEffect } from 'react';
import { CheckCircle2, XCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    if (message) {
      const t = setTimeout(onClose, 3500);
      return () => clearTimeout(t);
    }
  }, [message, onClose]);

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className="fixed top-4 right-4 z-[200]"
        >
          <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border backdrop-blur-xl ${
            type === 'error'
              ? 'bg-rose-500/10 border-rose-500/20 text-rose-100'
              : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-100'
          }`}>
            {type === 'error'
              ? <XCircle className="h-4 w-4 text-rose-400 flex-shrink-0" />
              : <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
            }
            <span className="text-sm font-medium">{message}</span>
            <button onClick={onClose} className="ml-1 opacity-60 hover:opacity-100 transition-opacity">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toast;
