import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
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

export default function Register() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { register, user, isLoading } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && user) {
      navigate(user.onboardingCompleted ? "/dashboard/sound" : "/onboarding", { replace: true });
    }
  }, [isLoading, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError(t("auth.errors.passwordMismatch"));
      return;
    }
    if (password.length < 6) {
      setError(t("auth.errors.passwordTooShort"));
      return;
    }

    setIsSubmitting(true);
    try {
      await register(email, password, name);
      navigate("/onboarding", { replace: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : t("auth.errors.createAccountFailed");
      setError(translateAuthError(msg, t));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title={t("auth.registerTitle")}
      subtitle={t("auth.registerSubtitle")}
      footer={
        <p className="text-gray-600">
          {t("auth.registerHasAccount")}{" "}
          <Link to="/login" className="text-orange-600 font-semibold hover:underline">
            {t("auth.registerSignIn")}
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t("common.name")}</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl border-2 border-orange-100 bg-input-background focus:border-orange-400 focus:outline-none transition-colors"
            placeholder={t("auth.registerNamePlaceholder")}
          />
        </div>
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
            placeholder={t("auth.registerPasswordPlaceholder")}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t("common.confirmPassword")}</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
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
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50 mt-2"
        >
          {isSubmitting ? t("auth.registerSubmitting") : t("auth.registerSubmit")}
        </motion.button>
      </form>
    </AuthLayout>
  );
}
