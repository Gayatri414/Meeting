import { useEffect, useState } from 'react';
import { CheckSquare, Check, Clock, User, Flag, TrendingUp, Filter } from 'lucide-react';
import { getAllMeetings, updateTaskStatus } from '@/services/api';
import { motion, AnimatePresence } from 'framer-motion';

const priorityColor = (p) => {
  if (p === 'High') return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
  if (p === 'Medium') return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
  return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
};

const Tasks = () => {
  const [allTasks, setAllTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending'); // pending | done | all
  const [updating, setUpdating] = useState(null);

  const loadTasks = async () => {
    try {
      const meetings = await getAllMeetings();
      const tasks = [];
      meetings.forEach((m) => {
        (m.tasks || []).forEach((t, idx) => {
          tasks.push({ ...t, meetingId: m._id, taskIndex: idx, meetingTitle: m.title || m.summary?.substring(0, 50) });
        });
      });
      setAllTasks(tasks);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { loadTasks(); }, []);

  const handleToggle = async (task) => {
    const key = `${task.meetingId}-${task.taskIndex}`;
    setUpdating(key);
    try {
      const newCompleted = !task.completed;
      await updateTaskStatus(task.meetingId, task.taskIndex, {
        completed: newCompleted,
        status: newCompleted ? 'done' : 'pending'
      });
      setAllTasks(prev => prev.map(t =>
        t.meetingId === task.meetingId && t.taskIndex === task.taskIndex
          ? { ...t, completed: newCompleted, status: newCompleted ? 'done' : 'pending' }
          : t
      ));
    } catch {}
    setUpdating(null);
  };

  const filtered = allTasks.filter(t => {
    if (filter === 'pending') return !t.completed;
    if (filter === 'done') return t.completed;
    return true;
  });

  const total = allTasks.length;
  const done = allTasks.filter(t => t.completed).length;
  const score = total ? Math.round((done / total) * 100) : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Tasks</h1>
          <p className="text-sm text-muted-foreground">Track and complete your action items</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Tasks', value: total, color: 'text-white' },
          { label: 'Completed', value: done, color: 'text-emerald-400' },
          { label: 'Pending', value: total - done, color: 'text-amber-400' },
          { label: 'Score', value: `${score}%`, color: 'text-indigo-400' }
        ].map((stat) => (
          <div key={stat.label} className="glass-card rounded-2xl p-4 border border-white/5">
            <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Productivity bar */}
      <div className="glass-card rounded-2xl p-4 border border-white/5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-indigo-400" />
            <span className="text-sm font-medium">Productivity Score</span>
          </div>
          <span className="text-sm font-bold text-indigo-400">{score}%</span>
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full"
          />
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {['all', 'pending', 'done'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-all capitalize ${
              filter === f
                ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                : 'bg-white/5 text-muted-foreground hover:bg-white/10 border border-white/5'
            }`}
          >
            {f} {f === 'all' ? `(${total})` : f === 'pending' ? `(${total - done})` : `(${done})`}
          </button>
        ))}
      </div>

      {/* Task list */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4].map(i => <div key={i} className="h-16 glass-card rounded-2xl animate-pulse border border-white/5" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center border border-white/5">
          <CheckSquare className="h-10 w-10 mx-auto mb-3 opacity-20" />
          <p className="text-muted-foreground">No {filter} tasks</p>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {filtered.map((task, i) => {
              const key = `${task.meetingId}-${task.taskIndex}`;
              const isUpdating = updating === key;
              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: i * 0.03 }}
                  className={`glass-card rounded-2xl p-4 border transition-all ${
                    task.completed ? 'border-emerald-500/10 opacity-60' : 'border-white/5 hover:border-indigo-500/20'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => handleToggle(task)}
                      disabled={isUpdating}
                      className={`mt-0.5 h-5 w-5 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                        task.completed
                          ? 'bg-emerald-500 border-emerald-500'
                          : 'border-white/20 hover:border-indigo-400'
                      }`}
                    >
                      {task.completed && <Check className="h-3 w-3 text-white" />}
                      {isUpdating && <div className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />}
                    </button>

                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium leading-tight ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                        {task.task}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {task.person || task.user || 'Unassigned'}
                        </span>
                        {task.deadline && task.deadline !== 'unspecified' && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {task.deadline}
                          </span>
                        )}
                        {task.meetingTitle && (
                          <span className="truncate max-w-[200px] text-indigo-400/70">📋 {task.meetingTitle}</span>
                        )}
                      </div>
                    </div>

                    <span className={`text-[10px] px-2 py-0.5 rounded-lg border font-medium flex-shrink-0 ${priorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default Tasks;
