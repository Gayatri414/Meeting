import { useEffect, useRef, useState } from 'react';
import {
  ChevronLeft, ChevronRight, Calendar as CalIcon, Plus, X,
  Clock, User, Link2, Camera, Loader2, CheckCircle2, Trash2,
  AlertTriangle, Upload
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getScheduledMeetings, scheduleMeeting,
  updateScheduledStatus, deleteScheduledMeeting
} from '@/services/api';
import Toast from '@/components/common/Toast';

const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];

// ─── Lightbox ─────────────────────────────────────────────────────────────────
const Lightbox = ({ src, onClose }) => (
  <div
    className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4"
    onClick={onClose}
  >
    <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors">
      <X className="h-5 w-5 text-white" />
    </button>
    <img
      src={src}
      alt="Screenshot"
      className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl object-contain"
      onClick={e => e.stopPropagation()}
    />
  </div>
);

// ─── Schedule Modal ───────────────────────────────────────────────────────────
const ScheduleModal = ({ onClose, onSaved, defaultDate }) => {
  const [text, setText] = useState('');
  const [screenshot, setScreenshot] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [manualDate, setManualDate] = useState(
    defaultDate ? defaultDate.toISOString().slice(0, 16) : ''
  );
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const fileRef = useRef(null);

  const handleImageFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setScreenshot(e.target.result);
      setScreenshotPreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const track = stream.getVideoTracks()[0];
      const ic = new ImageCapture(track);
      const bitmap = await ic.grabFrame();
      const canvas = document.createElement('canvas');
      canvas.width = bitmap.width; canvas.height = bitmap.height;
      canvas.getContext('2d').drawImage(bitmap, 0, 0);
      const dataUrl = canvas.toDataURL('image/png');
      setScreenshot(dataUrl); setScreenshotPreview(dataUrl);
      track.stop();
    } catch {}
  };

  const handleSubmit = async () => {
    if (!text.trim() && !screenshot) return;
    setLoading(true);
    try {
      const res = await scheduleMeeting({
        text: text.trim(),
        screenshot: screenshot || undefined,
        manualDate: manualDate || undefined
      });
      setResult(res);
      onSaved(res.meeting);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-lg glass-card border-white/10 shadow-2xl rounded-3xl overflow-hidden"
      >
        <div className="p-5 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalIcon className="h-5 w-5 text-indigo-400" />
            <h3 className="text-lg font-bold">Schedule Meeting</h3>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/5 rounded-xl transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
          {!result ? (
            <>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Meeting notes / description
                </label>
                <textarea
                  value={text}
                  onChange={e => setText(e.target.value)}
                  placeholder='e.g. "Discuss API delay and UI bugs tomorrow at 5pm with Rahul"'
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500/50 transition-all resize-none"
                />
                <p className="text-[10px] text-muted-foreground mt-1">
                  AI will auto-detect date, time, assignee and topics
                </p>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Date & Time (optional override)
                </label>
                <input
                  type="datetime-local"
                  value={manualDate}
                  onChange={e => setManualDate(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500/50 transition-all"
                />
              </div>

              {/* Screenshot upload */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Screenshot (optional — AI will extract meeting details)
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs hover:bg-white/10 transition-colors"
                  >
                    <Upload className="h-3.5 w-3.5" /> Upload Image
                  </button>
                  <button
                    onClick={handleCapture}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs hover:bg-white/10 transition-colors"
                  >
                    <Camera className="h-3.5 w-3.5" /> Capture Screen
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => handleImageFile(e.target.files?.[0])}
                  />
                </div>
                {screenshotPreview && (
                  <div className="relative mt-2 inline-block">
                    <img src={screenshotPreview} alt="preview" className="h-24 rounded-xl border border-white/10 object-cover" />
                    <button
                      onClick={() => { setScreenshot(null); setScreenshotPreview(null); }}
                      className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-rose-500 flex items-center justify-center"
                    >
                      <X className="h-3 w-3 text-white" />
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading || (!text.trim() && !screenshot)}
                className="w-full h-10 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Scheduling...</> : 'Schedule Meeting'}
              </button>
            </>
          ) : (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-semibold">Meeting Scheduled!</span>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-2 text-sm">
                <p className="font-medium">{result.meeting.title}</p>
                <p className="text-muted-foreground flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  {new Date(result.scheduledDate).toLocaleString()}
                </p>
                {result.assignedTo && (
                  <p className="text-muted-foreground flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" />
                    {result.assignedTo}
                  </p>
                )}
                {result.topics?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {result.topics.map((t, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">{t}</span>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={onClose} className="w-full h-9 bg-white/5 hover:bg-white/10 text-sm rounded-xl transition-colors">
                Close
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

// ─── Main Calendar ────────────────────────────────────────────────────────────
const Calendar = () => {
  const today = new Date();
  const [current, setCurrent] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [selected, setSelected] = useState(today.getDate());
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [lightbox, setLightbox] = useState(null);
  const [toast, setToast] = useState('');
  const [toastType, setToastType] = useState('success');

  const showToast = (msg, type = 'success') => { setToast(msg); setToastType(type); };

  const load = async () => {
    setLoading(true);
    try {
      const data = await getScheduledMeetings({ month: current.month, year: current.year });
      setMeetings(Array.isArray(data) ? data : []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, [current.month, current.year]);

  const { year, month } = current;
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const meetingsByDay = {};
  meetings.forEach(m => {
    const d = new Date(m.scheduledDate);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate();
      if (!meetingsByDay[day]) meetingsByDay[day] = [];
      meetingsByDay[day].push(m);
    }
  });

  const selectedMeetings = meetingsByDay[selected] || [];

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const prevMonth = () => setCurrent(c => ({
    year: c.month === 0 ? c.year - 1 : c.year,
    month: c.month === 0 ? 11 : c.month - 1
  }));
  const nextMonth = () => setCurrent(c => ({
    year: c.month === 11 ? c.year + 1 : c.year,
    month: c.month === 11 ? 0 : c.month + 1
  }));

  const handleDelete = async (id) => {
    try {
      await deleteScheduledMeeting(id);
      setMeetings(p => p.filter(m => m._id !== id));
      showToast('Meeting removed');
    } catch { showToast('Failed to delete', 'error'); }
  };

  const handleStatusToggle = async (m) => {
    const next = m.status === 'done' ? 'upcoming' : 'done';
    try {
      const updated = await updateScheduledStatus(m._id, next);
      setMeetings(p => p.map(x => x._id === m._id ? updated : x));
    } catch {}
  };

  const defaultDate = new Date(year, month, selected, 9, 0, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <Toast message={toast} type={toastType} onClose={() => setToast('')} />

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Calendar</h1>
          <p className="text-sm text-muted-foreground">Schedule and track meetings</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-all"
        >
          <Plus className="h-4 w-4" /> Schedule Meeting
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar grid */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6 border border-white/5">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold">{MONTHS[month]} {year}</h2>
            <div className="flex gap-2">
              <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-white/5 transition-colors">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => { setCurrent({ year: today.getFullYear(), month: today.getMonth() }); setSelected(today.getDate()); }}
                className="px-3 py-1 text-xs rounded-xl bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 transition-colors"
              >
                Today
              </button>
              <button onClick={nextMonth} className="p-2 rounded-xl hover:bg-white/5 transition-colors">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 mb-2">
            {DAYS.map(d => (
              <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, i) => {
              if (!day) return <div key={`e-${i}`} />;
              const hasMeetings = (meetingsByDay[day] || []).length > 0;
              const count = (meetingsByDay[day] || []).length;
              const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
              const isSelected = day === selected;

              return (
                <button
                  key={day}
                  onClick={() => setSelected(day)}
                  className={`relative aspect-square flex flex-col items-center justify-center rounded-xl text-sm font-medium transition-all
                    ${isSelected ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : ''}
                    ${isToday && !isSelected ? 'ring-1 ring-indigo-500/50 text-indigo-400' : ''}
                    ${!isSelected && !isToday ? 'hover:bg-white/5 text-foreground' : ''}
                  `}
                >
                  {day}
                  {hasMeetings && (
                    <span className={`absolute bottom-1 flex gap-0.5`}>
                      {Array.from({ length: Math.min(count, 3) }).map((_, j) => (
                        <span key={j} className={`h-1 w-1 rounded-full ${isSelected ? 'bg-white' : 'bg-indigo-400'}`} />
                      ))}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Day detail panel */}
        <div className="glass-card rounded-2xl p-5 border border-white/5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CalIcon className="h-4 w-4 text-indigo-400" />
              <h3 className="font-semibold text-sm">{MONTHS[month]} {selected}, {year}</h3>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="p-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 transition-colors"
              title="Add meeting"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
            {loading ? (
              [1,2].map(i => <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />)
            ) : selectedMeetings.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <CalIcon className="h-8 w-8 mx-auto mb-2 opacity-20" />
                <p className="text-sm">No meetings scheduled</p>
                <button
                  onClick={() => setShowModal(true)}
                  className="mt-3 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  + Schedule one
                </button>
              </div>
            ) : (
              <AnimatePresence>
                {selectedMeetings.map((m, i) => (
                  <motion.div
                    key={m._id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ delay: i * 0.05 }}
                    className={`p-3 rounded-xl border transition-all ${
                      m.status === 'done'
                        ? 'bg-white/[0.02] border-white/5 opacity-60'
                        : 'bg-white/5 border-white/5 hover:border-indigo-500/20'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-semibold leading-tight ${m.status === 'done' ? 'line-through text-muted-foreground' : ''}`}>
                          {m.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(m.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {m.assignedTo && (
                            <span className="flex items-center gap-1 text-indigo-400">
                              <User className="h-3 w-3" />
                              {m.assignedTo}
                            </span>
                          )}
                        </div>

                        {/* Topics */}
                        {m.topics?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {m.topics.slice(0, 3).map((t, j) => (
                              <span key={j} className="text-[9px] px-1.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400">{t}</span>
                            ))}
                          </div>
                        )}

                        {/* Screenshot thumbnail — clickable */}
                        {m.screenshot && (
                          <button
                            onClick={() => setLightbox(m.screenshot)}
                            className="mt-2 block"
                            title="View screenshot"
                          >
                            <img
                              src={m.screenshot}
                              alt="screenshot"
                              className="h-12 w-20 object-cover rounded-lg border border-white/10 hover:border-indigo-500/40 transition-colors"
                            />
                          </button>
                        )}
                      </div>

                      <div className="flex flex-col gap-1 flex-shrink-0">
                        <button
                          onClick={() => handleStatusToggle(m)}
                          className={`p-1 rounded-lg transition-colors ${
                            m.status === 'done'
                              ? 'text-emerald-400 hover:bg-emerald-500/10'
                              : 'text-muted-foreground hover:bg-white/5'
                          }`}
                          title={m.status === 'done' ? 'Mark upcoming' : 'Mark done'}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(m._id)}
                          className="p-1 rounded-lg text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>

      {/* Schedule modal */}
      <AnimatePresence>
        {showModal && (
          <ScheduleModal
            onClose={() => setShowModal(false)}
            defaultDate={defaultDate}
            onSaved={(meeting) => {
              setMeetings(p => [...p, meeting]);
              setShowModal(false);
              showToast('Meeting scheduled!');
              // Jump to the scheduled date
              const d = new Date(meeting.scheduledDate);
              setCurrent({ year: d.getFullYear(), month: d.getMonth() });
              setSelected(d.getDate());
            }}
          />
        )}
      </AnimatePresence>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && <Lightbox src={lightbox} onClose={() => setLightbox(null)} />}
      </AnimatePresence>
    </div>
  );
};

export default Calendar;
