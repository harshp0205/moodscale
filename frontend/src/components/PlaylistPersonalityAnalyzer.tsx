import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { playlistAPI, type PlaylistTrack, type PersonalityProfile } from '@/services/api'
import { Trash2, Plus, Music } from 'lucide-react'

const traitLabels = {
  openness: 'Openness to Experience',
  conscientiousness: 'Conscientiousness',
  extraversion: 'Extraversion',
  agreeableness: 'Agreeableness',
  neuroticism: 'Neuroticism'
}

const traitDescriptions = {
  openness: 'Creativity, curiosity, and willingness to try new things',
  conscientiousness: 'Organization, discipline, and goal-oriented behavior',
  extraversion: 'Sociability, assertiveness, and energy in social situations',
  agreeableness: 'Compassion, cooperation, and trust in others',
  neuroticism: 'Emotional instability, anxiety, and stress sensitivity'
}

export default function PlaylistPersonalityAnalyzer() {
  const [tracks, setTracks] = useState<PlaylistTrack[]>([
    { title: '', artist: '', genre: '', year: undefined }
  ])
  const [spotifyUrl, setSpotifyUrl] = useState('')
  const [useSpotify, setUseSpotify] = useState(false)
  const [personalityProfile, setPersonalityProfile] = useState<PersonalityProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addTrack = () => {
    setTracks([...tracks, { title: '', artist: '', genre: '', year: undefined }])
  }

  const removeTrack = (index: number) => {
    if (tracks.length > 1) {
      setTracks(tracks.filter((_, i) => i !== index))
    }
  }

  const updateTrack = (index: number, field: keyof PlaylistTrack, value: string | number) => {
    const updatedTracks = [...tracks]
    if (field === 'year') {
      updatedTracks[index][field] = value ? Number(value) : undefined
    } else {
      updatedTracks[index][field] = value as string
    }
    setTracks(updatedTracks)
  }

  const analyzePersonality = async () => {
    if (useSpotify) {
      if (!spotifyUrl.trim()) {
        setError('Please enter a valid Spotify playlist URL')
        return
      }
      
      setLoading(true)
      setError(null)
      
      try {
        const profile = await playlistAPI.analyzeSpotifyPlaylist(spotifyUrl.trim())
        setPersonalityProfile(profile)
      } catch (err: any) {
        const errorMessage = err.response?.data?.error || 'Failed to analyze Spotify playlist. Please try again.'
        setError(errorMessage)
        console.error('Spotify playlist analysis failed:', err)
      } finally {
        setLoading(false)
      }
    } else {
      const validTracks = tracks.filter(track => track.title.trim() && track.artist.trim())
      
      if (validTracks.length < 3) {
        setError('Please add at least 3 complete songs (title and artist required)')
        return
      }

      setLoading(true)
      setError(null)
      
      try {
        const profile = await playlistAPI.analyzePlaylist(validTracks)
        setPersonalityProfile(profile)
      } catch (err) {
        setError('Failed to analyze playlist. Please try again.')
        console.error('Playlist analysis failed:', err)
      } finally {
        setLoading(false)
      }
    }
  }

  const getTraitColor = (score: number) => {
    if (score >= 8) return 'bg-green-500'
    if (score >= 6) return 'bg-blue-500'
    if (score >= 4) return 'bg-yellow-500'
    if (score >= 2) return 'bg-orange-500'
    return 'bg-red-500'
  }

  const loadSamplePlaylist = () => {
    setTracks([
      { title: 'Bohemian Rhapsody', artist: 'Queen', genre: 'Rock', year: 1975 },
      { title: 'Stairway to Heaven', artist: 'Led Zeppelin', genre: 'Rock', year: 1971 },
      { title: 'Hotel California', artist: 'Eagles', genre: 'Rock', year: 1976 },
      { title: 'Sweet Child O\' Mine', artist: 'Guns N\' Roses', genre: 'Hard Rock', year: 1987 },
      { title: 'Imagine', artist: 'John Lennon', genre: 'Rock', year: 1971 },
      { title: 'Yesterday', artist: 'The Beatles', genre: 'Pop', year: 1965 },
      { title: 'Purple Haze', artist: 'Jimi Hendrix', genre: 'Rock', year: 1967 },
      { title: 'Like a Rolling Stone', artist: 'Bob Dylan', genre: 'Folk Rock', year: 1965 }
    ])
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Music className="h-6 w-6" />
            <span>Personality via Playlist</span>
          </CardTitle>
          <p className="text-gray-600">
            Add your favorite songs and discover what your music taste reveals about your personality using AI analysis.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Input Method Toggle */}
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            <span className="font-medium">Choose input method:</span>
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="spotify"
                name="inputMethod"
                checked={useSpotify}
                onChange={() => setUseSpotify(true)}
                className="text-blue-600"
              />
              <label htmlFor="spotify" className="cursor-pointer">Spotify Playlist URL</label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="manual"
                name="inputMethod"
                checked={!useSpotify}
                onChange={() => setUseSpotify(false)}
                className="text-blue-600"
              />
              <label htmlFor="manual" className="cursor-pointer">Manual Entry</label>
            </div>
          </div>

          {/* Spotify URL Input */}
          {useSpotify && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Spotify Playlist URL
                </label>
                <Input
                  placeholder="https://open.spotify.com/playlist/... or spotify:playlist:..."
                  value={spotifyUrl}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSpotifyUrl(e.target.value)}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Paste any Spotify playlist URL or just the playlist ID. Make sure the playlist is public.
                </p>
              </div>
            </div>
          )}

          {/* Manual Track Entry */}
          {!useSpotify && (
            <>
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Your Playlist</h3>
                <div className="space-x-2">
                  <Button onClick={loadSamplePlaylist} variant="outline" size="sm">
                    Load Sample
                  </Button>
                  <Button onClick={addTrack} variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Song
                  </Button>
                </div>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {tracks.map((track, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-center p-3 bg-gray-50 rounded-lg">
                    <Input
                      placeholder="Song title"
                      value={track.title}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateTrack(index, 'title', e.target.value)}
                      className="col-span-4"
                    />
                    <Input
                      placeholder="Artist"
                      value={track.artist}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateTrack(index, 'artist', e.target.value)}
                      className="col-span-3"
                    />
                    <Input
                      placeholder="Genre (optional)"
                      value={track.genre || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateTrack(index, 'genre', e.target.value)}
                      className="col-span-2"
                    />
                    <Input
                      placeholder="Year"
                      type="number"
                      value={track.year || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateTrack(index, 'year', e.target.value)}
                      className="col-span-2"
                    />
                    <Button
                      onClick={() => removeTrack(index)}
                      variant="ghost"
                      size="sm"
                      disabled={tracks.length === 1}
                      className="col-span-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </>
          )}

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}

          <Button
            onClick={analyzePersonality}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? 'Analyzing Your Personality...' : 'Analyze My Personality'}
          </Button>
        </CardContent>
      </Card>

      {personalityProfile && (
        <div className="space-y-6">
          {/* Playlist Metadata */}
          {personalityProfile.playlistMetadata && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {personalityProfile.playlistMetadata.playlistName}
                </CardTitle>
                <p className="text-gray-600">
                  Analyzed {personalityProfile.playlistMetadata.analyzedTracks} of {personalityProfile.playlistMetadata.totalTracks} tracks
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {personalityProfile.playlistMetadata.totalTracks}
                    </div>
                    <div className="text-sm text-gray-600">Total Tracks</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {personalityProfile.playlistMetadata.uniqueArtists}
                    </div>
                    <div className="text-sm text-gray-600">Unique Artists</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {personalityProfile.playlistMetadata.artistDiversity}
                    </div>
                    <div className="text-sm text-gray-600">Artist Diversity</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <div className="text-lg font-bold text-orange-600">
                      {personalityProfile.playlistMetadata.yearRange}
                    </div>
                    <div className="text-sm text-gray-600">Year Range</div>
                  </div>
                </div>
                {personalityProfile.playlistMetadata.topArtists && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Top Artists:</h4>
                    <div className="flex flex-wrap gap-2">
                      {personalityProfile.playlistMetadata.topArtists.map((artist: string, index: number) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 rounded-md text-sm">
                          {artist}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Personality Traits */}
          <Card>
            <CardHeader>
              <CardTitle>Your Personality Profile</CardTitle>
              <p className="text-gray-600">{personalityProfile.summary}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(personalityProfile.traits).map(([trait, score]) => (
                  <div key={trait} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">
                        {traitLabels[trait as keyof typeof traitLabels]}
                      </span>
                      <span className="text-sm text-gray-600">
                        {score.toFixed(1)}/10
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full ${getTraitColor(score)} transition-all duration-500`}
                        style={{ width: `${(score / 10) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      {traitDescriptions[trait as keyof typeof traitDescriptions]}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Music Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Your Music Preferences</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {personalityProfile.musicPreferences.map((preference, index) => (
                  <div
                    key={index}
                    className="bg-blue-50 text-blue-800 px-3 py-2 rounded-lg text-sm"
                  >
                    {preference}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Personality Insights */}
          <Card>
            <CardHeader>
              <CardTitle>Personality Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {personalityProfile.personalityInsights.map((insight, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mt-1">
                      <span className="text-purple-600 text-xs font-bold">{index + 1}</span>
                    </div>
                    <p className="text-gray-700">{insight}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Personalized Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {personalityProfile.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-1">
                      <span className="text-green-600 text-xs font-bold">💡</span>
                    </div>
                    <p className="text-gray-700">{recommendation}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
