import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface User {
  id: string
  email: string
  username: string
  full_name: string
  bio?: string
  avatar_url?: string
  is_verified: boolean
  created_at: string
  updated_at: string
}

export interface Post {
  id: string
  user_id: string
  caption?: string
  media_urls: string[]
  media_type: 'image' | 'video' | 'carousel'
  location?: string
  likes_count: number
  comments_count: number
  created_at: string
  updated_at: string
  user?: User
  isLiked?: boolean
}

export interface Like {
  id: string
  user_id: string
  post_id: string
  created_at: string
}

export interface Comment {
  id: string
  user_id: string
  post_id: string
  content: string
  created_at: string
  updated_at: string
  user?: User
}

export interface Follow {
  id: string
  follower_id: string
  following_id: string
  created_at: string
}

export interface Story {
  id: string
  user_id: string
  media_url: string
  media_type: 'image' | 'video'
  text_content?: string
  expires_at: string
  created_at: string
  user?: User
}