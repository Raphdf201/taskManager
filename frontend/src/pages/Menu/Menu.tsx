import './Menu.css'
import { useState, useEffect } from 'react'
import {Link} from 'react-router-dom'

import Pipes from '../../components/common/Pipes'

function Menu() {

  const [userName, setUserName] = useState<string>('Samy')
  const [displayText, setDisplayText] = useState<string>('')
  const [showCursor, setShowCursor] = useState<boolean>(true)
  const fullText = "Bonjour,\nSamy"
  
 useEffect(() => {
    let index = 0
    const interval = setInterval(() => {
      if (index < fullText.length) {
        setDisplayText(fullText.slice(0, index + 1))
        index++
      } else {
        clearInterval(interval)
      }
    }, 70) 

    return () => clearInterval(interval)
  }, [fullText])

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev)
    }, 500)

    return () => clearInterval(cursorInterval)
  }, [])


  return (
    <div className='menu-page'>
    <Pipes opacity ={0.2} />
     <div className="top-line"></div>
     <nav className="navbar">
     <Link to="/menu">Menu</Link>
     <Link to="/tasks">Tâches</Link>
     <Link to="/members">Membres</Link>
     </nav>
    <h1 className='welcome-text' style = {{whiteSpace: 'pre-line'}}>
    {displayText}
    {showCursor && <span className = "cursor">|</span>}
    </h1>
    </div>
  )
}

export default Menu
