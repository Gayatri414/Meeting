import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Calendar, ChevronDown, FileText, Search, Users, Pin, PinOff,
  Trash2, Download, ExternalLink, CheckSquare
} from 'lucide-react';
import { getAllMeetings, deleteMeeting, togglePinMeeting } from '@/services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { generateMeetingPDF } from '@/utils/pdfExport';

const priorityColor = (p) => {
  if (p === 'High') return 'text-rose-400';
  if (p === 'Medium') return 'text-amber-400';
  return 'text-emerald-400';
};

const History = () => {
  const [searchParams] = useSearchParams();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [expandedId, setExpandedId] = useState(null);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getAllMeetings();
        setMeetings(Array.isArray(data) ? data : []);
      } catch {
        setMeetings([]);
      }
      setLoading(false);
    };
    fetch();
  }, []);

  const filtered = meetings.filter((m) => {
    const text = `${m.summary || ''} ${m.transcript || ''} ${m.title || ''}`.toLowerCase();
    return text.includes(searchTerm.toLowerCase());
  });

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Delete this meeting?')) return;
    setDeleting(id);
    try {
      await deleteMeeting(id);
      setMeetings(prev => prev.filter(m => m._id !== id));
    } catch {}
    setDeleting(null);
  };

  const handlePin = async (id, e) => {
    e.stopPropagation();
    try {
      const updated = await togglePinMeeting(id);
      setMeetings(prev => prev.map(m => m._id === id ? { ...m, pinned: updated.pinned } : m));
    } catch {}
  };

  const handleExport = (meeting, e) => {
    e.stopPropagation();
    generateMeetingPDF(meeting);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-500">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Meeting History</h1>
          <p className="text-sm text-muted-foreground">{meetings.length} meetings recorded</p>
        </div>
        <div className="relative w-72">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl h-9 pl-10 pr-4 text-sm focus:outline-none focus:border-indigo-500/50 transition-all"
            placeholder="Search meetings..."
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-20 glass-card rounded-2xl animate-pulse border border-white/5" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center border border-white/5">
          <FileText className="h-10 w-10 mx-auto mb-3 opacity-20" />
          <p className="text-muted-foreground">No meetings found</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map((meeting, i) => (
              <motion.div
                key={meeting._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: i * 0.04 }}
                className={`glass-card rounded-2xl border transition-all cursor-pointer ${
                  meeting.pinned ? 'border-indigo-500/30' : 'border-white/5 hover:border-white/10'
                }`}
                onClick={() => setExpandedId(expandedId === meeting._id ? null : meeting._id)}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {meeting.pinned && <Pin className="h-3 w-3 text-indigo-400 flex-shrink-0" />}
                        <p className="text-sm font-semibold truncate">{meeting.title || 'Untitled Meeting'}</p>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{meeting.summary}</p>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={(e) => handlePin(meeting._id, e)}
                        className="p-1.5 rounded-lg hover:bg-white/5 transition-colors text-muted-foreground hover:text-indigo-400"
                        title={meeting.pinned ? 'Unpin' : 'Pin'}
                      >
                        {meeting.pinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
                      </button>
                      <button
                        onClick={(e) => handleExport(meeting, e)}
                        className="p-1.5 rounded-lg hover:bg-white/5 transition-colors text-muted-foreground hover:text-emerald-400"
                        title="Export PDF"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(meeting._id, e)}
                        disabled={deleting === meeting._id}
                        className="p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors text-muted-foreground hover:text-rose-400"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                      <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${expandedId === meeting._id ? 'rotate-180' : ''}`} />
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-2 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(meeting.createdAt).toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckSquare className="h-3 w-3" />
                      {meeting.tasks?.length || 0} tasks
                    </span>
                    {meeting.meetingLink && (
                      <a
                        href={meeting.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={e => e.stopPropagation()}
                        className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300"
                      >
                        <ExternalLink className="h-3 w-3" /> Join
                      </a>
                    )}
                  </div>
                </div>

                <AnimatePresence>
                  {expandedId === meeting._id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 pt-2 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Tasks */}
                        <div>
                          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
                            <Users className="h-3 w-3" /> Action Items
                          </h4>
                          <div className="space-y-1">
                            {(meeting.tasks || []).length === 0 ? (
                              <p className="text-xs text-muted-foreground">None</p>
                            ) : (
                              meeting.tasks.map((t, idx) => (
                                <div key={idx} className="flex items-start gap-2 text-xs">
                                  <span className={`mt-0.5 font-medium ${priorityColor(t.priority)}`}>•</span>
                                  <span className={t.completed ? 'line-through text-muted-foreground' : ''}>
                                    {t.task} <span className="text-muted-foreground">({t.person || t.user})</span>
                                  </span>
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                        {/* Decisions */}
                        <div>
                          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
                            <FileText className="h-3 w-3" /> Decisions
                          </h4>
                          <div className="space-y-1">
                            {(meeting.decisions || []).length === 0 ? (
                              <p className="text-xs text-muted-foreground">None</p>
                            ) : (
                              meeting.decisions.map((d, idx) => (
                                <p key={idx} className="text-xs">• {d}</p>
                              ))
                            )}
                          </div>
                        </div>

                        {/* Unresolved topics */}
                        {(meeting.unresolved_topics || []).length > 0 && (
                          <div className="md:col-span-2">
                            <h4 className="text-xs font-bold text-amber-400/70 uppercase tracking-wider mb-2">⚠ Unresolved Topics</h4>
                            <div className="flex flex-wrap gap-2">
                              {meeting.unresolved_topics.map((t, i) => (
                                <span key={i} className="text-xs px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">{t}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default History;
