import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Search, User, ChevronDown, LayoutDashboard, Share2, Sparkles } from 'lucide-react';
import { getAllMeetings } from '@/services/api';
import { useMeetingUser } from '@/context/MeetingUserContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';
import ThemeToggle from '@/components/ui/ThemeToggle';
import AppShareModal from '@/components/share/AppShareModal';

const Navbar = () => {
  const navigate = useNavigate();
  const { dark } = useTheme();
  const { participantNames, activeParticipant, setActiveParticipant } = useMeetingUser();
  const [pendingTasks, setPendingTasks] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  const displayName = 'Guest';

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const meetings = await getAllMeetings();
        const tasks = meetings.flatMap((m) => m.tasks || []);
        const match = (u) => activeParticipant &&
          String(u).toLowerCase().trim() === String(activeParticipant).toLowerCase().trim();
        setPendingTasks(tasks.filter((t) => !t.completed && match(t.user || t.person)));
      } catch {}
    };
    fetchTasks();
  }, [activeParticipant]);

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);



  // Theme-aware text classes
  const textPrimary   = dark ? 'text-white'      : 'text-gray-900';
  const textSecondary = dark ? 'text-gray-300'   : 'text-gray-600';
  const textMuted     = dark ? 'text-gray-400'   : 'text-gray-500';
  const dropdownBg    = dark ? 'bg-[#0d0a1a]/95' : 'bg-white/98';
  const dropdownBorder= dark ? 'border-purple-700/25' : 'border-purple-200/60';
  const itemHover     = dark ? 'hover:bg-purple-700/10 hover:text-purple-300' : 'hover:bg-purple-50 hover:text-purple-700';

  return (
    <>
      <nav className="glass-navbar sticky top-0 z-40 h-16 flex items-center px-4 sm:px-5 lg:px-6 gap-3 theme-transition">

        {/* Search */}
        <div className="flex-1 relative hidden sm:block max-w-xs lg:max-w-sm group">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${textMuted} group-focus-within:text-purple-500`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && searchQuery.trim()) {
                navigate(`/history?search=${encodeURIComponent(searchQuery.trim())}`);
                setSearchQuery('');
              }
            }}
            placeholder="Search meetings, tasks..."
            className={`input-theme w-full h-9 pl-10 pr-4 text-sm rounded-xl ${textPrimary}`}
          />
        </div>

        <div className="flex items-center gap-2 ml-auto">

          {/* Participant selector */}
          {participantNames.length > 0 && (
            <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all ${
              dark ? 'bg-purple-700/10 border-purple-700/20' : 'bg-purple-50 border-purple-200/60'
            }`}>
              <User className="h-3.5 w-3.5 text-purple-500" />
              <select
                value={activeParticipant || participantNames[0]}
                onChange={(e) => setActiveParticipant(e.target.value)}
                className={`bg-transparent border-0 text-xs font-medium focus:ring-0 cursor-pointer ${
                  dark ? 'text-purple-300' : 'text-purple-700'
                }`}
              >
                {participantNames.map((name) => (
                  <option key={name} value={name}
                    className={dark ? 'bg-[#0d0a1a] text-white' : 'bg-white text-gray-900'}
                  >{name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Theme toggle */}
          <ThemeToggle />

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <motion.button
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => { setShowNotifications(p => !p); setShowProfile(false); }}
              className={`relative p-2 rounded-xl border transition-all ${
                dark
                  ? 'bg-purple-700/10 border-purple-700/20 hover:bg-purple-700/20'
                  : 'bg-purple-50 border-purple-200/60 hover:bg-purple-100'
              }`}
            >
              <Bell className={`h-4 w-4 ${textMuted}`} />
              {pendingTasks.length > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-[9px] font-bold flex items-center justify-center text-white"
                >
                  {pendingTasks.length > 9 ? '9+' : pendingTasks.length}
                </motion.span>
              )}
            </motion.button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className={`absolute right-0 mt-2 w-80 rounded-2xl p-4 shadow-glass-lg z-50 border glass-card-elevated ${dropdownBorder}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className={`text-sm font-bold ${textPrimary}`}>Notifications</h4>
                    {pendingTasks.length > 0 && (
                      <span className="text-[10px] bg-purple-700/20 text-purple-400 px-2 py-0.5 rounded-full font-medium border border-purple-700/30">
                        {pendingTasks.length} pending
                      </span>
                    )}
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                    {pendingTasks.length === 0 ? (
                      <div className="text-center py-6">
                        <Sparkles className="h-6 w-6 text-purple-400 mx-auto mb-2 opacity-50" />
                        <p className={`text-sm ${textMuted}`}>All caught up! 🎉</p>
                      </div>
                    ) : (
                      pendingTasks.map((task, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.04 }}
                          className={`p-3 rounded-xl border transition-colors ${
                            dark
                              ? 'bg-purple-700/8 border-purple-700/15 hover:bg-purple-700/15'
                              : 'bg-purple-50 border-purple-100 hover:bg-purple-100'
                          }`}
                        >
                          <p className={`text-xs font-medium leading-tight mb-1 ${textPrimary}`}>{task.task}</p>
                          <div className={`flex justify-between text-[10px] ${textMuted}`}>
                            <span className="text-purple-500">Action Item</span>
                            <span>Due: {task.deadline || task.dueDate || 'N/A'}</span>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile */}
          <div className="relative" ref={profileRef}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { setShowProfile(p => !p); setShowNotifications(false); }}
              className={`flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border transition-all ${
                dark
                  ? 'border-transparent hover:bg-purple-700/10 hover:border-purple-700/20'
                  : 'border-transparent hover:bg-purple-50 hover:border-purple-200/60'
              }`}
            >
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                <User className="h-4 w-4" />
              </div>
              <div className="hidden lg:flex flex-col items-start">
                <span className={`text-xs font-semibold leading-tight ${textPrimary}`}>MeetAI</span>
                <span className={`text-[10px] ${textMuted}`}>Pro Account</span>
              </div>
              <ChevronDown className={`h-3.5 w-3.5 hidden lg:block ${textMuted}`} />
            </motion.button>

            <AnimatePresence>
              {showProfile && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className={`absolute right-0 mt-2 w-56 rounded-2xl p-2 shadow-glass-lg z-50 border glass-card-elevated ${dropdownBorder}`}
                >
                  <div className={`px-3 py-2.5 mb-1 border-b ${dark ? 'border-purple-700/20' : 'border-purple-100'}`}>
                    <p className={`text-sm font-semibold ${textPrimary}`}>MeetAI App</p>
                    <p className={`text-xs truncate ${textMuted}`}>Meeting Intelligence</p>
                  </div>
                  {[
                    { icon: LayoutDashboard, label: 'Dashboard', action: () => navigate('/') },
                    { icon: Share2, label: 'Share App', action: () => { setShareOpen(true); setShowProfile(false); } },
                  ].map((item) => (
                    <motion.button
                      key={item.label}
                      whileHover={{ x: 2 }}
                      onClick={item.action}
                      className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm transition-colors ${
                        item.danger
                          ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10'
                          : `${textSecondary} ${itemHover}`
                      }`}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </nav>

      <AppShareModal isOpen={shareOpen} onClose={() => setShareOpen(false)} />
    </>
  );
};

export default Navbar;
