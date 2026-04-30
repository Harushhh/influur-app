'use client'

import { useState, useEffect } from 'react'

// ── Loading Spinner ───────────────────────────────────────────────────────────
export function Spinner({ size = 16, color = 'var(--amber)' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 0.8s linear infinite' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" strokeOpacity="0.2" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

// ── Toast Notification ────────────────────────────────────────────────────────
export function Toast({ message, type = 'success', onClose }: { message: string; type?: 'success' | 'error' | 'info'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t) }, [onClose])
  const colors = { success: 'var(--green)', error: 'var(--red)', info: 'var(--amber)' }
  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, background: 'var(--surface2)', border: `1px solid ${colors[type]}`, borderRadius: 6, padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 10, animation: 'slideIn 0.3s ease', boxShadow: '0 8px 32px rgba(0,0,0,0.4)', maxWidth: 360 }}>
      <style>{`@keyframes slideIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div style={{ width: 6, height: 6, borderRadius: '50%', background: colors[type], flexShrink: 0 }} />
      <span style={{ fontSize: 13, color: 'var(--text1)', flex: 1 }}>{message}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 14, padding: 0 }}>✕</button>
    </div>
  )
}

// ── Engagement Rate Bar ───────────────────────────────────────────────────────
export function EngagementBar({ rate, max = 10 }: { rate: number; max?: number }) {
  const pct = Math.min((rate / max) * 100, 100)
  const color = rate >= 5 ? 'var(--green)' : rate >= 2.5 ? 'var(--amber)' : 'var(--red)'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 4, background: 'var(--surface3)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 2, transition: 'width 0.8s cubic-bezier(0.16,1,0.3,1)' }} />
      </div>
      <span style={{ fontSize: 11, color, fontWeight: 500, minWidth: 36, textAlign: 'right' }}>{rate}%</span>
    </div>
  )
}

// ── Avatar Initial ────────────────────────────────────────────────────────────
export function Avatar({ handle, size = 40 }: { handle: string; size?: number }) {
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: 'var(--amber-dim2)', border: '1.5px solid rgba(212,168,71,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Cormorant Garamond',serif", fontSize: size * 0.35, color: 'var(--amber)', flexShrink: 0, lineHeight: 1 }}>
      {handle.slice(0, 2).toUpperCase()}
    </div>
  )
}

// ── Section Divider ───────────────────────────────────────────────────────────
export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 10, letterSpacing: '0.2em', color: 'var(--text3)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1rem' }}>
      {children}
      <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
    </div>
  )
}

// ── Empty State ───────────────────────────────────────────────────────────────
export function EmptyState({ title, subtitle, cta, onCta }: { title: string; subtitle: string; cta?: string; onCta?: () => void }) {
  return (
    <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
      <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.4rem', color: 'var(--text2)', marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 20, lineHeight: 1.6 }}>{subtitle}</div>
      {cta && onCta && <button onClick={onCta} className="btn-amber" style={{ padding: '10px 24px', fontSize: 11 }}>{cta}</button>}
    </div>
  )
}

// ── Metric Pill ───────────────────────────────────────────────────────────────
export function MetricPill({ label, value, positive }: { label: string; value: string; positive?: boolean }) {
  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', background: 'var(--surface3)', borderRadius: 4, padding: '8px 14px', border: '1px solid var(--border)' }}>
      <span style={{ fontSize: 9, color: 'var(--text3)', letterSpacing: '0.14em', marginBottom: 2 }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 500, color: positive === undefined ? 'var(--text1)' : positive ? 'var(--green)' : 'var(--red)' }}>{value}</span>
    </div>
  )
}

// ── AI Badge ──────────────────────────────────────────────────────────────────
export function AIBadge() {
  return (
    <span style={{ fontSize: 9, padding: '3px 7px', background: 'var(--amber-dim)', border: '1px solid rgba(212,168,71,0.2)', borderRadius: 3, color: 'var(--amber)', letterSpacing: '0.12em', fontWeight: 500 }}>
      ✦ AI
    </span>
  )
}

// ── Use Toast Hook ────────────────────────────────────────────────────────────
export function useToast() {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
  const show = (message: string, type: 'success' | 'error' | 'info' = 'success') => setToast({ message, type })
  const clear = () => setToast(null)
  return { toast, show, clear }
}
