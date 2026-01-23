// src/App.jsx
import { useEffect, useState } from 'react'
import posthog from 'posthog-js'
import './App.css'

// 1. Initialize PostHog
posthog.init('YOUR_POSTHOG_API_KEY_HERE', {
  api_host: 'https://us.i.posthog.com', // or 'https://eu.i.posthog.com'
  session_recording: {
    maskAllInputs: false, // Easier to debug for mock apps
  }
})

function App() {
  const [featureVariant, setFeatureVariant] = useState('control')
  const [email, setEmail] = useState('')

  useEffect(() => {
    // 2. A/B Testing Logic
    // We listen for the flag load event to prevent flickering
    posthog.onFeatureFlags(() => {
      const variant = posthog.getFeatureFlag('new-signup-button-color')
      if (variant) setFeatureVariant(variant)
    })
  }, [])

  // 3. Product Analytics: Tracking Events
  const handleSignup = () => {
    if (!email) return alert("Enter an email!")
    
    // Track the event
    posthog.capture('signup_completed', { 
      method: 'email', 
      variant_seen: featureVariant 
    })
    
    // Identify the user (Critical for "Business View")
    posthog.identify(email) 
    alert(`Signed up as ${email} using ${featureVariant} button!`)
  }

  // Simulate an Error for "Dev View"
  const triggerError = () => {
    console.error("Critical Payment Failure!")
    throw new Error("Mock Payment 500 Error")
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial' }}>
      <h1>Mock SaaS Product</h1>
      
      {/* Product Analytics Section */}
      <div style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '1rem' }}>
        <h2>Sign Up Flow</h2>
        <input 
          type="email" 
          placeholder="user@example.com" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <br /><br />
        
        {/* A/B Test Implementation */}
        <button 
          onClick={handleSignup}
          style={{
            backgroundColor: featureVariant === 'test' ? '#ff4500' : '#007bff',
            color: 'white',
            padding: '10px 20px',
            fontSize: '16px',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          {featureVariant === 'test' ? 'Get Started NOW (Test)' : 'Sign Up (Control)'}
        </button>
      </div>

      {/* Dev View Section */}
      <div style={{ border: '1px solid #red', padding: '1rem', background: '#fff0f0' }}>
        <h3>Dev Zone</h3>
        <button onClick={triggerError}>Trigger 500 Error</button>
        <p>Click this to test "Console Logs" in Session Replay</p>
      </div>
    </div>
  )
}

export default App