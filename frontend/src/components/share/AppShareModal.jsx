import { useState } from 'react';
import { X, MessageCircle, Mail, Link2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const APP_URL = window.location.origin;
const APP_TEXT = `Check out MeetAI – Real-Time Meeting Intelligence! 🚀\nAI-powered meeting summaries, action items, and more.\n${APP_URL}`;

const AppShareModal = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  const handleWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(APP_TEXT)}`, '_blank');
  };

  const handleEmail = () => {
    window.open(`mailto:?subject=Check out MeetAI&body=${encodeURIComponent(APP_TEXT)}`, '_blank');
  };

  const handleCopy = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: 'MeetAI', text: APP_TEXT, url: APP_URL });
      } else {
        await navigator.clipboard.writeText(APP_URL);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {}
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-sm glass-card border-white/10 shadow-2xl rounded-3xl overflow-hidden"
          >
            <div className="p-5 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-lg font-bold">Share MeetAI</h3>
              <button onClick={onClose} className="p-1.5 hover:bg-white/5 rounded-xl transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5 space-y-3">
              <p className="text-sm text-muted-foreground">Share this app with your team</p>

              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={handleWhatsApp}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/20 transition-all"
                >
                  <MessageCircle className="h-6 w-6 text-[#25D366]" />
                  <span className="text-xs font-medium">WhatsApp</span>
                </button>

                <button
                  onClick={handleEmail}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 transition-all"
                >
                  <Mail className="h-6 w-6 text-blue-400" />
                  <span className="text-xs font-medium">Email</span>
                </button>

                <button
                  onClick={handleCopy}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
                >
                  {copied ? <Check className="h-6 w-6 text-emerald-400" /> : <Link2 className="h-6 w-6 text-muted-foreground" />}
                  <span className="text-xs font-medium">{copied ? 'Copied!' : 'Copy Link'}</span>
                </button>
              </div>

              <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-xs text-muted-foreground break-all">
                {APP_URL}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AppShareModal;
