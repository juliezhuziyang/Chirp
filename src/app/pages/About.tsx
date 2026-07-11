import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { InteractiveSoundWave } from '../components/InteractiveSoundWave';
import { Navigation } from '../components/Navigation';
import { Footer } from '../components/Footer';
import { MessageCircle, Brain, Heart, Target, ShieldAlert, Github } from 'lucide-react';
import developerPhoto from '@/assets/julie-developer-photo.png';
import { Link } from 'react-router';

export default function About() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 overflow-hidden">
      <InteractiveSoundWave />

      <div className="fixed inset-0 opacity-10 pointer-events-none" style={{ zIndex: 0 }}>
        <div className="absolute top-20 left-10 w-96 h-96 bg-orange-300 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-300 rounded-full blur-3xl"></div>
      </div>

      <Navigation />

      <section className="relative max-w-7xl mx-auto px-6 py-20" style={{ zIndex: 2 }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-6xl font-bold text-gray-900 mb-6">
            {t('about.title')}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {t('about.intro')}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl text-center shadow-lg border border-orange-100"
          >
            <MessageCircle className="w-12 h-12 text-orange-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-800 mb-3">{t('about.challengeTitle')}</h3>
            <p className="text-gray-700">{t('about.challengeDesc')}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl text-center shadow-lg border border-orange-100"
          >
            <Brain className="w-12 h-12 text-orange-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-800 mb-3">{t('about.solutionTitle')}</h3>
            <p className="text-gray-700">{t('about.solutionDesc')}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl text-center shadow-lg border border-orange-100"
          >
            <Heart className="w-12 h-12 text-orange-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-800 mb-3">{t('about.impactTitle')}</h3>
            <p className="text-gray-700">{t('about.impactDesc')}</p>
          </motion.div>
        </div>
      </section>

      <section className="relative bg-white/50 backdrop-blur-sm py-20" style={{ zIndex: 2 }}>
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold text-gray-900 mb-6">{t('about.goalsTitle')}</h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="bg-white rounded-2xl p-8 shadow-lg border border-orange-100"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-green-100 p-3 rounded-xl">
                  <Target className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{t('about.aimTitle')}</h3>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                  <p className="text-gray-700">{t('about.aim1')}</p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                  <p className="text-gray-700">{t('about.aim2')}</p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                  <p className="text-gray-700">{t('about.aim3')}</p>
                </li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="bg-white rounded-2xl p-8 shadow-lg border border-orange-100"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-amber-100 p-3 rounded-xl">
                  <ShieldAlert className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{t('about.notAimTitle')}</h3>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-gray-400 rounded-full mt-2"></div>
                  <p className="text-gray-700">{t('about.notAim1')}</p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-gray-400 rounded-full mt-2"></div>
                  <p className="text-gray-700">{t('about.notAim2')}</p>
                </li>
              </ul>
              <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-200">
                <p className="text-sm text-gray-700 italic">{t('about.disclaimer')}</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="relative max-w-5xl mx-auto px-6 py-20" style={{ zIndex: 2 }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-5xl font-bold text-gray-900 mb-6">{t('about.developerTitle')}</h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-white rounded-3xl p-10 shadow-2xl border border-orange-200"
        >
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
            <div className="flex-shrink-0">
              <img
                src={developerPhoto}
                alt={t('about.developerPhotoAlt')}
                className="w-48 h-48 rounded-2xl object-cover shadow-lg border-4 border-orange-100"
              />
            </div>

            <div className="flex-1">
              <h3 className="text-3xl font-bold text-gray-900 mb-2">{t('about.developerName')}</h3>
              <p className="text-orange-600 font-semibold mb-4 text-lg">{t('about.developerRole')}</p>
              <p className="text-gray-700 leading-relaxed mb-6">
                {t('about.developerBio')}{' '}
                <a
                  href="https://oxydebate.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-600 hover:text-orange-700 font-semibold underline"
                >
                  Oxymorona Debate
                </a>
                {t('about.developerBioEnd')}
              </p>

              <div className="flex flex-wrap gap-2 mb-4">
                <span className="bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-semibold">
                  {t('about.tagBiology')}
                </span>
                <span className="bg-amber-100 text-amber-700 px-4 py-2 rounded-full text-sm font-semibold">
                  {t('about.tagPhysics')}
                </span>
                <span className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full text-sm font-semibold">
                  {t('about.tagML')}
                </span>
                <span className="bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-semibold">
                  {t('about.tagBehavior')}
                </span>
                <span className="bg-amber-100 text-amber-700 px-4 py-2 rounded-full text-sm font-semibold">
                  {t('about.tagDebate')}
                </span>
              </div>

              <a
                href="https://github.com/Julie-Zhu24/Chirp"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-full font-semibold hover:bg-gray-800 transition-colors shadow-lg"
              >
                <Github className="w-5 h-5" />
                {t('about.githubLink')}
              </a>
            </div>
          </div>
        </motion.div>
      </section>

      <section className="relative max-w-4xl mx-auto px-6 py-16" style={{ zIndex: 2 }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-3xl p-10 text-center shadow-2xl"
        >
          <h2 className="text-3xl font-bold text-white mb-4">{t('about.ctaTitle')}</h2>
          <p className="text-lg text-orange-100 mb-6">{t('about.ctaDescription')}</p>
          <Link
            to="/register"
            className="inline-block bg-white text-orange-600 px-10 py-4 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transition-shadow"
          >
            {t('about.ctaButton')}
          </Link>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
