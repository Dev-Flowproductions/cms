import { Link } from "@/lib/navigation";

export const metadata = {
  title: "Terms of Use | CMS WitFlow",
  description: "Terms and conditions for the CMS WitFlow editorial platform.",
};

export default async function TermsOfUsePage() {
  const lastUpdated = "March 4, 2026";

  return (
    <div
      className="min-h-screen py-16 px-4"
      style={{ background: "var(--bg)", color: "var(--text)" }}
    >
      <div className="max-w-3xl mx-auto">

        {/* Back */}
        <Link
          href="/login"
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
            Terms of Use
          </h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Last updated: {lastUpdated}
          </p>
        </div>

        <div className="space-y-10 text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: "var(--text)" }}>1. Agreement to terms</h2>
            <p>
              By accessing or using the Witflow CMS platform (&ldquo;Platform&rdquo;), you agree to be bound by these Terms of Use (&ldquo;Terms&rdquo;). If you do not agree, you must not use the Platform. These Terms apply to all users, including administrators and client accounts.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: "var(--text)" }}>2. The service</h2>
            <p className="mb-3">
              Witflow provides a content management system that enables:
            </p>
            <ul className="space-y-2 list-none pl-0">
              {[
                "Automated AI-powered blog post generation tailored to your website and audience.",
                "Management and publication of content to your website.",
                "Integration with Google Analytics and Google Search Console for content optimisation.",
                "Cover image generation using AI (Google Imagen).",
              ].map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "var(--accent)" }} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3">
              Access to the Platform is granted solely by Witflow. Accounts are created by Witflow administrators on behalf of clients. Self-registration is not available.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: "var(--text)" }}>3. Account responsibilities</h2>
            <p className="mb-3">You are responsible for:</p>
            <ul className="space-y-2 list-none pl-0">
              {[
                "Keeping your login credentials confidential and secure.",
                "All activity that occurs under your account.",
                "Notifying Witflow immediately of any unauthorised access.",
                "Ensuring the domain and website information you provide is accurate and belongs to you.",
              ].map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "var(--accent)" }} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: "var(--text)" }}>4. AI-generated content</h2>
            <p className="mb-3">
              The Platform uses Google&apos;s Gemini AI to generate blog posts and cover images. You acknowledge that:
            </p>
            <ul className="space-y-2 list-none pl-0">
              {[
                "AI-generated content may contain inaccuracies and should be reviewed before publication.",
                "Witflow does not guarantee the factual accuracy of AI-generated content.",
                "You are solely responsible for content published to your website.",
                "You must not use the Platform to generate content that is illegal, defamatory, or infringes third-party rights.",
                "AI-generated images are subject to Google's Imagen usage policies.",
              ].map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "var(--accent)" }} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: "var(--text)" }}>5. Google account connection</h2>
            <p>
              When you connect your Google account during onboarding, you authorise Witflow to access your Google Analytics and Google Search Console data in read-only mode. This access is used exclusively to improve the quality and relevance of content generated for your website. We will never modify, delete, or post to your Google accounts. You may revoke this access at any time via your{" "}
              <a
                href="https://myaccount.google.com/permissions"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--accent)" }}
              >
                Google Account permissions
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: "var(--text)" }}>6. Intellectual property</h2>
            <p className="mb-3">
              All content generated through the Platform on your behalf — including blog posts and cover images — is provided to you for use on your website. Witflow retains no ownership over your published content.
            </p>
            <p>
              The Platform itself, including its design, code, and branding, is the exclusive intellectual property of Witflow and may not be copied, reverse-engineered, or redistributed without written permission.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: "var(--text)" }}>7. Acceptable use</h2>
            <p className="mb-3">You agree not to:</p>
            <ul className="space-y-2 list-none pl-0">
              {[
                "Use the Platform for any unlawful purpose or in violation of any applicable regulation.",
                "Attempt to gain unauthorised access to any part of the Platform or other users' accounts.",
                "Use the Platform to generate spam, misinformation, or harmful content.",
                "Overload, disrupt, or interfere with the Platform's infrastructure.",
                "Share your account credentials with third parties.",
              ].map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "var(--accent)" }} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: "var(--text)" }}>8. Availability & modifications</h2>
            <p>
              Witflow will endeavour to maintain Platform availability but does not guarantee uninterrupted access. We reserve the right to modify, suspend, or discontinue any part of the Platform at any time, with or without notice. We will make reasonable efforts to notify active users of significant changes.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: "var(--text)" }}>9. Limitation of liability</h2>
            <p>
              To the maximum extent permitted by applicable law, Witflow shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Platform, including but not limited to loss of revenue, data, or business opportunities resulting from AI-generated content. Our total liability shall not exceed the amount paid by you for the service in the three months preceding the claim.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: "var(--text)" }}>10. Termination</h2>
            <p>
              Witflow may suspend or terminate your account at any time if you breach these Terms or if the service relationship between Witflow and your business ends. Upon termination, your access to the Platform will be revoked. Content already published to your website remains yours.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: "var(--text)" }}>11. Governing Law</h2>
            <p>
              These Terms are governed by the laws of Portugal. Any disputes arising from these Terms shall be subject to the exclusive jurisdiction of the courts of Lisbon, Portugal, unless otherwise required by applicable consumer protection law.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: "var(--text)" }}>12. Contact</h2>
            <p>
              For questions about these Terms, contact us at{" "}
              <a href="mailto:legal@witflow.co" style={{ color: "var(--accent)" }}>
                legal@witflow.co
              </a>{" "}
              or visit{" "}
              <a href="https://witflow.co" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)" }}>
                witflow.co
              </a>.
            </p>
          </section>

        </div>

        {/* Footer links */}
        <div className="mt-16 pt-8 flex gap-6" style={{ borderTop: "1px solid var(--border)" }}>
          <Link href="/privacy" className="text-xs hover:opacity-70 transition-opacity" style={{ color: "var(--text-faint)" }}>
            Privacy policy
          </Link>
          <Link href="/login" className="text-xs hover:opacity-70 transition-opacity" style={{ color: "var(--text-faint)" }}>
            Back to login
          </Link>
        </div>

      </div>
    </div>
  );
}
