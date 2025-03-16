import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Main entry point for the React application that renders the App component to the DOM
createRoot(document.getElementById("root")!).render(<App />);
