import React, { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { formatDistanceToNow } from 'date-fns'
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from 'lucide-react'
import { supabase, Post } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface PostCardProps {
  post: Post
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [showFullCaption, setShowFullCaption] = useState(false)

  const likeMutation = useMutation({
    mutationFn: async () => {
      if (!user) return

      if (post.isLiked) {
        // Unlike the post
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('post_id', post.id)
          .eq('user_id', user.id)

        if (error) throw error
      } else {
        // Like the post
        const { error } = await supabase
          .from('likes')
          .insert([{
            post_id: post.id,
            user_id: user.id,
          }])

        if (error) throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed-posts'] })
    },
    onError: (error) => {
      toast.error('Error updating like')
      console.error('Like error:', error)
    },
  })

  const handleLike = () => {
    if (!user) {
      toast.error('Please log in to like posts')
      return
    }
    likeMutation.mutate()
  }

  const handleComment = () => {
    // TODO: Navigate to post detail page with comments
    toast.info('Comments feature coming soon!')
  }

  const handleShare = () => {
    // TODO: Implement share functionality
    toast.info('Share feature coming soon!')
  }

  const handleSave = () => {
    // TODO: Implement save functionality
    toast.info('Save feature coming soon!')
  }

  const truncatedCaption = post.caption && post.caption.length > 150
    ? post.caption.substring(0, 150) + '...'
    : post.caption

  return (
    <div className="bg-white border-b border-gray-200">
      {/* Post Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={post.user?.avatar_url} alt={post.user?.username} />
            <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm">
              {post.user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <div className="flex items-center space-x-1">
              <span className="font-semibold text-sm">{post.user?.username}</span>
              {post.user?.is_verified && (
                <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            {post.location && (
              <span className="text-xs text-gray-500">{post.location}</span>
            )}
          </div>
        </div>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>

      {/* Post Media */}
      {post.media_urls && post.media_urls.length > 0 && (
        <div className="aspect-square bg-gray-100">
          <img
            src={post.media_urls[0]}
            alt="Post media"
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src = 'https://via.placeholder.com/400x400?text=Image+Not+Found'
            }}
          />
        </div>
      )}

      {/* Post Actions */}
      <div className="px-4 pt-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className="p-0 h-auto"
              onClick={handleLike}
              disabled={likeMutation.isPending}
            >
              <Heart
                className={`h-6 w-6 ${
                  post.isLiked
                    ? 'fill-red-500 text-red-500'
                    : 'text-gray-900 hover:text-gray-600'
                }`}
              />
            </Button>
            <Button variant="ghost" size="sm" className="p-0 h-auto" onClick={handleComment}>
              <MessageCircle className="h-6 w-6 text-gray-900 hover:text-gray-600" />
            </Button>
            <Button variant="ghost" size="sm" className="p-0 h-auto" onClick={handleShare}>
              <Send className="h-6 w-6 text-gray-900 hover:text-gray-600" />
            </Button>
          </div>
          <Button variant="ghost" size="sm" className="p-0 h-auto" onClick={handleSave}>
            <Bookmark className="h-6 w-6 text-gray-900 hover:text-gray-600" />
          </Button>
        </div>

        {/* Likes Count */}
        {post.likes_count > 0 && (
          <div className="font-semibold text-sm mb-2">
            {post.likes_count.toLocaleString()} {post.likes_count === 1 ? 'like' : 'likes'}
          </div>
        )}

        {/* Caption */}
        {post.caption && (
          <div className="text-sm mb-2">
            <span className="font-semibold mr-2">{post.user?.username}</span>
            <span>
              {showFullCaption ? post.caption : truncatedCaption}
              {post.caption.length > 150 && (
                <button
                  onClick={() => setShowFullCaption(!showFullCaption)}
                  className="text-gray-500 ml-1"
                >
                  {showFullCaption ? 'less' : 'more'}
                </button>
              )}
            </span>
          </div>
        )}

        {/* Comments Link */}
        {post.comments_count > 0 && (
          <button
            onClick={handleComment}
            className="text-gray-500 text-sm mb-2 block"
          >
            View all {post.comments_count} comments
          </button>
        )}

        {/* Timestamp */}
        <div className="text-gray-400 text-xs mb-3">
          {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
        </div>
      </div>
    </div>
  )
}

export default PostCard