import { useState, useRef, useEffect } from 'react';
import { SendHorizontal, Bot, User, Sparkles, MessageSquare, X } from 'lucide-react';
import { sendChatMessage } from '@/services/api';
import { motion, AnimatePresence } from 'framer-motion';

const QUICK_QUESTIONS = [
  'Summarize the key decisions',
  'What are my action items?',
  'What topics were unresolved?',
  'Who has the most tasks?'
];

const ChatPanel = ({ meetingId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Hi! I can help you analyze this meeting. Ask me about tasks, decisions, or for a deeper summary.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', text: input.trim() };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await sendChatMessage(
        userMessage.text,
        nextMessages.map((item) => ({ role: item.role, text: item.text })),
        meetingId
      );
      setMessages((prev) => [...prev, { role: 'bot', text: response.reply }]);
    } catch (error) {
      let errorMsg = 'I encountered an issue. Please try again.';
      if (error?.response?.status === 429) {
        errorMsg = 'AI quota exceeded. Please wait a moment.';
      }
      setMessages((prev) => [...prev, { role: 'bot', text: errorMsg }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-[380px] sm:w-[420px] glass-card border-white/10 shadow-2xl overflow-hidden rounded-3xl flex flex-col h-[520px]"
          >
            {/* Header */}
            <div className="pb-3 pt-4 px-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-500/20">
                  <Bot className="h-4 w-4 text-indigo-400" />
                </div>
                <span className="font-semibold text-sm">AI Assistant</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/5 rounded-lg transition-colors text-muted-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4 bg-black/40"
            >
              <AnimatePresence initial={false}>
                {messages.map((message, index) => (
                  <motion.div
                    key={`${message.role}-${index}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex gap-2 max-w-[85%] ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className={`mt-1 p-1.5 rounded-xl flex-shrink-0 h-fit ${
                        message.role === 'user' ? 'bg-indigo-600' : 'bg-white/5 border border-white/10'
                      }`}>
                        {message.role === 'user'
                          ? <User className="h-3.5 w-3.5" />
                          : <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                        }
                      </div>
                      <div className={`rounded-2xl px-3 py-2.5 text-sm leading-relaxed ${
                        message.role === 'user'
                          ? 'bg-indigo-600 text-white rounded-tr-none'
                          : 'bg-white/5 border border-white/5 rounded-tl-none'
                      }`}>
                        {message.text}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start gap-2">
                  <div className="p-1.5 rounded-xl bg-white/5 border border-white/10 h-fit">
                    <Sparkles className="h-3.5 w-3.5 text-indigo-400 animate-pulse" />
                  </div>
                  <div className="bg-white/5 border border-white/5 rounded-2xl rounded-tl-none px-3 py-2.5">
                    <div className="flex gap-1 items-center h-4">
                      {[0, 0.2, 0.4].map((delay, i) => (
                        <motion.span
                          key={i}
                          animate={{ opacity: [0.4, 1, 0.4] }}
                          transition={{ repeat: Infinity, duration: 1, delay }}
                          className="w-1.5 h-1.5 bg-indigo-400 rounded-full"
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Input area */}
            <div className="p-3 border-t border-white/5 bg-black/20 flex-shrink-0">
              {/* Quick questions */}
              {messages.length <= 1 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {QUICK_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => setInput(q)}
                      className="text-[10px] px-2 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
              <div className="flex gap-2 p-1.5 rounded-xl bg-white/5 border border-white/10 focus-within:border-indigo-500/50 transition-all">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about this meeting..."
                  className="flex-1 bg-transparent border-0 text-sm focus:outline-none px-2"
                  disabled={loading}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
                />
                <button
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  className="h-8 w-8 bg-indigo-600 hover:bg-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0 disabled:opacity-50 transition-colors"
                >
                  <SendHorizontal className="h-3.5 w-3.5 text-white" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`h-14 w-14 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-300 ${
          isOpen ? 'bg-rose-500 shadow-rose-500/20' : 'bg-indigo-600 shadow-indigo-500/20'
        }`}
      >
        {isOpen ? <X className="h-6 w-6 text-white" /> : <MessageSquare className="h-6 w-6 text-white" />}
      </motion.button>
    </div>
  );
};

export default ChatPanel;
