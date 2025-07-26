# SocialApp - Instagram-like Social Media Platform

A modern, responsive social media application built with React, TypeScript, Tailwind CSS, and Supabase. Features include user authentication, photo sharing, likes, comments, stories, and more.

## 🚀 Features

- **User Authentication**: Sign up, login, and logout functionality
- **Photo Feed**: Instagram-like feed with infinite scroll
- **Stories**: 24-hour disappearing stories
- **Likes & Comments**: Interactive engagement features
- **User Profiles**: Customizable profiles with bio and avatar
- **Responsive Design**: Mobile-first design that works on all devices
- **Real-time Updates**: Live updates using Supabase real-time subscriptions

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Radix UI Components
- **Backend**: Supabase (PostgreSQL, Authentication, Storage)
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **Forms**: React Hook Form with Zod validation

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd social-media-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Copy your project URL and anon key
   - Run the database migration:
     ```sql
     -- Copy the contents of supabase/migrations/20250101000000_create_social_media_schema.sql
     -- and run it in your Supabase SQL editor
     ```

4. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Update `.env` with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

## 🗄️ Database Schema

The app uses the following main tables:

- **users**: User profiles and authentication
- **posts**: Photo/video posts with metadata
- **likes**: Post likes relationship
- **comments**: Comments on posts
- **follows**: User follow relationships
- **stories**: 24-hour disappearing stories

## 🔐 Authentication

The app uses Supabase Auth with email/password authentication. Users can:
- Sign up with email, username, and full name
- Log in with email and password
- Reset password (coming soon)
- Update profile information

## 📱 Pages & Features

### Feed Page (`/`)
- Instagram-like photo feed
- Stories bar at the top
- Like and comment on posts
- Infinite scroll loading

### Profile Page (`/profile`)
- User profile with stats (posts, followers, following)
- Posts grid view
- Edit profile functionality
- Sign out option

### Authentication Pages
- **Login** (`/login`): User login form
- **Signup** (`/signup`): User registration form

### Coming Soon
- **Search** (`/search`): User and hashtag search
- **Create** (`/create`): Create new posts
- **Activity** (`/activity`): Likes and comments notifications

## 🎨 UI Components

The app uses a custom design system built with:
- **Radix UI**: Accessible primitive components
- **Tailwind CSS**: Utility-first styling
- **Custom Components**: Avatar, Button, Card, Input, etc.

## 🔄 State Management

- **TanStack Query**: Server state management and caching
- **React Context**: Authentication state
- **Local State**: Component-level state with React hooks

## 📱 Responsive Design

The app is designed mobile-first with:
- Mobile-optimized navigation
- Touch-friendly interactions
- Responsive grid layouts
- Optimized images and loading states

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms
The app can be deployed to any static hosting platform:
- Netlify
- GitHub Pages
- AWS S3 + CloudFront
- Surge.sh

Build for production:
```bash
npm run build
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Supabase](https://supabase.com) for the backend infrastructure
- [Radix UI](https://radix-ui.com) for accessible components
- [Tailwind CSS](https://tailwindcss.com) for the design system
- [Lucide](https://lucide.dev) for beautiful icons

## 📞 Support

If you have any questions or need help, please:
1. Check the [Issues](https://github.com/your-username/social-media-app/issues) page
2. Create a new issue if your question hasn't been answered
3. Provide as much detail as possible about your problem

---

Made with ❤️ and modern web technologies
