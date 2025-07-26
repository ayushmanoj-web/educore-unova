import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { supabase, Post } from '@/lib/supabase'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Settings, Grid3X3, Bookmark, Tag, MoreHorizontal } from 'lucide-react'
import { toast } from 'sonner'

const ProfilePage: React.FC = () => {
  const { user, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState<'posts' | 'saved' | 'tagged'>('posts')

  const {
    data: userPosts = [],
    isLoading: postsLoading,
  } = useQuery({
    queryKey: ['user-posts', user?.id],
    queryFn: async () => {
      if (!user) return []
      
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    },
    enabled: !!user,
  })

  const {
    data: stats,
    isLoading: statsLoading,
  } = useQuery({
    queryKey: ['user-stats', user?.id],
    queryFn: async () => {
      if (!user) return { posts: 0, followers: 0, following: 0 }

      const [postsResult, followersResult, followingResult] = await Promise.all([
        supabase
          .from('posts')
          .select('id')
          .eq('user_id', user.id),
        supabase
          .from('follows')
          .select('id')
          .eq('following_id', user.id),
        supabase
          .from('follows')
          .select('id')
          .eq('follower_id', user.id),
      ])

      return {
        posts: postsResult.data?.length || 0,
        followers: followersResult.data?.length || 0,
        following: followingResult.data?.length || 0,
      }
    },
    enabled: !!user,
  })

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success('Signed out successfully')
    } catch (error) {
      toast.error('Failed to sign out')
    }
  }

  const handleEditProfile = () => {
    toast.info('Edit profile feature coming soon!')
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Please log in to view your profile</p>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 z-10">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">{user.username}</h1>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Profile Info */}
      <div className="p-4">
        <div className="flex items-center space-x-4 mb-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={user.avatar_url} alt={user.username} />
            <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-2xl">
              {user.full_name?.charAt(0)?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex items-center justify-around text-center">
              <div>
                <div className="font-semibold text-lg">
                  {statsLoading ? '-' : stats?.posts || 0}
                </div>
                <div className="text-sm text-gray-600">posts</div>
              </div>
              <div>
                <div className="font-semibold text-lg">
                  {statsLoading ? '-' : stats?.followers || 0}
                </div>
                <div className="text-sm text-gray-600">followers</div>
              </div>
              <div>
                <div className="font-semibold text-lg">
                  {statsLoading ? '-' : stats?.following || 0}
                </div>
                <div className="text-sm text-gray-600">following</div>
              </div>
            </div>
          </div>
        </div>

        {/* User Details */}
        <div className="mb-4">
          <h2 className="font-semibold text-sm">{user.full_name}</h2>
          {user.bio && (
            <p className="text-sm text-gray-600 mt-1">{user.bio}</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 mb-4">
          <Button
            onClick={handleEditProfile}
            variant="outline"
            className="flex-1"
          >
            Edit profile
          </Button>
          <Button
            onClick={handleSignOut}
            variant="outline"
            className="flex-1"
          >
            Sign out
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-t border-gray-200">
        <div className="flex">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex-1 flex items-center justify-center py-3 ${
              activeTab === 'posts'
                ? 'border-t-2 border-gray-900 text-gray-900'
                : 'text-gray-400'
            }`}
          >
            <Grid3X3 className="h-5 w-5" />
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex-1 flex items-center justify-center py-3 ${
              activeTab === 'saved'
                ? 'border-t-2 border-gray-900 text-gray-900'
                : 'text-gray-400'
            }`}
          >
            <Bookmark className="h-5 w-5" />
          </button>
          <button
            onClick={() => setActiveTab('tagged')}
            className={`flex-1 flex items-center justify-center py-3 ${
              activeTab === 'tagged'
                ? 'border-t-2 border-gray-900 text-gray-900'
                : 'text-gray-400'
            }`}
          >
            <Tag className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Posts Grid */}
      <div className="pb-16">
        {activeTab === 'posts' && (
          <div className="grid grid-cols-3 gap-1">
            {postsLoading ? (
              [...Array(9)].map((_, i) => (
                <div key={i} className="aspect-square bg-gray-200 animate-pulse" />
              ))
            ) : userPosts.length > 0 ? (
              userPosts.map((post) => (
                <div key={post.id} className="aspect-square bg-gray-100 relative">
                  {post.media_urls && post.media_urls.length > 0 ? (
                    <img
                      src={post.media_urls[0]}
                      alt="Post"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = 'https://via.placeholder.com/300x300?text=Image+Not+Found'
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      <span className="text-gray-400 text-xs">No image</span>
                    </div>
                  )}
                  
                  {/* Post overlay with stats */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
                    <div className="text-white text-center">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                          </svg>
                          <span className="text-sm font-medium">{post.likes_count}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                            <path d="M21 6h-2l-1.27-1.27A2 2 0 0 0 16.31 4H7.69a2 2 0 0 0-1.42.73L5 6H3a1 1 0 0 0 0 2h18a1 1 0 0 0 0-2zM19 9v10a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V9zm-2 2H7v8h10z"/>
                          </svg>
                          <span className="text-sm font-medium">{post.comments_count}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Grid3X3 className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No posts yet</h3>
                <p className="text-gray-500 text-center">
                  Start sharing photos and videos to fill your profile.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'saved' && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Bookmark className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No saved posts</h3>
            <p className="text-gray-500 text-center">
              Save posts you want to see again here.
            </p>
          </div>
        )}

        {activeTab === 'tagged' && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Tag className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No tagged posts</h3>
            <p className="text-gray-500 text-center">
              Posts you're tagged in will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProfilePage