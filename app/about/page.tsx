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
      <div className="shell-body" style={{ textAlign: 'left' }}>

        <p style={{ fontSize: '0.95rem', lineHeight: 1.75, color: '#374151', marginBottom: 16 }}>
          The Belgium Environment Tracker is an independent, non-profit initiative built to help
          Belgian citizens understand the country&apos;s progress on climate and environmental
          objectives. The goal is simple: to increase climate literacy among the general public.
          Understanding what is happening to our climate and environment is the first and most
          important step towards taking the action our generation urgently needs. Climate and
          environmental degradation is the defining challenge of our time, and informed citizens
          are essential to meeting it.
        </p>

        <h2 style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: '#1a1a1a', margin: '28px 0 10px' }}>
          Who is behind it
        </h2>
        <p style={{ fontSize: '0.95rem', lineHeight: 1.75, color: '#374151', marginBottom: 14 }}>
          My name is Tjok Meuwissen. I studied environmental engineering at KU Leuven and have
          been working since 2020 as an LCA (Life Cycle Assessment) expert, performing assessments
          across a wide range of topics as well as societal cost-benefit analyses.
        </p>
        <p style={{ fontSize: '0.95rem', lineHeight: 1.75, color: '#374151', marginBottom: 14 }}>
          Beyond my professional work, I have always been drawn to the natural world. I regularly
          lead guided walks for friends and family in the Sonian Forest, I am a certified divemaster
          with a deep love for the ocean, and I am happiest when surrounded by nature rather than
          anywhere else.
        </p>
        <p style={{ fontSize: '0.95rem', lineHeight: 1.75, color: '#374151', marginBottom: 28 }}>
          This website is entirely personal, non-commercial and independent. It reflects no
          institutional position and has no commercial interests.
        </p>

        <h2 style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: '#1a1a1a', margin: '0 0 10px' }}>
          Get in touch
        </h2>
        <p style={{ fontSize: '0.95rem', lineHeight: 1.75, color: '#374151', marginBottom: 28 }}>
          If you have questions, suggestions or want to connect, you can find me on{' '}
          <a
            href="https://www.linkedin.com/in/tjok-meuwissen-b468681b4/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#0a66c2', fontWeight: 600, textDecoration: 'none' }}
          >
            LinkedIn &#x2197;
          </a>
          .
        </p>

        <Link href="/" className="shell-back-link">&#x2190; Back to home</Link>
      </div>
      <footer>
        <p>Data sourced from EEA, Eurostat, VMM, ISSeP and other official sources. Last updated April 2026.</p>
      </footer>
    </div>
  );
}
