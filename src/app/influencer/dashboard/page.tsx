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
  fullName?: string;
  profilePicUrl?: string;
}

function StatCard({ label, value, delta, positive }: { label: string; value: string; delta: string; positive: boolean }) {
  return (
    <div className="bg-white border border-gray-100 p-6 rounded-3xl hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
      <div className="text-xs font-bold text-gray-400 tracking-[0.15em] uppercase mb-3">{label}</div>
      <div className="text-3xl font-black text-gray-900 mb-2">{value}</div>
      <div className={`text-sm font-semibold flex items-center gap-1 ${positive ? 'text-emerald-500' : 'text-rose-500'}`}>
        {positive ? '↑' : '↓'} {delta}
      </div>
    </div>
  )
}

function PostCard({ post, onDelete }: { post: ScheduledPostItem; onDelete: (id: string) => void }) {
  const statusConfig: Record<string, string> = { 
    SCHEDULED: 'bg-brand-50 text-brand-700 border-brand-200', 
    DRAFT: 'bg-gray-50 text-gray-700 border-gray-200', 
    PUBLISHED: 'bg-emerald-50 text-emerald-700 border-emerald-200', 
    FAILED: 'bg-rose-50 text-rose-700 border-rose-200' 
  }
  
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-4 shadow-sm hover:shadow-md transition-shadow group">
      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-2 items-center">
          <span className={`px-3 py-1 text-[10px] font-black tracking-widest uppercase rounded-md border ${statusConfig[post.status] || statusConfig.DRAFT}`}>
            {post.status}
          </span>
          {post.aiGenerated && (
            <span className="px-3 py-1 text-[10px] font-black tracking-widest uppercase rounded-md border bg-accent-50 text-accent-600 border-accent-200">
              ✦ AI Optimized
            </span>
          )}
        </div>
        <button onClick={() => onDelete(post.id)} className="text-gray-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
      <p className="text-sm text-gray-700 leading-relaxed mb-4 line-clamp-3">{post.caption}</p>
      <div className="flex gap-2 flex-wrap mb-4">
        {post.hashtags.map(h => <span key={h} className="text-xs font-bold text-gray-500 bg-gray-50 px-2 py-1 rounded-md">{h}</span>)}
      </div>
      <div className="text-xs font-bold text-brand-600 flex items-center gap-2 border-t border-gray-50 pt-4">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        {new Date(post.scheduledAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
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
    <div className="bg-white border border-gray-100 p-8 rounded-3xl shadow-sm">
      <div className="mb-6">
        <label className="block text-xs font-black text-gray-400 tracking-widest uppercase mb-3">Post Caption</label>
        <div className="relative">
          <textarea 
            value={caption} 
            onChange={e => setCaption(e.target.value)}
            placeholder="What do you want to share with your audience?" 
            rows={5}
            className="w-full bg-gray-50 border-0 rounded-2xl px-5 py-4 text-sm text-gray-800 focus:ring-2 focus:ring-brand-500 outline-none transition-all resize-y" 
          />
          <button 
            onClick={getAISuggestions} 
            disabled={aiLoading}
            className="absolute bottom-4 right-4 text-xs font-bold px-4 py-2 bg-white text-brand-600 shadow-sm rounded-xl hover:shadow-md transition-all flex items-center gap-2"
          >
            {aiLoading ? <span className="animate-pulse">Thinking...</span> : <><span>✦</span> Magic Edit</>}
          </button>
        </div>
      </div>

      {aiSuggestions.length > 0 && (
        <div className="bg-brand-50 border border-brand-100 rounded-2xl p-5 mb-6">
          <div className="text-xs font-black text-brand-600 tracking-widest mb-4 uppercase flex items-center gap-2">
            <span>✦</span> Select an AI Variation
          </div>
          {aiSuggestions.map((s, i) => (
            <div 
              key={i} 
              onClick={() => { setCaption(s.caption); setHashtags(s.hashtags.join(' ')) }}
              className="bg-white rounded-xl p-4 mb-3 cursor-pointer border border-transparent hover:border-brand-300 hover:shadow-md transition-all group"
            >
              <div className="flex justify-between items-center mb-2">
                <div className="text-xs font-black text-gray-400 uppercase tracking-wider">{s.style}</div>
                <div className="text-[10px] font-bold text-brand-500 opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest bg-brand-50 px-2 py-1 rounded">Use This</div>
              </div>
              <div className="text-sm text-gray-800 leading-relaxed mb-3">{s.caption}</div>
              <div className="flex gap-2 flex-wrap">
                {s.hashtags?.map(h => <span key={h} className="text-[10px] font-bold text-brand-500 bg-brand-50 px-2 py-1 rounded">{h}</span>)}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        <div>
          <label className="block text-xs font-black text-gray-400 tracking-widest uppercase mb-3">Hashtags</label>
          <input 
            value={hashtags} 
            onChange={e => setHashtags(e.target.value)} 
            placeholder="#viral #trending" 
            className="w-full bg-gray-50 border-0 rounded-xl px-5 py-3.5 text-sm text-gray-800 focus:ring-2 focus:ring-brand-500 outline-none transition-all" 
          />
        </div>
        <div>
          <label className="block text-xs font-black text-gray-400 tracking-widest uppercase mb-3">Publish Time</label>
          <input 
            type="datetime-local" 
            value={scheduledAt} 
            onChange={e => setScheduledAt(e.target.value)} 
            className="w-full bg-gray-50 border-0 rounded-xl px-5 py-3.5 text-sm text-gray-800 focus:ring-2 focus:ring-brand-500 outline-none transition-all" 
          />
        </div>
      </div>

      <button 
        onClick={handleSchedule} 
        disabled={loading || !caption || !scheduledAt} 
        className="w-full bg-black hover:bg-gray-900 text-white py-4 rounded-2xl font-black tracking-widest uppercase shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {loading ? 'Adding to Queue...' : 'Schedule to Instagram'}
      </button>
    </div>
  )
}

export default function InfluencerDashboardPage() {
  const [tab, setTab] = useState<Tab>('overview')
  const [data, setData] = useState<LiveDataExt | null>(null)
  const [loading, setLoading] = useState(true)
  
  // AI Chat State
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([{ role: 'assistant', content: 'Welcome to INFLUUR Studio. I am analyzing your real-time Meta data. How can we grow your audience today?' }])
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
      .then(d => { 
        if(d.data && d.data.isLive) {
            setData(d.data); 
        }
        setLoading(false) 
      })
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
    setData(prev => prev ? { ...prev, scheduledPosts: prev.scheduledPosts?.filter(p => p.id !== id) } : prev)
  }

  const handleSchedule = (post: Omit<ScheduledPostItem, 'id' | 'status'>) => {
    setData(prev => prev ? { ...prev, scheduledPosts: [{ ...post, id: `sp_${Date.now()}`, status: 'SCHEDULED' }, ...(prev.scheduledPosts || [])] } : prev)
  }

  const fmt = (n?: number) => !n ? '0' : n >= 1000000 ? `${(n / 1000000).toFixed(1)}M` : n >= 1000 ? `${(n / 1000).toFixed(1)}K` : new Intl.NumberFormat('en-IN').format(n)
  const fmtDelta = (n?: number) => n ? (n > 0 ? `${n}%` : `${Math.abs(n)}%`) : "0%"

  const tabs: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'Overview' }, 
    { id: 'schedule', label: 'Auto-Post' }, 
    { id: 'ai', label: '✦ AI Studio' }, 
    { id: 'competitors', label: 'Competitors' }
  ]

  // Feature 1: Goal Tracker Logic
  const getNextGoal = (current: number) => {
      if(current < 1000) return 1000;
      if(current < 10000) return 10000;
      if(current < 50000) return 50000;
      if(current < 100000) return 100000;
      return Math.ceil(current / 100000) * 100000 + 100000;
  }
  const currentFollowers = data?.followerCount || 0;
  const nextGoal = getNextGoal(currentFollowers);
  const progressPercent = Math.min(100, Math.max(0, (currentFollowers / nextGoal) * 100));

  // Feature 2: Smart Insights Logic
  const generateInsight = () => {
      if(!data?.isLive) return "Connect your Instagram to see personalized AI insights based on your recent activity.";
      const reels = data.recentReels || 0;
      const photos = data.recentPhotos || 0;
      if (reels > photos && parseFloat(data.engagementRate || '0') > 3) {
          return "🔥 Your Reels are driving massive engagement! Double down on short-form video this week to maximize reach.";
      } else if (photos > reels) {
          return "💡 You are posting more photos than Reels. Try converting your best-performing photo into a 7-second Reel to boost the algorithm.";
      } else {
          return "✨ Your engagement is holding steady. Use the AI Studio to generate a viral hook for your next post.";
      }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#F8FAFC] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="text-xs font-black text-brand-600 tracking-widest uppercase bg-brand-50 px-3 py-1 rounded-full">Influencer Studio</span>
              <span className={`flex items-center text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border ${data?.isLive ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-amber-700 bg-amber-50 border-amber-200'}`}>
                <span className={`w-2 h-2 rounded-full mr-2 animate-pulse ${data?.isLive ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                {data?.isLive ? 'Live Connection Active' : 'Waiting for Data...'}
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-accent-600">{data?.fullName || data?.username || 'Creator'}</span>
            </h1>
          </div>
          
          {/* New Profile Badge in Header */}
          {data?.isLive && (
             <div className="flex items-center gap-4 bg-white p-2 pr-6 rounded-full border border-gray-100 shadow-sm">
                 {data.profilePicUrl ? (
                     <img src={data.profilePicUrl} alt="Profile" className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" />
                 ) : (
                     <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold text-xl">
                         {data.username?.charAt(0).toUpperCase()}
                     </div>
                 )}
                 <div>
                     <div className="text-sm font-black text-gray-900">@{data.username}</div>
                     <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Instagram Meta Graph</div>
                 </div>
             </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-8 border-b border-gray-200 mb-8 overflow-x-auto">
          {tabs.map(t => (
            <button 
              key={t.id} 
              onClick={() => setTab(t.id)}
              className={`pb-4 text-xs font-black tracking-widest uppercase whitespace-nowrap transition-colors relative ${
                tab === t.id ? 'text-brand-600' : 'text-gray-400 hover:text-gray-900'
              }`}
            >
              {t.label}
              {tab === t.id && <div className="absolute bottom-[-1px] left-0 w-full h-0.5 bg-brand-600 rounded-t-full" />}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {tab === 'overview' && (
          <div className="animate-fadeUp">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-gray-200 rounded-3xl animate-pulse" />)}
              </div>
            ) : data ? (
              <>
                {/* NEW FEATURE 1 & 2: Goal Tracker and AI Insight Bar */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    <div className="lg:col-span-2 bg-gradient-to-r from-gray-900 to-black rounded-3xl p-6 md:p-8 text-white flex flex-col justify-center shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500 rounded-full blur-[100px] opacity-20 transform translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
                        <div className="text-xs font-black tracking-widest text-brand-400 uppercase mb-4 flex items-center gap-2">
                            <span>✦</span> AI Strategy Insight
                        </div>
                        <p className="text-lg md:text-xl font-medium leading-relaxed text-gray-100">
                            {generateInsight()}
                        </p>
                    </div>
                    
                    <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 flex flex-col justify-center shadow-sm">
                        <div className="text-xs font-black tracking-widest text-gray-400 uppercase mb-4">Milestone Tracker</div>
                        <div className="flex justify-between items-end mb-3">
                            <span className="text-3xl font-black text-gray-900">{fmt(currentFollowers)}</span>
                            <span className="text-sm font-bold text-gray-400 mb-1">Goal: {fmt(nextGoal)}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-3 mb-2 overflow-hidden">
                            <div className="bg-brand-500 h-3 rounded-full transition-all duration-1000" style={{ width: `${progressPercent}%` }}></div>
                        </div>
                        <div className="text-right text-xs font-bold text-brand-600">{progressPercent.toFixed(1)}% Complete</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <StatCard 
                    label="LIVE FOLLOWERS" 
                    value={fmt(data.followerCount || 0)} 
                    delta="Real-Time Sync" 
                    positive={true} 
                  />
                  <StatCard 
                    label="TOTAL POSTS" 
                    value={fmt(data.totalPosts || 0)} 
                    delta={`${fmt(data.recentPhotos || 0)} Photos`} 
                    positive={true} 
                  />
                  <StatCard 
                    label="RECENT REELS" 
                    value={fmt(data.recentReels || 0)} 
                    delta="Last 20 Posts" 
                    positive={true} 
                  />
                  <StatCard 
                    label="ENGAGEMENT RATE" 
                    value={`${data.engagementRate || '0.00'}%`} 
                    delta={`${fmt(data.totalRecentLikes || 0)} Recent Likes`} 
                    positive={parseFloat(data.engagementRate || '0') > 1.5} 
                  />
                </div>

                {/* Reach chart */}
                <div className="bg-white border border-gray-100 p-8 rounded-3xl mb-8 flex flex-col relative overflow-hidden shadow-sm">
                  <h3 className="text-xs font-black text-gray-400 tracking-widest uppercase mb-8 relative z-10">7-Day Reach & Impressions</h3>
                  <div className="flex items-end gap-4 h-40 border-b border-gray-100 pb-2 relative z-10">
                    {data.recentInsights?.map((d, i) => {
                      const maxImp = Math.max(...data.recentInsights!.map(r => r.impressions || 0), 1)
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                          <div className="w-full rounded-t-md bg-gray-100 group-hover:bg-gray-200 transition-colors relative" style={{ height: `${((d.impressions || 0) / maxImp) * 100}%` }}>
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 bg-gray-900 text-white text-xs font-bold py-1 px-2 rounded pointer-events-none whitespace-nowrap z-20">
                                  {fmt(d.impressions)} Imp.
                              </div>
                          </div>
                          <div className="w-full rounded-t-md bg-brand-500 group-hover:bg-brand-400 transition-colors relative" style={{ height: `${((d.reach || 0) / maxImp) * 100}%`, marginTop: '2px' }}>
                             <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 bg-brand-600 text-white text-xs font-bold py-1 px-2 rounded pointer-events-none whitespace-nowrap z-20">
                                  {fmt(d.reach)} Reach
                              </div>
                          </div>
                          <span className="text-[10px] text-gray-400 font-bold tracking-wider mt-2">{d.date}</span>
                        </div>
                      )
                    })}
                  </div>
                  <div className="flex items-center gap-8 mt-6 relative z-10 justify-center">
                    <div className="flex items-center gap-3"><div className="w-4 h-4 rounded border border-gray-200 bg-brand-500 shadow-sm" /><span className="text-xs font-bold uppercase tracking-wider text-gray-600">Reach</span></div>
                    <div className="flex items-center gap-3"><div className="w-4 h-4 rounded border border-gray-200 bg-gray-100 shadow-sm" /><span className="text-xs font-bold uppercase tracking-wider text-gray-600">Impressions</span></div>
                  </div>
                </div>

                {/* Upcoming posts */}
                <h3 className="text-xs font-black text-gray-400 tracking-widest uppercase mb-4 pl-2">Upcoming Auto-Posts</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {data.scheduledPosts?.slice(0, 2).map(p => <PostCard key={p.id} post={p} onDelete={handleDelete} />)}
                  {(!data.scheduledPosts || data.scheduledPosts.length === 0) && (
                      <div className="col-span-2 bg-white border border-dashed border-gray-300 rounded-3xl p-10 flex flex-col items-center justify-center text-center">
                          <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                              <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                          </div>
                          <h4 className="text-gray-900 font-bold mb-1">No Posts Scheduled</h4>
                          <p className="text-sm text-gray-500 mb-4">Keep your audience engaged by planning content in advance.</p>
                          <button onClick={() => setTab('schedule')} className="text-sm font-bold text-brand-600 hover:text-brand-700 transition-colors uppercase tracking-wider">Go to Auto-Post →</button>
                      </div>
                  )}
                </div>
              </>
            ) : null}
          </div>
        )}

        {/* Schedule Tab */}
        {tab === 'schedule' && (
          <div className="animate-fadeUp grid grid-cols-1 xl:grid-cols-5 gap-8">
            <div className="xl:col-span-3">
              <h3 className="text-xs font-black text-gray-400 tracking-widest uppercase mb-4 pl-2">Compose New Content</h3>
              <ComposePost onSchedule={handleSchedule} />
            </div>
            <div className="xl:col-span-2">
              <h3 className="text-xs font-black text-gray-400 tracking-widest uppercase mb-4 pl-2">Your Content Queue</h3>
              <div className="space-y-4">
                {data?.scheduledPosts?.length ? (
                  data.scheduledPosts.map(p => <PostCard key={p.id} post={p} onDelete={handleDelete} />)
                ) : (
                  <div className="bg-white border border-gray-100 p-12 rounded-3xl text-center text-gray-500 text-sm font-bold shadow-sm">Queue is empty.</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* AI Studio Tab */}
        {tab === 'ai' && (
          <div className="animate-fadeUp grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white rounded-3xl flex flex-col h-[700px] overflow-hidden border border-gray-100 shadow-sm">
              <div className="p-6 bg-white border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-brand-600 text-xl">✦</span>
                  <span className="text-sm font-black text-gray-900 tracking-widest uppercase">AI Strategy Assistant</span>
                </div>
                <span className="text-[10px] font-black text-brand-600 uppercase tracking-widest bg-brand-50 px-3 py-1.5 rounded-full">Pro Feature</span>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50">
                {chatMessages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl p-5 text-sm leading-relaxed shadow-sm ${
                      m.role === 'user' 
                        ? 'bg-black text-white rounded-tr-sm' 
                        : 'bg-white text-gray-800 border border-gray-100 rounded-tl-sm'
                    }`}>
                      {m.role === 'assistant' && <div className="text-[10px] font-black text-brand-600 tracking-widest uppercase mb-3 flex items-center gap-2"><span>✦</span> INFLUUR Engine</div>}
                      {m.content}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                    <div className="flex justify-start">
                        <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm p-5 shadow-sm flex gap-2 items-center">
                            <div className="w-2 h-2 rounded-full bg-brand-300 animate-bounce"></div>
                            <div className="w-2 h-2 rounded-full bg-brand-400 animate-bounce" style={{animationDelay: '0.1s'}}></div>
                            <div className="w-2 h-2 rounded-full bg-brand-500 animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                    </div>
                )}
              </div>
              
              <div className="p-5 bg-white border-t border-gray-100">
                <div className="relative">
                    <input 
                    value={chatInput} 
                    onChange={e => setChatInput(e.target.value)} 
                    onKeyDown={e => e.key === 'Enter' && sendChat()}
                    placeholder="Ask AI for content ideas, hashtag research, or data analysis..." 
                    className="w-full bg-gray-50 border-0 rounded-xl pl-5 pr-24 py-4 text-sm text-gray-800 focus:ring-2 focus:ring-brand-500 outline-none transition-all" 
                    />
                    <button 
                    onClick={sendChat} 
                    disabled={chatLoading || !chatInput.trim()} 
                    className="absolute right-2 top-2 bottom-2 bg-black hover:bg-gray-900 text-white px-6 rounded-lg font-bold text-xs tracking-widest uppercase shadow-sm disabled:opacity-50 transition-all"
                    >
                    Send
                    </button>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-black text-gray-400 tracking-widest uppercase mb-4 pl-2">One-Click Prompts</h3>
              {[
                'Write a viral Reel caption about my daily routine', 
                'Give me 10 trending hashtags for fashion in India', 
                'Analyze my recent engagement and suggest a new niche', 
                'Draft a professional email to pitch a brand sponsorship'
              ].map(p => (
                <button 
                  key={p} 
                  onClick={() => setChatInput(p)}
                  className="w-full text-left bg-white border border-gray-100 p-5 rounded-2xl text-sm text-gray-600 hover:text-brand-700 hover:border-brand-300 hover:shadow-md transition-all mb-4 leading-relaxed font-semibold group"
                >
                  <span className="text-brand-400 mr-2 opacity-0 group-hover:opacity-100 transition-opacity">✦</span>
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Competitor Tab */}
        {tab === 'competitors' && (
          <div className="animate-fadeUp max-w-4xl">
            
            <div className="bg-white border border-gray-100 p-8 md:p-10 rounded-3xl mb-8 shadow-sm">
              <div className="text-[10px] font-black text-accent-500 tracking-widest uppercase mb-4">Enterprise Intelligence API</div>
              <h3 className="text-3xl font-black text-gray-900 mb-8">Analyze Any Creator</h3>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <span className="absolute left-5 top-4 text-gray-400 font-bold">@</span>
                  <input 
                    value={competitorInput} 
                    onChange={e => setCompetitorInput(e.target.value)} 
                    onKeyDown={e => e.key === 'Enter' && analyzeCompetitor()}
                    placeholder="Enter Instagram handle (e.g. swiggyindia)" 
                    className="w-full pl-10 pr-5 py-4 bg-gray-50 border-0 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-accent-500 outline-none transition-all" 
                  />
                </div>
                <button 
                  onClick={analyzeCompetitor} 
                  disabled={competitorLoading || !competitorInput.trim()} 
                  className="bg-accent-600 hover:bg-accent-700 text-white px-8 py-4 rounded-xl font-black tracking-widest uppercase shadow-md disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {competitorLoading ? (
                      <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Scanning</>
                  ) : 'Analyze Data'}
                </button>
              </div>
              {competitorError && <div className="text-xs font-bold text-rose-500 mt-6 bg-rose-50 p-4 rounded-xl border border-rose-100">{competitorError}</div>}
            </div>

            {competitorData && (
              <div className="animate-fadeUp mt-8 bg-white border border-gray-100 p-8 md:p-10 rounded-3xl shadow-sm">
                <div className="flex items-center gap-6 mb-10 pb-8 border-b border-gray-100">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-brand-500 to-accent-500 flex items-center justify-center text-white text-3xl font-black shadow-md">@</div>
                  <div>
                    <div className="text-3xl font-black text-gray-900 mb-1">{competitorData.username}</div>
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        Live Meta Graph Sync
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div>
                      <div className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-2">Total Followers</div>
                      <div className="text-4xl font-black text-gray-900">{fmt(competitorData.followers || 0)}</div>
                  </div>
                  <div>
                      <div className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-2">Lifetime Media Count</div>
                      <div className="text-4xl font-black text-gray-900">{fmt(competitorData.totalPosts || 0)}</div>
                  </div>
                  <div>
                      <div className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-2">Avg. Engagement Rate</div>
                      <div className="text-4xl font-black text-brand-600">{competitorData.avgEngagementRate}%</div>
                      <div className="text-xs font-bold text-gray-400 mt-1">Based on last 10 posts</div>
                  </div>
                  <div>
                      <div className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-2">Recent Engagement Volume</div>
                      <div className="text-4xl font-black text-gray-900">{fmt(competitorData.recentLikes || 0)}</div>
                      <div className="text-xs font-bold text-gray-400 mt-1">Total Likes & Comments</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}