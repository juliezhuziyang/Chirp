import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import logoImage from 'figma:asset/2c2fce460c7929b55577efe6720c0ce0c73a5838.png';

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="relative bg-gray-900 text-white py-12" style={{ zIndex: 2 }}>
      <div className="max-w-7xl mx-auto px-6 text-center">
        <Link to="/" className="flex items-center justify-center gap-3 mb-6">
          <img src={logoImage} alt="Chirp Logo" className="w-10 h-10 rounded-lg" />
          <span className="text-2xl font-bold">Chirp</span>
        </Link>
        <p className="text-gray-400 mb-2">
          {t('footer.tagline')}
        </p>
        <p className="text-gray-400 mb-4">
          {t('footer.subtitle')}
        </p>
        <p className="text-gray-500 text-sm">
          {t('footer.copyright')}
        </p>
      </div>
    </footer>
  );
}
