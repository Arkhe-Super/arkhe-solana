import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '../../i18n/config';

export default function LanguageToggle() {
  const { i18n } = useTranslation();

  const current = (i18n.resolvedLanguage ?? 'en') as SupportedLanguage;

  const change = async (lng: SupportedLanguage) => {
    await i18n.changeLanguage(lng);
  };

  return (
    <div role="group" aria-label="Language selector" className="flex items-center gap-1 border border-outline-variant/30 rounded p-1">
      {SUPPORTED_LANGUAGES.map((lng) => (
        <button
          key={lng}
          type="button"
          onClick={() => change(lng)}
          aria-pressed={current === lng}
          disabled={current === lng}
          className={`p-1 text-xs font-code-sm rounded ${current === lng ? 'bg-surface-container-highest text-on-surface' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest/50'} transition-colors min-w-[32px] uppercase`}
          title={`Switch to ${lng.toUpperCase()}`}
        >
          {lng}
        </button>
      ))}
    </div>
  );
}
