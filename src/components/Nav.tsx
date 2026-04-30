'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

export default function Nav() {
  const path = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const links = [
    { href: '/discover', label: 'DISCOVER' },
    { href: '/marketer/dashboard', label: 'CRM' },
    { href: '/influencer/dashboard', label: 'MY STUDIO' },
  ]

  return (
    <nav style={{ borderBottom: '1px solid var(--border)', background: 'rgba(9,9,14,0.95)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 100 }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.4rem', fontWeight: 600, color: 'var(--amber)', letterSpacing: '-0.01em' }}>
            INFLUUR
          </span>
          <span style={{ fontSize: 9, color: 'var(--text3)', letterSpacing: '0.2em', marginLeft: 6, verticalAlign: 'middle' }}>AI</span>
        </Link>

        <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
          {links.map(l => (
            <Link key={l.href} href={l.href} style={{
              textDecoration: 'none',
              fontSize: 11,
              letterSpacing: '0.16em',
              color: path === l.href ? 'var(--amber)' : 'var(--text2)',
              transition: 'color 0.15s',
              borderBottom: path === l.href ? '1px solid var(--amber)' : '1px solid transparent',
              paddingBottom: 2,
            }}>
              {l.label}
            </Link>
          ))}
          <Link href="/influencer/login" style={{
            textDecoration: 'none', fontSize: 11, letterSpacing: '0.1em',
            background: 'var(--amber)', color: 'var(--ink)', padding: '7px 16px', borderRadius: 3, fontWeight: 500,
          }}>
            CONNECT IG
          </Link>
        </div>
      </div>
    </nav>
  )
}