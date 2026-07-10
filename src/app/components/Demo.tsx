import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { Upload, Mic, X, Play } from 'lucide-react';
import { VASGraph3D } from './VASGraph3D';

interface AnalysisResult {
  valence: number;
  arousal: number;
  socialEngagement: number;
  confidence: number;
  emotionKey: string;
  adviceKey: string;
}

export function Demo() {
  const { t } = useTranslation();
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

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        }
      });

      streamRef.current = stream;
      audioChunksRef.current = [];

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

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const audioFile = new File(
          [audioBlob],
          `chirp-recording-${timestamp}.webm`,
          { type: mimeType }
        );

        setAudioFile(audioFile);
        setAnalysisResult(null);

        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }

        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = null;
        }
      };

      mediaRecorder.onerror = () => {
        setRecordingError(t('demo.recordingErrors.generic'));
        stopRecording();
      };

      mediaRecorder.start(250);
      setIsRecording(true);

      timerIntervalRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          setRecordingError(t('demo.recordingErrors.micDenied'));
        } else if (error.name === 'NotFoundError') {
          setRecordingError(t('demo.recordingErrors.noMic'));
        } else {
          setRecordingError(t('demo.recordingErrors.startFailed', { message: error.message }));
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

    setTimeout(() => {
      const result: AnalysisResult = {
        valence: Math.random() * 10 - 5,
        arousal: Math.random() * 5,
        socialEngagement: Math.random() * 10 - 5,
        confidence: 75 + Math.random() * 20,
        emotionKey: 'neutral',
        adviceKey: 'neutral',
      };

      if (result.valence > 2 && result.arousal > 3) {
        result.emotionKey = 'excitedHappy';
        result.adviceKey = 'excitedHappy';
      } else if (result.valence > 2 && result.arousal < 2) {
        result.emotionKey = 'contentCalm';
        result.adviceKey = 'contentCalm';
      } else if (result.valence < -2 && result.arousal > 3) {
        result.emotionKey = 'stressedAgitated';
        result.adviceKey = 'stressedAgitated';
      } else if (result.valence < -2 && result.arousal < 2) {
        result.emotionKey = 'subduedUnhappy';
        result.adviceKey = 'subduedUnhappy';
      } else if (result.socialEngagement > 3) {
        result.emotionKey = 'seekingInteraction';
        result.adviceKey = 'seekingInteraction';
      } else if (result.socialEngagement < -3) {
        result.emotionKey = 'withdrawn';
        result.adviceKey = 'withdrawn';
      }

      setAnalysisResult(result);
      setIsAnalyzing(false);
    }, 2000);
  };

  const handleClear = () => {
    setAudioFile(null);
    setAnalysisResult(null);
  };

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  return (
    <section className="relative py-16 bg-white/30 backdrop-blur-sm" style={{ zIndex: 2 }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
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
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{t('demo.uploadTitle')}</h3>
                  <p className="text-gray-600 mb-6">{t('demo.uploadDescription')}</p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-shadow"
                  >
                    {t('demo.chooseFile')}
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <div className="bg-green-100 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Play className="w-10 h-10 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{audioFile.name}</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    {(audioFile.size / 1024).toFixed(2)} KB
                  </p>
                  <button
                    onClick={handleClear}
                    className="text-red-600 hover:text-red-700 font-semibold flex items-center gap-2 mx-auto"
                  >
                    <X className="w-4 h-4" />
                    {t('common.remove')}
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-orange-300 to-transparent"></div>
              <span className="text-sm font-semibold text-gray-500">{t('common.or')}</span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-orange-300 to-transparent"></div>
            </div>

            <div className="bg-gradient-to-br from-white to-orange-50 border-2 border-orange-200 rounded-3xl p-8 text-center">
              <div className={`${isRecording ? 'bg-red-500' : 'bg-gradient-to-br from-orange-500 to-amber-500'} w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg transition-all`}>
                <Mic className={`w-10 h-10 text-white ${isRecording ? 'animate-pulse' : ''}`} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {isRecording ? t('demo.recording') : t('demo.recordLive')}
              </h3>

              {isRecording && (
                <div className="mb-4">
                  <div className="text-3xl font-bold text-red-600 font-mono">
                    {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{t('demo.recordingTime')}</p>
                </div>
              )}

              <p className="text-gray-600 mb-6">
                {isRecording ? t('demo.recordingCapturing') : t('demo.recordingPrompt')}
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
                {isRecording ? t('demo.stopRecording') : t('demo.startRecording')}
              </button>
            </div>

            <button
              onClick={handleAnalyze}
              disabled={!audioFile || isAnalyzing}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white px-8 py-5 rounded-2xl font-bold text-xl shadow-xl hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? (
                <span className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-[3px] border-white border-t-transparent rounded-full animate-spin"></div>
                  {t('demo.analyzing')}
                </span>
              ) : (
                t('demo.analyzeChirp')
              )}
            </button>
          </motion.div>

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
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">{t('demo.readyTitle')}</h3>
                    <p className="text-gray-600">{t('demo.readyDescription')}</p>
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
                  <VASGraph3D
                    valence={analysisResult.valence}
                    arousal={analysisResult.arousal}
                    socialEngagement={analysisResult.socialEngagement}
                  />

                  <div className="bg-white rounded-2xl p-6 border border-orange-200 shadow-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-bold text-gray-900">{t('demo.confidenceScore')}</h4>
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

                  <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6 border border-orange-200">
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-600 mb-2">{t('demo.detectedEmotion')}</h4>
                      <p className="text-2xl font-bold text-orange-600">
                        {t(`demo.emotions.${analysisResult.emotionKey}`)}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-600 mb-2">{t('demo.careAdvice')}</h4>
                      <p className="text-gray-700 leading-relaxed">
                        {t(`demo.advice.${analysisResult.adviceKey}`)}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleClear}
                    className="w-full bg-white text-orange-600 border-2 border-orange-300 px-8 py-4 rounded-2xl font-bold hover:bg-orange-50 transition-colors"
                  >
                    {t('demo.analyzeAnother')}
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
