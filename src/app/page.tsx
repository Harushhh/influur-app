import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-mesh px-4 py-12 relative overflow-hidden animate-fadeUp">
      
      {/* Eyebrow Label */}
      <div className="text-xs font-bold text-brand-600 tracking-[0.2em] mb-6 uppercase">
        Welcome to Influur
      </div>
      
      {/* Headline */}
      <h1 className="text-5xl sm:text-7xl font-extrabold text-gray-900 mb-6 max-w-4xl leading-[1.1] text-center tracking-tight">
        The Elite Omni-Channel <br/>
        <span className="font-serif italic text-gradient pr-4">Influencer CRM</span>
      </h1>
      
      {/* Subtitle */}
      <p className="text-gray-600 text-lg sm:text-xl font-medium max-w-2xl mb-12 leading-relaxed text-center">
        Stop guessing. Start scaling. Discover verified creators, access live Meta Graph data, and automate your outreach campaigns in one intelligent platform.
      </p>
      
      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-5 z-10 w-full sm:w-auto">
        {/* BRAND ENTRY: Points to the brand login page */}
        <Link 
          href="/brand/login" 
          className="bg-brand-600 hover:bg-brand-500 text-white px-8 py-4 text-xs sm:text-sm font-bold rounded-2xl tracking-[0.1em] uppercase transition-all duration-300 hover:-translate-y-1 hover:shadow-float shadow-soft text-center"
        >
          Enter Brand Portal
        </Link>
        {/* CREATOR ENTRY: Points to the creator login page */}
        <Link 
          href="/influencer/login" 
          className="glass text-gray-700 hover:text-brand-600 px-8 py-4 text-xs sm:text-sm font-bold rounded-2xl tracking-[0.1em] uppercase transition-all duration-300 hover:-translate-y-1 text-center"
        >
          Creator Login
        </Link>
      </div>

    </div>
  )
}