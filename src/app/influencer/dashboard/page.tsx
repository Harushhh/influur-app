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
    <div className="glass p-6 rounded-3xl hover:-translate-y-1 transition-all duration-300">
      <div className="text-xs font-bold text-gray-500 tracking-[0.1em] uppercase mb-2">{label}</div>
      <div className="text-3xl font-extrabold text-gray-900 mb-2">{value}</div>
      <div className={`text-sm font-medium ${positive ? 'text-emerald-600' : 'text-rose-600'}`}>{delta}</div>
    </div>
  )
}

function PostCard({ post, onDelete }: { post: ScheduledPostItem; onDelete: (id: string) => void }) {
  const statusConfig: Record<string, string> = { 
    SCHEDULED: 'bg-brand-100 text-brand-700 border-brand-200', 
    DRAFT: 'bg-gray-100 text-gray-700 border-gray-200', 
    PUBLISHED: 'bg-emerald-100 text-emerald-700 border-emerald-200', 
    FAILED: 'bg-rose-100 text-rose-700 border-rose-200' 
  }
  
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex gap-2 items-center">
          <span className={`px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase rounded-full border ${statusConfig[post.status] || statusConfig.DRAFT}`}>
            {post.status}
          </span>
          {post.aiGenerated && (
            <span className="px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase rounded-full border bg-accent-50 text-accent-600 border-accent-200">
              ✦ AI
            </span>
          )}
        </div>
        <button onClick={() => onDelete(post.id)} className="text-gray-400 hover:text-rose-500 transition-colors text-sm font-bold">✕</button>
      </div>
      <p className="text-sm text-gray-800 leading-relaxed mb-3">{post.caption}</p>
      <div className="flex gap-2 flex-wrap mb-3">
        {post.hashtags.map(h => <span key={h} className="text-xs font-medium text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md">{h}</span>)}
      </div>
      <div className="text-xs font-medium text-gray-500">
        📅 {new Date(post.scheduledAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
      </div>
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
    <div className="glass p-6 rounded-3xl">
      <div className="mb-5">
        <label className="block text-xs font-bold text-gray-500 tracking-[0.1em] uppercase mb-2">Caption</label>
        <div className="relative">
          <textarea 
            value={caption} 
            onChange={e => setCaption(e.target.value)}
            placeholder="Write your caption..." 
            rows={4}
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-shadow resize-y" 
          />
          <button 
            onClick={getAISuggestions} 
            disabled={aiLoading}
            className="absolute top-3 right-3 text-xs font-bold px-3 py-1 bg-brand-50 text-brand-600 border border-brand-200 rounded-lg hover:bg-brand-100 transition-colors"
          >
            {aiLoading ? '...' : '✦ AI'}
          </button>
        </div>
      </div>

      {aiSuggestions.length > 0 && (
        <div className="bg-gradient-to-r from-brand-50 to-accent-50 border border-brand-100 rounded-2xl p-4 mb-5">
          <div className="text-xs font-bold text-brand-600 tracking-[0.1em] mb-3 uppercase">✦ AI Caption Suggestions</div>
          {aiSuggestions.map((s, i) => (
            <div 
              key={i} 
              onClick={() => { setCaption(s.caption); setHashtags(s.hashtags.join(' ')) }}
              className="bg-white rounded-xl p-3 mb-2 cursor-pointer border border-gray-100 hover:border-brand-300 hover:shadow-sm transition-all"
            >
              <div className="text-xs font-bold text-brand-600 mb-1">{s.style}</div>
              <div className="text-sm text-gray-700 leading-relaxed">{s.caption}</div>
              <div className="text-xs font-medium text-brand-500 mt-2">{s.hashtags?.join(' ')}</div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-xs font-bold text-gray-500 tracking-[0.1em] uppercase mb-2">Hashtags</label>
          <input 
            value={hashtags} 
            onChange={e => setHashtags(e.target.value)} 
            placeholder="#hashtag1 #hashtag2" 
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-shadow" 
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 tracking-[0.1em] uppercase mb-2">Schedule Time</label>
          <input 
            type="datetime-local" 
            value={scheduledAt} 
            onChange={e => setScheduledAt(e.target.value)} 
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-shadow" 
          />
        </div>
      </div>

      <button 
        onClick={handleSchedule} 
        disabled={loading || !caption || !scheduledAt} 
        className="w-full bg-gray-900 hover:bg-black text-white py-3.5 rounded-xl font-bold tracking-wide uppercase shadow-soft disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {loading ? 'Scheduling...' : 'Schedule Post'}
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
      if (json.success) setCompetitorData(json.data)
      else setCompetitorError(json.error || 'Failed to analyze competitor.')
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

  const tabs: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'Overview' }, 
    { id: 'schedule', label: 'Auto-Post' }, 
    { id: 'ai', label: '✦ AI Studio' }, 
    { id: 'competitors', label: 'Competitors' }
  ]

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-mesh py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <span className="text-xs font-bold text-brand-600 tracking-[0.2em] uppercase">Influencer Studio</span>
              <span className={`flex items-center text-xs font-medium px-3 py-1 rounded-full border ${data?.isConnected ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-amber-700 bg-amber-50 border-amber-200'}`}>
                <span className={`w-2 h-2 rounded-full mr-2 animate-pulse ${data?.isConnected ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                {data?.isLive ? `Live Data: @${data.username}` : data?.isConnected ? 'Instagram Connected' : 'Waiting for Live Connection...'}
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight mt-2">
              My <span className="text-gradient">Dashboard</span>
            </h1>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-8 border-b border-gray-200 mb-8 overflow-x-auto">
          {tabs.map(t => (
            <button 
              key={t.id} 
              onClick={() => setTab(t.id)}
              className={`pb-4 text-sm font-bold tracking-[0.1em] uppercase whitespace-nowrap transition-colors ${
                tab === t.id ? 'text-brand-600 border-b-2 border-brand-600' : 'text-gray-400 hover:text-gray-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {tab === 'overview' && (
          <div className="animate-fadeUp">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-gray-200/50 rounded-3xl animate-pulse" />)}
              </div>
            ) : data ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                <div className="glass p-8 rounded-3xl mb-8 flex flex-col relative overflow-hidden">
                  <h3 className="text-xs font-bold text-gray-500 tracking-[0.1em] uppercase mb-8 relative z-10">Daily Reach & Impressions</h3>
                  <div className="flex items-end gap-3 h-32 border-b border-gray-200/50 pb-2 relative z-10">
                    {data.recentInsights?.map((d, i) => {
                      const maxImp = Math.max(...data.recentInsights.map(r => r.impressions || 0), 1)
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                          <div className="w-full rounded-t-sm bg-brand-200" style={{ height: `${((d.impressions || 0) / maxImp) * 80}px` }} />
                          <div className="w-full rounded-t-sm bg-brand-500" style={{ height: `${((d.reach || 0) / maxImp) * 80}px`, marginTop: '2px' }} />
                          <span className="text-[10px] text-gray-400 font-medium mt-1">{d.date}</span>
                        </div>
                      )
                    })}
                  </div>
                  <div className="flex items-center gap-6 mt-6 relative z-10">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-brand-500 shadow-sm" /><span className="text-xs font-medium text-gray-600">Reach</span></div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-brand-200 shadow-sm" /><span className="text-xs font-medium text-gray-600">Impressions</span></div>
                  </div>
                </div>

                {/* Upcoming posts */}
                <h3 className="text-sm font-bold text-gray-900 tracking-wide uppercase mb-4">Upcoming Posts</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.scheduledPosts?.slice(0, 2).map(p => <PostCard key={p.id} post={p} onDelete={handleDelete} />)}
                </div>
              </>
            ) : null}
          </div>
        )}

        {/* Schedule Tab */}
        {tab === 'schedule' && (
          <div className="animate-fadeUp grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-sm font-bold text-gray-900 tracking-wide uppercase mb-4">Compose New Post</h3>
              <ComposePost onSchedule={handleSchedule} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 tracking-wide uppercase mb-4">Queue</h3>
              {data?.scheduledPosts?.length ? (
                data.scheduledPosts.map(p => <PostCard key={p.id} post={p} onDelete={handleDelete} />)
              ) : (
                <div className="glass p-12 rounded-3xl text-center text-gray-500 text-sm font-medium">No posts scheduled yet.</div>
              )}
            </div>
          </div>
        )}

        {/* AI Studio Tab */}
        {tab === 'ai' && (
          <div className="animate-fadeUp grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 glass rounded-3xl flex flex-col h-[600px] overflow-hidden border border-gray-100">
              <div className="p-5 bg-white/50 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-brand-600 text-lg">✦</span>
                  <span className="text-sm font-bold text-gray-900 tracking-widest uppercase">Influur AI Studio</span>
                </div>
                <span className="text-xs font-medium text-gray-400 bg-gray-100 px-3 py-1 rounded-full">Powered by AI</span>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {chatMessages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed shadow-sm ${
                      m.role === 'user' 
                        ? 'bg-brand-600 text-white rounded-tr-sm' 
                        : 'bg-white text-gray-800 border border-gray-100 rounded-tl-sm'
                    }`}>
                      {m.role === 'assistant' && <div className="text-[10px] font-bold text-brand-600 tracking-widest uppercase mb-2">✦ INFLUUR AI</div>}
                      {m.content}
                    </div>
                  </div>
                ))}
                {chatLoading && <div className="text-xs font-medium text-gray-400 pl-2 animate-pulse">AI is typing...</div>}
              </div>
              
              <div className="p-4 bg-white/50 border-t border-gray-100 flex gap-3">
                <input 
                  value={chatInput} 
                  onChange={e => setChatInput(e.target.value)} 
                  onKeyDown={e => e.key === 'Enter' && sendChat()}
                  placeholder="Ask AI anything about your content strategy..." 
                  className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-shadow" 
                />
                <button 
                  onClick={sendChat} 
                  disabled={chatLoading || !chatInput.trim()} 
                  className="bg-gray-900 hover:bg-black text-white px-6 rounded-xl font-bold text-sm tracking-wider uppercase shadow-soft disabled:opacity-50 transition-all"
                >
                  Send
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-900 tracking-wide uppercase mb-4">Quick Actions</h3>
              {[
                'Write me a viral Reel caption for a skincare routine', 
                'What are the best hashtags for lifestyle content in India?', 
                'Analyse my posting schedule and suggest improvements', 
                'Write a compelling bio for my profile'
              ].map(p => (
                <button 
                  key={p} 
                  onClick={() => setChatInput(p)}
                  className="w-full text-left glass p-4 rounded-2xl text-sm text-gray-600 hover:text-brand-700 hover:border-brand-200 hover:-translate-y-0.5 transition-all mb-3 leading-relaxed font-medium"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Competitor Tab */}
        {tab === 'competitors' && (
          <div className="animate-fadeUp">
            
            <div className="glass p-8 rounded-3xl mb-8">
              <div className="text-xs font-bold text-accent-500 tracking-[0.1em] uppercase mb-3">Enterprise Intelligence</div>
              <h3 className="text-2xl font-extrabold text-gray-900 mb-6">Competitor Spy</h3>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <span className="absolute left-4 top-3.5 text-gray-400 font-bold">@</span>
                  <input 
                    value={competitorInput} 
                    onChange={e => setCompetitorInput(e.target.value)} 
                    onKeyDown={e => e.key === 'Enter' && analyzeCompetitor()}
                    placeholder="Enter Instagram handle (e.g. swiggyindia)" 
                    className="w-full pl-9 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none shadow-sm transition-shadow" 
                  />
                </div>
                <button 
                  onClick={analyzeCompetitor} 
                  disabled={competitorLoading || !competitorInput.trim()} 
                  className="bg-accent-600 hover:bg-accent-500 text-white px-8 py-3.5 rounded-xl font-bold tracking-wide uppercase shadow-soft disabled:opacity-50 transition-all"
                >
                  {competitorLoading ? 'Scanning...' : 'Analyze'}
                </button>
              </div>
              {competitorError && <div className="text-sm font-medium text-rose-500 mt-4 bg-rose-50 p-3 rounded-lg border border-rose-100">{competitorError}</div>}
            </div>

            {competitorData && (
              <div className="animate-fadeUp mt-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-brand-500 to-accent-500 flex items-center justify-center text-white text-2xl font-bold shadow-soft">@</div>
                  <div>
                    <div className="text-2xl font-extrabold text-gray-900">{competitorData.username}</div>
                    <div className="text-sm font-medium text-gray-500">Live Meta Graph Data</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
    </div>
  )
}