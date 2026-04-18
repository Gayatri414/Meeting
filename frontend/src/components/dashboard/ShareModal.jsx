import { useState } from 'react';
import { 
  X, 
  MessageCircle, 
  Instagram, 
  Link2, 
  Download, 
  Check, 
  Copy 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

const ShareModal = ({ isOpen, onClose, data }) => {
  const [copied, setCopied] = useState(false);

  if (!data) return null;

  const { summary = '', tasks = [], decisions = [] } = data;

  const shareText = `
*Meeting Summary:*
${summary}

*Key Decisions:*
${decisions.map(d => `• ${d}`).join('\n')}

*Action Items:*
${tasks.map(t => `• [${t.priority}] ${t.task} (${t.user})`).join('\n')}
  `.trim();

  const handleWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([shareText], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = "meeting-summary.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleInstagram = () => {
    handleCopy();
    alert("Text copied! Instagram doesn't support direct text sharing via web, please paste it in your Story or DM.");
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
            <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
              <h3 className="text-xl font-bold">Share Meeting Result</h3>
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  onClick={handleWhatsApp}
                  className="bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-2xl h-24 flex flex-col gap-2 transition-transform hover:scale-[1.02]"
                >
                  <MessageCircle className="h-8 w-8" />
                  WhatsApp
                </Button>
                
                <Button 
                  onClick={handleInstagram}
                  className="bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] hover:opacity-90 text-white rounded-2xl h-24 flex flex-col gap-2 transition-transform hover:scale-[1.02]"
                >
                  <Instagram className="h-8 w-8" />
                  Instagram
                </Button>

                <Button 
                  onClick={handleCopy}
                  variant="secondary"
                  className="bg-white/5 border border-white/10 rounded-2xl h-24 flex flex-col gap-2 transition-transform hover:scale-[1.02]"
                >
                  {copied ? <Check className="h-8 w-8 text-green-400" /> : <Copy className="h-8 w-8" />}
                  {copied ? 'Copied!' : 'Copy Link'}
                </Button>

                <Button 
                  onClick={handleDownload}
                  variant="secondary"
                  className="bg-white/5 border border-white/10 rounded-2xl h-24 flex flex-col gap-2 transition-transform hover:scale-[1.02]"
                >
                  <Download className="h-8 w-8" />
                  Download
                </Button>
              </div>

              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest mb-2">Preview</p>
                <p className="text-xs line-clamp-4 text-muted-foreground italic">
                  {shareText}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ShareModal;
