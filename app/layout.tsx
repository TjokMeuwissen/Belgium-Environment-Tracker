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
      <body>
        <SiteNav />
        {children}
      </body>
    </html>
  )
}
