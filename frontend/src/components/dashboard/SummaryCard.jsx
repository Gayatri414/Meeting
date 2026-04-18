import { motion } from 'framer-motion';
import { Sparkles, FileText, Quote } from 'lucide-react';

const SummaryCard = ({ summary, analyzing }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-3xl overflow-hidden"
    >
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-purple-700/15"
        style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.1) 0%, rgba(37,99,235,0.06) 100%)' }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-purple-600/30 to-blue-600/20 border border-purple-500/20">
              <Sparkles className="h-4 w-4 text-purple-300" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#f0eeff]">AI Summary</h3>
              <p className="text-[10px] text-[#8b7db5]">Powered by Groq LLM</p>
            </div>
          </div>

          {analyzing && (
            <div className="flex items-center gap-2">
              {[0, 0.15, 0.3].map((delay, i) => (
                <motion.div
                  key={i}
                  animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
                  transition={{ repeat: Infinity, duration: 1.2, delay }}
                  className="w-1.5 h-1.5 rounded-full bg-purple-400"
                />
              ))}
              <span className="text-xs text-purple-400 font-medium ml-1">Analyzing...</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {!summary && !analyzing ? (
          <div className="flex flex-col items-center justify-center py-10 text-[#8b7db5]">
            <div className="h-12 w-12 rounded-2xl bg-purple-700/15 border border-purple-700/20 flex items-center justify-center mb-3">
              <FileText className="h-6 w-6 opacity-40" />
            </div>
            <p className="text-sm font-medium">No summary yet</p>
            <p className="text-xs mt-1 opacity-70">Start a meeting or upload audio to begin</p>
          </div>
        ) : analyzing ? (
          <div className="space-y-3">
            {[3/4, 1, 5/6, 1/2, 2/3].map((w, i) => (
              <div key={i} className="skeleton h-3.5 rounded-lg" style={{ width: `${w * 100}%` }} />
            ))}
          </div>
        ) : (
          <div className="relative">
            <Quote className="absolute -top-1 -left-1 h-8 w-8 text-purple-500/10 -z-10" />
            <p className="text-sm text-[#d4c8ff] leading-relaxed">
              {summary}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default SummaryCard;
