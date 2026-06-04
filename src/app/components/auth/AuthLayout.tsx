import { Link } from "react-router";
import { motion } from "motion/react";
import { ChirpBackground } from "../layout/ChirpBackground";
import logoImage from "figma:asset/2c2fce460c7929b55577efe6720c0ce0c73a5838.png";

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <ChirpBackground>
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Link to="/" className="flex items-center justify-center gap-3 mb-8">
            <img src={logoImage} alt="Chirp" className="w-14 h-14 rounded-xl shadow-lg" />
            <span className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              Chirp
            </span>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white/90 backdrop-blur-md rounded-3xl p-8 shadow-2xl border-2 border-orange-100"
          >
            <h1 className="text-2xl font-bold text-gray-900 text-center mb-1">{title}</h1>
            <p className="text-gray-500 text-center mb-8">{subtitle}</p>
            {children}
          </motion.div>

          {footer && <div className="mt-6 text-center">{footer}</div>}
        </motion.div>
      </div>
    </ChirpBackground>
  );
}
