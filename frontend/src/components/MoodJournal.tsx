import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from './ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { moodAPI, recommendationsAPI, type SongRecommendation, type SongRecommendations, type MoodEntry } from '@/services/api'
import { Music, Heart, Zap, Star, Play } from 'lucide-react'

const moodEmojis = ['😢', '😞', '😐', '😊', '😄']
const moodLabels = ['Very Sad', 'Sad', 'Neutral', 'Happy', 'Very Happy']

const musicGenres = [
  'Pop', 'Rock', 'Hip Hop', 'R&B', 'Country', 'Electronic', 'Jazz', 'Classical', 
  'Indie', 'Alternative', 'Folk', 'Reggae', 'Blues', 'Metal', 'Punk', 'Funk'
]

export default function MoodJournal() {
  const [selectedMood, setSelectedMood] = useState<number>(2)
  const [note, setNote] = useState('')
  const [preferredGenre, setPreferredGenre] = useState<string>('')
  const [recommendations, setRecommendations] = useState<SongRecommendations | null>(null)
  const [recentEntries, setRecentEntries] = useState<MoodEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [recentSongs, setRecentSongs] = useState<string[]>([])

  useEffect(() => {
    loadRecentEntries()
    loadRecentSongs()
  }, [])

  const loadRecentEntries = async () => {
    try {
      const entries = await moodAPI.getMoods()
      setRecentEntries(entries.slice(0, 5))
    } catch (error) {
      console.error('Failed to load recent entries:', error)
    }
  }

  const loadRecentSongs = () => {
    const stored = localStorage.getItem('recentRecommendations')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setRecentSongs(parsed)
      } catch (error) {
        console.error('Failed to parse recent songs:', error)
      }
    }
  }

  const saveRecentSongs = (songs: string[]) => {
    const allSongs = [...songs, ...recentSongs].slice(0, 10) // Keep last 10
    setRecentSongs(allSongs)
    localStorage.setItem('recentRecommendations', JSON.stringify(allSongs))
  }

  const handleSubmit = async () => {
    if (!note.trim()) {
      setError('Please write something about your mood')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      // Save mood entry
      await moodAPI.createMood(selectedMood, note.trim())
      
      // Get song recommendations
      setLoading(true)
      const songRecs = await recommendationsAPI.getSongRecommendations(
        selectedMood, 
        note.trim(), 
        preferredGenre || undefined,
        recentSongs
      )
      
      setRecommendations(songRecs)
      
      // Save recommended songs to recent list
      const newSongs = songRecs.recommendations.map(r => `${r.artist} - ${r.title}`)
      saveRecentSongs(newSongs)
      
      // Clear form
      setNote('')
      setPreferredGenre('')
      
      // Reload recent entries
      await loadRecentEntries()
      
    } catch (error) {
      console.error('Failed to submit mood journal:', error)
      setError('Failed to save mood entry or get recommendations')
    } finally {
      setSubmitting(false)
      setLoading(false)
    }
  }

  const getSpotifySearchUrl = (song: SongRecommendation) => {
    const query = encodeURIComponent(`${song.artist} ${song.title}`)
    return `https://open.spotify.com/search/${query}`
  }

  const getYouTubeSearchUrl = (song: SongRecommendation) => {
    const query = encodeURIComponent(`${song.artist} ${song.title}`)
    return `https://www.youtube.com/results?search_query=${query}`
  }

  return (
    <div className="space-y-6">
      {/* Mood Journal Entry */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            Mood Journal with Soundtrack
          </CardTitle>
          <p className="text-gray-600">Share your mood and get personalized song recommendations</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Mood Selection */}
          <div>
            <label className="block text-sm font-medium mb-3">How are you feeling?</label>
            <div className="flex gap-3 justify-center">
              {moodEmojis.map((emoji, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedMood(index)}
                  className={`p-4 rounded-lg text-3xl transition-all duration-200 cursor-pointer hover:scale-110 active:scale-95 ${
                    selectedMood === index
                      ? 'bg-blue-100 ring-2 ring-blue-500 scale-110 shadow-lg'
                      : 'bg-gray-50 hover:bg-gray-100 hover:shadow-md'
                  }`}
                  title={moodLabels[index]}
                >
                  {emoji}
                </button>
              ))}
            </div>
            <p className="text-center text-sm text-gray-600 mt-2">
              {moodLabels[selectedMood]}
            </p>
          </div>

          {/* Journal Entry */}
          <div>
            <label htmlFor="note" className="block text-sm font-medium mb-2">
              What's on your mind? *
            </label>
            <Textarea
              id="note"
              placeholder="Describe your mood, what happened today, or what you're thinking about..."
              value={note}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNote(e.target.value)}
              className="min-h-24"
            />
          </div>

          {/* Genre Preference */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Preferred music genre (optional)
            </label>
            <Select value={preferredGenre} onValueChange={setPreferredGenre}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a genre or leave blank for variety" />
              </SelectTrigger>
              <SelectContent>
                {musicGenres.map((genre) => (
                  <SelectItem key={genre} value={genre}>
                    {genre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          <Button 
            onClick={handleSubmit} 
            className="w-full" 
            disabled={submitting || loading}
          >
            {submitting ? 'Saving...' : loading ? 'Getting Recommendations...' : 'Save & Get Song Recommendations'}
          </Button>
        </CardContent>
      </Card>

      {/* Song Recommendations */}
      {recommendations && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Your Personalized Soundtrack
            </CardTitle>
            <p className="text-gray-600">{recommendations.playlist_vibe}</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recommendations.recommendations.map((song, index) => (
                <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 hover:shadow-md transition-all duration-200 cursor-default group">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg group-hover:text-blue-600 transition-colors">{song.title}</h4>
                      <p className="text-gray-600 mb-2">by {song.artist}</p>
                      <p className="text-sm text-gray-700 mb-3">{song.reason}</p>
                      
                      {/* Song Metrics */}
                      <div className="flex gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Zap className="h-3 w-3" />
                          Energy: {song.energy.toFixed(1)}/5
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          Mood Match: {song.mood_match.toFixed(1)}/5
                        </div>
                      </div>
                    </div>
                    
                    {/* Play Buttons */}
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(getSpotifySearchUrl(song), '_blank')}
                        className="flex items-center gap-1 hover:bg-green-100 hover:border-green-300 hover:text-green-700 transition-all duration-200"
                      >
                        <Play className="h-3 w-3" />
                        Spotify
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(getYouTubeSearchUrl(song), '_blank')}
                        className="flex items-center gap-1 hover:bg-red-100 hover:border-red-300 hover:text-red-700 transition-all duration-200"
                      >
                        <Play className="h-3 w-3" />
                        YouTube
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Journal Entries */}
      {recentEntries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Journal Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentEntries.map((entry) => (
                <div key={entry._id} className="border-l-4 border-blue-200 pl-4 py-2 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 rounded-r-md cursor-default">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{moodEmojis[entry.mood]}</span>
                    <span className="text-sm text-gray-500">
                      {new Date(entry.timestamp).toLocaleDateString()} at{' '}
                      {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {entry.note && (
                    <p className="text-gray-700 text-sm">{entry.note}</p>
                  )}
                  {entry.song && (
                    <p className="text-blue-600 text-sm hover:text-blue-800 transition-colors">🎵 {entry.song}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
