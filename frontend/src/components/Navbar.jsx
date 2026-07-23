import { NavLink } from 'react-router-dom'
import { Home, PenTool, User, BarChart2, History } from 'lucide-react'

export default function Navbar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 glass-card rounded-t-2xl rounded-b-none border-b-0 border-x-0 bg-surface-900/80 pb-safe pt-2 px-6 z-50">
      <div className="flex justify-between items-center max-w-lg mx-auto">
        <NavLink to="/" className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`}>
          <Home size={24} />
          <span>Asosiy</span>
        </NavLink>
        
        <NavLink to="/tests" className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`}>
          <PenTool size={24} />
          <span>Test</span>
        </NavLink>
        
        <NavLink to="/history" className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`}>
          <History size={24} />
          <span>Tarix</span>
        </NavLink>
        
        <NavLink to="/progress" className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`}>
          <BarChart2 size={24} />
          <span>Progress</span>
        </NavLink>
        
        <NavLink to="/profile" className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`}>
          <User size={24} />
          <span>Profil</span>
        </NavLink>
      </div>
    </nav>
  )
}
