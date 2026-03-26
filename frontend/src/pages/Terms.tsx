import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '../components/ui/Card';

interface LegalSection {
  title: string;
  paragraphs: string[];
  list: string[];
}

interface LegalPageData {
  meta: {
    category: string;
    title: string;
    description: string;
    lastUpdated: string;
  };
  sections: LegalSection[];
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  const [rawIndex, ...rest] = title.split('. ');
  const hasNumber = rest.length > 0 && /^\d+$/.test(rawIndex);
  const sectionTitle = hasNumber ? rest.join('. ') : title;

  return (
    <section className="space-y-3">
      <h2 className="flex items-baseline gap-2 text-lg font-bold uppercase tracking-wider text-white">
        {hasNumber ? <span className="font-mono text-white/90">{rawIndex}.</span> : null}
        <span>{sectionTitle}</span>
      </h2>
      <div className="space-y-3 text-sm leading-6 text-white/70">{children}</div>
    </section>
  );
}

export default function Terms() {
  const { t } = useTranslation();
  const page = t('terms', { returnObjects: true }) as LegalPageData;
  const sections = Array.isArray(page?.sections) ? page.sections : [];

  return (
    <div className="mx-auto w-full max-w-4xl py-8">
      <Card className="p-6 sm:p-8 border-white/10 bg-black/40 backdrop-blur-xl">
        <header className="mb-8 space-y-3 border-b border-white/10 pb-6">
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-brand-red">
            {page?.meta?.category ?? 'Legal'}
          </p>
          <h1 className="text-3xl font-black uppercase tracking-tight text-white">
            {page?.meta?.title ?? 'Terms of Use'}
          </h1>
          <p className="text-sm leading-6 text-white/65">
            {page?.meta?.description ?? 'These terms govern access to and use of this Pong platform prototype, including gameplay pages, account features, chat UI, and related interfaces.'}
          </p>
          <p className="text-xs uppercase tracking-widest text-white/35">
            {page?.meta?.lastUpdated ?? 'Last updated: February 22, 2026'}
          </p>
        </header>

        <div className="space-y-8">
          {sections.map((section, index) => (
            <Section key={index} title={section.title}>
              {section.paragraphs.map((text, i) => (
                <p key={`p-${i}`}>{text}</p>
              ))}
              {section.list.length > 0 ? (
                <ul className="list-disc space-y-2 pl-5">
                  {section.list.map((item, i) => (
                    <li key={`li-${i}`}>{item}</li>
                  ))}
                </ul>
              ) : null}
            </Section>
          ))}
        </div>
      </Card>
    </div>
  );
}
