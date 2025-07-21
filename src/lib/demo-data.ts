import { supabase } from './supabase'

export const demoUsers = [
  {
    username: 'sarah_photo',
    full_name: 'Sarah Johnson',
    bio: '📸 Photography enthusiast | 🌍 Travel lover | ☕ Coffee addict',
    avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b647?w=150&h=150&fit=crop&crop=face',
    is_verified: true,
  },
  {
    username: 'mike_adventures',
    full_name: 'Mike Chen',
    bio: '🏔️ Mountain climber | 🏄‍♂️ Surfer | 🌅 Sunset chaser',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    is_verified: false,
  },
  {
    username: 'emma_art',
    full_name: 'Emma Wilson',
    bio: '🎨 Digital artist | 🖌️ Illustrator | ✨ Creating magic daily',
    avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    is_verified: true,
  },
]

export const demoPosts = [
  {
    caption: 'Golden hour magic ✨ Nothing beats a perfect sunset by the ocean. The colors tonight were absolutely incredible! 🌅 #sunset #goldenhour #oceanview',
    media_urls: ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop'],
    location: 'Malibu, California',
    likes_count: 127,
    comments_count: 23,
  },
  {
    caption: 'Fresh coffee and morning vibes ☕ Starting the day right with this perfect latte art. Who else needs their morning caffeine fix? #coffee #latteart #morningvibes',
    media_urls: ['https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=400&fit=crop'],
    location: 'Brooklyn, New York',
    likes_count: 89,
    comments_count: 12,
  },
  {
    caption: 'Mountain peak conquered! 🏔️ The view from 10,000 feet was absolutely breathtaking. Every step was worth it for this moment. #hiking #mountains #adventure',
    media_urls: ['https://images.unsplash.com/photo-1464822759844-d150ad6d1dff?w=400&h=400&fit=crop'],
    location: 'Rocky Mountain National Park',
    likes_count: 234,
    comments_count: 45,
  },
  {
    caption: 'New digital artwork finished! 🎨 Spent the whole weekend working on this piece. What do you think? #digitalart #illustration #artistsoninstagram',
    media_urls: ['https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=400&fit=crop'],
    location: 'Home Studio',
    likes_count: 156,
    comments_count: 28,
  },
  {
    caption: 'Perfect waves today! 🏄‍♂️ The ocean was calling and I had to answer. Nothing like the feeling of riding the perfect wave. #surfing #ocean #waves',
    media_urls: ['https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=400&fit=crop'],
    location: 'Huntington Beach, CA',
    likes_count: 178,
    comments_count: 34,
  },
  {
    caption: 'City lights never get old ✨ The skyline looks magical tonight. Love capturing the energy of the city after dark. #cityscape #nightphotography #urban',
    media_urls: ['https://images.unsplash.com/photo-1514565131-fce0801e5785?w=400&h=400&fit=crop'],
    location: 'Downtown Los Angeles',
    likes_count: 203,
    comments_count: 19,
  },
]

export const createDemoData = async () => {
  console.log('Creating demo data...')
  
  try {
    // Note: This is for demo purposes only
    // In a real app, you would need proper authentication
    console.log('Demo data creation would need proper authentication setup')
    console.log('Please set up Supabase and create accounts manually for testing')
    
    return {
      success: true,
      message: 'Demo data structure ready - set up Supabase to use'
    }
  } catch (error) {
    console.error('Error creating demo data:', error)
    return {
      success: false,
      error: error
    }
  }
}