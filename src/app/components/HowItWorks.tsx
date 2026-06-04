import { motion } from 'motion/react';
import { Database, TrendingUp, Brain, Sparkles } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: Database,
    title: 'Collect Audio Database',
    description: 'Gather a comprehensive database of lovebird vocalizations across various contexts, emotional states, and environmental conditions. Each sound is carefully annotated and categorized.',
    details: 'Our dataset includes thousands of audio samples from different lovebird species, capturing chirps, calls, and songs in diverse situations.',
    color: 'from-orange-500 to-amber-500',
  },
  {
    number: '02',
    icon: TrendingUp,
    title: 'VAS Value Inference',
    description: 'Extract and infer VAS (Valence, Arousal, Social Engagement) values from each audio sample using advanced signal processing and feature extraction techniques.',
    details: 'Valence measures positive/negative emotion, Arousal indicates energy level, and Social Engagement reflects interaction intent.',
    color: 'from-amber-500 to-yellow-500',
  },
  {
    number: '03',
    icon: Brain,
    title: 'CNN Machine Learning',
    description: 'Train deep Convolutional Neural Networks on audio spectrograms to recognize complex patterns in vocal expressions and correlate them with emotional states.',
    details: 'Our CNN architecture analyzes frequency, duration, amplitude, and temporal patterns to build robust predictive models.',
    color: 'from-yellow-500 to-orange-500',
  },
  {
    number: '04',
    icon: Sparkles,
    title: 'Classification & Advice',
    description: 'Generate emotion classifications with confidence scores and provide data-driven care recommendations tailored to your lovebird\'s specific vocal patterns.',
    details: 'Receive actionable insights on your bird\'s needs, stress levels, and wellbeing, backed by scientific analysis.',
    color: 'from-orange-500 to-amber-600',
  },
];

export function HowItWorks() {
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
            {/* Step number background */}
            <div className="absolute top-8 right-8 text-8xl font-bold text-gray-100 select-none">
              {step.number}
            </div>

            <div className="relative z-10">
              {/* Icon */}
              <div className={`inline-flex bg-gradient-to-br ${step.color} p-4 rounded-2xl mb-6 shadow-lg`}>
                <step.icon className="w-10 h-10 text-white" />
              </div>

              {/* Title */}
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                {step.title}
              </h3>

              {/* Description */}
              <p className="text-gray-700 mb-4 leading-relaxed">
                {step.description}
              </p>

              {/* Details */}
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-200">
                <p className="text-sm text-gray-600 italic">
                  {step.details}
                </p>
              </div>
            </div>

            {/* Connecting line (except for last items) */}
            {index < steps.length - 1 && index % 2 === 0 && (
              <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-orange-300 to-transparent"></div>
            )}
          </motion.div>
        ))}
        </div>

        {/* Flow arrows for visual connection */}
        <div className="mt-12 flex justify-center">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-orange-100 to-amber-100 px-6 py-3 rounded-full border border-orange-200">
            <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
            <span className="text-sm font-semibold text-gray-700">Continuous AI Learning Pipeline</span>
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
          </div>
        </div>
      </div>
    </section>
  );
}