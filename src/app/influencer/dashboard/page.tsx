'use client'

import { useState, useEffect } from 'react'
import type { InfluencerDashboardData, ScheduledPostItem } from '@/lib/types'

type Tab = 'overview' | 'schedule' | 'ai' | 'competitors'

type LiveDataExt = InfluencerDashboardData & { 
  isConnected?: boolean; 
  isLive?: boolean; 
  username?: string; 
  followerCount?: number;
  totalPosts?: number;
  recentReels?: number;
  recentPhotos?: number;
  engagementRate?: string;
  totalRecentLikes?: number;
  reachGrowth?: number;
  impressionsGrowth?: number;
  profileViewsGrowth?: number;
  websiteClicksGrowth?: number;
}

function StatCard({ label, value, delta, positive }: { label: string; value: string; delta: string; positive: boolean }) {
  return (
    <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 6, padding: '1rem 1.2rem' }}>
      <div style={{ fontSize: 10, color: 'var(--text3)', letterSpacing: '0.14em', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: '1.5rem', color: 'var(--text1)', fontWeight: 500 }}>{value}</div>
      <div style={{ fontSize: 11, color: positive ? 'var(--green)' : 'var(--red)', marginTop: 4 }}>{delta}</div>
    </div>
  )
}

function PostCard({ post, onDelete }: { post: ScheduledPostItem; onDelete: (id: string) => void }) {
  const statusColors: Record<string, string> = { SCHEDULED: 'var(--amber)', DRAFT: 'var(--text2)', PUBLISHED: 'var(--green)', FAILED: 'var(--red)' }
  return (
    <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 6, padding: '1rem 1.2rem', marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: statusColors[post.status] }} />
          <span style={{ fontSize: 10, color: statusColors[post.status], letterSpacing: '0.1em' }}>{post.status}</span>
          {post.aiGenerated && <span className="badge badge-amber" style={{ fontSize: 9 }}>✦ AI</span>}
        </div>
        <button onClick={() => onDelete(post.id)} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 12 }}>✕</button>
      </div>
      <p style={{ fontSize: 13, color: 'var(--text1)', lineHeight: 1.5, marginBottom: 8 }}>{post.caption}</p>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
        {post.hashtags.map(h => <span key={h} style={{ fontSize: 10, color: 'var(--blue)' }}>{h}</span>)}
      </div>
      <div style={{ fontSize: 11, color: 'var(--text3)' }}>📅 {new Date(post.scheduledAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</div>
    </div>
  )
}

