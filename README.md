# 🎵 MoodScale - AI-Powered Mood & Music Platform

> A full-stack application that connects emotions to music using AI-powered insights and personalized song recommendations.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white)
![Google AI](https://img.shields.io/badge/Google_AI-4285F4?style=flat&logo=google&logoColor=white)

## ✨ Features

### 🎯 **Core Functionality**
- **Mood Tracking** - Emoji-based mood selection with personal notes
- **AI Journaling** - Deep mood analysis with personalized song recommendations  
- **Music Analysis** - AI-powered emotional impact prediction for songs
- **Spotify Integration** - Real playlist analysis with personality insights
- **Smart Analytics** - Day-based streak tracking with daily mood averaging

### 🤖 **AI-Powered Features**
- **Song Recommendations** - Context-aware music suggestions based on mood and notes
- **Personality Analysis** - Big Five traits analysis from music taste
- **Mood Insights** - Supportive AI feedback and pattern recognition
- **Smart Filtering** - Avoids recently recommended songs for variety

## 🛠️ Tech Stack

### **Frontend**
- **React 19** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **shadcn/ui** components
- **Recharts** for data visualization

### **Backend**
- **Node.js** with Express
- **TypeScript** for type safety
- **MongoDB Atlas** for data storage
- **Google Gemini AI** for intelligent features
- **Spotify Web API** for music integration

### **Architecture**
- RESTful API design
- Clean separation of concerns
- Type-safe throughout
- Error handling & loading states
- Responsive design

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- [Google AI Studio API key](https://aistudio.google.com/) (free)
- [Spotify Developer Account](https://developer.spotify.com/) (optional)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd MoodScale

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies  
cd ../moodscale-app
npm install
```

### Environment Setup

Create `backend/.env`:
```env
# Required - Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here

# Required - MongoDB Atlas
MONGODB_URI=your_mongodb_connection_string

# Optional - Spotify Integration
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret

# Server Configuration
NODE_ENV=development
```

## 📱 Application Flow

1. **Track Mood** - Select emoji and add personal notes
2. **Get AI Insights** - Receive supportive feedback and song recommendations
3. **Analyze Music** - Input songs for emotional impact analysis
4. **Explore Playlists** - Analyze Spotify playlists for personality insights
5. **View Analytics** - Track mood patterns and streaks over time

## 🎯 Key Features Demo

### Mood Journal with Soundtrack
- Rich journaling interface with mood selection
- AI-powered song recommendations based on context
- Direct Spotify/YouTube links for instant listening
- Genre preferences for personalized suggestions

### Smart Analytics Dashboard
- Day-based streak tracking (not individual entries)
- Daily mood averaging for multiple entries per day
- Interactive charts showing mood trends
- AI-generated insights and recommendations

### Playlist Personality Analysis
- Real Spotify URL integration with accurate metadata
- Big Five personality traits scoring
- Music taste analysis with AI insights
- Manual playlist entry support

## 🏗️ Project Structure

```
MoodScale/
├── backend/                 # Node.js Express API
│   ├── src/
│   │   ├── index.ts        # Main server with routes
│   │   ├── models/         # MongoDB schemas
│   │   └── config/         # Database configuration
│   └── .env                # Environment variables
├── moodscale-app/          # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # API service layer
│   │   └── lib/           # Utilities
│   └── public/            # Static assets
└── docs/                  # Documentation
```

## 🔧 API Endpoints

- `GET /api/health` - Server health check
- `GET /api/moods` - Retrieve mood entries
- `POST /api/moods` - Create mood entry with AI insight
- `POST /api/recommend-songs` - Get AI song recommendations
- `POST /api/music/analyze` - Analyze song mood impact
- `POST /api/playlist/analyze` - Spotify playlist analysis
- `GET /api/insights` - AI insights with streak analytics

## 🎨 UI/UX Features

- **Modern Design** - Clean, responsive interface with smooth animations
- **Dark Overlays** - Elegant dropdown menus with proper z-indexing
- **Hover Effects** - Enhanced interactivity with visual feedback
- **Loading States** - Smooth transitions and user feedback
- **Error Handling** - Graceful error messages and fallbacks

## 🌟 Why This Project Stands Out

- **Real AI Integration** - Working Gemini AI features, not just buzzwords
- **Modern Tech Stack** - Latest React 19, TypeScript, and industry standards
- **Full-Stack Mastery** - Complete frontend and backend implementation
- **Production Ready** - Error handling, loading states, responsive design
- **Unique Concept** - Memorable connection between music and emotions

**Built with ❤️ using React, TypeScript, Node.js, MongoDB, and Google Gemini AI**
   # Edit .env and add your Gemini API key

## 🏗️ Architecture

### Frontend (React + TypeScript + Vite)
```
src/
├── components/
│   ├── ui/           # shadcn/ui components
│   ├── MoodTracker.tsx
│   ├── MusicAnalyzer.tsx
│   └── MoodDashboard.tsx
├── services/
│   └── api.ts        # API service layer
├── lib/
│   └── utils.ts      # Utility functions
└── App.tsx           # Main application
```

### Backend (Node.js + Express + TypeScript)
```
src/
└── index.ts          # Main server with API routes
```

## 🎯 API Endpoints

### Mood Tracking
- `GET /api/moods` - Get all mood entries
- `POST /api/moods` - Create new mood entry with AI insight

### Music Analysis
- `POST /api/music/analyze` - Analyze song and predict mood

### AI Insights
- `GET /api/insights` - Get personalized AI insights and recommendations

### Health Check
- `GET /api/health` - Server health status

## 🎨 UI Components

Built with modern design principles using:
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: High-quality, accessible components
- **Recharts**: Beautiful, responsive charts
- **Lucide React**: Consistent iconography

## 🤖 AI Integration

### Gemini AI Features
1. **Mood Analysis**: Analyzes mood entries and provides supportive insights
2. **Music Mood Prediction**: Predicts emotional impact based on song features
3. **Personalized Recommendations**: Generates tailored advice and music suggestions

### Example AI Interactions
- **Mood Entry**: "Feeling stressed about work" → AI provides supportive insight
- **Music Analysis**: Song features → "This song will make you feel energetic"
- **Weekly Insights**: Mood patterns → Personalized recommendations

## 📊 Data Visualization

### Charts & Analytics
- **Mood Trend Line Chart**: Track mood changes over time
- **Genre Analysis Bar Chart**: Correlate music genres with mood levels
- **Statistics Cards**: Average mood, streak counter, total entries

## 🎵 Music Integration

### Supported Platforms
- Spotify URLs (planned)
- YouTube URLs (planned)
- Manual song entry (Artist - Title format)

### Analysis Features
- Energy level assessment
- Happiness/valence rating
- Danceability score
- Tempo analysis
- AI mood prediction

## 🔧 Development

### Tech Stack
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express, TypeScript, Gemini AI, MongoDB
- **Charts**: Recharts
- **HTTP Client**: Axios
- **Development**: Nodemon, ts-node

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
npm run build
# Deploy dist/ folder
```

### Backend (Railway/Heroku)
```bash
npm run build
# Deploy with start script
```

### Environment Variables
```env
GEMINI_API_KEY=your_gemini_api_key_here
NODE_ENV=production
```

## 🎯 MoodScale Integration

This application demonstrates several key features that would integrate well with the MoodScale ecosystem:

### Product Integration Opportunities
1. **Data Export**: Export mood data for integration with other MoodScale tools
2. **API Integration**: Connect with existing MoodScale user accounts
3. **Machine Learning**: Use mood data to improve MoodScale's recommendation algorithms
4. **Social Features**: Share mood insights within MoodScale community
5. **Wearable Integration**: Connect with fitness trackers for comprehensive mood monitoring

### Business Value
- **User Engagement**: Music connection increases daily usage
- **Data Insights**: Rich emotional data for product improvement
- **Differentiation**: Unique music-mood correlation features
- **Retention**: Personalized AI insights encourage continued use

## 🔮 Future Enhancements

### Phase 1 (Short-term)
- [ ] Real Spotify/Apple Music API integration
- [ ] User authentication and data persistence
- [ ] Mobile-responsive design improvements
- [ ] More chart types and visualizations

### Phase 2 (Medium-term)
- [ ] Social sharing of mood insights
- [ ] Playlist generation based on mood
- [ ] Integration with streaming platforms
- [ ] Advanced AI mood coaching

### Phase 3 (Long-term)
- [ ] Voice mood tracking
- [ ] Wearable device integration
- [ ] Community features and mood challenges
- [ ] Professional therapist integration

**Built with ❤️ by Kumar Harsh**

*Connecting music to emotions, one song at a time.*
