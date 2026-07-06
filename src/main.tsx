import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// KendoReact base theme (dark). Imported before index.css so our token overrides win.
import '@progress/kendo-theme-default/dist/default-main-dark.css'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
