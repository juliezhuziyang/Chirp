import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { InteractiveSoundWave } from '../components/InteractiveSoundWave';
import { Navigation } from '../components/Navigation';
import { Footer } from '../components/Footer';
import { HowItWorks } from '../components/HowItWorks';
import { Link } from 'react-router';

export default function HowItWorksPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 overflow-hidden">
      <InteractiveSoundWave />

      <div className="fixed inset-0 opacity-10 pointer-events-none" style={{ zIndex: 0 }}>
        <div className="absolute top-20 left-10 w-96 h-96 bg-orange-300 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-300 rounded-full blur-3xl"></div>
      </div>

      <Navigation />

      <section className="relative max-w-7xl mx-auto px-6 pt-20 pb-10" style={{ zIndex: 2 }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h1 className="text-6xl font-bold text-gray-900 mb-6">{t('howItWorks.pageTitle')}</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">{t('howItWorks.pageSubtitle')}</p>
        </motion.div>
      </section>

      <HowItWorks />

      <section className="relative max-w-4xl mx-auto px-6 py-16" style={{ zIndex: 2 }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-3xl p-10 text-center shadow-2xl"
        >
          <h2 className="text-3xl font-bold text-white mb-4">{t('howItWorks.ctaTitle')}</h2>
          <p className="text-lg text-orange-100 mb-6">{t('howItWorks.ctaDescription')}</p>
          <Link
            to="/register"
            className="inline-block bg-white text-orange-600 px-10 py-4 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transition-shadow"
          >
            {t('howItWorks.ctaButton')}
          </Link>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
