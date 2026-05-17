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
    <div ref={ref} className="relative select-none">
      <div className="flex items-center">
        <div 
          onClick={() => setIsOpen(!isOpen)} 
          className={`px-4 py-2 text-[13px] font-medium flex items-center gap-2 cursor-pointer transition-all h-[42px] border ${
            isActive || isOpen ? 'border-brand-300 text-brand-600 bg-brand-50' : 'border-gray-200 text-gray-600 bg-white hover:bg-gray-50'
          } ${isActive ? 'rounded-l-xl border-r-0' : 'rounded-xl'}`}
        >
          <span>{label}</span>
          {isActive && <div className="w-1.5 h-1.5 rounded-full bg-brand-500" />}
        </div>
        {isActive && (
          <div 
            onClick={onClear} 
            className="px-3 h-[42px] flex items-center justify-center bg-brand-50 border border-brand-300 border-l-0 rounded-r-xl text-brand-500 hover:text-brand-700 cursor-pointer text-sm transition-colors"
          >
            ✕
          </div>
        )}
      </div>
      {isOpen && (
        <div className="absolute top-[calc(100%+8px)] left-0 w-[260px] bg-white border border-gray-100 rounded-2xl z-50 p-5 shadow-xl animate-fadeUp">
          <div className="flex justify-between items-center mb-5">
            <span className="text-sm font-bold text-gray-900">{label}</span>
            <span className="text-sm font-bold text-brand-600">&ge; {formatFn(value)}</span>
          </div>
          <input 
            type="range" min={min} max={max} step={step} value={value} 
            onChange={(e) => onChange(Number(e.target.value))} 
            className="custom-range-slider w-full h-1.5 bg-gray-200 rounded-full outline-none" 
            style={{ background: `linear-gradient(to right, #8b5cf6 ${percentage}%, #e5e7eb ${percentage}%)` }} 
          />
          <div className="flex justify-between mt-3 text-[11px] font-medium text-gray-400">
            <span>{formatFn(min)}</span><span>{formatFn(max)}</span>
          </div>
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
    <div ref={ref} className="relative select-none">
      <div className="flex items-center">
        <div 
          onClick={() => setIsOpen(!isOpen)} 
          className={`px-4 py-2 text-[13px] font-medium flex items-center gap-2 cursor-pointer transition-all h-[42px] border ${
            isActive || isOpen ? 'border-brand-300 text-brand-600 bg-brand-50' : 'border-gray-200 text-gray-600 bg-white hover:bg-gray-50'
          } ${isActive ? 'rounded-l-xl border-r-0' : 'rounded-xl'}`}
        >
          <span className="truncate max-w-[120px]">{isActive ? value : label}</span>
          <span className="text-[10px] text-gray-400">▼</span>
        </div>
        {isActive && (
          <div 
            onClick={onClear} 
            className="px-3 h-[42px] flex items-center justify-center bg-brand-50 border border-brand-300 border-l-0 rounded-r-xl text-brand-500 hover:text-brand-700 cursor-pointer text-sm transition-colors"
          >
            ✕
          </div>
        )}
      </div>
      {isOpen && (
        <div className="absolute top-[calc(100%+8px)] left-0 w-[240px] bg-white border border-gray-100 rounded-2xl z-50 p-3 shadow-xl animate-fadeUp">
          <input 
            autoFocus value={searchTerm} onChange={e => setSearchTerm(e.target.value)} 
            placeholder={`Search ${label}...`} 
            className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 outline-none text-[13px] mb-3 focus:border-brand-500 transition-colors" 
          />
          <div className="custom-scrollbar max-h-[200px] overflow-y-auto">
            {filtered.map((opt: string) => (
              <div 
                key={opt} onClick={() => { onChange(opt); setIsOpen(false); setSearchTerm(''); }} 
                className="px-3 py-2 text-[13px] text-gray-700 cursor-pointer rounded-lg hover:bg-gray-50 transition-colors"
              >
                {opt}
              </div>
            ))}
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
    <div ref={ref} className="relative select-none">
      <div className="flex items-center">
        <div 
          onClick={() => setIsOpen(!isOpen)} 
          className={`px-4 py-2 text-[13px] font-medium flex items-center gap-2 cursor-pointer transition-all h-[42px] border ${
            isActive || isOpen ? 'border-brand-300 text-brand-600 bg-brand-50' : 'border-gray-200 text-gray-600 bg-white hover:bg-gray-50'
          } ${isActive ? 'rounded-l-xl border-r-0' : 'rounded-xl'}`}
        >
          <span>{isActive ? value.split(',')[0] : 'Location'}</span>
          <span className="text-[10px] text-gray-400">▼</span>
        </div>
        {isActive && (
          <div 
            onClick={onClear} 
            className="px-3 h-[42px] flex items-center justify-center bg-brand-50 border border-brand-300 border-l-0 rounded-r-xl text-brand-500 hover:text-brand-700 cursor-pointer text-sm transition-colors"
          >
            ✕
          </div>
        )}
      </div>
      {isOpen && (
        <div className="absolute top-[calc(100%+8px)] left-0 w-[300px] bg-white border border-gray-100 rounded-2xl z-50 p-3 shadow-xl animate-fadeUp">
          <div className="relative">
             <span className="absolute left-3 top-2.5 text-gray-400 text-sm">📍</span>
             <input 
              autoFocus value={searchTerm} onChange={e => setSearchTerm(e.target.value)} 
              placeholder="Search cities..." 
              className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 outline-none text-[13px] mb-2 focus:border-brand-500 transition-colors" 
            />
          </div>
          <div className="max-h-[200px] overflow-y-auto custom-scrollbar">
            {searchTerm.length > 0 && LOCATIONS.filter(l => l.toLowerCase().includes(searchTerm.toLowerCase())).map((loc: string) => {
              const [city, ...rest] = loc.split(',')
              return (
                <div 
                  key={loc} onClick={() => { onChange(city); setIsOpen(false); setSearchTerm(''); }} 
                  className="px-3 py-2.5 flex items-center gap-3 text-[13px] cursor-pointer border-b border-gray-50 hover:bg-gray-50 transition-colors last:border-0"
                >
                  <div><strong className="text-gray-900">{city}</strong><span className="text-gray-400 text-xs">,{rest.join(',')}</span></div>
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
    <div className="border-b border-gray-100/50">
      <div 
        onClick={() => onToggle(id)} 
        className={`py-3.5 flex justify-between items-center cursor-pointer text-[13px] transition-colors ${
          isOpen || isActive ? 'text-brand-600 font-bold' : 'text-gray-600 font-medium hover:text-gray-900'
        }`}
      >
        <div className="flex items-center gap-2">
          <span>{title}</span>
          {isActive && <div className="w-1 h-1 rounded-full bg-brand-500" />}
        </div>
        <span className={`text-[10px] text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
      </div>
      {isOpen && <div className="pb-4 animate-fadeUp">{children}</div>}
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
            alert(`❌ API Error: ${json.error || 'Failed to fetch creator data'}`)
            console.error("Backend Error Payload:", json)
          }
        }
        setSearchQuery('');
        
      } else if (hasFiltersApplied) {
        // ==========================================
        // DISCOVERY SEARCH (Pre-Fetch from Database)
        // ==========================================
        const activeFilters = {
          location: locationFilter, category: categoryFilter, followers: followerFilter, engagement: engFilter, ...adv 
        };

        const response = await fetch('/api/search/discover', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ filters: activeFilters })
        });
        
        const json = await response.json();
        
        if (json.success && json.data && json.data.length > 0) {
          setResults(json.data.map((creator: any, idx: number) => mapToUIModel(creator, `db_${idx}`)));
        } else {
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

    return {
      id: `creator_${key}`, username: d.username, name: d.name || d.username.toUpperCase(),
      avatar: d.profile_picture_url || d.avatarUrl || `https://ui-avatars.com/api/?name=${d.username}&background=8b5cf6&color=fff&bold=true`,
      bio: d.biography || "", followers: followers, engagement: engagement, location: d.location || "", category: d.category || "",
      realReach: reachRaw, cpm: mediaValue, emailUnlocked: false, recentPosts: realPosts,
      
      isVerified: !!d.is_verified || !!d.isVerified, hasEmail: !!d.public_email || !!d.business_email || !!d.contactEmail,
      optedIn: !!d.optedIn, gender: d.gender || "", language: d.language || "English",
      hashtags: d.hashtags || [], mentions: d.mentions || [], growthRate: d.growthRate || 0,
      
      aqs: d.aqs || 0, audAgeMin: d.audienceAgeMin || 0, audAgeMax: d.audienceAgeMax || 100,
      audLocation: d.audienceLocation || "", audInterest: d.audienceInterest || "",
      audLanguage: d.audienceLanguage || "", audGender: d.audienceGender || "", authenticity: d.authenticityScore || 0,
      
      daysSincePost: d.daysSinceLastPost || 0, avgLikes: avgLikes, avgComments: recentComments, avgViews: d.avgViews || 0,
      accountType: d.account_type || d.accountType || ""
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-mesh py-12 px-4 sm:px-6 lg:px-8">
      
      {/* CSS & HYDRATION FIX FOR LIGHT MODE FORMS */}
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-range-slider::-webkit-slider-thumb { -webkit-appearance: none; width: 20px; height: 20px; border-radius: 50%; background: white; border: 3px solid #8b5cf6; cursor: pointer; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #d1d5db; }
        .tech-checkbox { appearance: none; width: 16px; height: 16px; border: 1px solid #d1d5db; border-radius: 4px; background: white; cursor: pointer; position: relative; display: inline-block; vertical-align: middle; transition: all 0.2s; }
        .tech-checkbox:checked { background: #8b5cf6; border-color: #8b5cf6; }
        .tech-checkbox:checked::after { content: '✔'; position: absolute; color: white; font-size: 10px; top: 0px; left: 3px; font-weight: bold; }
        .adv-input { width: 100%; padding: 10px 12px; background: white; border: 1px solid #e5e7eb; border-radius: 8px; color: #111827; font-size: 13px; outline: none; margin-bottom: 8px; transition: border-color 0.2s; }
        .adv-input:focus { border-color: #8b5cf6; }
        .adv-input::placeholder { color: #9ca3af; }
      `}} />
      
      <div className="max-w-6xl mx-auto animate-fadeUp flex flex-col items-center">
        
        {/* TABS */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {['✦ AI', 'Text Match', 'Lookalike', 'Handle'].map(tab => (
            <button 
              key={tab} 
              onClick={() => { setActiveTab(tab); setResults([]); }} 
              className={`px-6 py-2.5 rounded-xl text-sm font-bold tracking-wide transition-all ${
                activeTab === tab
                  ? 'bg-brand-50 text-brand-600 border-2 border-brand-200 shadow-sm'
                  : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* SEARCH CONTAINER */}
        <div className="w-full glass p-6 sm:p-8 rounded-4xl shadow-soft mb-8 z-20">
          
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl opacity-60">🔍</span>
              <input 
                value={searchQuery} 
                onChange={e => setSearchQuery(e.target.value)} 
                onKeyDown={e => e.key === 'Enter' && handleSearch()} 
                placeholder={activeTab === 'Handle' ? "Target any specific handle (e.g., @sarahstyles)..." : activeTab === 'Lookalike' ? "Enter a creator handle to find identical profiles..." : "Describe your ideal creator..."} 
                className="w-full bg-white/80 border border-gray-200 rounded-2xl pl-12 pr-4 py-4 text-sm text-gray-900 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-shadow shadow-sm placeholder:text-gray-400" 
              />
            </div>
            <button 
              onClick={handleSearch} 
              disabled={isSearching}
              className="bg-gray-900 hover:bg-black disabled:bg-gray-400 disabled:text-gray-200 text-white px-8 py-4 rounded-2xl font-bold tracking-wider uppercase shadow-soft transition-all md:w-auto text-sm"
            >
              {isSearching ? 'Scanning...' : 'Analyze'}
            </button>
          </div>

          {/* PRIMARY FILTER RIBBON */}
          <div className="flex gap-3 border-t border-gray-100/50 pt-6 items-center flex-wrap">
            <LocationAutocomplete value={locationFilter} onChange={setLocationFilter} onClear={() => setLocationFilter('')} />
            <SearchableListFilter label="Category" value={categoryFilter} options={CATEGORIES} onChange={setCategoryFilter} onClear={() => setCategoryFilter('')} />
            <SliderFilter label="Followers" value={followerFilter} min={0} max={5000000} step={10000} formatFn={fmt} onChange={setFollowerFilter} onClear={() => setFollowerFilter(0)} />
            <SliderFilter label="Engagement" value={engFilter} min={0} max={20} step={0.5} formatFn={fmtEng} onChange={setEngFilter} onClear={() => setEngFilter(0)} />
            
            <div className="ml-auto mt-2 sm:mt-0">
              <button 
                onClick={() => setIsMoreFiltersOpen(!isMoreFiltersOpen)} 
                className={`px-4 py-2 text-[13px] font-bold rounded-xl flex items-center gap-2 transition-all h-[42px] ${
                  isMoreFiltersOpen ? 'bg-brand-50 text-brand-600 border border-brand-200 shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                <span>⚙️</span> More filters
              </button>
            </div>
          </div>

          {/* 🚀 THE MEGA MENU (All 20+ Sub-filters) */}
          {isMoreFiltersOpen && (
            <div className="absolute top-[calc(100%+12px)] left-0 w-full bg-white/95 backdrop-blur-xl border border-gray-200 rounded-3xl p-8 shadow-2xl z-50 animate-fadeUp grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
              
              {/* COLUMN 1: INFLUENCER */}
              <div>
                <h3 className="text-gray-900 text-sm font-bold tracking-wide uppercase mb-4">Influencer</h3>
                <FilterAccordion title="Opted-in" id="opt" expandedId={expandedAccordion} onToggle={toggleAccordion} isActive={adv.optedIn}>
                  <label className="flex items-center gap-2 text-gray-600 text-[13px] cursor-pointer"><input type="checkbox" className="tech-checkbox" checked={adv.optedIn} onChange={e => updateAdv('optedIn', e.target.checked)} /> Show opted-in only</label>
                </FilterAccordion>
                <FilterAccordion title="Email" id="eml" expandedId={expandedAccordion} onToggle={toggleAccordion} isActive={adv.reqEmail}>
                  <label className="flex items-center gap-2 text-gray-600 text-[13px] cursor-pointer"><input type="checkbox" className="tech-checkbox" checked={adv.reqEmail} onChange={e => updateAdv('reqEmail', e.target.checked)} /> Has public email</label>
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
                  <input type="number" className="adv-input" placeholder="Max budget (USD)" value={adv.maxCpm || ''} onChange={e => updateAdv('maxCpm', Number(e.target.value))} />
                </FilterAccordion>
                <FilterAccordion title="Verified" id="ver" expandedId={expandedAccordion} onToggle={toggleAccordion} isActive={adv.reqVerified}>
                  <label className="flex items-center gap-2 text-gray-600 text-[13px] cursor-pointer"><input type="checkbox" className="tech-checkbox" checked={adv.reqVerified} onChange={e => updateAdv('reqVerified', e.target.checked)} /> Verified accounts only</label>
                </FilterAccordion>
              </div>

              {/* COLUMN 2: AUDIENCE */}
              <div>
                <h3 className="text-gray-900 text-sm font-bold tracking-wide uppercase mb-4">Audience</h3>
                <FilterAccordion title="AQS" id="aqs" expandedId={expandedAccordion} onToggle={toggleAccordion} isActive={adv.aqsMin > 0}>
                  <input type="number" className="adv-input" placeholder="Min Quality Score (0-100)" value={adv.aqsMin || ''} onChange={e => updateAdv('aqsMin', Number(e.target.value))} />
                </FilterAccordion>
                <FilterAccordion title="Age range" id="age" expandedId={expandedAccordion} onToggle={toggleAccordion} isActive={adv.ageMin > 0 || adv.ageMax < 100}>
                   <div className="flex gap-2">
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
                <h3 className="text-gray-900 text-sm font-bold tracking-wide uppercase mb-4">Performance</h3>
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
                <h3 className="text-gray-900 text-sm font-bold tracking-wide uppercase mb-4">Exclusion</h3>
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
              <div className="col-span-full border-t border-gray-100 pt-6 flex justify-between items-center mt-2">
                <div className="text-brand-600 text-[13px] font-bold">{filteredResults.length} creators match your advanced criteria</div>
                <div className="flex gap-4 items-center">
                  <button onClick={clearAdv} className="text-gray-500 hover:text-gray-900 font-medium text-[13px] transition-colors">Clear All</button>
                  <button onClick={() => setIsMoreFiltersOpen(false)} className="bg-gray-900 hover:bg-black text-white px-6 py-2.5 rounded-xl text-[13px] font-bold shadow-soft transition-all">Apply & Close</button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* MATRIX TABLE */}
        <div className="w-full glass rounded-3xl overflow-hidden shadow-soft">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-white/40 border-b border-gray-100/50">
                <th className="p-5 w-12"></th>
                <th className="p-5 text-[10px] font-bold text-gray-400 tracking-[0.16em] uppercase">Creator</th>
                <th className="p-5 text-[10px] font-bold text-gray-400 tracking-[0.16em] uppercase">Metrics</th>
                <th className="p-5 text-[10px] font-bold text-gray-400 tracking-[0.16em] uppercase">Niche & Location</th>
                <th className="p-5 text-[10px] font-bold text-gray-400 tracking-[0.16em] uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredResults.map((c) => (
                <React.Fragment key={c.id}>
                  <tr 
                    className="hover:bg-brand-50/50 transition-colors border-b border-gray-100/50 cursor-pointer"
                    onClick={() => setSelectedCreator(c)} 
                  >
                    <td className="p-5 text-center" onClick={(e) => { e.stopPropagation(); setExpandedRows(prev => { const n = new Set(prev); n.has(c.id) ? n.delete(c.id) : n.add(c.id); return n; }) }}>
                      <span className={`inline-block text-gray-400 cursor-pointer text-[12px] transition-transform duration-200 ${expandedRows.has(c.id) ? 'rotate-90' : ''}`}>▶</span>
                    </td>
                    <td className="p-5">
                      <div className="flex gap-4 items-center">
                        <div className="relative">
                          <img 
                            src={c.avatar} 
                            onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${c.username}&background=8b5cf6&color=fff&bold=true` }}
                            className="w-11 h-11 rounded-full border border-gray-200 object-cover shadow-sm" 
                            alt=""
                          />
                          {c.isVerified && <div className="absolute -bottom-1 -right-1 bg-[#1da1f2] text-white w-4 h-4 rounded-full text-[9px] flex items-center justify-center border-2 border-white">✓</div>}
                        </div>
                        <div>
                          <div className="text-[15px] font-bold text-gray-900 flex items-center gap-2">
                            {c.name} {c.hasEmail && <span title="Email Available" className="text-[12px]">✉️</span>}
                          </div>
                          <div className="text-[13px] font-medium text-gray-500">@{c.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="font-extrabold text-sm text-gray-900">{fmt(c.followers)} <span className="text-gray-400 text-[11px] font-medium">FLW</span></div>
                      <div className="text-emerald-600 font-extrabold text-[13px] mt-1">{c.engagement.toFixed(2)}% <span className="text-gray-400 text-[11px] font-medium">ENG</span></div>
                    </td>
                    <td className="p-5">
                      <div className="text-gray-700 text-[13px] font-bold">{c.category}</div>
                      <div className="text-gray-500 text-[13px] mt-1 font-medium">📍 {c.location}</div>
                    </td>
                    <td className="p-5 text-right flex justify-end items-center gap-2">
                      <button 
                        onClick={async (e) => { 
                          e.stopPropagation(); 
                          try {
                            const res = await fetch('/api/saved-influencers', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ handle: c.username, name: c.name, followerCount: c.followers, engagementRate: c.engagement, avatarUrl: c.avatar, category: c.category })
                            });
                            const data = await res.json();
                            if (data.success) alert("✅ Saved to CRM!");
                            else alert("❌ Failed to save: " + data.error);
                          } catch(err) { alert("❌ Network error saving to CRM."); }
                        }} 
                        className="px-4 py-2 bg-white hover:bg-brand-50 border border-brand-200 text-brand-600 rounded-lg text-xs font-bold transition-colors shadow-sm"
                      >
                        + CRM
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setActiveTab('Lookalike'); setSearchQuery(c.username); handleSearch(); }} 
                        className="px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 rounded-lg text-xs font-bold transition-colors shadow-sm"
                      >
                        ⚲ Find Similar
                      </button>
                    </td>
                  </tr>
                  
                  {/* EXPANDED RECENT POSTS ROW */}
                  {expandedRows.has(c.id) && (
                     <tr className="bg-gray-50/50 border-b border-gray-100/50">
                       <td colSpan={5} className="p-6 sm:px-10">
                          {c.recentPosts.length > 0 ? (
                            <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
                              {c.recentPosts.map(post => (
                                <div key={post.id} className="min-w-[180px] rounded-xl overflow-hidden bg-white border border-gray-200 relative shadow-sm hover:shadow-md transition-shadow">
                                  <img src={post.imageUrl} alt="post" className="w-full h-[180px] object-cover" />
                                  <div className="absolute bottom-0 left-0 right-0 p-3 flex justify-between text-xs text-white font-bold bg-gradient-to-t from-black/80 to-transparent">
                                    <span>❤️ {fmt(post.likes)}</span>
                                    <span>💬 {post.comments}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-gray-500 text-[13px] font-medium">No recent media available from the API for this creator.</div>
                          )}
                       </td>
                     </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
          {filteredResults.length === 0 && !isSearching && (
            <div className="p-24 text-center text-gray-500 font-medium">
              No active intelligence data matches your filters.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}