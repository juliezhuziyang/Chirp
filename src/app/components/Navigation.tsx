import { Link } from 'react-router';
import logoImage from 'figma:asset/2c2fce460c7929b55577efe6720c0ce0c73a5838.png';
import { useAuth } from '../contexts/AuthContext';

export function Navigation() {
  const { isAuthenticated } = useAuth();

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
        <div className="flex items-center gap-6 sm:gap-8">
          <Link to="/" className="text-gray-700 hover:text-orange-600 transition-colors font-medium">
            Home
          </Link>
          <Link to="/about" className="text-gray-700 hover:text-orange-600 transition-colors font-medium hidden sm:inline">
            About
          </Link>
          <Link to="/how-it-works" className="text-gray-700 hover:text-orange-600 transition-colors font-medium hidden md:inline">
            How It Works
          </Link>
          <Link to="/demo" className="text-gray-700 hover:text-orange-600 transition-colors font-medium hidden md:inline">
            Demo
          </Link>
          {isAuthenticated ? (
            <Link
              to="/dashboard/sound"
              className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-2 rounded-full font-semibold shadow-lg hover:shadow-xl transition-shadow"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-gray-700 hover:text-orange-600 transition-colors font-medium">
                Login
              </Link>
              <Link
                to="/register"
                className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-2 rounded-full font-semibold shadow-lg hover:shadow-xl transition-shadow"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}