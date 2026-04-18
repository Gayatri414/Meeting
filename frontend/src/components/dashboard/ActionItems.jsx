import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckSquare, User, Clock, Zap, Filter, ChevronDown, AlertCircle } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useTheme } from '@/context/ThemeContext';

gsap.registerPlugin(ScrollTrigger);

/* ── Priority config ─────────────────────────────────────── */
const PRIORITY = {
  high:   { label: 'High',   badge: 'badge-high',   dot: 'bg-red-400',     bar: 'from-red-500 to-rose-400',     ring: 'ring-red-400/20' },
  medium: { label: 'Medium', badge: 'badge-medium',  dot: 'bg-amber-400',   bar: 'from-amber-500 to-yellow-400', ring: 'ring-amber-400/20' },
  low:    { label: 'Low',    badge: 'badge-low',     dot: 'bg-emerald-400', bar: 'from-emerald-500 to-teal-400', ring: 'ring-emerald-400/20' },
};
const getPriority = (p) => PRIORITY[p?.toLowerCase()] || PRIORITY.low;

/* ── Single task card ────────────────────────────────────── */
const TaskCard = ({ task, dark }) => {
  const [expanded, setExpanded] = useState(false);
  const p = getPriority(task.priority);

  const cardBg = dark
    ? 'bg-gradient-to-br from-purple-950/40 to-blue-950/20 border-purple-700/15 hover:border-purple-500/35'
    : 'bg-white border-purple-100 hover:border-purple-300 shadow-sm hover:shadow-purple-sm';

  const titleColor  = dark ? 'text-white group-hover:text-purple-100' : 'text-gray-900 group-hover:text-purple-900';
  const metaColor   = dark ? 'text-gray-400' : 'text-gray-500';
  const assigneeColor = dark ? 'text-purple-300' : 'text-purple-700';
  const expandedBg  = dark ? 'bg-purple-900/20 border-purple-700/20' : 'bg-purple-50 border-purple-100';
  const syncBadge   = dark ? 'bg-blue-900/30 text-blue-300 border-blue-700/25' : 'bg-blue-50 text-blue-700 border-blue-200';

  return (
    <motion.div
      layout
      whileHover={{ scale: 1.018, y: -1 }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      onClick={() => setExpanded(!expanded)}
      className={`task-card group relative overflow-hidden rounded-2xl border cursor-pointer transition-all duration-250 ${cardBg}`}
    >
      {/* Left priority bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b ${p.bar} rounded-l-2xl`} />

      {/* Hover shimmer */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"
        style={{ background: 'radial-gradient(ellipse at 10% 50%, rgba(124,58,237,0.05) 0%, transparent 65%)' }}
      />

      <div className="pl-4 pr-3.5 py-3.5">
        {/* Row 1: title + badge */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5 flex-1 min-w-0">
            <span className={`mt-[5px] h-2 w-2 rounded-full flex-shrink-0 ${p.dot}`} />
            <p className={`text-sm font-semibold leading-snug transition-colors line-clamp-2 ${titleColor}`}>
              {task.task}
            </p>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0 mt-0.5">
            <span className={`text-[10px] px-2 py-0.5 rounded-lg font-bold ${p.badge}`}>
              {p.label}
            </span>
            <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.22 }}>
              <ChevronDown className={`h-3.5 w-3.5 ${metaColor}`} />
            </motion.div>
          </div>
        </div>

        {/* Row 2: meta */}
        <div className="flex flex-wrap items-center gap-3 mt-2.5 pl-[18px]">
          <div className={`flex items-center gap-1.5 text-[11px] ${metaColor}`}>
            <div className={`h-5 w-5 rounded-lg flex items-center justify-center ${dark ? 'bg-purple-700/20' : 'bg-purple-100'}`}>
              <User className="h-3 w-3 text-purple-500" />
            </div>
            <span className={`font-medium ${assigneeColor}`}>{task.person || task.user || 'Unassigned'}</span>
          </div>

          {(task.dueDate || task.deadline) && (task.dueDate || task.deadline) !== 'unspecified' && (
            <div className={`flex items-center gap-1.5 text-[11px] ${metaColor}`}>
              <div className={`h-5 w-5 rounded-lg flex items-center justify-center ${dark ? 'bg-blue-700/20' : 'bg-blue-100'}`}>
                <Clock className="h-3 w-3 text-blue-500" />
              </div>
              <span>{task.dueDate || task.deadline}</span>
            </div>
          )}

          {task.type && task.type !== 'other' && (
            <span className={`text-[10px] px-2 py-0.5 rounded-lg font-medium capitalize border ${
              dark ? 'bg-purple-700/15 text-purple-300 border-purple-700/20' : 'bg-purple-50 text-purple-600 border-purple-200'
            }`}>
              {task.type}
            </span>
          )}
        </div>

        {/* Expanded details */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
              className="overflow-hidden"
            >
              <div className={`mt-3 ml-[18px] pt-3 border-t rounded-xl p-2.5 space-y-2 ${expandedBg}`}>
                {task.syncReason && (
                  <div className={`flex items-start gap-2 text-[11px] ${metaColor}`}>
                    <Zap className="h-3.5 w-3.5 text-purple-500 flex-shrink-0 mt-0.5" />
                    <span className="italic leading-relaxed">{task.syncReason}</span>
                  </div>
                )}
                {task.syncTarget && task.syncTarget !== 'none' && (
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] ${metaColor}`}>Sync to:</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-lg font-bold capitalize border ${syncBadge}`}>
                      {task.syncTarget}
                    </span>
                  </div>
                )}
                {!task.syncReason && !task.syncTarget && (
                  <p className={`text-[11px] ${metaColor} italic`}>No additional details.</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

/* ── Main ActionItems component ──────────────────────────── */
const ActionItems = ({ tasks, analyzing, currentUserEmail }) => {
  const { dark } = useTheme();
  const [filterMine, setFilterMine] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState('all');
  const listRef = useRef(null);
  const containerRef = useRef(null);

  const myName = currentUserEmail?.split('@')[0]?.toLowerCase();

  let filtered = tasks || [];
  if (filterMine && myName) {
    filtered = filtered.filter(t => (t.person || t.user || '').toLowerCase().includes(myName));
  }
  if (priorityFilter !== 'all') {
    filtered = filtered.filter(t => t.priority?.toLowerCase() === priorityFilter);
  }

  const counts = {
    high:   (tasks || []).filter(t => t.priority?.toLowerCase() === 'high').length,
    medium: (tasks || []).filter(t => t.priority?.toLowerCase() === 'medium').length,
    low:    (tasks || []).filter(t => t.priority?.toLowerCase() === 'low').length,
  };

  // GSAP stagger on cards when tasks load / filter changes
  useEffect(() => {
    if (!listRef.current || !filtered.length) return;
    const cards = listRef.current.querySelectorAll('.task-card');
    if (!cards.length) return;

    gsap.fromTo(cards,
      { opacity: 0, y: 18, scale: 0.97 },
      {
        opacity: 1, y: 0, scale: 1,
        duration: 0.38,
        stagger: 0.07,
        ease: 'power3.out',
        clearProps: 'transform',
      }
    );
  }, [filtered.length, priorityFilter, filterMine]);

  // GSAP ScrollTrigger: fade container in when scrolled into view
  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(containerRef.current, {
        opacity: 0, y: 24,
        duration: 0.5,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 88%',
          once: true,
        }
      });
    });
    return () => ctx.revert();
  }, []);

  // Theme-aware classes
  const headerBg    = dark ? 'from-purple-950/50 to-blue-950/30' : 'from-purple-50 to-blue-50';
  const headerBorder= dark ? 'border-purple-700/15' : 'border-purple-100';
  const titleColor  = dark ? 'text-white' : 'text-gray-900';
  const subColor    = dark ? 'text-gray-400' : 'text-gray-500';
  const pillActive  = dark ? 'bg-purple-600/25 text-purple-300 border-purple-500/35' : 'bg-purple-100 text-purple-700 border-purple-300';
  const pillInactive= dark ? 'bg-purple-700/8 text-gray-400 border-purple-700/15 hover:bg-purple-700/15 hover:text-purple-300' : 'bg-white text-gray-500 border-gray-200 hover:bg-purple-50 hover:text-purple-600';
  const filterActive= dark ? 'bg-purple-600/20 border-purple-500/40 text-purple-300' : 'bg-purple-100 border-purple-300 text-purple-700';
  const filterInact = dark ? 'bg-purple-700/8 border-purple-700/20 text-gray-400 hover:bg-purple-700/15 hover:text-purple-300' : 'bg-white border-gray-200 text-gray-500 hover:bg-purple-50 hover:text-purple-600';
  const footerBg    = dark ? 'bg-purple-950/30' : 'bg-purple-50/60';
  const footerBorder= dark ? 'border-purple-700/15' : 'border-purple-100';
  const emptyIcon   = dark ? 'bg-purple-700/15 border-purple-700/20' : 'bg-purple-50 border-purple-100';

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
      className="glass-card rounded-3xl overflow-hidden theme-transition"
    >
      {/* ── Header ── */}
      <div className={`px-5 pt-5 pb-4 border-b bg-gradient-to-r ${headerBg} ${headerBorder} theme-transition`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ rotate: 8, scale: 1.1 }}
              className={`p-2 rounded-xl border ${dark ? 'bg-purple-600/25 border-purple-500/25' : 'bg-purple-100 border-purple-200'}`}
            >
              <CheckSquare className="h-4 w-4 text-purple-500" />
            </motion.div>
            <div>
              <h3 className={`text-sm font-bold ${titleColor}`}>Action Items</h3>
              <p className={`text-[10px] ${subColor}`}>
                {filtered.length} of {(tasks || []).length} tasks
              </p>
            </div>
          </div>

          {/* Mine filter toggle */}
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setFilterMine(!filterMine)}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all ${
              filterMine ? filterActive : filterInact
            }`}
          >
            <Filter className="h-3 w-3" />
            {filterMine ? 'Mine' : 'All'}
          </motion.button>
        </div>

        {/* Priority pills */}
        <div className="flex gap-1.5 flex-wrap">
          {[
            { key: 'all',    label: `All (${(tasks || []).length})` },
            { key: 'high',   label: `🔴 High (${counts.high})` },
            { key: 'medium', label: `🟡 Med (${counts.medium})` },
            { key: 'low',    label: `🟢 Low (${counts.low})` },
          ].map(f => (
            <motion.button
              key={f.key}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setPriorityFilter(f.key)}
              className={`text-[10px] px-2.5 py-1 rounded-lg font-semibold border transition-all ${
                priorityFilter === f.key ? pillActive : pillInactive
              }`}
            >
              {f.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* ── Task list ── */}
      <div ref={listRef} className="p-4 space-y-2.5 max-h-[440px] overflow-y-auto custom-scrollbar">
        {analyzing ? (
          // Skeleton with GSAP shimmer
          [1, 2, 3].map(i => (
            <div key={i} className={`rounded-2xl border overflow-hidden ${dark ? 'border-purple-700/10' : 'border-purple-100'}`}>
              <div className="p-4 space-y-2.5">
                <div className="skeleton h-4 rounded-lg w-3/4" />
                <div className="skeleton h-3 rounded-lg w-2/5" />
                <div className="skeleton h-3 rounded-lg w-1/3" />
              </div>
            </div>
          ))
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <div className={`h-14 w-14 rounded-2xl border flex items-center justify-center mx-auto mb-3 ${emptyIcon}`}>
              {filterMine
                ? <AlertCircle className="h-7 w-7 text-purple-400 opacity-50" />
                : <CheckSquare className="h-7 w-7 text-purple-400 opacity-50" />
              }
            </div>
            <p className={`text-sm font-medium ${dark ? 'text-gray-300' : 'text-gray-600'}`}>
              {filterMine ? 'No tasks assigned to you.' : 'No action items yet.'}
            </p>
            <p className={`text-xs mt-1 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
              Analyze a meeting transcript to extract tasks
            </p>
          </motion.div>
        ) : (
          // Responsive grid: 1 col mobile, 2 col tablet, 3 col desktop
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2 gap-2.5">
            <AnimatePresence mode="popLayout">
              {filtered.map((task, idx) => (
                <TaskCard
                  key={`${task.task}-${idx}`}
                  task={task}
                  dark={dark}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* ── Footer summary ── */}
      {!analyzing && (tasks || []).length > 0 && (
        <div className={`px-5 py-3 border-t flex items-center justify-between ${footerBg} ${footerBorder} theme-transition`}>
          <div className="flex gap-4">
            {counts.high > 0 && (
              <span className="flex items-center gap-1.5 text-[10px] text-red-500 font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-red-400" />{counts.high} high
              </span>
            )}
            {counts.medium > 0 && (
              <span className="flex items-center gap-1.5 text-[10px] text-amber-500 font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />{counts.medium} medium
              </span>
            )}
            {counts.low > 0 && (
              <span className="flex items-center gap-1.5 text-[10px] text-emerald-500 font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />{counts.low} low
              </span>
            )}
          </div>
          <span className={`text-[10px] ${subColor}`}>Click to expand</span>
        </div>
      )}
    </motion.div>
  );
};

export default ActionItems;
