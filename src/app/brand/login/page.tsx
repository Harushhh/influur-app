'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function BrandLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'idle' | 'authenticating' | 'workspace' | 'done'>('idle')

  const triggerLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    
    setLoading(true)
    setStep('authenticating')
    await new Promise(r => setTimeout(r, 1000))
    setStep('workspace')
    await new Promise(r => setTimeout(r, 1200))
    setStep('done')

    document.cookie = "influur_role=brand; path=/; max-age=86400"
    
    // ✨ THE FIX: Route them directly to the Campaign Creation page!
    router.push('/brand/campaigns/new')
  }

  const stepMessages: Record<string, string> = {
    authenticating: 'Verifying credentials...',
    workspace: 'Loading enterprise workspace...',
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
          <div className="text-xs font-bold text-brand-600 tracking-[0.2em] uppercase">Enterprise Portal</div>
        </div>

        {/* Main Card */}
        <div className="glass p-8 sm:p-10 rounded-4xl shadow-soft text-center mb-4">
          
          {/* Brand Icon */}
          <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-6 shadow-sm border border-brand-100 text-3xl">
            🏢
          </div>

          <h2 className="text-2xl font-extrabold text-gray-900 mb-2 tracking-tight">Welcome Back</h2>
          <p className="text-sm text-gray-500 leading-relaxed mb-8">
            Sign in to your brand workspace to manage campaigns, review creator pitches, and track ROI.
          </p>

          {/* Login Form */}
          <form onSubmit={triggerLogin} className="text-left mb-6">
            <div className="mb-4">
              <label className="block text-[10px] font-bold text-gray-400 tracking-[0.16em] uppercase mb-2">
                Work Email
              </label>
              <input 
                type="email" 
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@company.com" 
                className="w-full bg-white/80 border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-gray-900 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all shadow-sm"
              />
            </div>
            
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-[10px] font-bold text-gray-400 tracking-[0.16em] uppercase">
                  Password
                </label>
                <a href="#" className="text-xs font-medium text-brand-600 hover:text-brand-700 transition-colors">
                  Forgot?
                </a>
              </div>
              <input 
                type="password" 
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" 
                className="w-full bg-white/80 border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-gray-900 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all shadow-sm"
              />
            </div>

            {/* Step progress */}
            {loading && step !== 'idle' && (
              <div className="mb-6 text-center">
                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden mb-2">
                  <div 
                    className="h-full bg-brand-500 transition-all duration-700 ease-out rounded-full" 
                    style={{ width: step === 'authenticating' ? '40%' : step === 'workspace' ? '75%' : '100%' }} 
                  />
                </div>
                <div className="text-xs font-bold text-brand-600 tracking-wide animate-pulse">
                  {stepMessages[step]}
                </div>
              </div>
            )}

            <button 
              type="submit"
              disabled={loading} 
              className="w-full bg-gray-900 hover:bg-black disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold tracking-wide uppercase shadow-soft transition-all"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <p className="text-xs text-gray-500 font-medium">
            Don't have a brand account? <Link href="/brand/signup" className="text-brand-600 font-bold hover:underline">Sign Up here</Link>
          </p>
        </div>

        {/* Brand Platform Benefits */}
        <div className="grid grid-cols-3 gap-3">
          {[
            ['Discover Talent', 'AI-powered search'], 
            ['Manage Briefs', 'Streamlined workflows'], 
            ['Track ROI', 'Real-time analytics']
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