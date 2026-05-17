'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function NewCampaignPage() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    platform: 'instagram',
    budget: '',
    deliverables: '1x Reel, 2x Stories',
    targetAudience: '',
  })
  
  const [loading, setLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // Simulate API request to save campaign brief
    await new Promise(r => setTimeout(r, 1500))
    
    setLoading(false)
    setIsSuccess(true)
  }

  if (isSuccess) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-mesh flex items-center justify-center p-4">
        <div className="glass p-10 rounded-4xl max-w-md w-full text-center animate-fadeUp">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6 shadow-sm">
            ✓
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2 tracking-tight">Campaign Brief Live!</h2>
          <p className="text-sm text-gray-500 font-medium mb-8 leading-relaxed">
            Your campaign <strong className="text-brand-600">"{formData.title}"</strong> has been successfully configured. You can now begin scouting matching creators.
          </p>
          <Link 
            href="/brand/dashboard"
            className="block w-full bg-gray-900 hover:bg-black text-white py-3.5 rounded-xl font-bold tracking-wide uppercase transition-colors text-sm shadow-soft"
          >
            Return to Command Center
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-mesh py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto animate-fadeUp">
        
        {/* Back navigation */}
        <Link href="/brand/dashboard" className="inline-flex items-center text-xs font-bold text-gray-400 hover:text-brand-600 tracking-wider uppercase mb-6 transition-colors">
          ← Back to Command Center
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Main Form Area */}
          <form onSubmit={handleSubmit} className="lg:col-span-2 glass p-8 rounded-4xl space-y-6">
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Create New Campaign</h2>
              <p className="text-xs font-medium text-gray-400 mt-1">Deploy an intelligent brief to match with the ideal creator demographics.</p>
            </div>

            {/* Campaign Title */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 tracking-[0.16em] uppercase mb-2">Campaign Name</label>
              <input 
                type="text" 
                required
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                placeholder="e.g., Summer Essentials Product Drop"
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-gray-900 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-shadow shadow-sm placeholder:text-gray-400"
              />
            </div>

            {/* Grid Layout for Configuration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 tracking-[0.16em] uppercase mb-2">Primary Platform</label>
                <select 
                  value={formData.platform}
                  onChange={e => setFormData({...formData, platform: e.target.value})}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-gray-900 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-shadow shadow-sm appearance-none"
                >
                  <option value="instagram">Instagram (Reels/Stories)</option>
                  <option value="tiktok">TikTok (Shortform Video)</option>
                  <option value="youtube">YouTube (Dedicated/Integration)</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 tracking-[0.16em] uppercase mb-2">Allocated Budget (USD)</label>
                <input 
                  type="number" 
                  required
                  value={formData.budget}
                  onChange={e => setFormData({...formData, budget: e.target.value})}
                  placeholder="e.g., 5000"
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-gray-900 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-shadow shadow-sm placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Deliverables Requirement */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 tracking-[0.16em] uppercase mb-2">Required Deliverables</label>
              <input 
                type="text" 
                required
                value={formData.deliverables}
                onChange={e => setFormData({...formData, deliverables: e.target.value})}
                placeholder="e.g., 1x Dedicated Reel, 2x Story Slides with Link Sticker"
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-gray-900 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-shadow shadow-sm placeholder:text-gray-400"
              />
            </div>

            {/* Target Audience Insights */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 tracking-[0.16em] uppercase mb-2">Target Audience & Niche</label>
              <textarea 
                rows={3}
                value={formData.targetAudience}
                onChange={e => setFormData({...formData, targetAudience: e.target.value})}
                placeholder="e.g., Gen Z females based in metro cities interested in sustainable makeup and cruelty-free clean skincare routines..."
                className="w-full bg-white border border-gray-200 rounded-xl p-4 text-sm text-gray-900 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-shadow shadow-sm resize-none placeholder:text-gray-400"
              />
            </div>

            {/* Main Creative Brief Instruction */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 tracking-[0.16em] uppercase mb-2">Campaign Objectives & Scope</label>
              <textarea 
                rows={4}
                required
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                placeholder="Describe the aesthetic requirements, brand vision, mandatory audio cues, hooks, and content restrictions..."
                className="w-full bg-white border border-gray-200 rounded-xl p-4 text-sm text-gray-900 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-shadow shadow-sm resize-y placeholder:text-gray-400"
              />
            </div>

            {/* Action Buttons */}
            <button 
              type="submit"
              disabled={loading || !formData.title || !formData.description || !formData.budget}
              className="w-full bg-gradient-to-r from-brand-600 to-accent-500 hover:from-brand-500 hover:to-accent-400 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold tracking-wide uppercase shadow-float transition-all hover:-translate-y-0.5 text-sm text-center"
            >
              {loading ? 'Compiling Brief Framework...' : 'Launch Campaign Brief'}
            </button>
          </form>

          {/* Educational Sidebar Info */}
          <div className="space-y-4">
            <div className="glass p-6 rounded-3xl">
              <div className="text-brand-600 text-xl font-bold mb-2">✦ Escrow Smart Guard</div>
              <p className="text-xs text-gray-500 font-medium leading-relaxed">
                Your budget remains safe. Funds are loaded securely into escrow and are released natively to content creators only after content verification checks clear.
              </p>
            </div>
            <div className="glass p-6 rounded-3xl">
              <div className="text-accent-500 text-xl font-bold mb-2">📸 Integrated IP Rights</div>
              <p className="text-xs text-gray-500 font-medium leading-relaxed">
                By processing briefs through Influur, usage rights terms are instantly baked straight into the dynamic creator-brand legal master agreements.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}