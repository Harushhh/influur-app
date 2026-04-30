'use client'

import { useState, useEffect, useMemo } from 'react'

type SavedCreator = {
  id: string
  username: string
  name: string
  avatar: string
  followers: number
  engagementRate: string
  optInStatus: string
  // New metrics for KPI aggregation
  cpm: number
  realReach: number
  audGender: string
  audLocation: string
}

export default function MarketerDashboard() {
  const [creators, setCreators] = useState<SavedCreator[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isPro, setIsPro] = useState(false) 
  
  const [subject, setSubject] = useState('')
  const [emailBody, setEmailBody] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSending, setIsSending] = useState(false)

  useEffect(() => {
    fetch('/api/saved-influencers')
      .then(res => res.json())
      .then(json => {
        if (json.success && json.data) {
          setCreators(json.data)
        }
        setLoading(false)
      })
      .catch(err => {
        console.error("Failed to fetch CRM data:", err)
        setLoading(false)
      })
  }, [])

  const fmt = (n: number) => n >= 1000000 ? `${(n / 1000000).toFixed(1)}M` : n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n)

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
  }

  // ============================================================================
  // 🔥 DYNAMIC KPI CALCULATIONS 🔥
  // ============================================================================
  const kpis = useMemo(() => {
    if (creators.length === 0) {
      return { totalCpm: 0, efficiency: 0, pctF: 50, topGeos: [] }
    }

    // 1. Efficiency & Value
    const totalCpm = creators.reduce((sum, c) => sum + (c.cpm || 0), 0)
    const totalReach = creators.reduce((sum, c) => sum + (c.realReach || 0), 0)
    const efficiency = totalReach > 0 ? Math.round(totalCpm / (totalReach / 1000)) : 0

    // 2. Audience Split (Weighted inference)
    let femaleWeight = 0; let maleWeight = 0
    creators.forEach(c => {
      const g = c.audGender?.toLowerCase()
      if (g === 'female') { femaleWeight += 0.8; maleWeight += 0.2 }
      else if (g === 'male') { maleWeight += 0.8; femaleWeight += 0.2 }
      else { femaleWeight += 0.5; maleWeight += 0.5 }
    })
    const totalWeight = femaleWeight + maleWeight
    const pctF = totalWeight > 0 ? Math.round((femaleWeight / totalWeight) * 100) : 50

    // 3. Top Geographies
    const geoMap: Record<string, number> = {}
    creators.forEach(c => {
      const loc = c.audLocation || 'Global'
      geoMap[loc] = (geoMap[loc] || 0) + 1
    })
    const topGeos = Object.entries(geoMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([city, count]) => ({ city, pct: Math.round((count / creators.length) * 100) + '%' }))

    return { totalCpm, efficiency, pctF, topGeos }
  }, [creators])

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '3rem 1.5rem', animation: 'fadeIn 0.5s ease' }}>
      <div style={{ fontSize: 10, color: 'var(--amber)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 8 }}>Marketer CRM</div>
      <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '2.5rem', fontWeight: 600, color: 'var(--text1)', marginBottom: 32 }}>Brand Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        
        {/* CARD 1: THE PULSE */}
        <div className="bg-[#13131A] border border-[#2A2A35] rounded-lg p-5 flex flex-col justify-between hover:border-[#D4A847] transition-colors duration-300">
          <div>
            <div className="flex justify-between items-start mb-2">
              <span className="text-zinc-500 text-[10px] tracking-[0.15em] uppercase">Pipeline</span>
              <span className="text-emerald-400 text-xs font-mono bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/20">Active</span>
            </div>
            <div className="text-zinc-100 text-3xl font-serif tracking-tight mt-1">{creators.length}</div>
            <div className="text-zinc-400 text-xs mt-1">Total Saved Leads</div>
          </div>
        </div>

        {/* CARD 2: DYNAMIC AUDIENCE */}
        <div className="bg-[#13131A] border border-[#2A2A35] rounded-lg p-5 flex flex-col justify-between hover:border-[#D4A847] transition-colors duration-300">
          <div>
            <div className="text-zinc-500 text-[10px] tracking-[0.15em] uppercase mb-4">Avg Audience Split</div>
            <div className="mb-5">
              <div className="flex justify-between text-[10px] mb-1.5 font-mono">
                <span className="text-[#D4A847]">{kpis.pctF}% F</span>
                <span className="text-zinc-400">{100 - kpis.pctF}% M</span>
              </div>
              <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden flex">
                <div className="bg-[#D4A847] h-full transition-all duration-1000" style={{ width: `${kpis.pctF}%` }}></div>
                <div className="bg-zinc-600 h-full transition-all duration-1000" style={{ width: `${100 - kpis.pctF}%` }}></div>
              </div>
            </div>
          </div>

          <div>
            <div className="text-[10px] text-zinc-500 tracking-wider mb-2 uppercase">Top Geo</div>
            <ul className="space-y-2">
              {kpis.topGeos.length > 0 ? kpis.topGeos.map((item, i) => (
                <li key={i} className="flex justify-between items-center text-xs">
                  <span className="text-zinc-300 truncate max-w-[120px]" title={item.city}>{item.city}</span>
                  <span className="text-zinc-500 font-mono">{item.pct}</span>
                </li>
              )) : (
                <li className="text-xs text-zinc-600">No geo data available</li>
              )}
            </ul>
          </div>
        </div>

        {/* CARD 3: DYNAMIC EFFICIENCY */}
        <div className="bg-[#13131A] border border-[#2A2A35] rounded-lg p-5 flex flex-col justify-between hover:border-[#D4A847] transition-colors duration-300">
          <div>
            <div className="text-zinc-500 text-[10px] tracking-[0.15em] uppercase mb-2">Efficiency</div>
            <div className="text-zinc-100 text-3xl font-serif tracking-tight mt-1">₹{kpis.efficiency.toLocaleString('en-IN')}</div>
            <div className="text-zinc-400 text-xs mt-1">Avg Cost Per 1k Reach</div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#2A2A35]">
             <div className="text-zinc-500 text-[10px] tracking-[0.15em] uppercase mb-1">Est. Portfolio Value</div>
             <div className="text-[#D4A847] text-xl font-mono">₹{kpis.totalCpm.toLocaleString('en-IN')}</div>
             <div className="text-zinc-600 text-[9px] mt-1 uppercase tracking-wide">Based on saved creators</div>
          </div>
        </div>

        {/* CARD 4: RELIABILITY */}
        <div className="bg-[#13131A] border border-[#2A2A35] rounded-lg p-5 flex flex-col justify-between hover:border-[#D4A847] transition-colors duration-300">
          <div className="text-zinc-500 text-[10px] tracking-[0.15em] uppercase mb-2">Unlocked Contacts</div>
          
          <div className="flex-1 flex items-center justify-center relative mt-2">
            <svg viewBox="0 0 36 36" className="w-28 h-28 transform -rotate-90">
              <path className="text-zinc-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="2.5" />
              <path className="text-[#D4A847] transition-all duration-1000 ease-out" strokeDasharray={`${creators.length > 0 ? (creators.filter(c => c.optInStatus === 'UNLOCKED').length / creators.length) * 100 : 0}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-zinc-100 text-2xl font-serif">{creators.filter(c => c.optInStatus === 'UNLOCKED').length}</span>
              <span className="text-zinc-500 text-[9px] tracking-wider uppercase mt-1">Unlocked</span>
            </div>
          </div>
        </div>

      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: 24 }}>
        
        {/* Main CRM Table */}
        <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
          <div style={{ display: 'flex', gap: 24, padding: '1.2rem 1.5rem', borderBottom: '1px solid var(--border)', fontSize: 11, color: 'var(--amber)', letterSpacing: '0.08em' }}>
            <span style={{ borderBottom: '1px solid var(--amber)', paddingBottom: 4 }}>SAVED INFLUENCERS</span>
            <span style={{ color: 'var(--text3)' }}>CAMPAIGNS</span>
          </div>
          
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead style={{ fontSize: 10, color: 'var(--text3)', letterSpacing: '0.1em' }}>
              <tr>
                <th style={{ padding: '1rem 1.5rem', width: 40 }}></th>
                <th style={{ padding: '1rem 0' }}>INFLUENCER</th>
                <th style={{ padding: '1rem 0' }}>FOLLOWERS</th>
                <th style={{ padding: '1rem 0' }}>ENG RATE</th>
                <th style={{ padding: '1rem 0' }}>STATUS</th>
                <th style={{ padding: '1rem 0' }}>CONTACT</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--amber)', fontSize: 12, letterSpacing: '0.1em' }}>CONNECTING TO DATABASE...</td></tr>
              ) : creators.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>Your CRM is empty. Go discover some influencers!</td></tr>
              ) : (
                creators.map((creator) => (
                  <tr key={creator.id} style={{ borderTop: '1px solid var(--border)', background: selectedIds.has(creator.id) ? 'var(--surface3)' : 'transparent', transition: 'background 0.2s' }}>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <input type="checkbox" checked={selectedIds.has(creator.id)} onChange={() => toggleSelect(creator.id)} style={{ accentColor: 'var(--amber)' }} />
                    </td>
                    <td style={{ padding: '1rem 0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {/* 🔥 FIXED AVATAR WITH FALLBACK 🔥 */}
                        <img 
                          src={creator.avatar || `https://ui-avatars.com/api/?name=${creator.username}&background=D4A847&color=1A1A1A`} 
                          onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${creator.username}&background=D4A847&color=1A1A1A` }}
                          alt="" 
                          style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', border: '1px solid #27272a' }} 
                        />
                        <div>
                          <div style={{ fontSize: 13, color: 'var(--text1)', fontWeight: 500, maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{creator.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--amber)' }}>@{creator.username}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem 0', fontSize: 13, color: 'var(--text2)' }}>{fmt(creator.followers)}</td>
                    <td style={{ padding: '1rem 0', fontSize: 13, color: 'var(--green)', fontWeight: 500 }}>{creator.engagementRate}%</td>
                    <td style={{ padding: '1rem 0' }}>
                      <span className={`badge ${creator.optInStatus === 'PENDING' ? 'badge-muted' : 'badge-amber'}`} style={{ fontSize: 9 }}>{creator.optInStatus}</span>
                    </td>
                    <td style={{ padding: '1rem 0', fontSize: 11 }}>
                      {isPro || creator.optInStatus === 'UNLOCKED' ? (
                        <div style={{ color: 'var(--text2)' }}>Unlocked</div>
                      ) : (
                        <button 
                           className="badge badge-amber hover:bg-[#D4A847] hover:text-black transition-colors" 
                           style={{ cursor: 'pointer', border: '1px solid var(--amber)', background: 'transparent' }}
                           onClick={async (e) => {
                             e.stopPropagation();
                             const res = await fetch('/api/saved-influencers', {
                               method: 'PATCH',
                               headers: { 'Content-Type': 'application/json' },
                               body: JSON.stringify({ id: creator.id, optInStatus: 'UNLOCKED' })
                             });
                             if(res.ok) {
                               setCreators(creators.map(c => c.id === creator.id ? { ...c, optInStatus: 'UNLOCKED' } : c))
                             }
                           }}
                        >
                          UNLOCK
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* AI Email Outreach Panel */}
        <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: '1.5rem', height: 'fit-content' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 10, color: 'var(--text3)', letterSpacing: '0.12em' }}>BULK OUTREACH</div>
            
            <button 
              onClick={async () => {
                setIsGenerating(true)
                try {
                  const res = await fetch('/api/ai/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                      mode: 'outreach', 
                      prompt: 'Write a short, edgy pitch email for AURA, a dark-tech Gen-Z luxury cosmetic brand, asking the influencer for a collaboration.' 
                    })
                  })
                  const data = await res.json()
                  if (data.result) {
                    setSubject("Exclusive Collaboration with AURA Cosmetics")
                    setEmailBody(data.result.message || data.result)
                  } else {
                    alert("🤖 AI Error: " + (data.error || "Check VS Code Terminal"))
                  }
                } catch (err: any) {
                  alert("🌐 Network Error: " + err.message)
                } finally {
                  setIsGenerating(false)
                }
              }}
              className="btn-amber hover:bg-[#D4A847] hover:text-black transition-colors" style={{ padding: '6px 10px', fontSize: 9, background: 'transparent', border: '1px solid var(--amber)', color: 'var(--amber)' }} disabled={isGenerating}
            >
              {isGenerating ? 'GENERATING...' : '✦ AI COMPOSE'}
            </button>

          </div>
          <div style={{ fontSize: 13, color: 'var(--text1)', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: selectedIds.size > 0 ? 'var(--green)' : 'var(--text3)' }} />
            {selectedIds.size} influencers selected
          </div>
          
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 10, color: 'var(--text3)', letterSpacing: '0.12em', marginBottom: 8 }}>SUBJECT LINE</div>
            <input 
              type="text" 
              value={subject} 
              onChange={e => setSubject(e.target.value)}
              placeholder="Exciting collaboration opportunity..." 
              style={{ width: '100%', background: 'var(--surface3)', border: '1px solid var(--border)', padding: '10px 12px', borderRadius: 4, color: 'var(--text1)', fontSize: 13, outline: 'none' }} 
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 10, color: 'var(--text3)', letterSpacing: '0.12em', marginBottom: 8 }}>EMAIL BODY</div>
            <textarea 
              rows={10} 
              value={emailBody} 
              onChange={e => setEmailBody(e.target.value)}
              placeholder="Hi {NAME}, I'd love to explore a collaboration..." 
              style={{ width: '100%', background: 'var(--surface3)', border: '1px solid var(--border)', padding: '10px 12px', borderRadius: 4, color: 'var(--text1)', fontSize: 13, outline: 'none', resize: 'vertical', fontFamily: "'DM Mono', monospace" }} 
            />
          </div>

          <button 
            className="btn-amber" 
            style={{ width: '100%', padding: '12px' }} 
            disabled={selectedIds.size === 0 || isSending || !emailBody}
            onClick={async () => {
              setIsSending(true)
              try {
                const res = await fetch('/api/campaigns/send', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ subject, body: emailBody, influencerIds: Array.from(selectedIds) })
                })
                const data = await res.json()
                if (data.success) {
                  alert(`Successfully queued emails to ${selectedIds.size} influencers!`)
                  setSelectedIds(new Set()) 
                } else {
                  alert("Email Error: " + (data.error || "Check terminal"))
                }
              } catch (e:any) {
                 alert("Network Error: " + e.message)
              } finally {
                setIsSending(false)
              }
            }}
          >
            {isSending ? 'SENDING...' : `SEND TO ${selectedIds.size} INFLUENCERS`}
          </button>
        </div>

      </div>
    </div>
  )
}