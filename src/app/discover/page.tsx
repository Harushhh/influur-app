'use client'

import React, { useState, useMemo, useRef, useEffect } from 'react'

// --- TYPES ---
type Post = { id: string, imageUrl: string, likes: number, comments: number, views?: number }

type Creator = {
  id: string; username: string; name: string; avatar: string; bio: string;
  followers: number; engagement: number; location: string; category: string;
  realReach: number; cpm: number; emailUnlocked: boolean; email?: string;
  recentPosts: Post[];
  // Influencer Data
  isVerified: boolean; hasEmail: boolean; optedIn: boolean; gender: string;
  language: string; hashtags: string[]; mentions: string[]; growthRate: number;
  // Audience Data
  aqs: number; audAgeMin: number; audAgeMax: number; audLocation: string;
  audInterest: string; audLanguage: string; audGender: string; authenticity: number;
  // Performance Data
  daysSincePost: number; avgLikes: number; avgComments: number; avgViews: number;
  accountType: string;
}

const CATEGORIES = ['Events & Entertainment', 'Music', 'Food & Drinks', 'Beauty', 'Kids & Family', 'Health & Wellness', 'Photography', 'Art & Illustration', 'Tech & Gadgets', 'Finance & Crypto', 'Travel & Adventure', 'Fashion']
const LOCATIONS = ['Mumbai, Maharashtra, India', 'Delhi, India', 'Bangalore, Karnataka, India', 'Hyderabad, Telangana, India', 'Pune, Maharashtra, India', 'New York, USA', 'London, UK', 'Dubai, UAE']

