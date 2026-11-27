
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import RoutesPage from './RoutesPage.jsx'
import './index.css'
import { startJavaEngine } from './lang/javaProvider.js'
import { ClerkProvider } from '@clerk/react'
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ClerkProvider
      publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}
      signInFallbackRedirectUrl="https://snakestongue.github.io/Perscript/"
      signUpFallbackRedirectUrl="https://snakestongue.github.io/Perscript/"
      signOutFallbackRedirectUrl="https://snakestongue.github.io/Perscript/"

    >
      <RoutesPage />
    </ClerkProvider>
  </StrictMode>
)

// Warm up the Java language engine (worker, parser, symbol index) as soon as the page has
// loaded. Editors register their own Monaco providers when they mount
// and talk to this already-warm shared worker, so the first suggestion is instant.
const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 500))
const boot = () => idle(() => startJavaEngine())
if (document.readyState === 'complete') boot()
else window.addEventListener('load', boot, { once: true })
