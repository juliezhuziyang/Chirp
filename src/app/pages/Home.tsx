import { motion } from 'motion/react';
import { InteractiveSoundWave } from '../components/InteractiveSoundWave';
import { Navigation } from '../components/Navigation';
import { Footer } from '../components/Footer';
import { FeatureCard } from '../components/FeatureCard';
import { Waves, Brain, Heart, Target, Sparkles } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { Link } from 'react-router';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 overflow-hidden">
      {/* Interactive Sound Wave Background */}
      <InteractiveSoundWave />

      {/* Static decorative background blobs */}
      <div className="fixed inset-0 opacity-10 pointer-events-none" style={{ zIndex: 0 }}>
        <div className="absolute top-20 left-10 w-96 h-96 bg-orange-300 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-300 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-yellow-300 rounded-full blur-3xl"></div>
      </div>

      <Navigation />

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-6 pt-20 pb-32" style={{ zIndex: 2 }}>
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="inline-flex items-center gap-2 bg-orange-100 px-4 py-2 rounded-full mb-6"
            >
              <Sparkles className="w-4 h-4 text-orange-600" />
              <span className="text-orange-700 font-semibold text-sm">AI-Powered Communication</span>
            </motion.div>
            
            <h1 className="text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Understanding Your{' '}
              <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                Lovebird's
              </span>{' '}
              Voice
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Chirp uses AI to help humans better understand the vocal expressions of pet lovebirds, 
              fostering more empathetic and informed care through intelligent audio analysis.
            </p>

            <div className="flex items-center gap-4 flex-wrap">
              <Link
                to="/register"
                className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-8 py-4 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transition-shadow"
              >
                Get Started
              </Link>
              <Link
                to="/about"
                className="bg-white text-gray-800 px-8 py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-shadow border-2 border-orange-200"
              >
                Learn More
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="relative"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1767840927450-1817414cd2d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsb3ZlYmlyZCUyMHBhcnJvdCUyMGNvbG9yZnVsfGVufDF8fHx8MTc3MTEzOTMxMXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Colorful lovebird"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-orange-900/30 to-transparent"></div>
            </div>
            
            {/* Static decorative elements - NO ANIMATION */}
            <div className="absolute -top-6 -right-6 bg-white p-4 rounded-2xl shadow-xl">
              <Waves className="w-8 h-8 text-orange-500" />
            </div>
            
            <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl">
              <Brain className="w-8 h-8 text-amber-500" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative max-w-7xl mx-auto px-6 py-20" style={{ zIndex: 2 }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Intelligent Audio Analysis
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Advanced AI technology to decode your lovebird's vocalizations
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            icon={Waves}
            title="Pattern Recognition"
            description="Explore patterns in lovebird vocalizations using advanced audio analysis algorithms to identify recurring sounds and behaviors."
            delay={0}
          />
          <FeatureCard
            icon={Target}
            title="Behavioral Classification"
            description="Classify common vocal sounds into broad behavioral or emotional categories for better understanding of your pet's needs."
            delay={0.1}
          />
          <FeatureCard
            icon={Brain}
            title="AI-Powered Insights"
            description="Leverage machine learning to provide interpretable feedback that supports more informed and empathetic pet care."
            delay={0.2}
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative max-w-7xl mx-auto px-6 py-20" style={{ zIndex: 2 }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-3xl p-12 text-center shadow-2xl"
        >
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Better Understand Your Lovebird?
          </h2>
          <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
            Join us in exploring how AI can bridge the communication gap between humans and their beloved pets.
          </p>
          <Link
            to="/register"
            className="inline-block bg-white text-orange-600 px-10 py-4 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transition-shadow"
          >
            Start Your Journey with Chirp
          </Link>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}