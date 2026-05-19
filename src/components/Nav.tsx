'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function Navbar() {
  const path = usePathname()
  
  const [role, setRole] = useState<'brand' | 'creator' | 'guest'>('guest')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // 1. Try to read the authentication cookie
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`
      const parts = value.split(`; ${name}=`)
      if (parts.length === 2) return parts.pop()?.split(';').shift()
      return null
    }
    const currentRole = getCookie('influur_role')

    // 2. Failsafe: If no cookie exists (because we are testing), check the URL path!
    const isBrandRoute = path?.startsWith('/brand/dashboard') || path?.includes('/discover') || path?.includes('/messages') || path?.startsWith('/brand/campaigns')
    const isCreatorRoute = path?.startsWith('/influencer/dashboard') || path?.includes('/influencer/marketplace')

    if (currentRole === 'brand' || isBrandRoute) {
      setRole('brand')
    } else if (currentRole === 'creator' || isCreatorRoute) {
      setRole('creator')
    } else {
      setRole('guest')
    }
  }, [path]) 

  // Dynamically generate the navigation links based on user role
  const getNavLinks = () => {
    if (role === 'brand') {
      return [
        { href: '/brand/dashboard', label: 'Command Center' },
        { href: '/discover', label: 'Talent Scout' },
        { href: '/messages', label: 'Messages' },
      ]
    }
    if (role === 'creator') {
      return [
        { href: '/influencer/dashboard', label: 'Creator Studio' },
        { href: '/influencer/marketplace', label: 'Explore Campaigns' },
        { href: '/messages', label: 'Messages' },
      ]
    }
    // Guest Links - Updated to route directly to the dashboard
    return [
      { href: '/brand/dashboard', label: 'Brand Portal' },
      { href: '/influencer/login', label: 'Creator Portal' },
    ]
  }

  // Prevent UI flashing during server-side rendering
  if (!mounted) return <nav className="h-16 bg-white border-b border-gray-200 sticky top-0 z-50"></nav>

  return (
    <nav className="bg-white/90 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1">
            <span className="font-extrabold text-2xl tracking-tight text-gray-900">
              INFLUUR<span className="text-brand-600">.</span>
            </span>
          </Link>

          {/* Dynamic Desktop Links */}
          <div className="flex items-center gap-4 sm:gap-8">
            {getNavLinks().map((link) => {
              const isActive = path?.startsWith(link.href)
              return (
                <Link 
                  key={link.href} 
                  href={link.href}
                  className={`text-xs sm:text-sm font-bold tracking-wide transition-colors h-16 flex items-center border-b-2 ${
                    isActive 
                      ? 'text-brand-600 border-brand-600' 
                      : 'text-gray-500 hover:text-gray-900 border-transparent'
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
          </div>

          {/* Action Button / Profile Menu */}
          <div className="hidden sm:flex items-center">
            {role === 'guest' ? (
              <Link href="/discover" className="bg-gray-900 hover:bg-black text-white text-sm font-bold tracking-wide px-6 py-2.5 rounded-xl transition-colors shadow-soft">
                Explore Directory
              </Link>
            ) : (
              <div className="flex items-center gap-3 cursor-pointer group">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-500 to-accent-500 text-white flex items-center justify-center font-bold shadow-soft group-hover:scale-105 transition-transform">
                  {role === 'brand' ? 'B' : 'C'}
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-900">{role === 'brand' ? 'Acme Corp' : 'Sarah Styles'}</div>
                  <div className="text-[10px] font-medium text-gray-500 uppercase tracking-widest">{role} Account</div>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </nav>
  )
}