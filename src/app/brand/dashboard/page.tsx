'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function BrandDashboardPage() {
  // In a real app, this would fetch from your API. 
  // We start 'true' for loading, then set to 'false' to show the clean Empty State.
  const [loading, setLoading] = useState(true)
  const [hasActiveCampaigns, setHasActiveCampaigns] = useState(false) 

  useEffect(() => {
    // Simulate an API check for existing campaigns
    const fetchDashboardData = async () => {
      await new Promise(r => setTimeout(r, 800))
      setLoading(false)
    }
    fetchDashboardData()
  }, [])

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-mesh py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto animate-fadeUp">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-bold text-brand-600 tracking-[0.2em] uppercase">
                Acme Corp Workspace
              </span>
              <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Enterprise Plan
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight mt-2">
              Command <span className="text-gradient">Center</span>
            </h1>
          </div>
          
          {/* EXPLICIT CREATE CAMPAIGN BUTTON */}
          <Link 
            href="/brand/campaigns/new" 
            className="bg-brand-600 hover:bg-brand-500 text-white px-8 py-4 rounded-xl font-bold tracking-wide uppercase shadow-float transition-all hover:-translate-y-1 flex items-center gap-2"
          >
            <span className="text-xl leading-none mb-0.5">+</span> Create Campaign
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64 glass rounded-3xl">
            <div className="text-sm font-bold text-brand-600 animate-pulse tracking-widest uppercase">Loading Workspace...</div>
          </div>
        ) : (
          <>
            {/* The AI Daily Briefing (Welcome State) */}
            <div className="glass p-6 rounded-3xl mb-8 flex items-start gap-4 border-l-4 border-l-brand-500">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-100 to-accent-100 text-brand-600 flex items-center justify-center text-2xl shadow-sm flex-shrink-0">
                👋
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 tracking-wide uppercase mb-1">Welcome to Influur</h3>
                <p className="text-gray-600 text-sm leading-relaxed font-medium">
                  Your workspace is ready. To get started, you can either click <strong className="text-brand-600">Create Campaign</strong> to launch your first brief, or use the AI Scout below to discover creators.
                </p>
              </div>
            </div>

            {/* Live Pulse Metrics (Zero State) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[
                { label: 'Active Campaigns', value: '0', delta: 'Ready to launch' },
                { label: 'Creators in Pipeline', value: '0', delta: 'Awaiting outreach' },
                { label: 'Escrow Balance', value: '$0', delta: 'No pending funds' },
                { label: 'Live ROAS', value: '-', delta: 'Awaiting data' },
              ].map((metric, idx) => (
                <div key={idx} className="glass p-6 rounded-3xl hover:-translate-y-1 transition-transform duration-300">
                  <div className="text-[10px] font-bold text-gray-400 tracking-[0.16em] uppercase mb-2">
                    {metric.label}
                  </div>
                  <div className="text-3xl font-extrabold text-gray-300 mb-2">
                    {metric.value}
                  </div>
                  <div className="text-xs font-medium text-gray-400">
                    {metric.delta}
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Main Content Area: Pending Actions (Empty State) */}
              <div className="lg:col-span-2 glass rounded-3xl overflow-hidden flex flex-col h-[500px]">
                <div className="p-6 border-b border-gray-100/50 flex justify-between items-center bg-white/40">
                  <h3 className="text-sm font-bold text-gray-900 tracking-wide uppercase">Pending Actions</h3>
                </div>
                
                {/* Beautiful Empty State UI */}
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-3xl mb-4 shadow-sm border border-gray-100">
                    ✨
                  </div>
                  <h3 className="text-lg font-extrabold text-gray-900 mb-2">You're all caught up!</h3>
                  <p className="text-sm text-gray-500 font-medium max-w-sm mb-6 leading-relaxed">
                    Once you launch a campaign and start negotiating with creators, your tasks, content approvals, and escrow funding alerts will appear here.
                  </p>
                  <Link 
                    href="/brand/campaigns/new"
                    className="text-xs font-bold bg-gray-900 hover:bg-black text-white px-6 py-3 rounded-xl transition-colors shadow-soft uppercase tracking-wide"
                  >
                    Start Your First Campaign
                  </Link>
                </div>
              </div>

              {/* Right Sidebar: Quick Scout (Always Active) */}
              <div className="glass p-6 rounded-3xl h-[500px] flex flex-col">
                <h3 className="text-sm font-bold text-gray-900 tracking-wide uppercase mb-6">AI Talent Scout</h3>
                <p className="text-xs text-gray-500 font-medium leading-relaxed mb-4">
                  Describe your ideal creator in plain English. Our AI will search the live Meta Graph to find perfect matches.
                </p>
                
                <div className="flex-1">
                  <textarea 
                    placeholder="e.g., Find micro-influencers in Mumbai who talk about specialty coffee, have >3% engagement, and a Gen-Z audience..."
                    className="w-full h-32 bg-white/60 border border-gray-200 rounded-xl p-4 text-sm text-gray-700 focus:border-brand-500 outline-none resize-none shadow-sm mb-4 placeholder:text-gray-400"
                  />
                  <Link 
                    href="/discover"
                    className="w-full flex items-center justify-center bg-gradient-to-r from-brand-500 to-accent-500 hover:from-brand-600 hover:to-accent-600 text-white py-3.5 rounded-xl font-bold tracking-wide uppercase shadow-soft transition-all"
                  >
                    Search Creators
                  </Link>
                </div>
              </div>

            </div>
          </>
        )}
      </div>
    </div>
  )
}