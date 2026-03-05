import { getLocale } from "next-intl/server";
import { Link } from "@/lib/navigation";

export const metadata = {
  title: "Privacy Policy | Flow Productions",
  description: "How Flow Productions collects, uses, and protects your personal data.",
};

export default async function PrivacyPolicyPage() {
  const locale = await getLocale();
  const lastUpdated = "March 4, 2026";

  return (
    <div
      className="min-h-screen py-16 px-4"
      style={{ background: "var(--bg)", color: "var(--text)" }}
    >
      <div className="max-w-3xl mx-auto">

        {/* Back */}
        <Link
          href={`/${locale}/login`}
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest mb-10 transition-opacity hover:opacity-70"
          style={{ color: "var(--text-faint)" }}
        >
          ← Back
        </Link>

        {/* Header */}
        <div className="mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--accent)" }}>
            Legal
          </p>
          <h1 className="text-4xl font-bold mb-4" style={{ color: "var(--text)" }}>
            Privacy Policy
          </h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Last updated: {lastUpdated}
          </p>
        </div>

        <div className="space-y-10 text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: "var(--text)" }}>1. Who We Are</h2>
            <p>
              Flow Productions (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) is a creative studio based in Lisbon, Portugal, operating the CMS platform available at this domain. We provide brand strategy, web design, content management, and digital marketing services. Our registered contact address is available at{" "}
              <a href="https://flowproductions.pt" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)" }}>
                flowproductions.pt
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: "var(--text)" }}>2. What Data We Collect</h2>
            <p className="mb-3">We collect the following categories of personal data:</p>
            <ul className="space-y-2 list-none pl-0">
              {[
                { label: "Account data", desc: "Email address, display name, and encrypted password when you register." },
                { label: "Client data", desc: "Your website domain and business information you provide during onboarding." },
                { label: "Google OAuth tokens", desc: "If you connect your Google account, we store OAuth access and refresh tokens to read your Google Analytics and Search Console data on your behalf. We never post to your accounts." },
                { label: "Usage data", desc: "Pages visited, actions taken, and timestamps within the CMS, used to improve the service." },
                { label: "Content data", desc: "Blog posts, images, and SEO metadata you create or that are generated on your behalf." },
              ].map(({ label, desc }) => (
                <li key={label} className="flex gap-3">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "var(--accent)" }} />
                  <span><strong style={{ color: "var(--text)" }}>{label}:</strong> {desc}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: "var(--text)" }}>3. How We Use Your Data</h2>
            <p className="mb-3">We use your data to:</p>
            <ul className="space-y-2 list-none pl-0">
              {[
                "Provide and maintain the CMS platform and your account.",
                "Generate AI-powered blog content tailored to your website and audience.",
                "Fetch Google Analytics and Search Console data to improve content quality.",
                "Send essential service communications (account creation, password resets).",
                "Comply with legal obligations under EU and Portuguese law.",
              ].map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "var(--accent)" }} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3">
              We do <strong style={{ color: "var(--text)" }}>not</strong> sell your personal data to third parties, use it for advertising, or process it for any purpose beyond what is described above.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: "var(--text)" }}>4. Legal Basis (GDPR)</h2>
            <p>
              We process your data under the following legal bases as defined by the General Data Protection Regulation (GDPR):
            </p>
            <ul className="mt-3 space-y-2 list-none pl-0">
              {[
                { basis: "Contract", desc: "Processing necessary to provide the service you have signed up for." },
                { basis: "Legitimate interest", desc: "Improving and securing our platform." },
                { basis: "Consent", desc: "Google OAuth connection, which you can revoke at any time." },
              ].map(({ basis, desc }) => (
                <li key={basis} className="flex gap-3">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "var(--accent)" }} />
                  <span><strong style={{ color: "var(--text)" }}>{basis}:</strong> {desc}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: "var(--text)" }}>5. Data Storage & Security</h2>
            <p>
              Your data is stored on Supabase infrastructure (PostgreSQL), hosted in the European Union. Media files are stored in Supabase Storage. We use industry-standard encryption in transit (TLS) and at rest. Google OAuth tokens are stored encrypted and accessed only for authorised API calls.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: "var(--text)" }}>6. Third-Party Services</h2>
            <p className="mb-3">We use the following third-party processors:</p>
            <ul className="space-y-2 list-none pl-0">
              {[
                { name: "Supabase", purpose: "Database, authentication, and file storage." },
                { name: "Google LLC", purpose: "OAuth authentication and Analytics/Search Console API access." },
                { name: "Google Gemini / Imagen", purpose: "AI content and image generation using your post context." },
                { name: "Vercel Inc.", purpose: "Application hosting and edge delivery." },
              ].map(({ name, purpose }) => (
                <li key={name} className="flex gap-3">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "var(--accent)" }} />
                  <span><strong style={{ color: "var(--text)" }}>{name}:</strong> {purpose}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: "var(--text)" }}>7. Your Rights</h2>
            <p className="mb-3">Under GDPR, you have the right to:</p>
            <ul className="space-y-2 list-none pl-0">
              {[
                "Access the personal data we hold about you.",
                "Request correction of inaccurate data.",
                "Request deletion of your account and associated data.",
                "Withdraw consent for Google OAuth at any time via your Google Account settings.",
                "Lodge a complaint with the Portuguese data protection authority (CNPD) at cnpd.pt.",
              ].map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "var(--accent)" }} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3">
              To exercise any of these rights, contact us at{" "}
              <a href="mailto:privacy@flowproductions.pt" style={{ color: "var(--accent)" }}>
                privacy@flowproductions.pt
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: "var(--text)" }}>8. Data Retention</h2>
            <p>
              We retain your account data for as long as your account is active. If you request deletion, we will remove your personal data within 30 days, except where retention is required by law. Generated content you have published remains on your website under your own responsibility.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: "var(--text)" }}>9. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify active users of material changes via email. Continued use of the platform after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: "var(--text)" }}>10. Contact</h2>
            <p>
              For any privacy-related questions, contact us at{" "}
              <a href="mailto:privacy@flowproductions.pt" style={{ color: "var(--accent)" }}>
                privacy@flowproductions.pt
              </a>{" "}
              or visit{" "}
              <a href="https://flowproductions.pt" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)" }}>
                flowproductions.pt
              </a>.
            </p>
          </section>

        </div>

        {/* Footer links */}
        <div className="mt-16 pt-8 flex gap-6" style={{ borderTop: "1px solid var(--border)" }}>
          <Link href={`/${locale}/terms`} className="text-xs hover:opacity-70 transition-opacity" style={{ color: "var(--text-faint)" }}>
            Terms of Use
          </Link>
          <Link href={`/${locale}/login`} className="text-xs hover:opacity-70 transition-opacity" style={{ color: "var(--text-faint)" }}>
            Back to Login
          </Link>
        </div>

      </div>
    </div>
  );
}
