import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ToneGenerator } from '@/components/toneLab/ToneGenerator'
import { AudioEngineProvider } from '@/components/AudioEngineProvider'
import { registerServiceWorker } from '@/core/registerServiceWorker'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AudioEngineProvider>
      <div className="tone-lab-layout">
        <ToneGenerator />
        <App />
      </div>
    </AudioEngineProvider>
  </StrictMode>,
)

registerServiceWorker()
