import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase, Story } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Plus } from 'lucide-react'

const StoriesBar: React.FC = () => {
  const { user } = useAuth()

  const {
    data: stories = [],
    isLoading,
  } = useQuery({
    queryKey: ['stories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stories')
        .select(`
          *,
          user:users(*)
        `)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) throw error
      return data
    },
    enabled: !!user,
  })

  // Group stories by user
  const groupedStories = stories.reduce((acc, story) => {
    const userId = story.user_id
    if (!acc[userId]) {
      acc[userId] = {
        user: story.user,
        stories: [],
      }
    }
    acc[userId].stories.push(story)
    return acc
  }, {} as Record<string, { user: any; stories: Story[] }>)

  const userStories = Object.values(groupedStories)

  const handleAddStory = () => {
    // TODO: Implement add story functionality
    console.log('Add story clicked')
  }

  const handleViewStory = (userId: string) => {
    // TODO: Implement story viewer
    console.log('View story for user:', userId)
  }

  if (isLoading) {
    return (
      <div className="flex space-x-3 p-4 overflow-x-auto">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex-shrink-0">
            <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex space-x-3 p-4 overflow-x-auto border-b border-gray-200 bg-white">
      {/* Add Story Button */}
      <div className="flex-shrink-0 flex flex-col items-center space-y-1">
        <button
          onClick={handleAddStory}
          className="relative w-16 h-16 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-gray-400 transition-colors"
        >
          <Avatar className="w-14 h-14">
            <AvatarImage src={user?.avatar_url} alt={user?.username} />
            <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white">
            <Plus className="w-3 h-3 text-white" />
          </div>
        </button>
        <span className="text-xs text-gray-600 text-center max-w-[64px] truncate">
          Your story
        </span>
      </div>

      {/* Stories */}
      {userStories.map(({ user: storyUser, stories: userStoriesArray }) => (
        <div
          key={storyUser.id}
          className="flex-shrink-0 flex flex-col items-center space-y-1"
        >
          <button
            onClick={() => handleViewStory(storyUser.id)}
            className="relative"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 p-0.5">
              <Avatar className="w-full h-full border-2 border-white">
                <AvatarImage src={storyUser.avatar_url} alt={storyUser.username} />
                <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                  {storyUser.full_name?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            </div>
            {userStoriesArray.length > 1 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center border border-white">
                <span className="text-xs text-white font-bold">
                  {userStoriesArray.length}
                </span>
              </div>
            )}
          </button>
          <span className="text-xs text-gray-600 text-center max-w-[64px] truncate">
            {storyUser.username}
          </span>
        </div>
      ))}

      {userStories.length === 0 && (
        <div className="flex-1 flex items-center justify-center py-4">
          <p className="text-gray-500 text-sm">No stories available</p>
        </div>
      )}
    </div>
  )
}

export default StoriesBar