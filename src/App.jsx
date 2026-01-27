// src/App.jsx
import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import posthog from 'posthog-js'
import './App.css'

// 1. Initialize PostHog
posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
  api_host: import.meta.env.VITE_POSTHOG_HOST,
  session_recording: { maskAllInputs: false },
  enable_recording_console_log: true
})

// --- Helper: Track Pageviews on Route Change ---
function PageTracker() {
  const location = useLocation()
  useEffect(() => {
    posthog.capture('$pageview')
  }, [location])
  return null
}

// --- Page 1: Home (Headline Experiment) ---
function Home() {
  const [headline, setHeadline] = useState('Welcome to our Product')
  const [heroVariant, setHeroVariant] = useState('control')

  useEffect(() => {
    posthog.onFeatureFlags(() => {
      // EXPERIMENT 1: Headline
      const variant = posthog.getFeatureFlag('hero-headline-experiment')
      if (variant === 'test') {
        setHeadline('🔥 DOMINATE YOUR MARKET WITH AI 🔥')
        setHeroVariant('test')
      } else {
        setHeadline('Simple, Reliable Software.')
        setHeroVariant('control')
      }
    })
  }, [])

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>{headline}</h1>
      <p>The best solution for your mock needs.</p>
      <br />
      <Link to="/pricing">
        <button 
          onClick={() => posthog.capture('clicked_check_pricing', { variant_seen: heroVariant })}
          style={{ padding: '15px 30px', fontSize: '18px', cursor: 'pointer', background: '#333', color: '#fff' }}
        >
          Check Pricing
        </button>
      </Link>
    </div>
  )
}

// --- Page 2: Pricing (The Middle Funnel) ---
// --- Component: Pricing Page (Fixed) ---
function Pricing() {
  return (
    <div style={{ 
      padding: '2rem', 
      textAlign: 'center', 
      background: '#f0f0f0', 
      minHeight: '80vh',
      color: '#333' // <--- FIX: Forces text to be dark grey/black
    }}>
      <h2>Pricing Plans</h2>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '20px' }}>
        
        {/* Free Plan */}
        <div style={{ border: '1px solid #ccc', padding: '20px', background: 'white', borderRadius: '8px' }}>
          <h3>Free</h3>
          <p>$0/mo</p>
        </div>

        {/* Pro Plan */}
        <div style={{ border: '2px solid #007bff', padding: '20px', background: 'white', borderRadius: '8px' }}>
          <h3>Pro</h3>
          <p>$99/mo</p>
          <Link to="/signup">
            <button 
              onClick={() => posthog.capture('selected_pro_plan')}
              style={{ background: '#007bff', color: 'white', padding: '10px', marginTop: '10px', borderRadius: '4px', cursor: 'pointer', border: 'none' }}
            >
              Choose Pro
            </button>
          </Link>
        </div>

      </div>
    </div>
  )
}

// --- Page 3: Signup (Button Color Experiment) ---
function Signup() {
  const [email, setEmail] = useState('')
  const [btnVariant, setBtnVariant] = useState('control')
  const navigate = useNavigate()

  useEffect(() => {
    // EXPERIMENT 2: Button Color (The Old Logic)
    posthog.onFeatureFlags(() => {
      const variant = posthog.getFeatureFlag('new-signup-button-color')
      if (variant) setBtnVariant(variant)
    })
  }, [])

  const handleSignup = () => {
    if (!email) return alert('Email required!')
    
    posthog.identify(email)
    
    // We capture WHICH button color they saw when they converted
    posthog.capture('signup_completed', { 
      plan: 'Pro',
      btn_color_variant: btnVariant 
    })
    
    alert('Conversion Successful!')
    navigate('/')
  }

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2>Final Step: Create Account</h2>
      <input 
        type="email" 
        placeholder="Enter email..." 
        value={email}
        onChange={(e) => setEmail(e.target.value)} 
        style={{ padding: '10px', width: '250px' }}
      />
      <br /><br />
      <button 
        onClick={handleSignup} 
        style={{ 
          padding: '10px 20px', 
          color: 'white',
          // If 'test' -> Orange, Else -> Green (Control)
          background: btnVariant === 'test' ? '#ff4500' : 'green', 
          cursor: 'pointer',
          border: 'none',
          fontSize: '16px'
        }}
      >
        {btnVariant === 'test' ? 'Sign Up NOW' : 'Complete Signup'}
      </button>
    </div>
  )
}

// --- Main App ---
function App() {
  return (
    <BrowserRouter>
      <PageTracker />
      <nav style={{ padding: '15px', borderBottom: '1px solid #ddd', display: 'flex', gap: '20px', justifyContent: 'center' }}>
        <Link to="/">Home</Link>
        <Link to="/pricing">Pricing</Link>
        <Link to="/signup">Signup</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App