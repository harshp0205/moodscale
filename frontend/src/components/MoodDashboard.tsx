import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { insightsAPI, moodAPI, type AIInsights, type MoodEntry } from '@/services/api'

// Mock genre data for demonstration
const genreData = [
  { genre: 'Pop', count: 25, avgMood: 4.2 },
  { genre: 'Rock', count: 18, avgMood: 3.1 },
  { genre: 'Jazz', count: 12, avgMood: 3.8 },
  { genre: 'Classical', count: 8, avgMood: 4.5 },
  { genre: 'Hip Hop', count: 15, avgMood: 3.6 },
]

export default function MoodDashboard() {
  const [insights, setInsights] = useState<AIInsights | null>(null)
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const [insightsData, moodData] = await Promise.all([
        insightsAPI.getInsights(),
        moodAPI.getMoods()
      ])
      
      setInsights(insightsData)
      setMoodEntries(moodData.map(entry => ({
        ...entry,
        timestamp: new Date(entry.timestamp)
      })))
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Process mood data for charts - use daily averages if available
  const moodTrendData = insights?.dailyAverages
    ? insights.dailyAverages
        .slice(0, 7)
        .reverse()
        .map((dayData, index) => ({
          date: new Date(dayData.date).toLocaleDateString(),
          mood: dayData.averageMood,
          day: index + 1,
          entries: dayData.entryCount
        }))
    : moodEntries
        .slice(0, 7)
        .reverse()
        .map((entry, index) => ({
          date: entry.timestamp.toLocaleDateString(),
          mood: entry.mood,
          day: index + 1,
          entries: 1
        }))

  const currentMoodAvg = insights?.averageMood || 0
  const totalDays = insights?.totalDays || 0
  const streak = insights?.streak || 0

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl">📊</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average Mood</p>
                <p className="text-2xl font-bold text-gray-900">
                  {currentMoodAvg.toFixed(1)}/5
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-2xl">📅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Days Tracked</p>
                <p className="text-2xl font-bold text-gray-900">{totalDays}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span className="text-2xl">🔥</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Streak</p>
                <p className="text-2xl font-bold text-gray-900">{streak} days</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mood Trend Chart */}
      {moodTrendData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Daily Mood Averages</CardTitle>
            <p className="text-sm text-gray-600">
              Showing average mood per day {insights?.dailyAverages ? '(multiple entries per day averaged)' : ''}
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={moodTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[1, 5]} />
                  <Tooltip 
                    formatter={(value, _name, props) => [
                      `${Number(value).toFixed(1)}`,
                      `Daily Average ${props.payload.entries > 1 ? `(${props.payload.entries} entries)` : ''}`
                    ]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="mood" 
                    stroke="#8884d8" 
                    strokeWidth={3}
                    dot={{ fill: '#8884d8', strokeWidth: 2, r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Genre Analysis (Mock Data) */}
      <Card>
        <CardHeader>
          <CardTitle>Music Genres & Mood Correlation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={genreData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="genre" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    value, 
                    name === 'count' ? 'Songs Listened' : 'Average Mood'
                  ]}
                />
                <Bar dataKey="count" fill="#8884d8" />
                <Bar dataKey="avgMood" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle>🤖 AI Insights & Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insights && insights.insights.length > 0 ? (
              insights.insights.map((insight, index) => (
                <div key={index} className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                  <h4 className="font-medium text-blue-900">Insight #{index + 1}</h4>
                  <p className="text-blue-800 mt-1">{insight}</p>
                </div>
              ))
            ) : (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-600">Start tracking your mood to get personalized AI insights!</p>
              </div>
            )}
            
            {insights && insights.recommendations.length > 0 && (
              <>
                <h4 className="font-medium text-gray-800 mt-6 mb-3">Recommendations</h4>
                {insights.recommendations.map((recommendation, index) => (
                  <div key={index} className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                    <h4 className="font-medium text-green-900">Recommendation #{index + 1}</h4>
                    <p className="text-green-800 mt-1">{recommendation}</p>
                  </div>
                ))}
              </>
            )}

            <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
              <h4 className="font-medium text-purple-900">Daily Goal</h4>
              <p className="text-purple-800 mt-1">
                Keep tracking your mood daily and explore new music to build a comprehensive emotional profile!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
