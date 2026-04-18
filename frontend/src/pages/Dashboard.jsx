import { useEffect, useRef, useState } from 'react';
import {
  Mic, MicOff, Upload, BrainCircuit, MessageSquare, Activity,
  Camera, Link2, Share2, FileDown, BookOpen, Sparkles, AlertTriangle,
  CheckSquare, ArrowRight, Clock, Loader2, Eye, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOutletContext } from 'react-router-dom';
import { analyzeMeeting, transcribeAudioFile, exportToNotion, analyzeScreenshot } from '@/services/api';
import { useMeetingUser } from '@/context/MeetingUserContext';
import useSpeechRecognition from '@/hooks/useSpeechRecognition';
import ChatPanel from '@/components/chat/ChatPanel';
import Toast from '@/components/common/Toast';
import FileUpload from '@/components/dashboard/FileUpload';
import SummaryCard from '@/components/dashboard/SummaryCard';
import ActionItems from '@/components/dashboard/ActionItems';
import ShareModal from '@/components/dashboard/ShareModal';
import NotionModal from '@/components/dashboard/NotionModal';
import TaskSyncPanel from '@/components/dashboard/TaskSyncPanel';
import { generateMeetingPDF } from '@/utils/pdfExport';

const Dashboard = () => {
  const { loggedInEmail, loggedInUser } = useOutletContext();
  const { setFromMeetingResult } = useMeetingUser();

  const [transcript, setTranscript] = useState('');
  const [interimText, setInterimText] = useState('');
  const [meetingResult, setMeetingResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isNotionModalOpen, setIsNotionModalOpen] = useState(false);
  const [meetingLink, setMeetingLink] = useState('');
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [screenshots, setScreenshots] = useState([]);
  const [analyzingScreenshot, setAnalyzingScreenshot] = useState(null);
  const [lightboxSrc, setLightboxSrc] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);
  const screenshotIntervalRef = useRef(null);

  const { isListening, isSupported, startListening, stopListening } = useSpeechRecognition();

  const showToast = (msg, type = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(''), 3500);
  };

  useEffect(() => {
    if (meetingResult) setFromMeetingResult(meetingResult);
  }, [meetingResult, setFromMeetingResult]);

  // Timer
  useEffect(() => {
    if (isListening) {
      if (!startTime) setStartTime(Date.now());
      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - (startTime || Date.now())) / 1000));
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isListening, startTime]);

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const handleStart = () => {
    setStartTime(Date.now());
    setElapsed(0);
    startListening({
      onTranscript: ({ finalText, interimText: next }) => {
        if (finalText) setTranscript(p => `${p}${finalText} `.trimStart());
        setInterimText(next);
      }
    });
  };

  const handleStop = () => {
    stopListening();
    clearInterval(screenshotIntervalRef.current);
  };

  const handleFileUpload = async (file) => {
    try {
      setTranscribing(true);
      const { transcript: text } = await transcribeAudioFile(file);
      const trimmed = (text || '').trim();
      if (trimmed) {
        setTranscript(p => p ? `${p}\n\n${trimmed}` : trimmed);
        showToast('Audio transcribed successfully');
      } else {
        showToast('No speech detected in file', 'error');
      }
    } catch {
      showToast('Audio upload failed. Check backend connection.', 'error');
    } finally {
      setTranscribing(false);
    }
  };

  const handleAnalyze = async () => {
    const full = `${transcript} ${interimText}`.trim();
    if (!full) { showToast('Transcript is empty', 'error'); return; }
    try {
      setAnalyzing(true);
      const duration = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;
      const response = await analyzeMeeting(full, { meetingLink, duration });
      setMeetingResult(response);
      showToast('Meeting analyzed successfully');
    } catch {
      showToast('Analysis failed. Please try again.', 'error');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleScreenshot = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const track = stream.getVideoTracks()[0];
      const imageCapture = new ImageCapture(track);
      const bitmap = await imageCapture.grabFrame();
      const canvas = document.createElement('canvas');
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      canvas.getContext('2d').drawImage(bitmap, 0, 0);
      const dataUrl = canvas.toDataURL('image/png');
      track.stop();

      const newShot = { url: dataUrl, time: new Date().toLocaleTimeString(), analysis: null };
      setScreenshots(p => [...p, newShot]);
      showToast('Screenshot captured — analyzing...');

      // Auto-analyze with AI
      const idx = screenshots.length;
      setAnalyzingScreenshot(idx);
      try {
        const ctx = transcript ? `Meeting transcript so far: ${transcript.substring(0, 300)}` : '';
        const { analysis } = await analyzeScreenshot(dataUrl, ctx);
        setScreenshots(p => p.map((s, i) => i === idx ? { ...s, analysis } : s));
        showToast('Screenshot analyzed');
      } catch {
        setScreenshots(p => p.map((s, i) => i === idx ? { ...s, analysis: 'Analysis unavailable.' } : s));
      } finally {
        setAnalyzingScreenshot(null);
      }
    } catch {
      showToast('Screenshot failed. Allow screen access.', 'error');
    }
  };

  const handleExportPDF = () => {
    if (!meetingResult) { showToast('Analyze a meeting first', 'error'); return; }
    generateMeetingPDF(meetingResult);
    showToast('PDF exported');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage('')} />

      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Meeting Intelligence</h2>
          <p className="text-sm text-muted-foreground">Real-time transcription and AI-powered insights</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Meeting link */}
          <button
            onClick={() => setShowLinkInput(p => !p)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm border transition-all ${
              meetingLink ? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-400' : 'bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10'
            }`}
          >
            <Link2 className="h-4 w-4" />
            {meetingLink ? 'Link Set' : 'Add Link'}
          </button>

          {/* Screenshot */}
          <button
            onClick={handleScreenshot}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm bg-white/5 border border-white/10 text-muted-foreground hover:bg-white/10 transition-all"
          >
            <Camera className="h-4 w-4" />
            Screenshot
          </button>

          {/* Mic controls */}
          {isListening ? (
            <button
              onClick={handleStop}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm bg-rose-600 hover:bg-rose-500 text-white transition-all relative overflow-hidden"
            >
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.7, 0.4] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="absolute inset-0 bg-rose-400/20"
              />
              <MicOff className="h-4 w-4 relative z-10 animate-pulse" />
              <span className="relative z-10">Stop {formatTime(elapsed)}</span>
            </button>
          ) : (
            <button
              onClick={handleStart}
              disabled={!isSupported}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm bg-indigo-600 hover:bg-indigo-500 text-white transition-all disabled:opacity-50"
            >
              <Mic className="h-4 w-4" />
              Start Meeting
            </button>
          )}

          <button
            onClick={handleAnalyze}
            disabled={analyzing || !transcript.trim()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm bg-white/5 border border-white/10 hover:bg-white/10 transition-all disabled:opacity-50"
          >
            {analyzing ? <Activity className="h-4 w-4 animate-spin" /> : <BrainCircuit className="h-4 w-4" />}
            Analyze
          </button>

          {meetingResult && (
            <>
              <button
                onClick={() => setIsShareModalOpen(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
              >
                <Share2 className="h-4 w-4" />
                Share
              </button>
              <button
                onClick={handleExportPDF}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
              >
                <FileDown className="h-4 w-4" />
                PDF
              </button>
              <button
                onClick={() => setIsNotionModalOpen(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
              >
                <BookOpen className="h-4 w-4" />
                Notion
              </button>
            </>
          )}
        </div>
      </div>

      {/* Meeting link input */}
      <AnimatePresence>
        {showLinkInput && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="flex gap-2">
              <input
                type="url"
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                placeholder="Paste Google Meet or Zoom link..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl h-10 px-4 text-sm focus:outline-none focus:border-indigo-500/50 transition-all"
              />
              <button
                onClick={() => setShowLinkInput(false)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm transition-all"
              >
                Save
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left: Transcript + Upload */}
        <div className="xl:col-span-7 space-y-6">
          {/* Transcript */}
          <div className="glass-card rounded-2xl border border-white/5 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/5 bg-white/[0.02]">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-indigo-400" />
                <span className="text-sm font-semibold">Live Transcript</span>
              </div>
              <div className="flex items-center gap-3">
                {isListening && (
                  <div className="flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
                    </span>
                    <span className="text-xs font-medium text-rose-400">REC {formatTime(elapsed)}</span>
                  </div>
                )}
                {transcript && (
                  <button
                    onClick={() => { setTranscript(''); setInterimText(''); }}
                    className="text-xs text-muted-foreground hover:text-white transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
            <div className="relative">
              <textarea
                className="w-full min-h-[260px] border-0 bg-transparent p-5 text-sm leading-relaxed custom-scrollbar resize-none focus:outline-none"
                value={`${transcript}${interimText ? ` ${interimText}` : ''}`}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Transcript will appear here as you speak or after upload..."
              />
              {!transcript && !interimText && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
                  <MessageSquare className="h-16 w-16" />
                </div>
              )}
            </div>
          </div>

          {/* File upload */}
          <div>
            <h3 className="text-sm font-semibold flex items-center gap-2 mb-3 px-1">
              <Upload className="h-4 w-4 text-indigo-400" />
              Upload Recording
            </h3>
            <FileUpload onUpload={handleFileUpload} transcribing={transcribing} />
          </div>

          {/* Screenshots */}
          {screenshots.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Camera className="h-4 w-4 text-indigo-400" />
                  Screenshots ({screenshots.length})
                </h3>
                <button
                  onClick={() => setScreenshots([])}
                  className="text-xs text-muted-foreground hover:text-rose-400 transition-colors px-2 py-1 rounded-lg hover:bg-rose-500/10"
                >
                  Clear all
                </button>
              </div>
              <div className="space-y-3">
                <AnimatePresence>
                  {screenshots.map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="glass-card rounded-2xl border border-white/5 overflow-hidden"
                  >
                    <div className="flex gap-3 p-3">
                      {/* Thumbnail — clickable for lightbox */}
                      <div className="relative flex-shrink-0">
                        <button
                          onClick={() => setLightboxSrc(s.url)}
                          className="block focus:outline-none"
                          title="Click to enlarge"
                        >
                          <img
                            src={s.url}
                            alt={`Screenshot ${i + 1}`}
                            className="h-20 w-32 object-cover rounded-xl border border-white/10 hover:border-indigo-500/40 transition-colors cursor-zoom-in"
                          />
                        </button>
                        <span className="absolute bottom-1 left-1 text-[9px] bg-black/70 text-white px-1.5 py-0.5 rounded-md">
                          {s.time}
                        </span>
                      </div>

                      {/* Analysis */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-1.5">
                            <Eye className="h-3 w-3 text-indigo-400" />
                            <span className="text-xs font-semibold text-indigo-400">AI Analysis</span>
                            {analyzingScreenshot === i && (
                              <Loader2 className="h-3 w-3 animate-spin text-indigo-400" />
                            )}
                          </div>
                          <button
                            onClick={() => setScreenshots(p => p.filter((_, idx) => idx !== i))}
                            className="p-1 rounded-lg hover:bg-rose-500/10 text-muted-foreground hover:text-rose-400 transition-colors"
                            title="Remove screenshot"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                        {analyzingScreenshot === i ? (
                          <div className="space-y-1.5">
                            <div className="h-2.5 bg-white/5 rounded animate-pulse w-full" />
                            <div className="h-2.5 bg-white/5 rounded animate-pulse w-4/5" />
                            <div className="h-2.5 bg-white/5 rounded animate-pulse w-3/5" />
                          </div>
                        ) : s.analysis ? (
                          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-4">
                            {s.analysis}
                          </p>
                        ) : (
                          <p className="text-xs text-muted-foreground italic">No analysis</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>

        {/* Right: AI Results */}
        <div className="xl:col-span-5 space-y-5">
          <SummaryCard summary={meetingResult?.summary} analyzing={analyzing} />

          {/* Unresolved topics */}
          {(meetingResult?.unresolved_topics || []).length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-2xl p-5 border border-amber-500/20"
            >
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                <h3 className="text-sm font-bold">Unresolved Topics</h3>
              </div>
              <div className="space-y-1.5">
                {meetingResult.unresolved_topics.map((t, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    <span className="text-amber-400 mt-0.5">•</span>
                    <span>{t}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* New meetings detected */}
          {(meetingResult?.new_meetings || []).length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-2xl p-5 border border-blue-500/20"
            >
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-4 w-4 text-blue-400" />
                <h3 className="text-sm font-bold">New Meetings Detected</h3>
              </div>
              <div className="space-y-1.5">
                {meetingResult.new_meetings.map((m, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    <ArrowRight className="h-3 w-3 text-blue-400 mt-0.5 flex-shrink-0" />
                    <span>{m}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Suggested follow-ups */}
          {(meetingResult?.suggested_followups || []).length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-2xl p-5 border border-emerald-500/20"
            >
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-emerald-400" />
                <h3 className="text-sm font-bold">Suggested Follow-ups</h3>
              </div>
              <div className="space-y-1.5">
                {meetingResult.suggested_followups.map((f, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    <span className="text-emerald-400 mt-0.5">→</span>
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          <ActionItems tasks={meetingResult?.tasks} analyzing={analyzing} currentUserEmail={loggedInEmail} />

          {/* Task sync panel — shown after analysis */}
          {meetingResult && (
            <TaskSyncPanel
              meetingId={meetingResult._id}
              tasks={meetingResult.tasks || []}
              followUpMeetings={meetingResult.followUpMeetings || []}
            />
          )}
        </div>
      </div>

      <ChatPanel meetingId={meetingResult?._id} />

      <ShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} data={meetingResult} />

      <NotionModal
        isOpen={isNotionModalOpen}
        onClose={() => setIsNotionModalOpen(false)}
        meetingId={meetingResult?._id}
        onSuccess={() => showToast('Exported to Notion!')}
        onError={(msg) => showToast(msg, 'error')}
      />

      {/* Screenshot lightbox */}
      <AnimatePresence>
        {lightboxSrc && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4"
            onClick={() => setLightboxSrc(null)}
          >
            <button
              onClick={() => setLightboxSrc(null)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
            >
              <X className="h-5 w-5 text-white" />
            </button>
            <img
              src={lightboxSrc}
              alt="Screenshot"
              className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl object-contain"
              onClick={e => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
