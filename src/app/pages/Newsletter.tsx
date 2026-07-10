import { motion } from 'motion/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { InteractiveSoundWave } from '../components/InteractiveSoundWave';
import { Navigation } from '../components/Navigation';
import { Footer } from '../components/Footer';
import { Mail, Sparkles, Bell, CheckCircle, AlertCircle } from 'lucide-react';
import { edgeFunctionHeaders, edgeFunctionUrl } from '../../lib/supabaseApi';

export default function Newsletter() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      setStatus('error');
      setMessage(t('newsletter.errors.invalidEmail'));
      return;
    }

    setIsSubmitting(true);
    setStatus('idle');
    setMessage('');

    try {
      const response = await fetch(edgeFunctionUrl('/newsletter'), {
          method: 'POST',
          headers: edgeFunctionHeaders(),
          body: JSON.stringify({ email }),
        });

      const text = await response.text();
      let data: { message?: string; error?: string } = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = {};
      }

      if (response.ok) {
        setStatus('success');
        setMessage(data.message || t('newsletter.successDefault'));
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error || t('newsletter.errors.subscribeFailed'));
      }
    } catch {
      setStatus('error');
      setMessage(t('newsletter.errors.networkError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 overflow-hidden">
      <InteractiveSoundWave />

      <div className="fixed inset-0 opacity-10 pointer-events-none" style={{ zIndex: 0 }}>
        <div className="absolute top-20 left-10 w-96 h-96 bg-orange-300 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-300 rounded-full blur-3xl"></div>
      </div>

      <Navigation />

      <section className="relative max-w-4xl mx-auto px-6 py-20" style={{ zIndex: 2 }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2, type: 'spring' }}
            className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full mb-8 shadow-2xl"
          >
            <Bell className="w-12 h-12 text-white" />
          </motion.div>

          <h1 className="text-6xl font-bold text-gray-900 mb-6">{t('newsletter.title')}</h1>

          <div className="inline-flex items-center gap-2 bg-orange-100 px-4 py-2 rounded-full mb-8">
            <Sparkles className="w-5 h-5 text-orange-600" />
            <span className="text-orange-700 font-semibold">{t('newsletter.badge')}</span>
          </div>

          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed mb-4">
            {t('newsletter.intro1')}
          </p>

          <p className="text-lg text-gray-600 max-w-2xl mx-auto">{t('newsletter.intro2')}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="bg-white rounded-3xl p-10 shadow-2xl border-2 border-orange-200"
        >
          <div className="flex items-center gap-3 mb-6">
            <Mail className="w-8 h-8 text-orange-500" />
            <h2 className="text-3xl font-bold text-gray-900">{t('newsletter.formTitle')}</h2>
          </div>

          <p className="text-gray-600 mb-8">{t('newsletter.formDescription')}</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('newsletter.emailPlaceholder')}
                className="w-full px-6 py-4 border-2 border-orange-200 rounded-2xl text-lg focus:outline-none focus:border-orange-500 transition-colors"
                disabled={isSubmitting}
              />
            </div>

            {status !== 'idle' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-center gap-3 p-4 rounded-xl ${
                  status === 'success'
                    ? 'bg-green-50 border-2 border-green-200'
                    : 'bg-red-50 border-2 border-red-200'
                }`}
              >
                {status === 'success' ? (
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                )}
                <p
                  className={`font-semibold ${
                    status === 'success' ? 'text-green-700' : 'text-red-700'
                  }`}
                >
                  {message}
                </p>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || status === 'success'}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white px-8 py-5 rounded-2xl font-bold text-xl shadow-xl hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-3">
                  <div className="w-6 h-6 border-[3px] border-white border-t-transparent rounded-full animate-spin"></div>
                  {t('newsletter.submitting')}
                </span>
              ) : status === 'success' ? (
                t('newsletter.subscribed')
              ) : (
                t('newsletter.submitButton')
              )}
            </button>
          </form>

          <p className="text-sm text-gray-500 text-center mt-6">{t('newsletter.privacy')}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-16 grid md:grid-cols-3 gap-6"
        >
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl text-center border border-orange-100 shadow-lg">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🎵</span>
            </div>
            <h3 className="font-bold text-gray-900 mb-2">{t('newsletter.previewAudioTitle')}</h3>
            <p className="text-sm text-gray-600">{t('newsletter.previewAudioDesc')}</p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl text-center border border-orange-100 shadow-lg">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🧠</span>
            </div>
            <h3 className="font-bold text-gray-900 mb-2">{t('newsletter.previewAiTitle')}</h3>
            <p className="text-sm text-gray-600">{t('newsletter.previewAiDesc')}</p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl text-center border border-orange-100 shadow-lg">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">💚</span>
            </div>
            <h3 className="font-bold text-gray-900 mb-2">{t('newsletter.previewCareTitle')}</h3>
            <p className="text-sm text-gray-600">{t('newsletter.previewCareDesc')}</p>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
