'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

const NAV_LINKS = [
  { href: '/indicators', label: 'Indicators' },
  { href: '/learn',      label: 'Learn'       },
  { href: '/blog',       label: 'Blog'        },
  { href: '/about',      label: 'About'       },
];

export default function SiteNav() {
  const pathname = usePathname();

  // Scroll to top on every page navigation
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  return (
    <nav className="site-nav" aria-label="Site navigation">
      <div className="site-nav-inner">
        <Link href="/" className="site-nav-logo">
          <span className="site-nav-brand">Home</span>
        </Link>
        <div className="site-nav-links">
          {NAV_LINKS.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className={`site-nav-link${pathname?.startsWith(l.href) ? ' active' : ''}`}
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
