import { motion } from 'motion/react';
import { InteractiveSoundWave } from '../components/InteractiveSoundWave';
import { Navigation } from '../components/Navigation';
import { Footer } from '../components/Footer';
import { MessageCircle, Brain, Heart, Target, ShieldAlert, Github } from 'lucide-react';
import developerPhoto from 'figma:asset/72c70a48e114e573811b8ad0f82fcda007e16aef.png';
import { Link } from 'react-router';

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 overflow-hidden">
      {/* Interactive Sound Wave Background */}
      <InteractiveSoundWave />

      {/* Static decorative background blobs */}
      <div className="fixed inset-0 opacity-10 pointer-events-none" style={{ zIndex: 0 }}>
        <div className="absolute top-20 left-10 w-96 h-96 bg-orange-300 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-300 rounded-full blur-3xl"></div>
      </div>

      <Navigation />

      {/* About Section */}
      <section className="relative max-w-7xl mx-auto px-6 py-20" style={{ zIndex: 2 }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-6xl font-bold text-gray-900 mb-6">
            About Chirp
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Pet lovebirds rely heavily on vocalization to communicate their needs and emotional states. 
            However, human caretakers often interpret these sounds intuitively, which may lead to 
            misunderstanding or overlooked stress signals.
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
            <h3 className="text-2xl font-bold text-gray-800 mb-3">The Challenge</h3>
            <p className="text-gray-700">
              Lovebirds use complex vocalizations that are difficult for humans to interpret accurately
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl text-center shadow-lg border border-orange-100"
          >
            <Brain className="w-12 h-12 text-orange-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-800 mb-3">The Solution</h3>
            <p className="text-gray-700">
              AI-powered audio analysis to identify patterns and classify vocal behaviors
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl text-center shadow-lg border border-orange-100"
          >
            <Heart className="w-12 h-12 text-orange-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-800 mb-3">The Impact</h3>
            <p className="text-gray-700">
              More empathetic care and stronger bonds between caretakers and their beloved pets
            </p>
          </motion.div>
        </div>
      </section>

      {/* Project Goals Section */}
      <section className="relative bg-white/50 backdrop-blur-sm py-20" style={{ zIndex: 2 }}>
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold text-gray-900 mb-6">Project Goals</h2>
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
                <h3 className="text-2xl font-bold text-gray-900">What We Aim To Do</h3>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                  <p className="text-gray-700">Explore patterns in lovebird vocalizations using audio analysis</p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                  <p className="text-gray-700">Classify common vocal sounds into broad behavioral or emotional categories</p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                  <p className="text-gray-700">Provide interpretable feedback to support better pet care</p>
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
                <h3 className="text-2xl font-bold text-gray-900">What We Do NOT Aim To Do</h3>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-gray-400 rounded-full mt-2"></div>
                  <p className="text-gray-700">Fully translate bird language</p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-gray-400 rounded-full mt-2"></div>
                  <p className="text-gray-700">Replace human observation or veterinary advice</p>
                </li>
              </ul>
              <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-200">
                <p className="text-sm text-gray-700 italic">
                  Chirp is a supportive tool designed to enhance, not replace, your natural connection with your pet.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Developer Section */}
      <section className="relative max-w-5xl mx-auto px-6 py-20" style={{ zIndex: 2 }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-5xl font-bold text-gray-900 mb-6">Developer</h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-white rounded-3xl p-10 shadow-2xl border border-orange-200"
        >
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
            {/* Developer Photo */}
            <div className="flex-shrink-0">
              <img
                src={developerPhoto}
                alt="Ziyang Zhu (Julie)"
                className="w-48 h-48 rounded-2xl object-cover shadow-lg border-4 border-orange-100"
              />
            </div>

            {/* Developer Info */}
            <div className="flex-1">
              <h3 className="text-3xl font-bold text-gray-900 mb-2">
                Ziyang Zhu (Julie)
              </h3>
              <p className="text-orange-600 font-semibold mb-4 text-lg">
                High School Researcher & Developer
              </p>
              <p className="text-gray-700 leading-relaxed mb-6">
                Julie Zhu is a high school researcher and developer passionate about the intersection of biology and technology. 
                She is the creator of Chirp, combining computational modeling with behavioral science to improve human–bird interaction. 
                Julie is also the founder of{' '}
                <a
                  href="https://oxydebate.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-600 hover:text-orange-700 font-semibold underline"
                >
                  Oxymorona Debate
                </a>
                , showcasing her interest in debate and public speaking. With a strong foundation in biology and physics, she 
                approaches every project with curiosity, rigor, and a focus on real-world impact.
              </p>
              
              {/* Interests/Skills Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-semibold">
                  Biology
                </span>
                <span className="bg-amber-100 text-amber-700 px-4 py-2 rounded-full text-sm font-semibold">
                  Physics
                </span>
                <span className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full text-sm font-semibold">
                  Machine Learning
                </span>
                <span className="bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-semibold">
                  Behavioral Science
                </span>
                <span className="bg-amber-100 text-amber-700 px-4 py-2 rounded-full text-sm font-semibold">
                  Debate & Public Speaking
                </span>
              </div>

              {/* GitHub Link */}
              <a
                href="https://github.com/Julie-Zhu24/Chirp"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-full font-semibold hover:bg-gray-800 transition-colors shadow-lg"
              >
                <Github className="w-5 h-5" />
                View Project on GitHub
              </a>
            </div>
          </div>
        </motion.div>
      </section>

      {/* CTA Newsletter Section */}
      <section className="relative max-w-4xl mx-auto px-6 py-16" style={{ zIndex: 2 }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-3xl p-10 text-center shadow-2xl"
        >
          <h2 className="text-3xl font-bold text-white mb-4">
            Stay Updated on Chirp's Development
          </h2>
          <p className="text-lg text-orange-100 mb-6">
            Subscribe to our newsletter to be notified when Chirp launches!
          </p>
          <Link
            to="/newsletter"
            className="inline-block bg-white text-orange-600 px-10 py-4 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transition-shadow"
          >
            Subscribe Now
          </Link>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}