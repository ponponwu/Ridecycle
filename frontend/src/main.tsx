import React from 'react'
import { createRoot } from 'react-dom/client'
import AppWrapper from './AppWrapper'
import './index.css'
import './i18n'

// Make sure we create the root element properly
const rootElement = document.getElementById('root')

if (rootElement) {
    const root = createRoot(rootElement)
    root.render(<AppWrapper />)
} else {
    console.error('Root element not found in the document')
}
