'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function MessagesPage() {
  // We start with an empty array. No fake data!
  const [conversations, setConversations] = useState([])

  return (
    <div className="h-[calc(100vh-4rem)] bg-mesh p-4 sm:p-6 lg:p-8 flex items-center justify-center">
      <div className="w-full max-w-6xl h-full glass rounded-4xl shadow-soft flex overflow-hidden border border-white/60 animate-fadeUp">
        
        {/* LEFT PANE: Chat List (Empty) */}
        <div className="w-full md:w-1/3 bg-white/40 border-r border-gray-100 flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-100/50">
            <h2 className="text-xl font-extrabold text-gray-900 tracking-tight mb-1">Messages</h2>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-widest flex items-center justify-between">
              Active Negotiations
              <span className="bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full text-[9px] font-bold">0</span>
            </div>
          </div>
          
          {/* Empty Conversation List Area */}
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center opacity-70">
            <div className="text-3xl mb-3">💬</div>
            <p className="text-sm font-bold text-gray-400">No active chats</p>
          </div>
        </div>

        {/* RIGHT PANE: Beautiful Empty State */}
        <div className="hidden md:flex w-2/3 flex-col h-full bg-white/20 items-center justify-center p-12 text-center relative overflow-hidden">
          
          {/* Decorative background elements */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

          <div className="relative z-10 animate-fadeUp">
            <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center text-4xl shadow-sm border border-gray-100 mx-auto mb-6">
              ✨
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-3 tracking-tight">
              Your Inbox is Quiet
            </h2>
            <p className="text-sm text-gray-500 font-medium max-w-md mx-auto mb-8 leading-relaxed">
              This is your negotiation workspace. Once you scout creators and invite them to your campaigns, your chat threads, contract approvals, and escrow releases will appear here.
            </p>
            
            <div className="flex items-center justify-center gap-4">
              <Link 
                href="/discover"
                className="bg-gray-900 hover:bg-black text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-soft hover:-translate-y-0.5"
              >
                Scout Talent
              </Link>
              <Link 
                href="/brand/campaigns/new"
                className="bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-sm hover:-translate-y-0.5"
              >
                Create Campaign
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}