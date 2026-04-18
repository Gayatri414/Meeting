import { useState } from 'react';
import { X, BookOpen, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { exportToNotion } from '@/services/api';

const NotionModal = ({ isOpen, onClose, meetingId, onSuccess, onError }) => {
  const [token, setToken] = useState('');
  const [dbId, setDbId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    if (!token.trim() || !dbId.trim()) {
      onError('Notion token and database ID are required');
      return;
    }
    setLoading(true);
    try {
      await exportToNotion(meetingId, token.trim(), dbId.trim());
      onSuccess();
      onClose();
    } catch (err) {
      onError(err?.response?.data?.error || 'Notion export failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-md glass-card border-white/10 shadow-2xl rounded-3xl overflow-hidden"
          >
            <div className="p-5 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-indigo-400" />
                <h3 className="text-lg font-bold">Export to Notion</h3>
              </div>
              <button onClick={onClose} className="p-1.5 hover:bg-white/5 rounded-xl transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-sm text-muted-foreground">
                Export this meeting summary and tasks to a Notion database.
              </p>

              <a
                href="https://www.notion.so/my-integrations"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                <ExternalLink className="h-3 w-3" />
                Get your Notion integration token
              </a>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Integration Token</label>
                  <input
                    type="password"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="secret_..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl h-10 px-4 text-sm focus:outline-none focus:border-indigo-500/50 transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Database ID</label>
                  <input
                    type="text"
                    value={dbId}
                    onChange={(e) => setDbId(e.target.value)}
                    placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    className="w-full bg-white/5 border border-white/10 rounded-xl h-10 px-4 text-sm focus:outline-none focus:border-indigo-500/50 transition-all"
                  />
                </div>
              </div>

              <button
                onClick={handleExport}
                disabled={loading}
                className="w-full h-10 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-50"
              >
                {loading ? 'Exporting...' : 'Export to Notion'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default NotionModal;
