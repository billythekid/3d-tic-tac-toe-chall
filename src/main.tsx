import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import "./main.css"
import "./index.css"

if (import.meta.env.MODE == 'development') {
    await import('@github/spark/initializeTelemetry');
}

// Import for side effects only
import {} from '@github/spark/llm'

createRoot(document.getElementById('root')!).render(
    <App />
)
