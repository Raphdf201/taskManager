import './App.css'

import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Menu from './pages/Menu/Menu'
import Tasks from './pages/Tasks/Tasks'
import Members from './pages/Members/Members'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Menu />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/members" element={<Members />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
