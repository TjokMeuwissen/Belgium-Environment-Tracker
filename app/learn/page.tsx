import Link from 'next/link';

export default function LearnPage() {
  return (
    <div className="shell-page">
      <div className="shell-header">
        <div className="flag-stripe black" />
        <div className="flag-stripe yellow" />
        <div className="flag-stripe red" />
        <div className="shell-header-inner">
          <p className="shell-eyebrow">Learn</p>
          <h1 className="shell-title">Environmental topics</h1>
          <p className="shell-desc">Deep dives into the environmental challenges Belgium faces, organised by topic.</p>
        </div>
      </div>
      <div className="shell-body">
        <span className="shell-coming-badge">Coming soon</span>
        <h2>Topic deep-dives in progress</h2>
        <p>
          This section will present Belgium&#39;s environmental landscape through topic tiles —
          covering areas like climate change, carbon footprints, water quality, biodiversity
          and more, each with dedicated information pages.
        </p>
        <Link href="/" className="shell-back-link">← Back to home</Link>
      </div>
      <footer>
        <p>Data sourced from EEA, Eurostat, VMM, ISSeP and other official sources. Last updated March 2026.</p>
      </footer>
    </div>
  );
}
