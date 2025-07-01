import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { moodAPI, type MoodEntry } from '@/services/api'

const moodEmojis = ['😢', '😕', '😐', '😊', '😄']
const moodLabels = ['Very Sad', 'Sad', 'Neutral', 'Happy', 'Very Happy']

export default function MoodTracker() {
  const [selectedMood, setSelectedMood] = useState<number | null>(null)
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([])
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [aiInsight, setAiInsight] = useState<string | null>(null)
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set())

  // Load mood entries on component mount
  useEffect(() => {
    loadMoodEntries()
  }, [])

  const loadMoodEntries = async () => {
    try {
      const entries = await moodAPI.getMoods()
      setMoodEntries(entries.map(entry => ({
        ...entry,
        timestamp: new Date(entry.timestamp)
      })))
    } catch (error) {
      console.error('Failed to load mood entries:', error)
    }
  }

  const handleMoodSubmit = async () => {
    if (selectedMood !== null) {
      setLoading(true)
      try {
        const result = await moodAPI.createMood(selectedMood, note.trim() || undefined)
        
        // Refresh mood entries from server
        await loadMoodEntries()
        
        // Show AI insight if available
        if (result.aiInsight) {
          setAiInsight(result.aiInsight)
          setTimeout(() => setAiInsight(null), 5000) // Hide after 5 seconds
        }
        
        // Reset form
        setSelectedMood(null)
        setNote('')
      } catch (error) {
        console.error('Failed to save mood entry:', error)
        alert('Failed to save mood entry. Please try again.')
      } finally {
        setLoading(false)
      }
    }
  }

  const handleDeleteMood = async (entryId: string) => {
    if (!confirm('Are you sure you want to delete this mood entry?')) {
      return
    }

    setDeletingIds(prev => new Set(prev).add(entryId))
    try {
      await moodAPI.deleteMood(entryId)
      // Refresh mood entries from server
      await loadMoodEntries()
    } catch (error) {
      console.error('Failed to delete mood entry:', error)
      alert('Failed to delete mood entry. Please try again.')
    } finally {
      setDeletingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(entryId)
        return newSet
      })
    }
  }

  return (
    <div className="space-y-6">
      {aiInsight && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <span className="text-2xl">🤖</span>
              <div>
                <h4 className="font-medium text-blue-900">AI Insight</h4>
                <p className="text-blue-800 mt-1">{aiInsight}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Track Your Mood</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-5 gap-4">
            {moodEmojis.map((emoji, index) => (
              <button
                key={index}
                onClick={() => setSelectedMood(index)}
                className={`p-4 text-4xl rounded-lg transition-all duration-200 hover:scale-105 cursor-pointer active:scale-95 ${
                  selectedMood === index
                    ? 'bg-blue-500 text-white shadow-lg ring-2 ring-blue-300'
                    : 'bg-gray-100 hover:bg-blue-100 hover:shadow-md'
                }`}
              >
                <div className="text-center">
                  <div>{emoji}</div>
                  <div className="text-xs mt-1 font-medium">
                    {moodLabels[index]}
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add a note (optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="How are you feeling? What's happening in your life?"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
            />
          </div>

          <Button
            onClick={handleMoodSubmit}
            disabled={selectedMood === null || loading}
            className="w-full"
          >
            {loading ? 'Saving...' : 'Save Mood Entry'}
          </Button>
        </CardContent>
      </Card>

      {moodEntries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Mood Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {moodEntries.slice(0, 5).map((entry) => (
                <div
                  key={entry._id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 hover:shadow-md transition-all duration-200 group"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{moodEmojis[entry.mood]}</span>
                    <div className="flex-1">
                      <div className="font-medium group-hover:text-blue-600 transition-colors">{moodLabels[entry.mood]}</div>
                      <div className="text-sm text-gray-500">
                        {entry.timestamp.toLocaleString()}
                      </div>
                      {entry.note && (
                        <div className="text-sm text-gray-700 mt-1">
                          "{entry.note}"
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    onClick={() => handleDeleteMood(entry._id)}
                    disabled={deletingIds.has(entry._id)}
                    variant="destructive"
                    size="sm"
                    className="ml-4 hover:bg-red-600 hover:shadow-md transition-all duration-200"
                  >
                    {deletingIds.has(entry._id) ? 'Deleting...' : 'Delete'}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
