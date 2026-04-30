import Link from 'next/link'

export default function Home() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', textAlign: 'center', padding: '2rem', animation: 'fadeIn 0.8s ease' }}>
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>
      
      <div style={{ fontSize: 11, color: 'var(--amber)', letterSpacing: '0.2em', marginBottom: 20 }}>
        WELCOME TO INFLUUR
      </div>
      
      <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '4.5rem', fontWeight: 600, color: 'var(--text1)', marginBottom: 24, maxWidth: 900, lineHeight: 1.1 }}>
        The Elite Omni-Channel <br/>
        <span style={{ fontStyle: 'italic', color: 'var(--amber)' }}>Influencer CRM</span>
      </h1>
      
      <p style={{ color: 'var(--text3)', fontSize: 16, maxWidth: 550, marginBottom: 48, lineHeight: 1.6 }}>
        Stop guessing. Start scaling. Discover verified creators, access live Meta Graph data, and automate your outreach campaigns in one dark-tech platform.
      </p>
      
      <div style={{ display: 'flex', gap: 16 }}>
        <Link href="/discover" className="btn-amber" style={{ padding: '16px 36px', fontSize: 12, textDecoration: 'none', borderRadius: 4, letterSpacing: '0.1em' }}>
          ENTER PLATFORM
        </Link>
        <Link href="/influencer/login" style={{ padding: '16px 36px', fontSize: 12, textDecoration: 'none', borderRadius: 4, letterSpacing: '0.1em', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text2)' }}>
          CREATOR LOGIN
        </Link>
      </div>
    </div>
  )
}