import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import logoImage from 'figma:asset/2c2fce460c7929b55577efe6720c0ce0c73a5838.png';
import { useAuth } from '../contexts/AuthContext';
import { LanguageSwitcher } from './LanguageSwitcher';

export function Navigation() {
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();

  return (
    <nav
      className="relative bg-white/70 backdrop-blur-md border-b border-orange-200"
      style={{ zIndex: 10 }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <img src={logoImage} alt="Chirp Logo" className="w-12 h-12 rounded-lg" />
          <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
            Chirp
          </span>
        </Link>
        <div className="flex items-center gap-4 sm:gap-6">
          <Link to="/" className="text-gray-700 hover:text-orange-600 transition-colors font-medium">
            {t('nav.home')}
          </Link>
          <Link to="/about" className="text-gray-700 hover:text-orange-600 transition-colors font-medium hidden sm:inline">
            {t('nav.about')}
          </Link>
          <Link to="/how-it-works" className="text-gray-700 hover:text-orange-600 transition-colors font-medium hidden md:inline">
            {t('nav.howItWorks')}
          </Link>
          <Link to="/demo" className="text-gray-700 hover:text-orange-600 transition-colors font-medium hidden md:inline">
            {t('nav.demo')}
          </Link>
          <LanguageSwitcher />
          {isAuthenticated ? (
            <Link
              to="/dashboard/sound"
              className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-2 rounded-full font-semibold shadow-lg hover:shadow-xl transition-shadow"
            >
              {t('nav.dashboard')}
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-gray-700 hover:text-orange-600 transition-colors font-medium">
                {t('nav.login')}
              </Link>
              <Link
                to="/register"
                className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-2 rounded-full font-semibold shadow-lg hover:shadow-xl transition-shadow"
              >
                {t('nav.getStarted')}
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
