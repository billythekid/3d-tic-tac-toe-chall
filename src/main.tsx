import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import "./main.css"
import "./index.css"

// Removed GitHub Spark telemetry and LLM imports to fix build errors
// if (import.meta.env.MODE == 'development') {
//     await import('@github/spark/initializeTelemetry');
// }
// import {} from '@github/spark/llm'

createRoot(document.getElementById('root')!).render(
    <App />
)
