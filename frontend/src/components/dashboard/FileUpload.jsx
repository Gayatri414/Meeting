import { useState, useRef } from 'react';
import { Upload, FileAudio, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';

const FileUpload = ({ onUpload, transcribing }) => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    const isAudio =
      file.type.startsWith('audio/') ||
      file.type === 'video/mpeg' || // .mpeg files often report as video/mpeg
      /\.(mp3|wav|m4a|aac|ogg|wma|flac|mpeg|mpg|mp2)$/i.test(file.name);

    if (isAudio) {
      setFile(file);
    } else {
      alert(`"${file.name}" is not a recognised audio file. Supported: MP3, WAV, M4A, AAC, OGG, MPEG.`);
    }
  };

  const onButtonClick = () => {
    inputRef.current.click();
  };

  const removeFile = () => {
    setFile(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleUploadClick = () => {
    if (file) {
      onUpload(file);
    }
  };

  return (
    <div className="w-full">
      {!file ? (
        <motion.div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`relative group border-2 border-dashed rounded-xl p-8 transition-all flex flex-col items-center justify-center gap-4 ${
            dragActive 
              ? "border-indigo-500 bg-indigo-500/10" 
              : "border-white/10 hover:border-white/20 bg-white/5"
          }`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept="*/*"
            onChange={handleChange}
          />
          
          <div className="p-4 rounded-full bg-indigo-500/10 group-hover:bg-indigo-500/20 transition-colors">
            <Upload className="h-8 w-8 text-indigo-400" />
          </div>
          
          <div className="text-center">
            <p className="text-lg font-medium">Drag and drop audio file</p>
            <p className="text-sm text-muted-foreground mt-1">MP3, WAV, M4A, MPEG, AAC up to 25MB</p>
          </div>
          
          <Button 
            variant="outline" 
            onClick={onButtonClick}
            className="mt-2 border-white/10 hover:bg-white/10"
          >
            Select File
          </Button>
        </motion.div>
      ) : (
        <motion.div 
          className="glass-card rounded-xl p-6 flex items-center justify-between"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-indigo-500/20">
              <FileAudio className="h-6 w-6 text-indigo-400" />
            </div>
            <div>
              <p className="font-medium truncate max-w-[200px]">{file.name}</p>
              <p className="text-xs text-muted-foreground">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {!transcribing ? (
              <>
                <Button 
                  size="sm" 
                  onClick={handleUploadClick}
                  className="bg-indigo-600 hover:bg-indigo-500"
                >
                  Upload & Transcribe
                </Button>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  onClick={removeFile}
                  className="text-muted-foreground hover:text-white"
                >
                  <X className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-2 text-indigo-400 text-sm font-medium">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                >
                  <Upload className="h-4 w-4" />
                </motion.div>
                Transcribing...
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default FileUpload;
