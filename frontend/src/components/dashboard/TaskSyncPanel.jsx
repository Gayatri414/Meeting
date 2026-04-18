import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, X, CheckCircle2, ExternalLink, Loader2,
  AlertTriangle, ChevronDown, ChevronUp, User, Clock
} from 'lucide-react';
import { syncMeetingTasks } from '@/services/api';

// ─── Tool icons (inline SVG to avoid extra deps) ─────────────────────────────
const JiraIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
    <path d="M11.571 11.513H0a5.218 5.218 0 0 0 5.232 5.215h2.13v2.057A5.215 5.215 0 0 0 12.575 24V12.518a1.005 1.005 0 0 0-1.004-1.005zm5.723-5.756H5.757a5.215 5.215 0 0 0 5.214 5.214h2.129v2.058a5.218 5.218 0 0 0 5.215 5.214V6.762a1.005 1.005 0 0 0-1.021-1.005zM23.013 0H11.455a5.215 5.215 0 0 0 5.215 5.215h2.129v2.057A5.215 5.215 0 0 0 24.018 12.49V1.005A1.005 1.005 0 0 0 23.013 0z"/>
  </svg>
);

const LinearIcon = () => (
  <svg viewBox="0 0 100 100" className="h-4 w-4" fill="currentColor">
    <path d="M1.22541 61.5228c-.2225-.9485.90748-1.5459 1.59638-.857l36.5099 36.5099c.6889.6889.0915 1.8189-.857 1.5964C20.0515 94.4522 5.54779 79.9485 1.22541 61.5228zM.00189135 46.8891c-.01764375.2833.08887 .5599.28957.7606L52.3503 99.7085c.2007.2007.4773.3072.7606.2896 2.3692-.1476 4.6938-.46 6.9624-.9259.7645-.157 1.0301-1.0963.4782-1.6481L2.57595 39.4485c-.55186-.5519-1.49117-.2863-1.648174.4782-.465915 2.2686-.77832 4.5932-.92588 6.9624zM4.21093 29.7054c-.16649.3738-.08169.8106.21106 1.1034L69.1911 95.5779c.2928.2927.7296.3775 1.1034.2110 1.7861-.7956 3.5171-1.6927 5.1855-2.684.5521-.328.6373-1.0867.1832-1.5407L8.43566 24.3367c-.45409-.4541-1.21271-.3689-1.54074.1832-.99132 1.6684-1.88843 3.3994-2.68399 5.1855zM12.6587 18.074c-.3701-.3701-.3701-.9702 0-1.3403C21.5628 7.77022 34.3018 2 48.3686 2c27.2979 0 49.4809 22.183 49.4809 49.4809 0 14.0668-5.7702 26.8058-15.0337 35.7099-.3701.3701-.9702.3701-1.3403 0L12.6587 18.074z"/>
  </svg>
);

const NotionIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
    <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.139c-.093-.514.28-.887.747-.933zM1.936 1.035l13.31-.98c1.634-.14 2.055-.047 3.082.7l4.249 2.986c.7.513.934.653.934 1.213v16.378c0 1.026-.373 1.634-1.68 1.726l-15.458.934c-.98.047-1.448-.093-1.962-.747l-3.129-4.06c-.56-.747-.793-1.306-.793-1.96V2.667c0-.839.374-1.54 1.447-1.632z"/>
  </svg>
);

const TOOLS = {
  jira:   { label: 'Jira',   color: 'text-blue-400',    bg: 'bg-blue-500/10',   border: 'border-blue-500/20',   Icon: JiraIcon },
  linear: { label: 'Linear', color: 'text-purple-400',  bg: 'bg-purple-500/10', border: 'border-purple-500/20', Icon: LinearIcon },
  notion: { label: 'Notion', color: 'text-gray-300',    bg: 'bg-white/5',       border: 'border-white/10',      Icon: NotionIcon },
};

const TYPE_BADGE = {
  bug:      'bg-rose-500/10 text-rose-400',
  feature:  'bg-blue-500/10 text-blue-400',
  design:   'bg-purple-500/10 text-purple-400',
  research: 'bg-amber-500/10 text-amber-400',
  devops:   'bg-emerald-500/10 text-emerald-400',
  meeting:  'bg-indigo-500/10 text-indigo-400',
  other:    'bg-white/5 text-muted-foreground',
};

