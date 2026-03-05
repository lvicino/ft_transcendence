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

export default function Terms() {
  return (
    <div className="mx-auto w-full max-w-4xl py-8">
      <div className="rounded-2xl border border-white/10 bg-black/40 p-6 sm:p-8 backdrop-blur-xl">
        <header className="mb-8 space-y-3 border-b border-white/10 pb-6">
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-brand-red">Legal</p>
          <h1 className="text-3xl font-black uppercase tracking-tight text-white">Terms of Use</h1>
          <p className="text-sm leading-6 text-white/65">
            These terms govern access to and use of this Pong platform prototype, including gameplay pages,
            account features, chat UI, and related interfaces.
          </p>
          <p className="text-xs uppercase tracking-widest text-white/35">Last updated: February 22, 2026</p>
        </header>

        <div className="space-y-8">
          <Section title="1. Purpose of the Service">
            <p>
              This project is an educational web application built for demonstration and learning purposes. Some
              features may be mocked or incomplete, and availability is not guaranteed.
            </p>
          </Section>

          <Section title="2. Acceptable Use">
            <p>You agree not to misuse the service. In particular, you must not:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>attempt to disrupt matches, chat, or site availability;</li>
              <li>use abusive, hateful, or unlawful content in usernames or messages;</li>
              <li>attempt to access accounts or data that do not belong to you;</li>
              <li>reverse engineer or exploit the service beyond normal browser use.</li>
            </ul>
          </Section>

          <Section title="3. Accounts and Access">
            <p>
              You are responsible for activity performed through your account session. Keep your credentials private
              and log out when using a shared device.
            </p>
            <p>
              We may suspend access to protect the platform, other users, or project infrastructure if misuse is
              detected.
            </p>
          </Section>

          <Section title="4. Gameplay and Availability">
            <p>
              Matchmaking, lobby states, scores, and game outcomes may be simulated during development. No guarantee
              is made regarding persistence, fairness, ranking accuracy, or uninterrupted operation.
            </p>
          </Section>

          <Section title="5. Intellectual Property">
            <p>
              Unless otherwise noted, the project code, interface design, and original assets are provided for the
              educational project context. Third-party libraries and icons remain subject to their own licenses.
            </p>
          </Section>

          <Section title="6. Limitation of Liability">
            <p>
              The service is provided “as is” without warranties of any kind. To the maximum extent permitted by law,
              the project authors are not liable for data loss, service interruptions, or indirect damages arising
              from use of the application.
            </p>
          </Section>

          <Section title="7. Changes to These Terms">
            <p>
              These terms may be updated as the project evolves. Material changes will be reflected on this page with
              a revised “Last updated” date.
            </p>
          </Section>

          <Section title="8. Contact">
            <p>
              For project-related questions about these terms or your data, use the contact channel provided by the
              project team/instructors.
            </p>
            <p>
              See also the <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
            </p>
          </Section>
        </div>
      </div>
    </div>
  );
}
