import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import RoutesPage from './RoutesPage.jsx'
import './index.css'
import { startJavaEngine } from './lang/javaProvider.js'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RoutesPage />
  </StrictMode>
)

// Warm up the Java language engine (worker, parser, symbol index) as soon as the page has
// loaded, off the critical path. Editors register their own Monaco providers when they mount
// and talk to this already-warm shared worker, so the first suggestion is instant.
const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 500))
const boot = () => idle(() => startJavaEngine())
if (document.readyState === 'complete') boot()
else window.addEventListener('load', boot, { once: true })
