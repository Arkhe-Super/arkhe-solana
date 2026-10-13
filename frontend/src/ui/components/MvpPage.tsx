import type { ReactNode } from 'react';

type MvpPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
};

export default function MvpPage({ eyebrow, title, description, children }: MvpPageProps) {
  return (
    <main className="min-h-screen bg-surface px-5 pb-28 pt-10 text-on-surface sm:px-10">
      <div className="mx-auto max-w-5xl">
        <header className="border-b border-outline/20 pb-7">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-tertiary">{eyebrow}</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-primary sm:text-4xl">{title}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-on-surface-variant sm:text-base">{description}</p>
        </header>
        <div className="mt-8 space-y-6">{children}</div>
      </div>
    </main>
  );
}

export function StatusNotice({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'warning' | 'success' | 'error' }) {
  const tones = {
    neutral: 'border-outline/30 bg-surface-container-low text-on-surface-variant',
    warning: 'border-amber-400/40 bg-amber-400/10 text-amber-100',
    success: 'border-secondary/40 bg-secondary/10 text-secondary',
    error: 'border-error/50 bg-error/10 text-error',
  };

  return <p className={`rounded-lg border px-4 py-3 text-sm leading-6 ${tones[tone]}`}>{children}</p>;
}
