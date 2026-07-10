import { useTranslation } from "react-i18next";

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();

  const toggleLanguage = () => {
    void i18n.changeLanguage(i18n.language === "zh" ? "en" : "zh");
  };

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className="text-sm font-medium text-gray-600 hover:text-orange-600 transition-colors px-2 py-1 rounded-lg hover:bg-orange-50"
      aria-label={`Switch language to ${t("language.switchTo")}`}
    >
      {t("language.switchTo")}
    </button>
  );
}
