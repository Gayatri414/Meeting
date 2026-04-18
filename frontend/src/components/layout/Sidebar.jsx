import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, History, BarChart3, LogOut, BrainCircuit,
  Calendar, CheckSquare, ChevronLeft, ChevronRight, Share2, MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';
import AppShareModal from '@/components/share/AppShareModal';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: History,         label: 'History',   path: '/history' },
  { icon: BarChart3,       label: 'Analytics', path: '/analytics' },
  { icon: Calendar,        label: 'Calendar',  path: '/calendar' },
  { icon: CheckSquare,     label: 'My Tasks',  path: '/tasks' },
  { icon: MessageSquare,   label: 'Topics',    path: '/topics' },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const { dark } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('meetai_user');
    localStorage.removeItem('meetai_theme');
    navigate('/login', { replace: true });
  };

  const textMuted = dark ? 'text-gray-400' : 'text-gray-500';
  const subText   = dark ? 'text-[#8b7db5]' : 'text-gray-400';

  return (
    <>
      <motion.aside
        animate={{ width: collapsed ? 72 : 248 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        className="glass-sidebar h-screen sticky top-0 hidden lg:flex flex-col py-6 overflow-hidden flex-shrink-0 relative"
      >
        {/* Logo */}
        <div className={`flex items-center gap-3 mb-8 px-4 ${collapsed ? 'justify-center' : ''}`}>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2.5 rounded-2xl btn-primary shadow-purple-md flex-shrink-0 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <BrainCircuit className="h-5 w-5 text-white" />
          </motion.div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.15 }}
              >
                <h1 className="text-lg font-bold text-gradient whitespace-nowrap">MeetAI</h1>
                <p className={`text-[10px] whitespace-nowrap ${subText}`}>Meeting Intelligence</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Divider */}
        <div className="mx-4 mb-4 h-px bg-gradient-to-r from-transparent via-purple-700/30 to-transparent" />

        {/* Nav */}
        <nav className="flex-1 space-y-1 px-3 overflow-y-auto custom-scrollbar">
          {navItems.map((item, i) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              title={collapsed ? item.label : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all duration-200 group relative overflow-hidden
                ${isActive ? 'nav-active' : `${textMuted} hover:bg-purple-700/10 dark:hover:text-purple-300 hover:text-purple-700`}
                ${collapsed ? 'justify-center' : ''}`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute inset-0 rounded-2xl"
                      style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.2) 0%, rgba(37,99,235,0.12) 100%)' }}
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                    />
                  )}
                  <item.icon className={`h-5 w-5 flex-shrink-0 relative z-10 transition-colors ${isActive ? 'text-purple-400' : ''}`} />
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="font-medium text-sm whitespace-nowrap relative z-10"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {/* Active dot */}
                  {collapsed && (
                    <NavLink to={item.path} end={item.path === '/'}>
                      {({ isActive: ia }) => ia ? (
                        <span className="absolute right-1.5 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-purple-400" />
                      ) : null}
                    </NavLink>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Divider */}
        <div className="mx-4 my-3 h-px bg-gradient-to-r from-transparent via-purple-700/30 to-transparent" />

        {/* Bottom actions */}
        <div className="px-3 space-y-1">
          <button
            onClick={() => setShareOpen(true)}
            title={collapsed ? 'Share App' : undefined}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl w-full text-[#8b7db5] hover:bg-purple-700/10 hover:text-purple-400 transition-all ${collapsed ? 'justify-center' : ''}`}
          >
            <Share2 className="h-5 w-5 flex-shrink-0" />
            <AnimatePresence>
              {!collapsed && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="font-medium text-sm">
                  Share App
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          <button
            onClick={handleLogout}
            title={collapsed ? 'Logout' : undefined}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl w-full text-[#8b7db5] hover:bg-red-500/10 hover:text-red-400 transition-all ${collapsed ? 'justify-center' : ''}`}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            <AnimatePresence>
              {!collapsed && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="font-medium text-sm">
                  Logout
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>

        {/* Collapse toggle */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3.5 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-[#1a1230] border border-purple-700/30 flex items-center justify-center hover:bg-purple-700/20 hover:border-purple-500/50 transition-all z-20 shadow-purple-sm"
        >
          {collapsed
            ? <ChevronRight className="h-3.5 w-3.5 text-purple-400" />
            : <ChevronLeft  className="h-3.5 w-3.5 text-purple-400" />
          }
        </motion.button>
      </motion.aside>

      <AppShareModal isOpen={shareOpen} onClose={() => setShareOpen(false)} />
    </>
  );
};

export default Sidebar;
