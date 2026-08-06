import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import RoutesPage from './RoutesPage.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RoutesPage />
  </StrictMode>
)