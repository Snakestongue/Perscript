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
      signInForceRedirectUrl="https://snakestongue.github.io/Perscript/"
      signUpForceRedirectUrl="https://snakestongue.github.io/Perscript/"
      afterSignOutUrl="https://snakestongue.github.io/Perscript/"
    >
      <RoutesPage />
    </ClerkProvider>
  </StrictMode>
)

const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 500))
const boot = () => idle(() => startJavaEngine())

if (document.readyState === 'complete') boot()
else window.addEventListener('load', boot, { once: true })