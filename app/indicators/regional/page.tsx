import Link from 'next/link';

export default function RegionalIndicatorsPage() {
  return (
    <div className="shell-page">
      <div className="shell-header">
        <div className="flag-stripe black" />
        <div className="flag-stripe yellow" />
        <div className="flag-stripe red" />
        <div className="shell-header-inner">
          <p className="shell-eyebrow">Indicators</p>
          <h1 className="shell-title">Regional data</h1>
          <p className="shell-desc">Key environmental indicators broken down by Flanders, Wallonia and Brussels.</p>
        </div>
      </div>
      <div className="shell-body">
        <span className="shell-coming-badge">Coming soon</span>
        <h2>Regional breakdown in progress</h2>
        <p>
          This page will show how Flanders, Wallonia and Brussels each perform on a set of
          key environmental indicators — where region-level data is officially available.
        </p>
        <Link href="/indicators" className="shell-back-link">← Back to national indicators</Link>
      </div>
      <footer>
        <p>Data sourced from EEA, Eurostat, VMM, ISSeP and other official sources. Last updated March 2026.</p>
      </footer>
    </div>
  );
}
