import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import WorkRegistrationForm from './WorkRegistrationForm';
import SimilarityAnalyzer from './SimilarityAnalyzer';
import RoyaltyLiquidation from './RoyaltyLiquidation';

export default function JorgeBenJorVsRodStewartDemo() {
  const { t } = useTranslation();
  const [step, setStep] = useState<1 | 2 | 3>(1);


  const handleRegistered = (_work: any) => {

    setStep(2);
  };

  const handleSimilarityProven = () => {
    setStep(3);
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen p-8 antialiased font-body-md selection:bg-primary-container selection:text-on-primary-container">
      <div className="max-w-4xl mx-auto space-y-8">

        <header className="border-b border-outline/20 pb-6 mb-8">
          <h1 className="text-3xl font-headline-sm font-bold text-primary mb-2 flex items-center gap-3">
            <span className="material-symbols-outlined text-3xl">music_note</span>
            {t('demo.title')}
          </h1>
          <p className="text-on-surface-variant max-w-2xl">
            {t('demo.subtitle')}
          </p>
        </header>

        <div className="flex gap-4 mb-8">
          <div className={`flex-1 p-3 rounded-lg border text-center font-bold ${
            step >= 1 ? 'border-primary bg-primary/10 text-primary' : 'border-outline/20 text-on-surface-variant'
          }`}>
            {t('demo.step1')}
          </div>
          <div className={`flex-1 p-3 rounded-lg border text-center font-bold ${
            step >= 2 ? 'border-secondary bg-secondary/10 text-secondary' : 'border-outline/20 text-on-surface-variant'
          }`}>
            {t('demo.step2')}
          </div>
          <div className={`flex-1 p-3 rounded-lg border text-center font-bold ${
            step >= 3 ? 'border-tertiary bg-tertiary/10 text-tertiary' : 'border-outline/20 text-on-surface-variant'
          }`}>
            {t('demo.step3')}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-8">
            {step === 1 && (
              <WorkRegistrationForm onRegistered={handleRegistered} />
            )}

            {step === 2 && (
              <SimilarityAnalyzer onSimilarityProven={handleSimilarityProven} />
            )}

            {step === 3 && (
              <RoyaltyLiquidation />
            )}
          </div>

          <div className="bg-surface-container-low p-6 rounded-lg border border-outline/10 h-fit">
            <h3 className="font-bold text-lg mb-4 text-on-surface border-b border-outline/20 pb-2">
              {t('demo.demo_script')}
            </h3>
            <ul className="space-y-4 text-sm text-on-surface-variant">
              <li className={step === 1 ? "text-on-surface font-semibold" : ""}>
                <strong className="text-primary block mb-1">{t('demo.step1_title')}</strong>
                {t('demo.step1_desc')}
              </li>
              <li className={step === 2 ? "text-on-surface font-semibold" : ""}>
                <strong className="text-secondary block mb-1">{t('demo.step2_title')}</strong>
                {t('demo.step2_desc')}
              </li>
              <li className={step === 3 ? "text-on-surface font-semibold" : ""}>
                <strong className="text-tertiary block mb-1">{t('demo.step3_title')}</strong>
                {t('demo.step3_desc')}
              </li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}
