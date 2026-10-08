import { useTranslation } from 'react-i18next';

export default function LanguageToggle() {
  const { i18n } = useTranslation();

  const isEnglish = i18n.language.startsWith('en');

  const toggleLanguage = () => {
    const newLang = isEnglish ? 'pt-BR' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="p-1.5 rounded hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface transition-colors font-code-sm border border-outline-variant/30 flex items-center justify-center min-w-[40px]"
      title="Toggle Language"
    >
      {isEnglish ? 'PT' : 'EN'}
    </button>
  );
}
