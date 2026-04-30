import './globals.css'
import Nav from '@/components/Nav'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>INFLUUR — Influencer Intelligence Platform</title>
        <meta name="description" content="Premium influencer discovery, analytics, and CRM for modern brands" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="noise">
        <Nav />
        <main style={{ minHeight: 'calc(100vh - 56px)' }}>
          {children}
        </main>
      </body>
    </html>
  )
}