// ─── Credentials form per tool ────────────────────────────────────────────────
const CredentialsForm = ({ target, creds, onChange }) => {
  const field = (key, label, placeholder, type = 'text') => (
    <div key={key}>
      <label className="text-[10px] font-medium text-muted-foreground mb-1 block uppercase tracking-wider">{label}</label>
      <input
        type={type}
        value={creds[key] || ''}
        onChange={e => onChange({ ...creds, [key]: e.target.value })}
        placeholder={placeholder}
        className="w-full bg-white/5 border border-white/10 rounded-xl h-9 px-3 text-xs focus:outline-none focus:border-indigo-500/50 transition-all"
      />
    </div>
  );

  if (target === 'jira') return (
    <div className="grid grid-cols-2 gap-2">
      {field('host',       'Jira Host',    'yourcompany.atlassian.net')}
      {field('email',      'Email',        'you@company.com')}
      {field('token',      'API Token',    'ATATT3x...', 'password')}
      {field('projectKey', 'Project Key',  'PROJ')}
    </div>
  );

  if (target === 'linear') return (
    <div className="grid grid-cols-2 gap-2">
      {field('apiKey', 'API Key', 'lin_api_...', 'password')}
      {field('teamId', 'Team ID', 'xxxxxxxx-xxxx-...')}
    </div>
  );

  if (target === 'notion') return (
    <div className="grid grid-cols-2 gap-2">
      {field('notionToken', 'Integration Token', 'secret_...', 'password')}
      {field('databaseId',  'Database ID',       'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx')}
    </div>
  );

  return null;
};