// --- 🎚️ PRIMARY NAVBAR FILTERS ---
function SliderFilter({ label, value, min, max, step, formatFn, onChange, onClear }: any) {
  const [isOpen, setIsOpen] = useState(false); const ref = useRef<HTMLDivElement>(null); const isActive = value > min;
  useEffect(() => { const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false) }; document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h) }, [])
  const percentage = ((value - min) / (max - min)) * 100
  return (
    <div ref={ref} style={{ position: 'relative', userSelect: 'none' }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div onClick={() => setIsOpen(!isOpen)} style={{ padding: '10px 16px', background: isActive ? 'rgba(212, 168, 71, 0.05)' : '#121212', border: `1px solid ${isActive || isOpen ? '#D4A847' : '#333333'}`, borderRadius: isActive ? '8px 0 0 8px' : '8px', fontSize: '13px', color: isActive ? '#D4A847' : '#E5E5E5', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s ease', height: '42px' }}>
          <span style={{ fontWeight: 500 }}>{label}</span>{isActive && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#D4A847' }} />}
        </div>
        {isActive && <div onClick={onClear} style={{ padding: '0 12px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(212, 168, 71, 0.05)', border: '1px solid #D4A847', borderLeft: 'none', borderRadius: '0 8px 8px 0', color: '#D4A847', cursor: 'pointer', fontSize: '14px' }}>✕</div>}
      </div>
      {isOpen && (
        <div style={{ position: 'absolute', top: 'calc(100% + 8px)', left: 0, width: '260px', background: '#1A1A1A', border: '1px solid #333333', borderRadius: '12px', zIndex: 9999, padding: '20px', boxShadow: '0 10px 40px rgba(0,0,0,0.8)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'white' }}>{label}</span><span style={{ fontSize: '14px', color: '#D4A847', fontWeight: 600 }}>&ge; {formatFn(value)}</span>
          </div>
          <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="custom-range-slider" style={{ background: `linear-gradient(to right, #D4A847 ${percentage}%, #333 ${percentage}%)` }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontSize: '11px', color: '#71717a', fontWeight: 500 }}><span>{formatFn(min)}</span><span>{formatFn(max)}</span></div>
        </div>
      )}
    </div>
  )
}

function SearchableListFilter({ label, value, options, onChange, onClear }: any) {
  const [isOpen, setIsOpen] = useState(false); const [searchTerm, setSearchTerm] = useState('')
  const ref = useRef<HTMLDivElement>(null); const isActive = value !== ''
  useEffect(() => { const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false) }; document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h) }, [])
  const filtered = options.filter((o: string) => o.toLowerCase().includes(searchTerm.toLowerCase()))
  return (
    <div ref={ref} style={{ position: 'relative', userSelect: 'none' }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div onClick={() => setIsOpen(!isOpen)} style={{ padding: '10px 16px', background: isActive ? 'rgba(212, 168, 71, 0.05)' : '#121212', border: `1px solid ${isActive || isOpen ? '#D4A847' : '#333333'}`, borderRadius: isActive ? '8px 0 0 8px' : '8px', fontSize: '13px', color: isActive ? '#D4A847' : '#E5E5E5', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', height: '42px' }}>
          <span style={{ fontWeight: 500 }}>{isActive ? value : label}</span><span style={{ fontSize: '10px', color: '#71717a' }}>▼</span>
        </div>
        {isActive && <div onClick={onClear} style={{ padding: '0 12px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(212, 168, 71, 0.05)', border: '1px solid #D4A847', borderLeft: 'none', borderRadius: '0 8px 8px 0', color: '#D4A847', cursor: 'pointer', fontSize: '14px' }}>✕</div>}
      </div>
      {isOpen && (
        <div style={{ position: 'absolute', top: 'calc(100% + 8px)', left: 0, width: '240px', background: '#1A1A1A', border: '1px solid #333333', borderRadius: '12px', zIndex: 9999, padding: '12px', boxShadow: '0 10px 40px rgba(0,0,0,0.8)' }}>
          <input autoFocus value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder={`Search ${label}...`} style={{ width: '100%', padding: '10px 12px', background: '#121212', border: '1px solid #3f3f46', borderRadius: '6px', color: 'white', outline: 'none', fontSize: '13px', marginBottom: '12px' }} />
          <div className="custom-scrollbar" style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {filtered.map((opt: string) => <div key={opt} onClick={() => { onChange(opt); setIsOpen(false); setSearchTerm(''); }} style={{ padding: '10px 12px', fontSize: '13px', color: '#E5E5E5', cursor: 'pointer', borderRadius: '6px' }} onMouseEnter={e => e.currentTarget.style.background = '#27272a'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>{opt}</div>)}
          </div>
        </div>
      )}
    </div>
  )
}

function LocationAutocomplete({ value, onChange, onClear }: any) {
  const [isOpen, setIsOpen] = useState(false); const [searchTerm, setSearchTerm] = useState('')
  const ref = useRef<HTMLDivElement>(null); const isActive = value !== ''
  useEffect(() => { const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false) }; document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h) }, [])
  return (
    <div ref={ref} style={{ position: 'relative', userSelect: 'none' }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div onClick={() => setIsOpen(!isOpen)} style={{ padding: '10px 16px', background: isActive ? 'rgba(212, 168, 71, 0.05)' : '#121212', border: `1px solid ${isActive || isOpen ? '#D4A847' : '#333333'}`, borderRadius: isActive ? '8px 0 0 8px' : '8px', fontSize: '13px', color: isActive ? '#D4A847' : '#E5E5E5', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', height: '42px' }}>
          <span style={{ fontWeight: 500 }}>{isActive ? value.split(',')[0] : 'Location'}</span><span style={{ fontSize: '10px', color: '#71717a' }}>▼</span>
        </div>
        {isActive && <div onClick={onClear} style={{ padding: '0 12px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(212, 168, 71, 0.05)', border: '1px solid #D4A847', borderLeft: 'none', borderRadius: '0 8px 8px 0', color: '#D4A847', cursor: 'pointer' }}>✕</div>}
      </div>
      {isOpen && (
        <div style={{ position: 'absolute', top: 'calc(100% + 8px)', left: 0, width: '300px', background: '#1A1A1A', border: '1px solid #333333', borderRadius: '12px', zIndex: 9999, padding: '12px', boxShadow: '0 10px 40px rgba(0,0,0,0.8)' }}>
          <input autoFocus value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search cities..." style={{ width: '100%', padding: '10px 12px 10px 36px', background: '#121212', border: '1px solid #D4A847', borderRadius: '6px', color: 'white', outline: 'none', fontSize: '13px', marginBottom: '8px' }} />
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {searchTerm.length > 0 && LOCATIONS.filter(l => l.toLowerCase().includes(searchTerm.toLowerCase())).map((loc: string) => {
              const [city, ...rest] = loc.split(',')
              return (
                <div key={loc} onClick={() => { onChange(city); setIsOpen(false); setSearchTerm(''); }} style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', color: '#E5E5E5', cursor: 'pointer', borderBottom: '1px solid #27272a' }} onMouseEnter={e => e.currentTarget.style.background = '#27272a'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <div><strong style={{ color: 'white' }}>{city}</strong><span style={{ color: '#71717a', fontSize: '12px' }}>,{rest.join(',')}</span></div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// --- ⚡ ACCORDION HELPERS ---
function FilterAccordion({ title, id, expandedId, onToggle, children, isActive }: any) {
  const isOpen = expandedId === id
  return (
    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <div onClick={() => onToggle(id)} style={{ padding: '14px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', color: isOpen || isActive ? '#D4A847' : '#E5E5E5', fontSize: '13px', fontWeight: isOpen || isActive ? 600 : 400, transition: 'all 0.2s' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>{title}</span>
          {isActive && <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#D4A847' }} />}
        </div>
        <span style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: '0.2s', fontSize: '10px', color: '#71717a' }}>▼</span>
      </div>
      {isOpen && <div style={{ padding: '0 0 16px 0', animation: 'fadeIn 0.2s ease' }}>{children}</div>}
    </div>
  )
}

// --- MAIN PAGE COMPONENT ---
export default function DiscoverPage() {
  const [activeTab, setActiveTab] = useState('Handle')
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  
  const [results, setResults] = useState<Creator[]>([])
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null)

  // Primary Filters
  const [followerFilter, setFollowerFilter] = useState(0)
  const [engFilter, setEngFilter] = useState(0)
  const [categoryFilter, setCategoryFilter] = useState('')
  const [locationFilter, setLocationFilter] = useState('')

  // Advanced Mega Menu UI State
  const [isMoreFiltersOpen, setIsMoreFiltersOpen] = useState(false)
  const [expandedAccordion, setExpandedAccordion] = useState<string | null>(null)
  const toggleAccordion = (id: string) => setExpandedAccordion(prev => prev === id ? null : id)
  
  // 🧠 THE MASTER ADVANCED FILTER STATE
  const defaultAdv = {
    // Influencer
    optedIn: false, reqEmail: false, gender: '', language: '', hashtags: '', mentions: '', growthRate: 0, maxCpm: 0, reqVerified: false,
    // Audience
    aqsMin: 0, ageMin: 0, ageMax: 100, audLocation: '', audInterest: '', audLanguage: '', audGender: '', authMin: 0,
    // Performance
    daysSincePost: 365, estReachMin: 0, likesMin: 0, commentsMin: 0, viewsMin: 0,
    // Exclusion
    excKeyword: '', excLocation: '', excHashtag: '', excMention: '', accountType: ''
  }
  const [adv, setAdv] = useState(defaultAdv)
  const updateAdv = (key: keyof typeof adv, value: any) => setAdv(prev => ({ ...prev, [key]: value }))
  const clearAdv = () => setAdv(defaultAdv)

  const fmt = (n: number) => n >= 1000000 ? `${(n / 1000000).toFixed(1)}M` : n >= 1000 ? `${(n / 1000).toFixed(1)}K` : `${n}`
  const fmtEng = (n: number) => `${n}%`

  // ⚙️ THE UI FILTER ENGINE
  // This continues to run locally to allow users to refine their results instantly without hitting the DB again.
  const filteredResults = useMemo(() => {
    return results.filter(c => {
      // Primary
      if (c.followers < followerFilter) return false
      if (c.engagement < engFilter) return false
      if (categoryFilter && c.category !== categoryFilter) return false
      if (locationFilter && !c.location.toLowerCase().includes(locationFilter.toLowerCase())) return false
      
      // Influencer Advanced
      if (adv.optedIn && !c.optedIn) return false
      if (adv.reqEmail && !c.hasEmail) return false
      if (adv.reqVerified && !c.isVerified) return false
      if (adv.gender && c.gender.toLowerCase() !== adv.gender.toLowerCase()) return false
      if (adv.language && !c.language.toLowerCase().includes(adv.language.toLowerCase())) return false
      if (adv.hashtags && !c.hashtags.some(h => h.toLowerCase().includes(adv.hashtags.toLowerCase()))) return false
      if (adv.mentions && !c.mentions.some(m => m.toLowerCase().includes(adv.mentions.toLowerCase()))) return false
      if (adv.growthRate > 0 && c.growthRate < adv.growthRate) return false
      if (adv.maxCpm > 0 && c.cpm > adv.maxCpm) return false

      // Audience Advanced
      if (adv.aqsMin > 0 && c.aqs < adv.aqsMin) return false
      if (adv.ageMin > 0 && c.audAgeMin < adv.ageMin) return false
      if (adv.ageMax < 100 && c.audAgeMax > adv.ageMax) return false
      if (adv.audLocation && !c.audLocation.toLowerCase().includes(adv.audLocation.toLowerCase())) return false
      if (adv.audInterest && !c.audInterest.toLowerCase().includes(adv.audInterest.toLowerCase())) return false
      if (adv.audLanguage && !c.audLanguage.toLowerCase().includes(adv.audLanguage.toLowerCase())) return false
      if (adv.audGender && c.audGender.toLowerCase() !== adv.audGender.toLowerCase()) return false
      if (adv.authMin > 0 && c.authenticity < adv.authMin) return false

      // Performance Advanced
      if (c.daysSincePost > adv.daysSincePost) return false
      if (adv.estReachMin > 0 && c.realReach < adv.estReachMin) return false
      if (adv.likesMin > 0 && c.avgLikes < adv.likesMin) return false
      if (adv.commentsMin > 0 && c.avgComments < adv.commentsMin) return false
      if (adv.viewsMin > 0 && c.avgViews < adv.viewsMin) return false

      // Exclusions
      if (adv.excKeyword && c.bio.toLowerCase().includes(adv.excKeyword.toLowerCase())) return false
      if (adv.excLocation && c.location.toLowerCase().includes(adv.excLocation.toLowerCase())) return false
      if (adv.excHashtag && c.hashtags.some(h => h.toLowerCase().includes(adv.excHashtag.toLowerCase()))) return false
      if (adv.excMention && c.mentions.some(m => m.toLowerCase().includes(adv.excMention.toLowerCase()))) return false
      if (adv.accountType && c.accountType.toLowerCase() !== adv.accountType.toLowerCase()) return false

      return true
    })
  }, [results, followerFilter, engFilter, categoryFilter, locationFilter, adv])


  // 🚀 THE NEW SEARCH LOGIC WITH PROPER ERROR ALERTING 
  const handleSearch = async () => {
    const hasSearchQuery = searchQuery.trim().length > 0;
    
    // Check if any primary or advanced filter has been applied
    const hasFiltersApplied = 
      followerFilter > 0 || engFilter > 0 || categoryFilter !== '' || locationFilter !== '' ||
      adv.reqEmail || adv.reqVerified || adv.optedIn || adv.gender !== '' || adv.language !== '' ||
      adv.hashtags !== '' || adv.mentions !== '' || adv.growthRate > 0 || adv.maxCpm > 0 ||
      adv.aqsMin > 0 || adv.ageMin > 0 || adv.ageMax < 100 || adv.audLocation !== '' ||
      adv.audInterest !== '' || adv.audLanguage !== '' || adv.audGender !== '' || adv.authMin > 0 ||
      adv.daysSincePost < 365 || adv.estReachMin > 0 || adv.likesMin > 0 || adv.commentsMin > 0 ||
      adv.viewsMin > 0 || adv.excKeyword !== '' || adv.excLocation !== '' || adv.excHashtag !== '' ||
      adv.excMention !== '' || adv.accountType !== '';

    // If the user clicked Analyze but entered nothing and selected no filters, abort.
    if (!hasSearchQuery && !hasFiltersApplied) return;

    setIsSearching(true);
    const cleanHandle = searchQuery.replace('@', '');

    try {
      if (hasSearchQuery) {
        // ==========================================
        // TARGETED SEARCH (User typed a specific handle)
        // ==========================================
        if (activeTab === 'Lookalike') {
          // AI Lookalike Logic (pgvector)
          const res = await fetch('/api/search/lookalikes', { method: 'POST', body: JSON.stringify({ targetUsername: cleanHandle }) });
          const data = await res.json();
          if (data.success && data.lookalikes) {
            setResults(data.lookalikes.map((l: any, idx: number) => mapToUIModel(l, idx)));
          } else {
            alert(`❌ Lookalike Error: ${data.error || 'Failed to fetch'}`)
          }
        } else {
          // Standard API Competitor Scrape
          const response = await fetch(`/api/analytics/competitor?username=${cleanHandle}`);
          const json = await response.json();
          
          if (json.success) {
            setResults(prev => [mapToUIModel(json.data, Date.now()), ...prev]);
          } else {
            // 🔥 THIS WILL REVEAL THE EXACT ERROR 🔥
            alert(`❌ API Error: ${json.error || 'Failed to fetch creator data'}`)
            console.error("Backend Error Payload:", json)
          }
        }
        setSearchQuery('');
        
      } else if (hasFiltersApplied) {
        // ==========================================
        // DISCOVERY SEARCH (Pre-Fetch from Database)
        // ==========================================
        // Package all active filters to send to the server
        const activeFilters = {
          location: locationFilter,
          category: categoryFilter,
          followers: followerFilter,
          engagement: engFilter,
          ...adv 
        };

        // Call the Postgres Discovery Route
        const response = await fetch('/api/search/discover', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filters: activeFilters })
        });
        
        const json = await response.json();
        
        if (json.success && json.data && json.data.length > 0) {
          // Map the database results into the UI model
          setResults(json.data.map((creator: any, idx: number) => mapToUIModel(creator, `db_${idx}`)));
        } else {
          // Clear results if the database found no matches
          setResults([]);
        }
      }
    } catch (e: any) { 
      console.error(e);
      alert(`❌ Network/Syntax Error: ${e.message}`)
    } finally { 
      setIsSearching(false); 
    }
  }

  // 🔥 100% REAL DATA MAPPING 🔥
  const mapToUIModel = (d: any, key: string | number): Creator => {
    const followers = d.followers || d.followerCount || 0
    const engagement = parseFloat(d.avgEngagementRate || d.engagement || 0)
    const avgLikes = followers * (engagement / 100)
    const recentComments = d.recentComments || 0
    const mediaValue = (avgLikes * 2) + (recentComments / 10 * 15)
    const reachRaw = avgLikes * 2
    const rawPosts = d.recentPosts || d.media?.data || []
    
    const realPosts: Post[] = rawPosts.map((p: any, i: number) => ({
      id: p.id || `post_${key}_${i}`, imageUrl: p.media_url || p.display_url || p.imageUrl || '',
      likes: p.like_count || p.likes || 0, comments: p.comments_count || p.comments || 0, views: p.view_count || p.views || 0
    })).filter((p: Post) => p.imageUrl !== '')

    // If API is missing data, it defaults to falsy/0 values ensuring "No Mock Data" rule
    return {
      id: `creator_${key}`, username: d.username, name: d.name || d.username.toUpperCase(),
      avatar: d.profile_picture_url || d.avatarUrl || `https://ui-avatars.com/api/?name=${d.username}&background=D4A847&color=1A1A1A&bold=true`,
      bio: d.biography || "", followers: followers, engagement: engagement, location: d.location || "", category: d.category || "",
      realReach: reachRaw, cpm: mediaValue, emailUnlocked: false, recentPosts: realPosts,
      
      // Influencer Exact Fields
      isVerified: !!d.is_verified || !!d.isVerified, hasEmail: !!d.public_email || !!d.business_email || !!d.contactEmail,
      optedIn: !!d.optedIn, gender: d.gender || "", language: d.language || "English",
      hashtags: d.hashtags || [], mentions: d.mentions || [], growthRate: d.growthRate || 0,
      
      // Audience Exact Fields
      aqs: d.aqs || 0, audAgeMin: d.audienceAgeMin || 0, audAgeMax: d.audienceAgeMax || 100,
      audLocation: d.audienceLocation || "", audInterest: d.audienceInterest || "",
      audLanguage: d.audienceLanguage || "", audGender: d.audienceGender || "", authenticity: d.authenticityScore || 0,
      
      // Performance Exact Fields
      daysSincePost: d.daysSinceLastPost || 0, avgLikes: avgLikes, avgComments: recentComments, avgViews: d.avgViews || 0,
      accountType: d.account_type || d.accountType || ""
    }
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem', position: 'relative' }}>
      
      {/* CSS & HYDRATION FIX */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
        .hover-row:hover { background: rgba(255,255,255,0.03); }
        .custom-range-slider { -webkit-appearance: none; width: 100%; height: 6px; border-radius: 3px; outline: none; transition: background 0.1s; }
        .custom-range-slider::-webkit-slider-thumb { -webkit-appearance: none; width: 20px; height: 20px; border-radius: 50%; background: #1A1A1A; border: 3px solid #D4A847; cursor: pointer; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #3f3f46; border-radius: 4px; }
        .tech-checkbox { appearance: none; width: 16px; height: 16px; border: 1px solid #71717a; border-radius: 4px; background: #121212; cursor: pointer; position: relative; display: inline-block; vertical-align: middle; }
        .tech-checkbox:checked { background: #D4A847; border-color: #D4A847; }
        .tech-checkbox:checked::after { content: '✔'; position: absolute; color: black; font-size: 10px; top: 0px; left: 3px; font-weight: bold; }
        .adv-input { width: 100%; padding: 10px; background: #121212; border: 1px solid #3f3f46; border-radius: 6px; color: white; font-size: 13px; outline: none; margin-bottom: 8px; }
        .adv-input:focus { border-color: #D4A847; }
      `}} />
      
      {/* TABS */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '32px' }}>
        {['✦ AI', 'Text Match', 'Lookalike', 'Handle'].map(tab => (
          <button key={tab} onClick={() => { setActiveTab(tab); setResults([]); }} style={{ padding: '12px 32px', borderRadius: '8px', fontSize: '14px', fontWeight: 500, background: activeTab === tab ? 'rgba(212, 168, 71, 0.1)' : 'transparent', border: `1px solid ${activeTab === tab ? '#D4A847' : '#27272a'}`, color: activeTab === tab ? '#D4A847' : '#71717a', cursor: 'pointer' }}>{tab}</button>
        ))}
      </div>

      {/* SEARCH CONTAINER */}
      <div style={{ position: 'relative', background: '#18181b', padding: '2rem', borderRadius: '16px', border: '1px solid #27272a', marginBottom: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)', zIndex: 50 }}>
        
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} placeholder="Target any handle..." style={{ width: '100%', padding: '18px 24px 18px 52px', background: '#121212', border: '1px solid #27272a', borderRadius: '10px', color: 'white', outline: 'none', fontSize: '15px' }} />
            <span style={{ position: 'absolute', left: '20px', top: '18px', fontSize: '18px', opacity: 0.7 }}>🔍</span>
          </div>
          <button onClick={handleSearch} style={{ background: '#D4A847', color: 'black', padding: '0 48px', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', border: 'none', fontSize: '14px' }}>{isSearching ? 'SCANNING...' : 'ANALYZE'}</button>
        </div>

        {/* PRIMARY FILTER RIBBON */}
        <div style={{ display: 'flex', gap: '16px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
          <LocationAutocomplete value={locationFilter} onChange={setLocationFilter} onClear={() => setLocationFilter('')} />
          <SearchableListFilter label="Category" value={categoryFilter} options={CATEGORIES} onChange={setCategoryFilter} onClear={() => setCategoryFilter('')} />
          <SliderFilter label="Followers" value={followerFilter} min={0} max={5000000} step={10000} formatFn={fmt} onChange={setFollowerFilter} onClear={() => setFollowerFilter(0)} />
          <SliderFilter label="Engagement" value={engFilter} min={0} max={20} step={0.5} formatFn={fmtEng} onChange={setEngFilter} onClear={() => setEngFilter(0)} />
          
          <div style={{ marginLeft: 'auto' }}>
            <button onClick={() => setIsMoreFiltersOpen(!isMoreFiltersOpen)} style={{ padding: '10px 20px', background: isMoreFiltersOpen ? 'rgba(212, 168, 71, 0.1)' : 'transparent', border: `1px solid ${isMoreFiltersOpen ? '#D4A847' : '#3f3f46'}`, color: isMoreFiltersOpen ? '#D4A847' : '#E5E5E5', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s', height: '42px' }}>
              <span>⚙️</span> More filters
            </button>
          </div>
        </div>

        {/* 🚀 THE MEGA MENU (All 20+ Sub-filters) */}
        {isMoreFiltersOpen && (
          <div style={{ position: 'absolute', top: 'calc(100% + 12px)', left: 0, width: '100%', background: '#18181b', border: '1px solid #333333', borderRadius: '16px', padding: '32px', boxShadow: '0 20px 50px rgba(0,0,0,0.8)', zIndex: 100, animation: 'fadeIn 0.2s ease', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '40px', maxHeight: '600px', overflowY: 'auto' }} className="custom-scrollbar">
            
            {/* COLUMN 1: INFLUENCER */}
            <div>
              <h3 style={{ color: 'white', fontSize: '15px', fontWeight: 600, marginBottom: '20px', letterSpacing: '0.05em' }}>Influencer</h3>
              <FilterAccordion title="Opted-in" id="opt" expandedId={expandedAccordion} onToggle={toggleAccordion} isActive={adv.optedIn}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#a1a1aa', fontSize: '13px', cursor: 'pointer' }}><input type="checkbox" className="tech-checkbox" checked={adv.optedIn} onChange={e => updateAdv('optedIn', e.target.checked)} /> Show opted-in only</label>
              </FilterAccordion>
              <FilterAccordion title="Email" id="eml" expandedId={expandedAccordion} onToggle={toggleAccordion} isActive={adv.reqEmail}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#a1a1aa', fontSize: '13px', cursor: 'pointer' }}><input type="checkbox" className="tech-checkbox" checked={adv.reqEmail} onChange={e => updateAdv('reqEmail', e.target.checked)} /> Has public email</label>
              </FilterAccordion>
              <FilterAccordion title="Gender" id="gen" expandedId={expandedAccordion} onToggle={toggleAccordion} isActive={adv.gender !== ''}>
                <select className="adv-input" value={adv.gender} onChange={e => updateAdv('gender', e.target.value)}><option value="">Any</option><option value="male">Male</option><option value="female">Female</option></select>
              </FilterAccordion>
              <FilterAccordion title="Language" id="lang" expandedId={expandedAccordion} onToggle={toggleAccordion} isActive={adv.language !== ''}>
                <input className="adv-input" placeholder="e.g. Hindi, English" value={adv.language} onChange={e => updateAdv('language', e.target.value)} />
              </FilterAccordion>
              <FilterAccordion title="Hashtags" id="hash" expandedId={expandedAccordion} onToggle={toggleAccordion} isActive={adv.hashtags !== ''}>
                <input className="adv-input" placeholder="Must include hashtag..." value={adv.hashtags} onChange={e => updateAdv('hashtags', e.target.value)} />
              </FilterAccordion>
              <FilterAccordion title="Mentions" id="ment" expandedId={expandedAccordion} onToggle={toggleAccordion} isActive={adv.mentions !== ''}>
                <input className="adv-input" placeholder="@brand mention..." value={adv.mentions} onChange={e => updateAdv('mentions', e.target.value)} />
              </FilterAccordion>
              <FilterAccordion title="Followers growth rate" id="fgr" expandedId={expandedAccordion} onToggle={toggleAccordion} isActive={adv.growthRate > 0}>
                <input type="number" className="adv-input" placeholder="Min growth %" value={adv.growthRate || ''} onChange={e => updateAdv('growthRate', Number(e.target.value))} />
              </FilterAccordion>
              <FilterAccordion title="Est. cost per post" id="cpp" expandedId={expandedAccordion} onToggle={toggleAccordion} isActive={adv.maxCpm > 0}>
                <input type="number" className="adv-input" placeholder="Max budget (₹)" value={adv.maxCpm || ''} onChange={e => updateAdv('maxCpm', Number(e.target.value))} />
              </FilterAccordion>
              <FilterAccordion title="Verified" id="ver" expandedId={expandedAccordion} onToggle={toggleAccordion} isActive={adv.reqVerified}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#a1a1aa', fontSize: '13px', cursor: 'pointer' }}><input type="checkbox" className="tech-checkbox" checked={adv.reqVerified} onChange={e => updateAdv('reqVerified', e.target.checked)} /> Verified accounts only</label>
              </FilterAccordion>
            </div>

            {/* COLUMN 2: AUDIENCE */}
            <div>
              <h3 style={{ color: 'white', fontSize: '15px', fontWeight: 600, marginBottom: '20px', letterSpacing: '0.05em' }}>Audience</h3>
              <FilterAccordion title="AQS" id="aqs" expandedId={expandedAccordion} onToggle={toggleAccordion} isActive={adv.aqsMin > 0}>
                <input type="number" className="adv-input" placeholder="Min Quality Score (0-100)" value={adv.aqsMin || ''} onChange={e => updateAdv('aqsMin', Number(e.target.value))} />
              </FilterAccordion>
              <FilterAccordion title="Age range" id="age" expandedId={expandedAccordion} onToggle={toggleAccordion} isActive={adv.ageMin > 0 || adv.ageMax < 100}>
                 <div style={{ display: 'flex', gap: '8px' }}>
                   <input type="number" className="adv-input" placeholder="Min age" value={adv.ageMin || ''} onChange={e => updateAdv('ageMin', Number(e.target.value))} />
                   <input type="number" className="adv-input" placeholder="Max age" value={adv.ageMax === 100 ? '' : adv.ageMax} onChange={e => updateAdv('ageMax', Number(e.target.value))} />
                 </div>
              </FilterAccordion>
              <FilterAccordion title="Location" id="aloc" expandedId={expandedAccordion} onToggle={toggleAccordion} isActive={adv.audLocation !== ''}>
                <input className="adv-input" placeholder="Audience location..." value={adv.audLocation} onChange={e => updateAdv('audLocation', e.target.value)} />
              </FilterAccordion>
              <FilterAccordion title="Interest" id="aint" expandedId={expandedAccordion} onToggle={toggleAccordion} isActive={adv.audInterest !== ''}>
                <input className="adv-input" placeholder="Audience interests..." value={adv.audInterest} onChange={e => updateAdv('audInterest', e.target.value)} />
              </FilterAccordion>
              <FilterAccordion title="Language" id="alang" expandedId={expandedAccordion} onToggle={toggleAccordion} isActive={adv.audLanguage !== ''}>
                <input className="adv-input" placeholder="Audience language..." value={adv.audLanguage} onChange={e => updateAdv('audLanguage', e.target.value)} />
              </FilterAccordion>
              <FilterAccordion title="Gender" id="agen" expandedId={expandedAccordion} onToggle={toggleAccordion} isActive={adv.audGender !== ''}>
                 <select className="adv-input" value={adv.audGender} onChange={e => updateAdv('audGender', e.target.value)}><option value="">Any</option><option value="male">Male Skew</option><option value="female">Female Skew</option></select>
              </FilterAccordion>
              <FilterAccordion title="Authenticity" id="aauth" expandedId={expandedAccordion} onToggle={toggleAccordion} isActive={adv.authMin > 0}>
                <input type="number" className="adv-input" placeholder="Min Authenticity %" value={adv.authMin || ''} onChange={e => updateAdv('authMin', Number(e.target.value))} />
              </FilterAccordion>
            </div>

            {/* COLUMN 3: PERFORMANCE */}
            <div>
              <h3 style={{ color: 'white', fontSize: '15px', fontWeight: 600, marginBottom: '20px', letterSpacing: '0.05em' }}>Performance</h3>
              <FilterAccordion title="Days since last post" id="days" expandedId={expandedAccordion} onToggle={toggleAccordion} isActive={adv.daysSincePost < 365}>
                <input type="number" className="adv-input" placeholder="Max days inactive" value={adv.daysSincePost === 365 ? '' : adv.daysSincePost} onChange={e => updateAdv('daysSincePost', Number(e.target.value) || 365)} />
              </FilterAccordion>
              <FilterAccordion title="Estimated reach" id="er" expandedId={expandedAccordion} onToggle={toggleAccordion} isActive={adv.estReachMin > 0}>
                <input type="number" className="adv-input" placeholder="Min views/reach" value={adv.estReachMin || ''} onChange={e => updateAdv('estReachMin', Number(e.target.value))} />
              </FilterAccordion>
              <FilterAccordion title="Avg. likes per post" id="alk" expandedId={expandedAccordion} onToggle={toggleAccordion} isActive={adv.likesMin > 0}>
                <input type="number" className="adv-input" placeholder="Min average likes" value={adv.likesMin || ''} onChange={e => updateAdv('likesMin', Number(e.target.value))} />
              </FilterAccordion>
              <FilterAccordion title="Comments per post" id="acm" expandedId={expandedAccordion} onToggle={toggleAccordion} isActive={adv.commentsMin > 0}>
                <input type="number" className="adv-input" placeholder="Min average comments" value={adv.commentsMin || ''} onChange={e => updateAdv('commentsMin', Number(e.target.value))} />
              </FilterAccordion>
              <FilterAccordion title="Avg. views per video" id="avv" expandedId={expandedAccordion} onToggle={toggleAccordion} isActive={adv.viewsMin > 0}>
                <input type="number" className="adv-input" placeholder="Min video views" value={adv.viewsMin || ''} onChange={e => updateAdv('viewsMin', Number(e.target.value))} />
              </FilterAccordion>
            </div>

            {/* COLUMN 4: EXCLUSION */}
            <div>
              <h3 style={{ color: 'white', fontSize: '15px', fontWeight: 600, marginBottom: '20px', letterSpacing: '0.05em' }}>Exclusion</h3>
              <FilterAccordion title="Exclude keyword" id="xk" expandedId={expandedAccordion} onToggle={toggleAccordion} isActive={adv.excKeyword !== ''}>
                <input className="adv-input" placeholder="Must NOT contain word..." value={adv.excKeyword} onChange={e => updateAdv('excKeyword', e.target.value)} />
              </FilterAccordion>
              <FilterAccordion title="Exclude location" id="xl" expandedId={expandedAccordion} onToggle={toggleAccordion} isActive={adv.excLocation !== ''}>
                <input className="adv-input" placeholder="Exclude city/country..." value={adv.excLocation} onChange={e => updateAdv('excLocation', e.target.value)} />
              </FilterAccordion>
              <FilterAccordion title="Exclude hashtags" id="xh" expandedId={expandedAccordion} onToggle={toggleAccordion} isActive={adv.excHashtag !== ''}>
                <input className="adv-input" placeholder="Exclude #hashtag..." value={adv.excHashtag} onChange={e => updateAdv('excHashtag', e.target.value)} />
              </FilterAccordion>
              <FilterAccordion title="Exclude mentions" id="xm" expandedId={expandedAccordion} onToggle={toggleAccordion} isActive={adv.excMention !== ''}>
                <input className="adv-input" placeholder="Exclude @mention..." value={adv.excMention} onChange={e => updateAdv('excMention', e.target.value)} />
              </FilterAccordion>
              <FilterAccordion title="Account type" id="at" expandedId={expandedAccordion} onToggle={toggleAccordion} isActive={adv.accountType !== ''}>
                <select className="adv-input" value={adv.accountType} onChange={e => updateAdv('accountType', e.target.value)}><option value="">Any</option><option value="personal">Personal only</option><option value="business">Business / Creator</option></select>
              </FilterAccordion>
            </div>

            {/* BOTTOM ACTION BAR */}
            <div style={{ gridColumn: '1 / -1', borderTop: '1px solid #27272a', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ color: '#D4A847', fontSize: '13px', fontWeight: 500 }}>{filteredResults.length} creators match your advanced criteria</div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <button onClick={clearAdv} style={{ background: 'transparent', color: '#71717a', border: 'none', cursor: 'pointer', fontSize: '13px' }}>Clear All</button>
                <button onClick={() => setIsMoreFiltersOpen(false)} style={{ background: '#D4A847', color: 'black', padding: '8px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 700 }}>Apply & Close</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MATRIX TABLE */}
      <div style={{ background: '#18181b', borderRadius: '16px', border: '1px solid #27272a', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #27272a', background: 'rgba(255,255,255,0.02)' }}>
              <th style={{ padding: '20px', width: '50px' }}></th>
              <th style={{ padding: '20px', fontSize: '11px', color: '#71717a', letterSpacing: '0.1em', fontWeight: 600 }}>CREATOR</th>
              <th style={{ padding: '20px', fontSize: '11px', color: '#71717a', letterSpacing: '0.1em', fontWeight: 600 }}>METRICS</th>
              <th style={{ padding: '20px', fontSize: '11px', color: '#71717a', letterSpacing: '0.1em', fontWeight: 600 }}>NICHE & LOCATION</th>
              <th style={{ padding: '20px', textAlign: 'right', fontSize: '11px', color: '#71717a', letterSpacing: '0.1em', fontWeight: 600 }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredResults.map((c) => (
              <React.Fragment key={c.id}>
                <tr className="hover-row" onClick={() => setSelectedCreator(c)} style={{ borderBottom: '1px solid #27272a', cursor: 'pointer' }}>
                  <td style={{ padding: '20px', textAlign: 'center' }} onClick={(e) => { e.stopPropagation(); setExpandedRows(prev => { const n = new Set(prev); n.has(c.id) ? n.delete(c.id) : n.add(c.id); return n; }) }}><span style={{ color: '#71717a', cursor: 'pointer', display: 'inline-block', transform: expandedRows.has(c.id) ? 'rotate(90deg)' : 'none', transition: '0.2s', fontSize: '12px' }}>▶</span></td>
                  <td style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <div style={{ position: 'relative' }}>
                        {/* 🔥 FIXED AVATAR WITH FALLBACK 🔥 */}
                        <img 
                          src={c.avatar} 
                          onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${c.username}&background=D4A847&color=1A1A1A&bold=true` }}
                          style={{ width: '44px', height: '44px', borderRadius: '50%', border: '1px solid #3f3f46', objectFit: 'cover' }} 
                          alt=""
                        />
                        {c.isVerified && <div style={{ position: 'absolute', bottom: -4, right: -4, background: '#1da1f2', color: 'white', width: '16px', height: '16px', borderRadius: '50%', fontSize: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #18181b' }}>✓</div>}
                      </div>
                      <div>
                        <div style={{ fontSize: '15px', fontWeight: 600, color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {c.name} {c.hasEmail && <span title="Email Available" style={{ fontSize: '12px' }}>✉️</span>}
                        </div>
                        <div style={{ fontSize: '13px', color: '#71717a' }}>@{c.username}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '20px' }}><div style={{ fontWeight: 600, fontSize: '14px', color: 'white' }}>{fmt(c.followers)} <span style={{ color: '#71717a', fontSize: '11px', fontWeight: 400 }}>FLW</span></div><div style={{ color: '#34d399', fontWeight: 600, fontSize: '13px', marginTop: '4px' }}>{c.engagement.toFixed(2)}% <span style={{ color: '#71717a', fontSize: '11px', fontWeight: 400 }}>ENG</span></div></td>
                  <td style={{ padding: '20px' }}><div style={{ color: '#E5E5E5', fontSize: '13px', fontWeight: 500 }}>{c.category}</div><div style={{ color: '#a1a1aa', fontSize: '13px', marginTop: '4px' }}>📍 {c.location}</div></td>
                  <td style={{ padding: '20px', textAlign: 'right' }}>
                    {/* Add Save Button */}
                    <button 
                      onClick={async (e) => { 
                        e.stopPropagation(); 
                        try {
                          const res = await fetch('/api/saved-influencers', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ 
                              handle: c.username, 
                              name: c.name, 
                              followerCount: c.followers, 
                              engagementRate: c.engagement, 
                              avatarUrl: c.avatar, 
                              category: c.category 
                            })
                          });
                          const data = await res.json();
                          if (data.success) alert("✅ Saved to CRM!");
                          else alert("❌ Failed to save: " + data.error);
                        } catch(err) {
                          alert("❌ Network error saving to CRM.");
                        }
                      }} 
                      style={{ padding: '10px 18px', background: 'transparent', border: '1px solid #D4A847', color: '#D4A847', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', marginRight: '8px' }}
                    >
                      + CRM
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setActiveTab('Lookalike'); setSearchQuery(c.username); handleSearch(); }} style={{ padding: '10px 18px', background: 'transparent', border: '1px solid #27272a', color: 'white', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>⚲ Find Similar</button>
                  </td>
                </tr>
                {expandedRows.has(c.id) && (
                   <tr style={{ background: '#121212', borderBottom: '1px solid #27272a' }}>
                     <td colSpan={5} style={{ padding: '24px 40px' }}>
                        {c.recentPosts.length > 0 ? (
                          <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '8px' }}>
                            {c.recentPosts.map(post => (
                              <div key={post.id} style={{ minWidth: '180px', borderRadius: '10px', overflow: 'hidden', background: '#18181b', border: '1px solid #27272a', position: 'relative' }}>
                                <img src={post.imageUrl} alt="post" style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
                                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px', display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'white', background: 'linear-gradient(transparent, rgba(0,0,0,0.9))', fontWeight: 500 }}>
                                  <span>❤️ {fmt(post.likes)}</span>
                                  <span>💬 {post.comments}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div style={{ color: '#71717a', fontSize: '13px' }}>No recent media available from the API for this creator.</div>
                        )}
                     </td>
                   </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
        {filteredResults.length === 0 && !isSearching && <div style={{ padding: '120px', textAlign: 'center', color: '#71717a' }}>No active intelligence data matches your filters.</div>}
      </div>
    </div>
  )
}