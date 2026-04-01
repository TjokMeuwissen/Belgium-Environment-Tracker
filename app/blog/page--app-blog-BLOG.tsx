import Link from 'next/link';

export default function BlogPage() {
  return (
    <div className="shell-page">
      <div className="shell-header">
        <div className="flag-stripe black" />
        <div className="flag-stripe yellow" />
        <div className="flag-stripe red" />
        <div className="shell-header-inner">
          <p className="shell-eyebrow">Blog</p>
          <h1 className="shell-title">Analysis &amp; updates</h1>
          <p className="shell-desc">Commentary on Belgium&#39;s environmental policies and progress.</p>
        </div>
      </div>
      <div className="shell-body">
        <span className="shell-coming-badge">Coming soon</span>
        <h2>Blog posts coming soon</h2>
        <p>
          This section will feature analysis and commentary on Belgium&#39;s environmental policies,
          new data releases, and progress towards key climate &amp; nature objectives.
        </p>
        <Link href="/" className="shell-back-link">← Back to home</Link>
      </div>
      <footer>
        <p>Data sourced from EEA, Eurostat, VMM, ISSeP and other official sources. Last updated March 2026.</p>
      </footer>
    </div>
  );
}
