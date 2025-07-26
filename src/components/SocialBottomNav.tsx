import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, Search, PlusSquare, Heart, User } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const SocialBottomNav: React.FC = () => {
  const location = useLocation()
  const { user } = useAuth()

  const navItems = [
    {
      to: '/',
      icon: Home,
      label: 'Home',
      isActive: location.pathname === '/',
    },
    {
      to: '/search',
      icon: Search,
      label: 'Search',
      isActive: location.pathname === '/search',
    },
    {
      to: '/create',
      icon: PlusSquare,
      label: 'Create',
      isActive: location.pathname === '/create',
    },
    {
      to: '/activity',
      icon: Heart,
      label: 'Activity',
      isActive: location.pathname === '/activity',
    },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex items-center justify-around py-2 px-4 max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors ${
                item.isActive
                  ? 'text-gray-900'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Icon
                className={`h-6 w-6 ${
                  item.isActive ? 'fill-current' : ''
                }`}
              />
              <span className="sr-only">{item.label}</span>
            </Link>
          )
        })}
        
        {/* Profile */}
        <Link
          to="/profile"
          className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors ${
            location.pathname === '/profile'
              ? 'text-gray-900'
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <div className={`rounded-full ${
            location.pathname === '/profile' 
              ? 'ring-2 ring-gray-900 ring-offset-2' 
              : ''
          }`}>
            <Avatar className="h-6 w-6">
              <AvatarImage src={user?.avatar_url} alt={user?.username} />
              <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs">
                {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
          </div>
          <span className="sr-only">Profile</span>
        </Link>
      </div>
    </div>
  )
}

export default SocialBottomNav