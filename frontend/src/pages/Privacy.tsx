import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

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

export default function Privacy() {
  return (
    <div className="mx-auto w-full max-w-4xl py-8">
      <div className="rounded-2xl border border-white/10 bg-black/40 p-6 sm:p-8 backdrop-blur-xl">
        <header className="mb-8 space-y-3 border-b border-white/10 pb-6">
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-brand-red">Legal</p>
          <h1 className="text-3xl font-black uppercase tracking-tight text-white">Privacy Policy</h1>
          <p className="text-sm leading-6 text-white/65">
            This page explains what data may be processed when using this Pong platform prototype and how it is used
            inside the application.
          </p>
          <p className="text-xs uppercase tracking-widest text-white/35">Last updated: February 22, 2026</p>
        </header>

        <div className="space-y-8">
          <Section title="1. Data We May Process">
            <p>Depending on implemented features, the application may process:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>account information (username, email, avatar);</li>
              <li>session/authentication tokens stored in the browser;</li>
              <li>game-related state (match IDs, lobby status, scores);</li>
              <li>chat messages and presence indicators;</li>
              <li>basic technical logs for debugging and stability.</li>
            </ul>
          </Section>

          <Section title="2. Why We Use Data">
            <p>Data is used only for operating the service and improving the project, including to:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>authenticate users and maintain sessions;</li>
              <li>connect players to lobbies and matches;</li>
              <li>display game UI, profiles, and chat interactions;</li>
              <li>diagnose errors, performance issues, or abuse.</li>
            </ul>
          </Section>

          <Section title="3. Storage and Retention">
            <p>
              Because this is a development/educational project, some data may be mocked, temporary, or reset without
              notice. Retention periods may vary depending on the current implementation stage.
            </p>
          </Section>

          <Section title="4. Sharing">
            <p>
              We do not sell personal data. Data may be visible to other players as part of core functionality (for
              example usernames, avatars, chat messages, or match presence).
            </p>
          </Section>

          <Section title="5. Security">
            <p>
              Reasonable measures are taken within the project scope, but no system is guaranteed to be perfectly
              secure. Avoid sharing sensitive information in chat or profile fields.
            </p>
          </Section>

          <Section title="6. Your Choices">
            <p>
              You may stop using the service at any time and request guidance from the project team/instructors
              regarding account data handling, where applicable.
            </p>
          </Section>

          <Section title="7. Changes to This Policy">
            <p>
              This policy may be updated as features change. The “Last updated” date on this page indicates the most
              recent revision.
            </p>
          </Section>

          <Section title="8. Related Document">
            <p>
              Please also review the <Link to="/terms" className="text-primary hover:underline">Terms of Use</Link>.
            </p>
          </Section>
        </div>
      </div>
    </div>
  );
}
