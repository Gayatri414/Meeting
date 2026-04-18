import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import gsap from 'gsap';

const ThemeToggle = ({ className = '' }) => {
  const { dark, toggle } = useTheme();
  const btnRef = useRef(null);

  const handleToggle = () => {
    // GSAP: quick scale-bounce on the button, then fade the page
    const tl = gsap.timeline();
    tl.to(btnRef.current, { scale: 0.85, duration: 0.1, ease: 'power2.in' })
      .to(btnRef.current, { scale: 1.1,  duration: 0.15, ease: 'power2.out' })
      .to(btnRef.current, { scale: 1,    duration: 0.1,  ease: 'power2.inOut' });

    // Fade the main content during switch
    gsap.to('#layout-main', {
      opacity: 0.6, duration: 0.15, ease: 'power1.in',
      onComplete: () => {
        toggle();
        gsap.to('#layout-main', { opacity: 1, duration: 0.35, ease: 'power2.out', delay: 0.05 });
      }
    });
  };

  return (
    <motion.button
      ref={btnRef}
      onClick={handleToggle}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      title={dark ? 'Switch to Light mode' : 'Switch to Dark mode'}
      className={`relative h-9 w-16 rounded-full border transition-all duration-400 flex items-center px-1 ${
        dark
          ? 'bg-purple-700/20 border-purple-700/30'
          : 'bg-amber-50 border-amber-200'
      } ${className}`}
      aria-label="Toggle theme"
    >
      {/* Track icons */}
      <Moon className={`absolute left-2 h-3.5 w-3.5 transition-opacity duration-300 ${dark ? 'opacity-100 text-purple-300' : 'opacity-30 text-gray-400'}`} />
      <Sun  className={`absolute right-2 h-3.5 w-3.5 transition-opacity duration-300 ${!dark ? 'opacity-100 text-amber-500' : 'opacity-30 text-gray-500'}`} />

      {/* Thumb */}
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
        className={`h-6 w-6 rounded-full shadow-md flex items-center justify-center z-10 ${
          dark
            ? 'bg-gradient-to-br from-purple-500 to-blue-600 ml-0'
            : 'bg-gradient-to-br from-amber-400 to-orange-400 ml-auto'
        }`}
      >
        {dark
          ? <Moon className="h-3 w-3 text-white" />
          : <Sun  className="h-3 w-3 text-white" />
        }
      </motion.div>
    </motion.button>
  );
};

export default ThemeToggle;
