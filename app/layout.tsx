import type { Metadata } from 'next'
import './globals.css'
import SiteNav from './components/SiteNav'

export const metadata: Metadata = {
  title: 'Belgium Environment Tracker',
  description: "Tracking Belgium's progress on climate & environment objectives",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700;900&family=Epilogue:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', margin: 0 }}>
        <SiteNav />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {children}
        </div>
        <footer
          style={{
            padding: '20px 24px',
            background: '#1a1a1a',
            color: '#d1d5db',
            textAlign: 'center',
            fontSize: '14px',
            fontFamily: 'Epilogue, sans-serif',
            lineHeight: 1.5,
            borderTop: '1px solid #2a2a2a',
          }}
        >
          Independent website / data sourced from official sources such as Eurostat, EEA, Our World In Data and others
        </footer>
      </body>
    </html>
  )
}
