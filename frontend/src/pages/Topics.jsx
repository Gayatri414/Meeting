import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, MessageSquare, Clock, RefreshCw, Zap } from 'lucide-react';
import { getTopics, resolveTopic } from '@/services/api';
import { motion, AnimatePresence } from 'framer-motion';
import Toast from '@/components/common/Toast';

const Topics = () => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all | open | resolved | repeated
  const [toast, setToast] = useState('');
  const [toastType, setToastType] = useState('success');

  const showToast = (msg, type = 'success') => { setToast(msg); setToastType(type); };

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getTopics();
        setTopics(Array.isArray(data) ? data : []);
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  const handleResolve = async (id) => {
    try {
      const updated = await resolveTopic(id);
      setTopics(p => p.map(t => t._id === id ? updated : t));
      showToast('Topic marked as resolved');
    } catch { showToast('Failed to resolve', 'error'); }
  };

  const filtered = topics.filter(t => {
    if (filter === 'open') return t.status === 'open';
    if (filter === 'resolved') return t.status === 'resolved';
    if (filter === 'repeated') return t.isRepeatedUnresolved;
    return true;
  });

  const repeated = topics.filter(t => t.isRepeatedUnresolved).length;
  const open = topics.filter(t => t.status === 'open').length;
  const resolved = topics.filter(t => t.status === 'resolved').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <Toast message={toast} type={toastType} onClose={() => setToast('')} />

      <div>
        <h1 className="text-2xl font-bold">Topics Dashboard</h1>
        <p className="text-sm text-muted-foreground">Track recurring discussion topics across meetings</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Topics', value: topics.length, color: 'text-white' },
          { label: 'Open', value: open, color: 'text-amber-400' },
          { label: 'Resolved', value: resolved, color: 'text-emerald-400' },
          { label: 'Repeated Issues', value: repeated, color: 'text-rose-400' }
        ].map(s => (
          <div key={s.label} className="glass-card rounded-2xl p-4 border border-white/5">
            <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Repeated issues alert */}
      {repeated > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3"
        >
          <AlertTriangle className="h-5 w-5 text-rose-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-rose-400">
              {repeated} Frequently Discussed but Unresolved {repeated === 1 ? 'Issue' : 'Issues'}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              These topics have been discussed more than twice without resolution. Consider creating dedicated tasks or escalating.
            </p>
          </div>
        </motion.div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: 'all', label: `All (${topics.length})` },
          { key: 'open', label: `🔴 Open (${open})` },
          { key: 'resolved', label: `✅ Resolved (${resolved})` },
          { key: 'repeated', label: `⚠️ Repeated (${repeated})` }
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-all ${
              filter === f.key
                ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                : 'bg-white/5 text-muted-foreground hover:bg-white/10 border border-white/5'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Topics list */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-20 glass-card rounded-2xl animate-pulse border border-white/5" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center border border-white/5">
          <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-20" />
          <p className="text-muted-foreground">No topics found</p>
          <p className="text-xs text-muted-foreground mt-1">Topics are extracted automatically when you analyze meetings</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map((topic, i) => (
              <motion.div
                key={topic._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: i * 0.04 }}
                className={`glass-card rounded-2xl p-4 border transition-all ${
                  topic.isRepeatedUnresolved
                    ? 'border-rose-500/20 bg-rose-500/[0.03]'
                    : topic.status === 'resolved'
                    ? 'border-emerald-500/10 opacity-70'
                    : 'border-white/5 hover:border-indigo-500/20'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      {/* Status badge */}
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${
                        topic.status === 'resolved'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                        {topic.status === 'resolved' ? '✅ Resolved' : '🔴 Open'}
                      </span>

                      {/* Repeated flag */}
                      {topic.isRepeatedUnresolved && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1">
                          <AlertTriangle className="h-2.5 w-2.5" />
                          Repeated Issue
                        </span>
                      )}
                    </div>

                    <p className={`text-sm font-semibold ${topic.status === 'resolved' ? 'line-through text-muted-foreground' : ''}`}>
                      {topic.title}
                    </p>

                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <RefreshCw className="h-3 w-3" />
                        Discussed {topic.discussedCount}x
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Last: {new Date(topic.lastDiscussedAt).toLocaleDateString()}
                      </span>
                      {topic.meetings?.length > 0 && (
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {topic.meetings.length} meeting{topic.meetings.length > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>

                    {/* Suggested action for repeated issues */}
                    {topic.isRepeatedUnresolved && topic.suggestedAction && (
                      <div className="mt-2 p-2 rounded-xl bg-rose-500/5 border border-rose-500/10">
                        <p className="text-[10px] text-rose-400 flex items-center gap-1">
                          <Zap className="h-3 w-3" />
                          Suggestion: {topic.suggestedAction}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  {topic.status === 'open' && (
                    <button
                      onClick={() => handleResolve(topic._id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-medium transition-all flex-shrink-0"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Resolve
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default Topics;