function ComposePost({ onSchedule }: { onSchedule: (post: Omit<ScheduledPostItem, 'id' | 'status'>) => void }) {
  const [caption, setCaption] = useState('')
  const [hashtags, setHashtags] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiSuggestions, setAiSuggestions] = useState<{ style: string; caption: string; hashtags: string[] }[]>([])

  const getAISuggestions = async () => {
    setAiLoading(true)
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'suggest_caption', context: { currentCaption: caption, platform: 'instagram' }, prompt: 'Generate caption variations.' }),
      })
      const data = await res.json()
      setAiSuggestions(data.result?.captions || [])
    } finally { setAiLoading(false) }
  }

  const handleSchedule = async () => {
    if (!caption || !scheduledAt) return
    setLoading(true)
    try {
      const res = await fetch('/api/posts/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caption, hashtags: hashtags.split(' ').filter(Boolean),
          mediaUrls: ['https://picsum.photos/seed/new/600/600'],
          scheduledAt, aiGenerated: false,
        }),
      })
      const data = await res.json()
      if (data.success) {
        onSchedule({ caption, hashtags: hashtags.split(' ').filter(Boolean), mediaUrls: ['https://picsum.photos/seed/new/600/600'], scheduledAt, platform: 'instagram', aiGenerated: false })
        setCaption(''); setHashtags(''); setScheduledAt('')
      }
    } finally { setLoading(false) }
  }

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <label style={{ fontSize: 10, color: 'var(--text3)', letterSpacing: '0.14em', display: 'block', marginBottom: 6 }}>CAPTION</label>
        <div style={{ position: 'relative' }}>
          <textarea value={caption} onChange={e => setCaption(e.target.value)}
            placeholder="Write your caption..." rows={4}
            style={{ width: '100%', background: 'var(--surface3)', border: '1px solid var(--border2)', borderRadius: 4, padding: '12px 14px', fontFamily: "'DM Mono',monospace", fontSize: 13, color: 'var(--text1)', resize: 'vertical', outline: 'none' }} />
          <button onClick={getAISuggestions} disabled={aiLoading}
            style={{ position: 'absolute', top: 8, right: 8, fontSize: 10, padding: '4px 10px', background: 'var(--amber-dim)', border: '1px solid rgba(212,168,71,0.2)', borderRadius: 3, color: 'var(--amber)', cursor: 'pointer' }}>
            {aiLoading ? '...' : '✦ AI'}
          </button>
        </div>
      </div>

      {aiSuggestions.length > 0 && (
        <div style={{ background: 'var(--amber-dim)', border: '1px solid rgba(212,168,71,0.15)', borderRadius: 6, padding: '1rem', marginBottom: 16 }}>
          <div style={{ fontSize: 10, color: 'var(--amber)', letterSpacing: '0.14em', marginBottom: 10 }}>✦ AI CAPTION SUGGESTIONS</div>
          {aiSuggestions.map((s, i) => (
            <div key={i} onClick={() => { setCaption(s.caption); setHashtags(s.hashtags.join(' ')) }}
              style={{ padding: '10px', background: 'var(--surface2)', borderRadius: 4, marginBottom: 8, cursor: 'pointer', border: '1px solid var(--border)', transition: 'border-color 0.15s' }}>
              <div style={{ fontSize: 10, color: 'var(--amber)', marginBottom: 4 }}>{s.style}</div>
              <div style={{ fontSize: 12, color: 'var(--text1)', lineHeight: 1.5 }}>{s.caption}</div>
              <div style={{ fontSize: 10, color: 'var(--blue)', marginTop: 4 }}>{s.hashtags?.join(' ')}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        <div>
          <label style={{ fontSize: 10, color: 'var(--text3)', letterSpacing: '0.14em', display: 'block', marginBottom: 6 }}>HASHTAGS</label>
          <input value={hashtags} onChange={e => setHashtags(e.target.value)} placeholder="#hashtag1 #hashtag2" className="input-premium" style={{ padding: '10px 12px', fontSize: 13 }} />
        </div>
        <div>
          <label style={{ fontSize: 10, color: 'var(--text3)', letterSpacing: '0.14em', display: 'block', marginBottom: 6 }}>SCHEDULE TIME</label>
          <input type="datetime-local" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)} className="input-premium" style={{ padding: '10px 12px', fontSize: 13 }} />
        </div>
      </div>

      <button onClick={handleSchedule} disabled={loading || !caption || !scheduledAt} className="btn-amber" style={{ width: '100%', padding: '13px' }}>
        {loading ? 'SCHEDULING...' : 'SCHEDULE POST'}
      </button>
    </div>
  )
}

export default function InfluencerDashboardPage() {
  const [tab, setTab] = useState<Tab>('overview')
  const [data, setData] = useState<LiveDataExt | null>(null)
  const [loading, setLoading] = useState(true)
  
  // AI Chat State
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([{ role: 'assistant', content: 'Hi! I\'m your INFLUUR AI assistant. I can help you optimize content, analyze your performance, and craft better captions. What would you like to work on today?' }])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)

  // Competitor Spy State
  const [competitorInput, setCompetitorInput] = useState('')
  const [competitorData, setCompetitorData] = useState<any>(null)
  const [competitorLoading, setCompetitorLoading] = useState(false)
  const [competitorError, setCompetitorError] = useState('')

  useEffect(() => {
    fetch('/api/auth/instagram?dashboard=1')
      .then(r => r.json())
      .then(d => { setData(d.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const sendChat = async () => {
    if (!chatInput.trim() || chatLoading) return
    const userMsg = { role: 'user' as const, content: chatInput }
    setChatMessages(m => [...m, userMsg])
    setChatInput('')
    setChatLoading(true)
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'chat', messages: [...chatMessages, userMsg], context: { dashboard: data } }),
      })
      const d = await res.json()
      setChatMessages(m => [...m, { role: 'assistant', content: d.result?.message || 'Let me think about that...' }])
    } finally { setChatLoading(false) }
  }

  const analyzeCompetitor = async () => {
    if (!competitorInput.trim() || competitorLoading) return
    setCompetitorLoading(true)
    setCompetitorError('')
    setCompetitorData(null)

    try {
      const res = await fetch(`/api/analytics/competitor?username=${competitorInput}`)
      const json = await res.json()

      if (json.success) {
        setCompetitorData(json.data)
      } else {
        setCompetitorError(json.error || 'Failed to analyze competitor.')
      }
    } catch (err) {
      setCompetitorError('Network error. Please try again.')
    } finally {
      setCompetitorLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    await fetch(`/api/posts/schedule?id=${id}`, { method: 'DELETE' })
    setData(prev => prev ? { ...prev, scheduledPosts: prev.scheduledPosts.filter(p => p.id !== id) } : prev)
  }

  const handleSchedule = (post: Omit<ScheduledPostItem, 'id' | 'status'>) => {
    setData(prev => prev ? { ...prev, scheduledPosts: [{ ...post, id: `sp_${Date.now()}`, status: 'SCHEDULED' }, ...prev.scheduledPosts] } : prev)
  }

  const fmt = (n?: number) => !n ? '0' : n >= 1000000 ? `${(n / 1000000).toFixed(1)}M` : n >= 1000 ? `${(n / 1000).toFixed(1)}K` : `${n}`
  const fmtDelta = (n?: number) => n ? (n > 0 ? `↑ +${n}%` : `↓ ${n}%`) : "0%"

  const tabs: { id: Tab; label: string }[] = [{ id: 'overview', label: 'OVERVIEW' }, { id: 'schedule', label: 'AUTO-POST' }, { id: 'ai', label: '✦ AI STUDIO' }, { id: 'competitors', label: 'COMPETITORS' }]

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2.5rem 1.5rem' }}>
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 10, color: 'var(--amber)', letterSpacing: '0.2em', marginBottom: 6 }}>INFLUENCER STUDIO</div>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '2rem', fontWeight: 600, color: 'var(--text1)' }}>My Dashboard</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: data?.isConnected ? 'var(--green)' : 'var(--amber)', animation: 'pulse 2s infinite' }} />
          <span style={{ fontSize: 11, color: data?.isConnected ? 'var(--green)' : 'var(--amber)' }}>
            {data?.isLive ? `Live Data: @${data.username}` : data?.isConnected ? 'Instagram Connected' : 'Waiting for Live Connection...'}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 28, borderBottom: '1px solid var(--border)', paddingBottom: 0 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ fontSize: 11, letterSpacing: '0.14em', padding: '10px 18px', background: 'none', border: 'none', cursor: 'pointer', color: tab === t.id ? 'var(--amber)' : 'var(--text3)', borderBottom: `2px solid ${tab === t.id ? 'var(--amber)' : 'transparent'}`, transition: 'color 0.15s,border-color 0.15s', marginBottom: -1 }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {tab === 'overview' && (
        <div style={{ animation: 'fadeIn 0.4s ease' }}>
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
              {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 88 }} />)}
            </div>
          ) : data ? (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 24 }}>
                <StatCard 
                  label={data.isLive ? "LIVE FOLLOWERS" : "REACH (7D)"} 
                  value={data.isLive ? fmt(data.followerCount || 0) : fmt(data.reach || 0)} 
                  delta={data.isLive ? "Live Sync" : fmtDelta(data.reachGrowth)} 
                  positive={true} 
                />
                <StatCard 
                  label={data.isLive ? "TOTAL POSTS" : "IMPRESSIONS (7D)"} 
                  value={data.isLive ? fmt(data.totalPosts || 0) : fmt(data.impressions || 0)} 
                  delta={data.isLive ? `${fmt(data.recentPhotos || 0)} Photos` : fmtDelta(data.impressionsGrowth)} 
                  positive={true} 
                />
                <StatCard 
                  label={data.isLive ? "RECENT REELS" : "PROFILE VIEWS"} 
                  value={data.isLive ? fmt(data.recentReels || 0) : fmt(data.profileViews || 0)} 
                  delta={data.isLive ? "Last 20 Posts" : fmtDelta(data.profileViewsGrowth)} 
                  positive={true} 
                />
                <StatCard 
                  label={data.isLive ? "ENGAGEMENT RATE" : "WEBSITE CLICKS"} 
                  value={data.isLive ? `${data.engagementRate || '0.00'}%` : fmt(data.websiteClicks || 0)} 
                  delta={data.isLive ? `${fmt(data.totalRecentLikes || 0)} Recent Likes` : fmtDelta(data.websiteClicksGrowth)} 
                  positive={true} 
                />
              </div>

              {/* Reach chart */}
              <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 6, padding: '1.2rem', marginBottom: 20 }}>
                <div style={{ fontSize: 10, color: 'var(--text3)', letterSpacing: '0.14em', marginBottom: 12 }}>DAILY REACH & IMPRESSIONS</div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 100 }}>
                  {data.recentInsights?.map((d, i) => {
                    const maxImp = Math.max(...data.recentInsights.map(r => r.impressions || 0), 1)
                    return (
                      <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                        <div style={{ width: '100%', borderRadius: '2px 2px 0 0', background: 'var(--blue)', opacity: 0.5, height: `${((d.impressions || 0) / maxImp) * 70}px` }} />
                        <div style={{ width: '100%', borderRadius: '2px 2px 0 0', background: 'var(--amber)', height: `${((d.reach || 0) / maxImp) * 70}px`, marginTop: 2 }} />
                        <span style={{ fontSize: 9, color: 'var(--text3)' }}>{d.date}</span>
                      </div>
                    )
                  })}
                </div>
                <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--amber)' }} /><span style={{ fontSize: 10, color: 'var(--text2)' }}>Reach</span></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--blue)', opacity: 0.5 }} /><span style={{ fontSize: 10, color: 'var(--text2)' }}>Impressions</span></div>
                </div>
              </div>

              {/* Upcoming posts */}
              <div className="section-label" style={{ marginBottom: 12 }}>Upcoming Posts</div>
              {data.scheduledPosts?.slice(0, 2).map(p => <PostCard key={p.id} post={p} onDelete={handleDelete} />)}
            </>
          ) : null}
        </div>
      )}

      {/* Schedule Tab */}
      {tab === 'schedule' && (
        <div style={{ animation: 'fadeIn 0.4s ease' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div>
              <div className="section-label" style={{ marginBottom: 16 }}>Compose New Post</div>
              <ComposePost onSchedule={handleSchedule} />
            </div>
            <div>
              <div className="section-label" style={{ marginBottom: 16 }}>Queue</div>
              {data?.scheduledPosts?.length ? data.scheduledPosts.map(p => <PostCard key={p.id} post={p} onDelete={handleDelete} />) : (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text3)', fontSize: 13 }}>No posts scheduled yet.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* AI Studio Tab */}
      {tab === 'ai' && (
        <div style={{ animation: 'fadeIn 0.4s ease' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
            <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, display: 'flex', flexDirection: 'column', height: 520 }}>
              <div style={{ padding: '1rem 1.2rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: 'var(--amber)', fontSize: 16 }}>✦</span>
                <span style={{ fontSize: 11, letterSpacing: '0.14em', color: 'var(--text1)' }}>INFLUUR AI STUDIO</span>
                <span style={{ fontSize: 10, color: 'var(--text3)', marginLeft: 'auto' }}>Powered by AI</span>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
                {chatMessages.map((m, i) => (
                  <div key={i} style={{ marginBottom: 14, display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                    <div style={{ maxWidth: '80%', background: m.role === 'user' ? 'var(--amber-dim2)' : 'var(--surface3)', border: `1px solid ${m.role === 'user' ? 'rgba(212,168,71,0.2)' : 'var(--border)'}`, borderRadius: 6, padding: '10px 14px', fontSize: 13, color: 'var(--text1)', lineHeight: 1.6 }}>
                      {m.role === 'assistant' && <div style={{ fontSize: 9, color: 'var(--amber)', letterSpacing: '0.14em', marginBottom: 4 }}>✦ INFLUUR AI</div>}
                      {m.content}
                    </div>
                  </div>
                ))}
                {chatLoading && <div style={{ fontSize: 12, color: 'var(--text3)', padding: '8px' }}>AI is thinking...</div>}
              </div>
              <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
                <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendChat()}
                  placeholder="Ask AI anything about your content strategy..." className="input-premium" style={{ flex: 1, padding: '10px 12px', fontSize: 12 }} />
                <button onClick={sendChat} disabled={chatLoading || !chatInput.trim()} className="btn-amber" style={{ padding: '10px 16px', fontSize: 11 }}>SEND</button>
              </div>
            </div>
            <div>
              <div className="section-label" style={{ marginBottom: 14 }}>Quick Actions</div>
              {['Write me a viral Reel caption for a skincare routine', 'What are the best hashtags for lifestyle content in India?', 'Analyse my posting schedule and suggest improvements', 'Write a compelling bio for my profile'].map(p => (
                <button key={p} onClick={() => { setChatInput(p); }}
                  style={{ width: '100%', textAlign: 'left', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 4, padding: '10px 12px', fontSize: 12, color: 'var(--text2)', cursor: 'pointer', marginBottom: 8, lineHeight: 1.4, transition: 'color 0.15s,border-color 0.15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text1)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--amber)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text2)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)' }}>
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Competitor Tab */}
      {tab === 'competitors' && (
        <div style={{ animation: 'fadeIn 0.4s ease' }}>
          
          {/* The Search Bar */}
          <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: '1.5rem', marginBottom: 24 }}>
            <div style={{ fontSize: 10, color: 'var(--amber)', letterSpacing: '0.14em', marginBottom: 12 }}>ENTERPRISE INTELLIGENCE</div>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--text1)', marginBottom: 16 }}>Competitor Spy</h3>
            <div style={{ display: 'flex', gap: 12 }}>
              <input 
                value={competitorInput} 
                onChange={e => setCompetitorInput(e.target.value)} 
                onKeyDown={e => e.key === 'Enter' && analyzeCompetitor()}
                placeholder="Enter Instagram handle (e.g., swiggyindia, theweeknd)" 
                className="input-premium" 
                style={{ flex: 1, padding: '12px 16px', fontSize: 14 }} 
              />
              <button onClick={analyzeCompetitor} disabled={competitorLoading || !competitorInput.trim()} className="btn-amber" style={{ padding: '0 24px' }}>
                {competitorLoading ? 'SCANNING...' : 'ANALYZE'}
              </button>
            </div>
            {competitorError && <div style={{ fontSize: 12, color: 'var(--red)', marginTop: 12 }}>{competitorError}</div>}
          </div>

          {/* The Results Dashboard */}
          {competitorData && (
            <div style={{ animation: 'fadeIn 0.4s ease' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--surface3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: 'var(--text2)' }}>@</div>
                <div>
                  <div style={{ fontSize: '1.2rem', color: 'var(--text1)', fontWeight: 500 }}>{competitorData.username}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)' }}>Live Meta Graph Data</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
                <StatCard 
                  label="FOLLOWERS" 
                  value={fmt(competitorData.followers || 0)} 
                  delta="Public Count" 
                  positive={true} 
                />
                <StatCard 
                  label="TOTAL POSTS" 
                  value={fmt(competitorData.totalPosts || 0)} 
                  delta="Lifetime Media" 
                  positive={true} 
                />
                <StatCard 
                  label="EST. ENGAGEMENT" 
                  value={`${competitorData.avgEngagementRate}%`} 
                  delta="Last 10 Posts" 
                  positive={parseFloat(competitorData.avgEngagementRate) > 2.0} 
                />
                <StatCard 
                  label="RECENT LIKES" 
                  value={fmt(competitorData.recentLikes || 0)} 
                  delta="Last 10 Posts" 
                  positive={true} 
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}