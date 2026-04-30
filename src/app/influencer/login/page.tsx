'use client'

import { useState } from 'react'

export default function InfluencerLoginPage() {
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'idle' | 'connecting' | 'permissions' | 'done'>('idle')

  const triggerRealOAuth = async () => {
    setLoading(true)
    setStep('connecting')
    await new Promise(r => setTimeout(r, 1200))
    setStep('permissions')
    await new Promise(r => setTimeout(r, 1500))
    setStep('done')

    // Send the user to your real backend route to trigger the Meta/Instagram Auth!
    window.location.href = '/api/auth/instagram'
  }

  const stepMessages: Record<string, string> = {
    connecting: 'Connecting to Instagram...',
    permissions: 'Requesting analytics permissions...',
    done: 'Authenticated! Redirecting...',
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div style={{ width: '100%', maxWidth: 440, animation: 'fadeUp 0.5s ease' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '2rem', fontWeight: 600, color: 'var(--amber)', marginBottom: 8 }}>INFLUUR</div>
          <div style={{ fontSize: 11, color: 'var(--text3)', letterSpacing: '0.2em' }}>CREATOR STUDIO</div>
        </div>

        {/* Card */}
        <div style={{ background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: 8, padding: '2.5rem', textAlign: 'center' }}>
          {/* Instagram icon */}
          <div style={{ width: 64, height: 64, borderRadius: 16, background: 'linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: 28 }}>
            📷
          </div>

          <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.6rem', fontWeight: 600, color: 'var(--text1)', marginBottom: 8 }}>Connect Instagram</h2>
          <p style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.7, marginBottom: 28, letterSpacing: '0.02em' }}>
            Link your Instagram account to unlock deep analytics, schedule posts, and receive brand partnership opportunities.
          </p>

          {/* Permissions list */}
          <div style={{ background: 'var(--surface3)', borderRadius: 6, padding: '1rem', marginBottom: 24, textAlign: 'left' }}>
            <div style={{ fontSize: 10, color: 'var(--text3)', letterSpacing: '0.16em', marginBottom: 10 }}>WE REQUEST ACCESS TO</div>
            {[
              ['📊', 'Insights & Analytics', 'Reach, impressions, profile views'],
              ['📅', 'Content Publishing', 'Schedule and publish posts'],
              ['👤', 'Basic Profile Info', 'Name, handle, follower count'],
            ].map(([icon, title, sub]) => (
              <div key={title} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 10 }}>
                <span style={{ fontSize: 14 }}>{icon}</span>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--text1)' }}>{title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 1 }}>{sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Step progress */}
          {loading && step !== 'idle' && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ height: 2, background: 'var(--surface3)', borderRadius: 2, overflow: 'hidden', marginBottom: 8 }}>
                <div style={{ height: '100%', background: 'var(--amber)', borderRadius: 2, transition: 'width 0.8s ease', width: step === 'connecting' ? '40%' : step === 'permissions' ? '75%' : '100%' }} />
              </div>
              <div style={{ fontSize: 11, color: 'var(--amber)', letterSpacing: '0.06em' }}>{stepMessages[step]}</div>
            </div>
          )}

          <button onClick={triggerRealOAuth} disabled={loading} className="btn-amber" style={{ width: '100%', padding: '14px', fontSize: 12, letterSpacing: '0.12em' }}>
            {loading ? '...' : 'CONNECT WITH INSTAGRAM'}
          </button>

          <p style={{ fontSize: 10, color: 'var(--text3)', marginTop: 16, lineHeight: 1.6 }}>
            We never post without your permission. Your data is encrypted and never sold. <a href="#" style={{ color: 'var(--amber)' }}>Privacy Policy</a>
          </p>
        </div>

        {/* Influencer benefits */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 16 }}>
          {[['Deep Analytics', 'Reach & impressions data'], ['Auto-Schedule', 'Post at peak times'], ['Brand Deals', 'Inbound opportunities']].map(([t, s]) => (
            <div key={t} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 6, padding: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: 'var(--amber)', marginBottom: 3 }}>{t}</div>
              <div style={{ fontSize: 10, color: 'var(--text3)', lineHeight: 1.4 }}>{s}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}