import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { musicAPI, type MusicAnalysis } from '@/services/api'

export default function MusicAnalyzer() {
  const [analyzing, setAnalyzing] = useState(false)
  const [currentSong, setCurrentSong] = useState<MusicAnalysis | null>(null)
  const [songUrl, setSongUrl] = useState('')
  const [error, setError] = useState<string | null>(null)

  const analyzeSong = async () => {
    setAnalyzing(true)
    setError(null)
    
    try {
      // Extract title and artist from common URL patterns or user input
      const isUrl = songUrl.includes('spotify.com') || songUrl.includes('youtube.com') || songUrl.includes('youtu.be')
      
      const analysis = await musicAPI.analyzeSong(
        songUrl,
        isUrl ? undefined : songUrl.split(' - ')[1], // Try to extract title
        isUrl ? undefined : songUrl.split(' - ')[0]  // Try to extract artist
      )
      
      setCurrentSong(analysis)
    } catch (err) {
      setError('Failed to analyze the song. Please check the URL or try again.')
      console.error('Song analysis error:', err)
    } finally {
      setAnalyzing(false)
    }
  }

  const getColorForValue = (value: number) => {
    if (value > 0.7) return 'bg-green-500'
    if (value > 0.4) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getMoodEmoji = (moodPrediction: string) => {
    const mood = moodPrediction.toLowerCase()
    if (mood.includes('happy') || mood.includes('joyful') || mood.includes('upbeat')) return '😄'
    if (mood.includes('sad') || mood.includes('melancholic') || mood.includes('depressing')) return '😢'
    if (mood.includes('energetic') || mood.includes('exciting') || mood.includes('pumped')) return '⚡'
    if (mood.includes('calm') || mood.includes('peaceful') || mood.includes('relaxing')) return '😌'
    if (mood.includes('angry') || mood.includes('aggressive') || mood.includes('intense')) return '😠'
    return '🎵'
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Music Mood Analysis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Song URL or Search
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={songUrl}
                onChange={(e) => setSongUrl(e.target.value)}
                placeholder="Paste Spotify/YouTube URL or enter 'Artist - Song Title'"
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Button
                onClick={analyzeSong}
                disabled={analyzing || !songUrl.trim()}
                className="px-6"
              >
                {analyzing ? 'Analyzing...' : 'Analyze'}
              </Button>
            </div>
            {error && (
              <p className="text-red-600 text-sm mt-2">{error}</p>
            )}
          </div>

          {currentSong && (
            <div className="border rounded-lg p-4 bg-gradient-to-r from-purple-50 to-blue-50">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-gray-300 rounded-lg flex items-center justify-center">
                  {getMoodEmoji(currentSong.moodPrediction)}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{currentSong.title}</h3>
                  <p className="text-gray-600">{currentSong.artist}</p>
                  <p className="text-sm text-purple-600 font-medium">
                    Predicted Mood: {currentSong.moodPrediction}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">Energy</span>
                    <span className="text-sm">{Math.round(currentSong.energy * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getColorForValue(currentSong.energy)}`}
                      style={{ width: `${currentSong.energy * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">Happiness</span>
                    <span className="text-sm">{Math.round(currentSong.valence * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getColorForValue(currentSong.valence)}`}
                      style={{ width: `${currentSong.valence * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">Danceability</span>
                    <span className="text-sm">{Math.round(currentSong.danceability * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getColorForValue(currentSong.danceability)}`}
                      style={{ width: `${currentSong.danceability * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">Tempo</span>
                    <span className="text-sm">{Math.round(currentSong.tempo)} BPM</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-blue-500"
                      style={{ width: `${Math.min((currentSong.tempo / 200) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-white rounded-lg border">
                <h4 className="font-medium text-gray-800 mb-2">🤖 AI Analysis</h4>
                <p className="text-sm text-gray-600">
                  This song has a {currentSong.energy > 0.7 ? 'high' : currentSong.energy > 0.4 ? 'moderate' : 'low'} energy level 
                  and is likely to make you feel {currentSong.moodPrediction.toLowerCase()}. 
                  {currentSong.valence > 0.6 ? ' It has positive emotional qualities' : currentSong.valence < 0.4 ? ' It has more melancholic qualities' : ' It has neutral emotional qualities'} 
                  with a {currentSong.tempo > 140 ? 'fast' : currentSong.tempo > 100 ? 'moderate' : 'slow'} tempo.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
