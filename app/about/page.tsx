import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="shell-page">
      <div className="shell-header">
        <div className="flag-stripe black" />
        <div className="flag-stripe yellow" />
        <div className="flag-stripe red" />
        <div className="shell-header-inner">
          <p className="shell-eyebrow">About</p>
          <h1 className="shell-title">About this tracker</h1>
          <p className="shell-desc">Who is behind the Belgium Environment Tracker and why it was built.</p>
        </div>
      </div>
      <div className="shell-body">
        <h2>About the tracker</h2>
        <p>
          The Belgium Environment Tracker is an independent initiative monitoring Belgium&#39;s
          progress on a selected set of climate &amp; environment objectives — drawing on data
          from the EEA, Eurostat, VMM, ISSeP and other official sources.
        </p>
        <p style={{ marginTop: '12px' }}>
          More information about who is behind this project will be added here soon.
        </p>
        <Link href="/" className="shell-back-link" style={{ marginTop: '12px' }}>← Back to home</Link>
      </div>
      <footer>
        <p>Data sourced from EEA, Eurostat, VMM, ISSeP and other official sources. Last updated March 2026.</p>
      </footer>
    </div>
  );
}
