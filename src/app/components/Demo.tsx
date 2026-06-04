import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, Mic, X, Play, Pause } from 'lucide-react';
import { VASGraph3D } from './VASGraph3D';

interface AnalysisResult {
  valence: number;
  arousal: number;
  socialEngagement: number;
  confidence: number;
  emotion: string;
  advice: string;
}

export function Demo() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingError, setRecordingError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerIntervalRef = useRef<number | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type.startsWith('audio/')) {
      setAudioFile(files[0]);
      setAnalysisResult(null);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setAudioFile(files[0]);
      setAnalysisResult(null);
    }
  };

  const startRecording = async () => {
    try {
      setRecordingError(null);
      setRecordingTime(0);

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        }
      });

      streamRef.current = stream;
      audioChunksRef.current = [];

      // Determine supported MIME type
      let mimeType = 'audio/webm';
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/webm')) {
        mimeType = 'audio/webm';
      } else if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
        mimeType = 'audio/ogg;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4';
      }

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      // Handle data available event
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // Handle recording stop
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });

        // Create File from Blob
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const audioFile = new File(
          [audioBlob],
          `chirp-recording-${timestamp}.webm`,
          { type: mimeType }
        );

        setAudioFile(audioFile);
        setAnalysisResult(null);

        // Stop all tracks and cleanup
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }

        // Clear timer
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = null;
        }
      };

      // Handle recording errors
      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        setRecordingError('Recording error occurred');
        stopRecording();
      };

      // Start recording (timeslice ensures chunks are captured in all browsers)
      mediaRecorder.start(250);
      setIsRecording(true);

      // Start timer
      timerIntervalRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Failed to start recording:', error);
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          setRecordingError('Microphone access denied. Please allow microphone permissions.');
        } else if (error.name === 'NotFoundError') {
          setRecordingError('No microphone found. Please connect a microphone.');
        } else {
          setRecordingError('Failed to start recording: ' + error.message);
        }
      }
    }
  };

  const stopRecording = () => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      if (recorder.state === 'recording') {
        recorder.requestData();
      }
      recorder.stop();
    }
    setIsRecording(false);
  };

  const handleRecordToggle = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleAnalyze = () => {
    if (!audioFile) return;
    
    setIsAnalyzing(true);
    
    // Simulate analysis with random values
    setTimeout(() => {
      const result: AnalysisResult = {
        valence: Math.random() * 10 - 5, // -5 to 5
        arousal: Math.random() * 5, // 0 to 5
        socialEngagement: Math.random() * 10 - 5, // -5 to 5
        confidence: 75 + Math.random() * 20, // 75-95%
        emotion: '',
        advice: '',
      };

      // Determine emotion based on VAS values
      if (result.valence > 2 && result.arousal > 3) {
        result.emotion = 'Excited & Happy';
        result.advice = 'Your lovebird is in a highly positive and energetic state! This is great. Continue engaging with your bird through play and social interaction.';
      } else if (result.valence > 2 && result.arousal < 2) {
        result.emotion = 'Content & Calm';
        result.advice = 'Your lovebird appears relaxed and content. This indicates a comfortable environment. Maintain current care routines.';
      } else if (result.valence < -2 && result.arousal > 3) {
        result.emotion = 'Stressed or Agitated';
        result.advice = 'Your bird may be experiencing stress or discomfort. Check for environmental stressors, ensure adequate food/water, and consider a vet visit if this persists.';
      } else if (result.valence < -2 && result.arousal < 2) {
        result.emotion = 'Subdued or Unhappy';
        result.advice = 'Your lovebird may be feeling down or unwell. Monitor closely for signs of illness and increase gentle interaction. Consult a vet if concerning.';
      } else if (result.socialEngagement > 3) {
        result.emotion = 'Seeking Interaction';
        result.advice = 'Your bird is actively seeking social engagement! Spend quality time with your lovebird through gentle handling, talking, or playtime.';
      } else if (result.socialEngagement < -3) {
        result.emotion = 'Withdrawn';
        result.advice = 'Your bird may need some quiet time. Respect their space while ensuring their basic needs are met. Gradual, gentle interaction may help.';
      } else {
        result.emotion = 'Neutral State';
        result.advice = 'Your lovebird is in a balanced emotional state. Continue providing consistent care, enrichment, and social interaction.';
      }

      setAnalysisResult(result);
      setIsAnalyzing(false);
    }, 2000);
  };

  const handleClear = () => {
    setAudioFile(null);
    setAnalysisResult(null);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Stop recording if active
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }

      // Stop all media tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      // Clear timer
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  return (
    <section className="relative py-16 bg-white/30 backdrop-blur-sm" style={{ zIndex: 2 }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Upload/Record Section */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            {/* Drag and Drop Area */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative border-[3px] border-dashed rounded-3xl p-12 transition-all ${
                isDragging
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-orange-300 bg-gradient-to-br from-white to-orange-50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              {!audioFile ? (
                <div className="text-center">
                  <div className="bg-gradient-to-br from-orange-500 to-amber-500 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Upload className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    Upload Audio File
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Drag and drop your audio file here, or click to browse
                  </p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-shadow"
                  >
                    Choose File
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <div className="bg-green-100 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Play className="w-10 h-10 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {audioFile.name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    {(audioFile.size / 1024).toFixed(2)} KB
                  </p>
                  <button
                    onClick={handleClear}
                    className="text-red-600 hover:text-red-700 font-semibold flex items-center gap-2 mx-auto"
                  >
                    <X className="w-4 h-4" />
                    Remove
                  </button>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-orange-300 to-transparent"></div>
              <span className="text-sm font-semibold text-gray-500">OR</span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-orange-300 to-transparent"></div>
            </div>

            {/* Recording Button */}
            <div className="bg-gradient-to-br from-white to-orange-50 border-2 border-orange-200 rounded-3xl p-8 text-center">
              <div className={`${isRecording ? 'bg-red-500' : 'bg-gradient-to-br from-orange-500 to-amber-500'} w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg transition-all`}>
                <Mic className={`w-10 h-10 text-white ${isRecording ? 'animate-pulse' : ''}`} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {isRecording ? 'Recording...' : 'Record Live'}
              </h3>

              {isRecording && (
                <div className="mb-4">
                  <div className="text-3xl font-bold text-red-600 font-mono">
                    {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Recording time</p>
                </div>
              )}

              <p className="text-gray-600 mb-6">
                {isRecording ? 'Capturing your lovebird\'s chirps' : 'Record your lovebird\'s sounds in real-time'}
              </p>

              {recordingError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-sm text-red-700">{recordingError}</p>
                </div>
              )}

              <button
                onClick={handleRecordToggle}
                className={`${
                  isRecording
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-gradient-to-r from-orange-500 to-amber-500'
                } text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all`}
              >
                {isRecording ? 'Stop Recording' : 'Start Recording'}
              </button>
            </div>

            {/* Analyze Button */}
            <button
              onClick={handleAnalyze}
              disabled={!audioFile || isAnalyzing}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white px-8 py-5 rounded-2xl font-bold text-xl shadow-xl hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? (
                <span className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-[3px] border-white border-t-transparent rounded-full animate-spin"></div>
                  Analyzing Chirp...
                </span>
              ) : (
                'Analyze Chirp'
              )}
            </button>
          </motion.div>

          {/* Right: Results Section */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <AnimatePresence mode="wait">
              {!analysisResult ? (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full bg-gradient-to-br from-gray-50 to-orange-50 border-2 border-dashed border-orange-300 rounded-3xl flex items-center justify-center p-12"
                >
                  <div className="text-center">
                    <div className="w-32 h-32 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <span className="text-6xl">🦜</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      Ready to Analyze
                    </h3>
                    <p className="text-gray-600">
                      Upload or record audio to see the emotional analysis results
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="space-y-6"
                >
                  {/* 3D VAS Graph */}
                  <VASGraph3D
                    valence={analysisResult.valence}
                    arousal={analysisResult.arousal}
                    socialEngagement={analysisResult.socialEngagement}
                  />

                  {/* Confidence Score */}
                  <div className="bg-white rounded-2xl p-6 border border-orange-200 shadow-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-bold text-gray-900">Confidence Score</h4>
                      <span className="text-3xl font-bold text-orange-600">
                        {analysisResult.confidence.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${analysisResult.confidence}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"
                      />
                    </div>
                  </div>

                  {/* Emotion & Advice */}
                  <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6 border border-orange-200">
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-600 mb-2">Detected Emotion</h4>
                      <p className="text-2xl font-bold text-orange-600">{analysisResult.emotion}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-600 mb-2">Care Advice</h4>
                      <p className="text-gray-700 leading-relaxed">{analysisResult.advice}</p>
                    </div>
                  </div>

                  {/* Analyze Another Button */}
                  <button
                    onClick={handleClear}
                    className="w-full bg-white text-orange-600 border-2 border-orange-300 px-8 py-4 rounded-2xl font-bold hover:bg-orange-50 transition-colors"
                  >
                    Analyze Another Recording
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
