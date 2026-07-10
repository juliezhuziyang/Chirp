import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { motion } from "motion/react";
import { useTranslation } from "react-i18next";
import { AuthLayout } from "../components/auth/AuthLayout";
import { useAuth } from "../contexts/AuthContext";

function translateAuthError(message: string, t: (key: string) => string): string {
  if (message.includes("INVALID_CREDENTIALS")) return t("auth.errors.invalidCredentials");
  if (message.includes("EMAIL_EXISTS") || message.includes("already exists")) {
    return t("auth.errors.emailExists");
  }
  return message;
}

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { login, user, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname;

  useEffect(() => {
    if (!isLoading && user) {
      navigate(user.onboardingCompleted ? "/dashboard/sound" : "/onboarding", { replace: true });
    }
  }, [isLoading, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const loggedIn = await login(email, password);
      const dest = from || (loggedIn.onboardingCompleted ? "/dashboard/sound" : "/onboarding");
      navigate(dest, { replace: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : t("auth.errors.signInFailed");
      setError(translateAuthError(msg, t));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title={t("auth.loginTitle")}
      subtitle={t("auth.loginSubtitle")}
      footer={
        <p className="text-gray-600">
          {t("auth.loginNoAccount")}{" "}
          <Link to="/register" className="text-orange-600 font-semibold hover:underline">
            {t("auth.loginCreateOne")}
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t("common.email")}</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl border-2 border-orange-100 bg-input-background focus:border-orange-400 focus:outline-none transition-colors"
            placeholder={t("auth.loginEmailPlaceholder")}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t("common.password")}</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-4 py-3 rounded-xl border-2 border-orange-100 bg-input-background focus:border-orange-400 focus:outline-none transition-colors"
            placeholder={t("auth.loginPasswordPlaceholder")}
          />
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-600 text-sm font-medium bg-red-50 px-4 py-3 rounded-xl border border-red-100"
          >
            {error}
          </motion.p>
        )}

        <motion.button
          type="submit"
          disabled={isSubmitting}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50"
        >
          {isSubmitting ? t("auth.loginSubmitting") : t("auth.loginSubmit")}
        </motion.button>
      </form>
    </AuthLayout>
  );
}
