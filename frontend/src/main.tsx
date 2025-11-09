import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import './index.css'
import App from './App'
import Aurora from './Components/Aurora'
import HomeText from './Components/HomeText' // Add this import

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
                {/* Aurora Background */}
                <div style={{ position: 'absolute', inset: 0 }}>
                    <Aurora
                        colorStops={["#ffff2e", "#ed8ef5", "#000000"]}
                        blend={0.5}
                        amplitude={1.0}
                        speed={0.5}
                    />
                </div>
                
                {/* Content Layer */}
                <div style={{ 
                    position: 'relative', 
                    zIndex: 1,
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <HomeText
                        text={[
                            "Bonjour, Samy!",
                            "Bienvenue chez 3990!",
                        ]}
                        as="h1"
                        typingSpeed={80}
                        deletingSpeed={40}
                        pauseDuration={4000}
                        loop={true}
                        showCursor={true}
                        textColors={["#ffffffff", "#fffffff", "#ffffff"]}
                        className="centered-text"
                    />
                    <App/>
                </div>
            </div>
        </StrictMode>
    )
}