'use client'

import { useState } from 'react'

export default function InfluencerLoginPage() {
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'idle' | 'connecting' | 'permissions' | 'done'>('idle')

  const triggerRealOAuth = async () => {
    setLoading(true)
    setStep('connecting')
    await new Promise(r => setTimeout(r, 1200))
    setStep('permissions')
    await new Promise(r => setTimeout(r, 1500))
    setStep('done')

    // 🔥 THE FIX: Force the browser to overwrite any old brand cookie with the Creator role!
    document.cookie = "influur_role=creator; path=/; max-age=86400"

    // Send the user to your real backend route to trigger the Meta/Instagram Auth!
    // NOTE: If your backend isn't running right now, you can temporarily change this to '/influencer/dashboard' for frontend testing.
    window.location.href = '/api/auth/instagram'
  }

  const stepMessages: Record<string, string> = {
    connecting: 'Connecting to Instagram...',
    permissions: 'Requesting analytics permissions...',
    done: 'Authenticated! Redirecting...',
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-mesh px-4 py-12 relative overflow-hidden">
      <div className="w-full max-w-md animate-fadeUp z-10">

        {/* Logo area */}
        <div className="text-center mb-8">
          <div className="font-extrabold text-3xl tracking-tight text-gray-900 mb-1">
            INFLUUR<span className="text-brand-600">.</span>
          </div>
          <div className="text-xs font-bold text-brand-600 tracking-[0.2em] uppercase">Creator Studio</div>
        </div>

        {/* Main Card */}
        <div className="glass p-8 sm:p-10 rounded-4xl shadow-soft text-center mb-4">
          
          {/* Instagram icon */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white flex items-center justify-center mx-auto mb-6 shadow-md">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
            </svg>
          </div>

          <h2 className="text-2xl font-extrabold text-gray-900 mb-2 tracking-tight">Connect Instagram</h2>
          <p className="text-sm text-gray-500 leading-relaxed mb-6">
            Link your Instagram account to unlock deep analytics, schedule posts, and receive brand partnership opportunities.
          </p>

          {/* Permissions list */}
          <div className="bg-white/60 border border-gray-100 rounded-2xl p-4 mb-6 text-left shadow-sm">
            <div className="text-[10px] font-bold text-gray-400 tracking-[0.16em] uppercase mb-3">We request access to</div>
            {[
              ['📊', 'Insights & Analytics', 'Reach, impressions, profile views'],
              ['📅', 'Content Publishing', 'Schedule and publish posts'],
              ['👤', 'Basic Profile Info', 'Name, handle, follower count'],
            ].map(([icon, title, sub]) => (
              <div key={title} className="flex gap-3 items-start mb-3 last:mb-0">
                <span className="text-lg">{icon}</span>
                <div>
                  <div className="text-sm font-bold text-gray-900">{title}</div>
                  <div className="text-xs font-medium text-gray-500 mt-0.5">{sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Step progress */}
          {loading && step !== 'idle' && (
            <div className="mb-6">
              <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden mb-2">
                <div 
                  className="h-full bg-brand-500 transition-all duration-700 ease-out rounded-full" 
                  style={{ width: step === 'connecting' ? '40%' : step === 'permissions' ? '75%' : '100%' }} 
                />
              </div>
              <div className="text-xs font-bold text-brand-600 tracking-wide animate-pulse">{stepMessages[step]}</div>
            </div>
          )}

          <button 
            onClick={triggerRealOAuth} 
            disabled={loading} 
            className="w-full bg-gray-900 hover:bg-black disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold tracking-wide uppercase shadow-soft transition-all"
          >
            {loading ? 'Authenticating...' : 'Connect with Instagram'}
          </button>

          <p className="text-[10px] text-gray-400 mt-5 leading-relaxed font-medium">
            We never post without your permission. Your data is encrypted and never sold. <br/>
            <a href="#" className="text-gray-600 underline hover:text-gray-900 transition-colors">Privacy Policy</a>
          </p>
        </div>

        {/* Influencer benefits */}
        <div className="grid grid-cols-3 gap-3">
          {[
            ['Deep Analytics', 'Reach & impressions'], 
            ['Auto-Schedule', 'Post at peak times'], 
            ['Brand Deals', 'Inbound opportunities']
          ].map(([t, s]) => (
            <div key={t} className="glass p-3 rounded-2xl text-center flex flex-col justify-center transition-transform hover:-translate-y-1">
              <div className="text-xs font-bold text-brand-600 mb-1 leading-tight">{t}</div>
              <div className="text-[10px] text-gray-500 font-medium leading-tight">{s}</div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}