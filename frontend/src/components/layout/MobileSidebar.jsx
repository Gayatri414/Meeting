import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, History, BarChart3, LogOut, BrainCircuit,
  Calendar, CheckSquare, MessageSquare, Menu, X, Share2
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

const MobileSidebar = () => {
  const navigate = useNavigate();
  const { dark } = useTheme();
  const [open, setOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('meetai_user');
    localStorage.removeItem('meetai_theme');
    window.location.href = '/login';
  };

  const navItemClass = (isActive) =>
    `flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 text-sm font-medium ${
      isActive ? 'nav-active' : dark
        ? 'text-gray-400 hover:bg-purple-700/10 hover:text-purple-300'
        : 'text-gray-500 hover:bg-purple-50 hover:text-purple-700'
    }`;

  return (
    <>
      {/* Hamburger — only on mobile */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed bottom-5 left-5 z-50 h-12 w-12 rounded-2xl btn-primary flex items-center justify-center shadow-purple-lg"
      >
        <Menu className="h-5 w-5 text-white" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="lg:hidden fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 z-50 w-72 glass-sidebar flex flex-col py-6 px-4"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-8 px-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl btn-primary shadow-purple-sm">
                    <BrainCircuit className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-lg font-bold text-gradient">MeetAI</span>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="p-2 rounded-xl btn-ghost"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Nav */}
              <nav className="flex-1 space-y-1">
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/'}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) => navItemClass(isActive)}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    {item.label}
                  </NavLink>
                ))}
              </nav>

              {/* Bottom */}
              <div className="space-y-1 pt-4 border-t border-purple-700/20">
                <button
                  onClick={() => { setShareOpen(true); setOpen(false); }}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl w-full text-[#8b7db5] hover:bg-purple-700/10 hover:text-[#c4b5fd] transition-all text-sm font-medium"
                >
                  <Share2 className="h-5 w-5" /> Share App
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl w-full text-[#8b7db5] hover:bg-red-500/10 hover:text-red-400 transition-all text-sm font-medium"
                >
                  <LogOut className="h-5 w-5" /> Logout
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AppShareModal isOpen={shareOpen} onClose={() => setShareOpen(false)} />
    </>
  );
};

export default MobileSidebar;
