import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();
  return (
<footer className="bg-surface-container-lowest/95 backdrop-blur-md dark:bg-surface-container-lowest/95 text-tertiary dark:text-tertiary fixed bottom-0 left-0 w-full h-8 z-50 flex items-center border-t border-outline-variant/30 shadow-[0_-4px_16px_-2px_rgba(0,0,0,0.4)]">
<div className="w-full px-4 flex justify-between items-center text-code-sm font-code-sm">
{/* Left Copyright & Slot Identifier */}
<div className="flex items-center gap-4">
<span className="text-code-sm font-code-sm text-on-surface font-semibold">
          {t("footer.foundation")} // {t("footer.slot")} #294029103
        </span>
</div>
{/* Right Telemetry Status Pills & Documentation Links */}
<div className="flex items-center gap-5">
<span className="text-secondary font-medium underline cursor-pointer active:opacity-75">{t("footer.yellowstone")}</span>
<span className="text-on-surface-variant hover:text-on-surface hover:text-secondary transition-colors duration-150 cursor-pointer active:opacity-75">{t("footer.wasm_runtime")}: 32MB</span>
<span className="text-on-surface-variant hover:text-on-surface hover:text-secondary transition-colors duration-150 cursor-pointer active:opacity-75">TPS: 3,420</span>
<span className="text-on-surface-variant hover:text-on-surface hover:text-secondary transition-colors duration-150 cursor-pointer active:opacity-75">{t("footer.audit")}</span>
<span className="text-on-surface-variant hover:text-on-surface hover:text-secondary transition-colors duration-150 cursor-pointer active:opacity-75">{t("footer.github")}</span>
</div>
</div>
</footer>
  );
}
