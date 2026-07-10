import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { Database, TrendingUp, Brain, Sparkles } from 'lucide-react';

const STEP_KEYS = ['collect', 'vas', 'cnn', 'classify'] as const;
const STEP_NUMBERS = ['01', '02', '03', '04'];
const STEP_ICONS = [Database, TrendingUp, Brain, Sparkles];
const STEP_COLORS = [
  'from-orange-500 to-amber-500',
  'from-amber-500 to-yellow-500',
  'from-yellow-500 to-orange-500',
  'from-orange-500 to-amber-600',
];

export function HowItWorks() {
  const { t } = useTranslation();

  const steps = STEP_KEYS.map((key, index) => ({
    number: STEP_NUMBERS[index],
    icon: STEP_ICONS[index],
    title: t(`howItWorks.steps.${key}.title`),
    description: t(`howItWorks.steps.${key}.description`),
    details: t(`howItWorks.steps.${key}.details`),
    color: STEP_COLORS[index],
  }));

  return (
    <section className="relative py-16 bg-white/30 backdrop-blur-sm" style={{ zIndex: 2 }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-8">{steps.map((step, index) => (
          <motion.div
            key={step.number}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="relative bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-shadow border border-orange-100"
          >
            <div className="absolute top-8 right-8 text-8xl font-bold text-gray-100 select-none">
              {step.number}
            </div>

            <div className="relative z-10">
              <div className={`inline-flex bg-gradient-to-br ${step.color} p-4 rounded-2xl mb-6 shadow-lg`}>
                <step.icon className="w-10 h-10 text-white" />
              </div>

              <h3 className="text-3xl font-bold text-gray-900 mb-4">{step.title}</h3>
              <p className="text-gray-700 mb-4 leading-relaxed">{step.description}</p>

              <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-200">
                <p className="text-sm text-gray-600 italic">{step.details}</p>
              </div>
            </div>

            {index < steps.length - 1 && index % 2 === 0 && (
              <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-orange-300 to-transparent"></div>
            )}
          </motion.div>
        ))}
        </div>

        <div className="mt-12 flex justify-center">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-orange-100 to-amber-100 px-6 py-3 rounded-full border border-orange-200">
            <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
            <span className="text-sm font-semibold text-gray-700">{t('howItWorks.pipeline')}</span>
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
