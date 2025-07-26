# 🔗 jmpy - URL Shortener

A modern, feature-rich URL shortening service built with Next.js, Supabase, and Redis. Create short, shareable links with analytics, custom aliases, and user authentication.

![jmpy](https://img.shields.io/badge/jmpy-URL%20Shortener-blue?style=for-the-badge&logo=link)

**[🚀 Live Demo](https://jmpy.vercel.app)**

## ✨ Features

- **🔗 URL Shortening**: Create short links instantly
- **🎯 Custom Aliases**: Choose your own short codes
- **📊 Analytics**: Track clicks and engagement
- **👤 User Authentication**: Sign up and manage your URLs
- **📱 QR Code Generation**: Generate QR codes for easy sharing
- **🎨 Modern UI**: Beautiful, responsive design with glass effects
- **⚡ Rate Limiting**: Protect against abuse with intelligent rate limiting
- **🔒 Secure**: Password reset, email verification, and secure authentication

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Caching**: Upstash Redis
- **Deployment**: Vercel
- **Icons**: React Icons
- **Notifications**: React Hot Toast

## 📋 Prerequisites

- Node.js 18+
- npm, yarn, or pnpm
- Supabase account
- Upstash Redis account (for rate limiting)

## 🔧 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Sakib62/jmpy.git
cd jmpy
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Base URL
NEXT_PUBLIC_BASE_URL=https://your-domain.com

# Redis Configuration (for rate limiting)
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token
```

### 4. Database Setup

#### Create Supabase Tables

Run these SQL commands in your Supabase SQL editor:

```sql
-- Create URLs table
CREATE TABLE urls (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  original_url TEXT NOT NULL,
  short_code VARCHAR(16) NOT NULL UNIQUE,
  custom_alias VARCHAR(16),
  user_id UUID REFERENCES auth.users(id),
  click_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_accessed TIMESTAMP WITH TIME ZONE
);
```

#### Configure Supabase Authentication

1. Go to your Supabase dashboard
2. Navigate to **Authentication** → **URL Configuration**
3. Set **Site URL** to your production domain
4. Add **Redirect URLs**:
   - `https://your-domain.com/reset` (production)
   - `http://localhost:3000/reset` (development)

### 5. Run the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🔗 How It Works

### URL Shortening Algorithm

The service uses a **random generation approach** with collision detection:

1. **Generate 6-character code**: Random selection from 62 characters (a-z, A-Z, 0-9)
2. **Check for uniqueness**: Database lookup to ensure no duplicates
3. **Retry if needed**: Generate new code if collision occurs
4. **Store URL**: Save original URL with unique short code

**Character Set**: 62 characters (26 lowercase + 26 uppercase + 10 digits)  
**Code Length**: 6 characters  
**Total Combinations**: 62^6 = ~56.8 billion possible codes

### Rate Limiting

- **Anonymous users**: 5 requests per minute
- **Authenticated users**: 15 requests per minute
- **Storage**: Redis-based rate limiting with IP tracking
- **Window**: 60-second sliding window

### Custom Aliases

Users can create custom short codes (minimum 6 characters) with uniqueness validation.

## 🔒 Security Features

- **Rate Limiting**: Prevents abuse and spam
- **Input Validation**: Sanitizes and validates all inputs
- **Authentication**: Secure user authentication with Supabase
- **Password Requirements**: Strong password policies
- **CSRF Protection**: Built-in Next.js protection

## 📊 Analytics

Track your shortened URLs with built-in analytics:

- **Click Count**: Number of times each link was accessed
- **Last Accessed**: Timestamp of most recent click


## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [Supabase](https://supabase.com/) for the backend-as-a-service
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Vercel](https://vercel.com/) for seamless deployment



---

**Built with ❤️ using Next.js, Supabase, and Tailwind CSS**
