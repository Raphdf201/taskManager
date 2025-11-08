import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import './index.css'
import App from './App'
import Aurora from './Components/Aurora'

const rootElement = document.getElementById('root')
if (rootElement) {
    createRoot(rootElement).render(
        <StrictMode>
            <div style={{
                width: '100vw',
                height: '100vh',
                position: 'relative',
                backgroundColor: '#000000'
            }}>
                <div style={{ position: 'absolute', inset: 0 }}>
                    <Aurora
                        colorStops={["#ffff2e", "#ed8ef5", "#000000"]}
                        blend={0.5}
                        amplitude={1.0}
                        speed={0.5}
                    />
                </div>
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <App/>
                </div>
            </div>
        </StrictMode>
    )
}