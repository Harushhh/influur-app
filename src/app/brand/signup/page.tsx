'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function BrandSignUpPage() {
  const [companyName, setCompanyName] = useState('')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'idle' | 'creating' | 'workspace' | 'done'>('idle')

  const triggerSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !companyName) return
    
    setLoading(true)
    setStep('creating')
    await new Promise(r => setTimeout(r, 1000))
    setStep('workspace')
    await new Promise(r => setTimeout(r, 1200))
    setStep('done')

    // Redirect to the Brand Dashboard after successful registration
    window.location.href = '/brand/dashboard'
  }

  const stepMessages: Record<string, string> = {
    creating: 'Creating company profile...',
    workspace: 'Provisioning enterprise workspace...',
    done: 'Account created! Redirecting...',
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
          
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2 tracking-tight">Create Workspace</h2>
          <p className="text-sm text-gray-500 leading-relaxed mb-8">
            Register your brand to start sourcing creators, posting campaigns, and scaling your ROI.
          </p>

          {/* Sign Up Form */}
          <form onSubmit={triggerSignUp} className="text-left mb-6">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 tracking-[0.16em] uppercase mb-2">
                  Company Name
                </label>
                <input 
                  type="text" 
                  required
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  placeholder="Acme Corp" 
                  className="w-full bg-white/80 border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-gray-900 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all shadow-sm"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 tracking-[0.16em] uppercase mb-2">
                  Your Name
                </label>
                <input 
                  type="text" 
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Jane Doe" 
                  className="w-full bg-white/80 border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-gray-900 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all shadow-sm"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-[10px] font-bold text-gray-400 tracking-[0.16em] uppercase mb-2">
                Work Email
              </label>
              <input 
                type="email" 
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="jane@acmecorp.com" 
                className="w-full bg-white/80 border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-gray-900 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all shadow-sm"
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-[10px] font-bold text-gray-400 tracking-[0.16em] uppercase mb-2">
                Create Password
              </label>
              <input 
                type="password" 
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" 
                minLength={8}
                className="w-full bg-white/80 border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-gray-900 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all shadow-sm"
              />
            </div>

            {/* Step progress */}
            {loading && step !== 'idle' && (
              <div className="mb-6 text-center">
                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden mb-2">
                  <div 
                    className="h-full bg-brand-500 transition-all duration-700 ease-out rounded-full" 
                    style={{ width: step === 'creating' ? '40%' : step === 'workspace' ? '75%' : '100%' }} 
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
              className="w-full bg-brand-600 hover:bg-brand-500 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold tracking-wide uppercase shadow-float transition-all hover:-translate-y-0.5"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-xs text-gray-500 font-medium">
            Already have a brand account? <Link href="/brand/login" className="text-brand-600 font-bold hover:underline">Sign In here</Link>
          </p>
        </div>
      </div>
    </div>
  )
}