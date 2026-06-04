import { Link, useNavigate } from "react-router";
import { LogOut, LayoutDashboard, Bird } from "lucide-react";
import logoImage from "figma:asset/2c2fce460c7929b55577efe6720c0ce0c73a5838.png";
import { useAuth } from "../../contexts/AuthContext";

export function AppNav() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <nav className="relative bg-white/70 backdrop-blur-md border-b border-orange-200" style={{ zIndex: 10 }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
        <Link to={isAuthenticated ? "/dashboard" : "/"} className="flex items-center gap-3 shrink-0">
          <img src={logoImage} alt="Chirp Logo" className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg" />
          <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
            Chirp
          </span>
        </Link>

        <div className="flex items-center gap-3 sm:gap-6 flex-wrap justify-end">
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                className="hidden sm:flex items-center gap-1.5 text-gray-700 hover:text-orange-600 transition-colors font-medium"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
              <Link
                to="/my-bird"
                className="flex items-center gap-1.5 text-gray-700 hover:text-orange-600 transition-colors font-medium"
              >
                <Bird className="w-4 h-4" />
                <span className="hidden xs:inline sm:inline">My Bird</span>
              </Link>
              <span className="hidden md:inline text-sm text-gray-500 truncate max-w-[120px]">
                {user?.name}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-gray-600 hover:text-orange-600 font-medium transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-gray-700 hover:text-orange-600 font-medium transition-colors">
                Login
              </Link>
              <Link
                to="/register"
                className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-5 py-2 rounded-full font-semibold shadow-lg hover:shadow-xl transition-shadow text-sm sm:text-base"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