// ─── Main component ───────────────────────────────────────────────────────────
const TaskSyncPanel = ({ meetingId, tasks = [], followUpMeetings = [] }) => {
  const [activeTarget, setActiveTarget] = useState(null);
  const [creds, setCreds] = useState({});
  const [selected, setSelected] = useState(new Set());
  const [syncing, setSyncing] = useState(false);
  const [results, setResults] = useState(null);
  const [showFollowUps, setShowFollowUps] = useState(true);

  if (!tasks.length && !followUpMeetings.length) return null;

  // Group tasks by suggested sync target
  const grouped = { jira: [], linear: [], notion: [], none: [] };
  tasks.forEach((t, i) => {
    const key = t.syncTarget || 'none';
    grouped[key]?.push({ ...t, _idx: i });
  });

  const toggleTask = (idx) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  const selectAllFor = (target) => {
    const idxs = grouped[target]?.map(t => t._idx) || [];
    setSelected(prev => {
      const next = new Set(prev);
      idxs.forEach(i => next.add(i));
      return next;
    });
  };

  const handleSync = async () => {
    if (!activeTarget || !selected.size || !meetingId) return;
    setSyncing(true);
    setResults(null);
    try {
      const res = await syncMeetingTasks(meetingId, activeTarget, Array.from(selected), creds);
      setResults(res.results);
    } catch (err) {
      setResults([{ success: false, error: err?.response?.data?.error || err.message, task: 'Sync failed' }]);
    }
    setSyncing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl border border-indigo-500/20 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5 bg-indigo-500/[0.04]">
        <div className="p-1.5 rounded-lg bg-indigo-500/20">
          <Zap className="h-4 w-4 text-indigo-400" />
        </div>
        <div>
          <h3 className="text-sm font-bold">Tasks & Follow-ups</h3>
          <p className="text-[10px] text-muted-foreground">AI-extracted with sync suggestions</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          {Object.entries(TOOLS).map(([key, { label, color, bg, border, Icon }]) => {
            const count = grouped[key]?.length || 0;
            if (!count) return null;
            return (
              <span key={key} className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full ${bg} ${color} border ${border}`}>
                <Icon />{count}
              </span>
            );
          })}
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Follow-up meetings */}
        {followUpMeetings.length > 0 && (
          <div>
            <button
              onClick={() => setShowFollowUps(p => !p)}
              className="flex items-center gap-2 w-full text-left mb-3"
            >
              <Clock className="h-4 w-4 text-blue-400" />
              <span className="text-sm font-semibold">Follow-up Meetings ({followUpMeetings.length})</span>
              {showFollowUps ? <ChevronUp className="h-3.5 w-3.5 ml-auto text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 ml-auto text-muted-foreground" />}
            </button>
            <AnimatePresence>
              {showFollowUps && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden space-y-2"
                >
                  {followUpMeetings.map((fm, i) => (
                    <div key={i} className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/15">
                      <p className="text-xs font-semibold text-blue-300">{fm.title}</p>
                      {fm.reason && <p className="text-[10px] text-muted-foreground mt-0.5">{fm.reason}</p>}
                      <div className="flex flex-wrap gap-3 mt-2 text-[10px] text-muted-foreground">
                        {fm.suggestedDate && fm.suggestedDate !== 'unspecified' && (
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{fm.suggestedDate}</span>
                        )}
                        {fm.participants?.length > 0 && (
                          <span className="flex items-center gap-1"><User className="h-3 w-3" />{fm.participants.join(', ')}</span>
                        )}
                      </div>
                      {fm.agenda?.length > 0 && (
                        <div className="mt-2 space-y-0.5">
                          {fm.agenda.map((a, j) => (
                            <p key={j} className="text-[10px] text-muted-foreground">• {a}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Tasks grouped by sync target */}
        {tasks.length > 0 && (
          <div className="space-y-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Action Items by Sync Target</p>

            {Object.entries(TOOLS).map(([key, { label, color, bg, border, Icon }]) => {
              const group = grouped[key] || [];
              if (!group.length) return null;
              return (
                <div key={key}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg ${bg} ${color} border ${border}`}>
                      <Icon />{label}
                    </span>
                    <button
                      onClick={() => selectAllFor(key)}
                      className="text-[10px] text-muted-foreground hover:text-white transition-colors ml-auto"
                    >
                      Select all
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    {group.map((task) => (
                      <label
                        key={task._idx}
                        className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                          selected.has(task._idx)
                            ? `${bg} ${border}`
                            : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selected.has(task._idx)}
                          onChange={() => toggleTask(task._idx)}
                          className="mt-0.5 accent-indigo-500 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium leading-tight">{task.task}</p>
                          <div className="flex flex-wrap items-center gap-2 mt-1.5">
                            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                              <User className="h-3 w-3" />{task.person || 'Unassigned'}
                            </span>
                            {task.dueDate && task.dueDate !== 'unspecified' && (
                              <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                <Clock className="h-3 w-3" />{task.dueDate}
                              </span>
                            )}
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-medium ${TYPE_BADGE[task.type] || TYPE_BADGE.other}`}>
                              {task.type || 'other'}
                            </span>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-medium ${
                              task.priority === 'High' ? 'bg-rose-500/10 text-rose-400' :
                              task.priority === 'Medium' ? 'bg-amber-500/10 text-amber-400' :
                              'bg-emerald-500/10 text-emerald-400'
                            }`}>{task.priority}</span>
                          </div>
                          {task.syncReason && (
                            <p className="text-[10px] text-muted-foreground/60 mt-1 italic">{task.syncReason}</p>
                          )}
                          {task.syncUrl && (
                            <a href={task.syncUrl} target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-1 text-[10px] text-indigo-400 hover:text-indigo-300 mt-1"
                              onClick={e => e.stopPropagation()}
                            >
                              <ExternalLink className="h-3 w-3" /> View in {label}
                            </a>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Sync controls */}
        {selected.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="border-t border-white/5 pt-4 space-y-3"
          >
            <div className="flex items-center gap-2">
              <p className="text-xs font-semibold">{selected.size} task{selected.size > 1 ? 's' : ''} selected — sync to:</p>
              <button onClick={() => setSelected(new Set())} className="ml-auto text-[10px] text-muted-foreground hover:text-rose-400 transition-colors">
                Clear
              </button>
            </div>

            {/* Tool selector */}
            <div className="flex gap-2">
              {Object.entries(TOOLS).map(([key, { label, color, bg, border, Icon }]) => (
                <button
                  key={key}
                  onClick={() => { setActiveTarget(key); setResults(null); }}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                    activeTarget === key ? `${bg} ${color} ${border}` : 'bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10'
                  }`}
                >
                  <Icon />{label}
                </button>
              ))}
            </div>

            {/* Credentials */}
            {activeTarget && (
              <motion.div
                key={activeTarget}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="overflow-hidden"
              >
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-2">
                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                    {TOOLS[activeTarget].label} Credentials
                  </p>
                  <CredentialsForm target={activeTarget} creds={creds} onChange={setCreds} />
                </div>

                <button
                  onClick={handleSync}
                  disabled={syncing}
                  className="mt-3 w-full h-9 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {syncing
                    ? <><Loader2 className="h-4 w-4 animate-spin" /> Syncing...</>
                    : <><Zap className="h-4 w-4" /> Sync {selected.size} task{selected.size > 1 ? 's' : ''} to {TOOLS[activeTarget].label}</>
                  }
                </button>
              </motion.div>
            )}

            {/* Results */}
            <AnimatePresence>
              {results && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-1.5"
                >
                  {results.map((r, i) => (
                    <div key={i} className={`flex items-start gap-2 p-2.5 rounded-xl text-xs border ${
                      r.success ? 'bg-emerald-500/5 border-emerald-500/15' : 'bg-rose-500/5 border-rose-500/15'
                    }`}>
                      {r.success
                        ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        : <AlertTriangle className="h-3.5 w-3.5 text-rose-400 flex-shrink-0 mt-0.5" />
                      }
                      <div className="flex-1 min-w-0">
                        <p className="truncate">{r.task}</p>
                        {r.success && r.url && (
                          <a href={r.url} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1 text-[10px] text-indigo-400 hover:text-indigo-300 mt-0.5"
                          >
                            <ExternalLink className="h-3 w-3" />{r.issueKey || 'View'}
                          </a>
                        )}
                        {!r.success && r.error && (
                          <p className="text-[10px] text-rose-400 mt-0.5">{r.error}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default TaskSyncPanel;
