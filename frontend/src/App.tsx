import { useState } from 'react'
import MoodTracker from '@/components/MoodTracker'
import MusicAnalyzer from '@/components/MusicAnalyzer'
import MoodDashboard from '@/components/MoodDashboard'
import PlaylistPersonalityAnalyzer from '@/components/PlaylistPersonalityAnalyzer'
import MoodJournal from '@/components/MoodJournal'
import { Button } from '@/components/ui/button'
import './App.css'

type TabType = 'tracker' | 'journal' | 'music' | 'dashboard' | 'playlist'

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('tracker')

  const tabs = [
    { id: 'tracker', label: 'Mood Tracker', icon: '😊' },
    { id: 'journal', label: 'Mood Journal', icon: '📔' },
    { id: 'music', label: 'Music Analysis', icon: '🎵' },
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'playlist', label: 'Playlist Personality', icon: '🎭' },
  ] as const

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🎵 MoodScale
          </h1>
          <p className="text-lg text-gray-600">
            Connect your music to your emotions with AI-powered insights
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-2 shadow-lg">
            <div className="flex space-x-1">
              {tabs.map((tab) => (
                <Button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  variant={activeTab === tab.id ? 'default' : 'ghost'}
                  className="flex items-center space-x-2 px-4 py-2"
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto">
          {activeTab === 'tracker' && <MoodTracker />}
          {activeTab === 'journal' && <MoodJournal />}
          {activeTab === 'music' && <MusicAnalyzer />}
          {activeTab === 'dashboard' && <MoodDashboard />}
          {activeTab === 'playlist' && <PlaylistPersonalityAnalyzer />}
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500">
          <p>Built with React, TypeScript, Tailwind CSS, and AI-powered insights</p>
        </div>
      </div>
    </div>
  )
}

export default App
