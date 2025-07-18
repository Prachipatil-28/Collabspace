import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ContextProvider } from './store/ContextApi.jsx';
import { BrowserRouter as Router } from 'react-router-dom';
import { AppProvider } from './store/AppContext.jsx';
import { ThemeProvider } from './store/ThemeProvider.jsx';

createRoot(document.getElementById('root')).render(
    <Router> 
    <ContextProvider>
    <AppProvider>
        <ThemeProvider>
    <App />
    </ThemeProvider>
    </AppProvider >
    </ContextProvider>
    </Router>
)
