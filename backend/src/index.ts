import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { connectDB } from './config/database';
import { MoodEntry, IMoodEntry } from './models/MoodEntry';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Types
interface MoodEntryRequest {
  mood: number;
  note?: string;
  song?: string;
}

interface MusicAnalysis {
  title: string;
  artist: string;
  energy: number;
  valence: number;
  danceability: number;
  tempo: number;
  moodPrediction: string;
}

interface PlaylistTrack {
  title: string;
  artist: string;
  genre?: string;
  year?: number;
  album?: string;
  duration?: number;
}

interface PersonalityProfile {
  traits: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  };
  summary: string;
  musicPreferences: string[];
  personalityInsights: string[];
  recommendations: string[];
}

interface SpotifyTrack {
  name: string;
  artists: Array<{ name: string }>;
  album: {
    name: string;
    release_date: string;
  };
  duration_ms: number;
}

// Spotify API functions
const getSpotifyAccessToken = async (): Promise<string | null> => {
  try {
    if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET) {
      console.log('Spotify credentials not configured');
      return null;
    }

    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      'grant_type=client_credentials',
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(
            `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
          ).toString('base64')}`
        }
      }
    );

    return response.data.access_token;
  } catch (error) {
    console.error('Error getting Spotify access token:', error);
    return null;
  }
};

const extractPlaylistId = (spotifyUrl: string): string | null => {
  // Handle different Spotify URL formats
  const patterns = [
    /spotify:playlist:([a-zA-Z0-9]+)/,
    /open\.spotify\.com\/playlist\/([a-zA-Z0-9]+)/,
    /^([a-zA-Z0-9]+)$/ // Direct playlist ID
  ];

  for (const pattern of patterns) {
    const match = spotifyUrl.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
};

const getSpotifyPlaylistTracks = async (playlistId: string, accessToken: string): Promise<{tracks: PlaylistTrack[], totalTracks: number, playlistName: string}> => {
  try {
    // First, get playlist info to get total track count and name
    const playlistInfoResponse = await axios.get(
      `https://api.spotify.com/v1/playlists/${playlistId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        params: {
          fields: 'name,tracks(total)'
        }
      }
    );

    const totalTracks = playlistInfoResponse.data.tracks.total;
    const playlistName = playlistInfoResponse.data.name;

    // Then get the tracks (limit to 50 for analysis, but report actual total)
    const tracksResponse = await axios.get(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        params: {
          limit: 50, // Analyze up to 50 tracks for performance
          fields: 'items(track(name,artists(name),album(name,release_date),duration_ms))'
        }
      }
    );

    const tracks: PlaylistTrack[] = tracksResponse.data.items
      .filter((item: any) => item.track && item.track.name) // Filter out null tracks
      .map((item: any) => {
        const track: SpotifyTrack = item.track;
        return {
          title: track.name,
          artist: track.artists.map(artist => artist.name).join(', '),
          album: track.album.name,
          year: track.album.release_date ? new Date(track.album.release_date).getFullYear() : undefined,
          duration: Math.floor(track.duration_ms / 1000) // Convert to seconds
        };
      });

    return { tracks, totalTracks, playlistName };
  } catch (error) {
    console.error('Error fetching Spotify playlist tracks:', error);
    throw new Error('Failed to fetch playlist tracks from Spotify');
  }
};

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Get all mood entries
app.get('/api/moods', async (req, res) => {
  try {
    const moodEntries = await MoodEntry.find()
      .sort({ timestamp: -1 })
      .limit(50);
    res.json(moodEntries);
  } catch (error) {
    console.error('Error fetching mood entries:', error);
    res.status(500).json({ error: 'Failed to fetch mood entries' });
  }
});

// Create a new mood entry
app.post('/api/moods', async (req, res) => {
  try {
    const { mood, note, song }: MoodEntryRequest = req.body;

    if (typeof mood !== 'number' || mood < 0 || mood > 4) {
      return res.status(400).json({ error: 'Mood must be a number between 0 and 4' });
    }

    const newEntry = new MoodEntry({
      mood,
      note: note?.trim() || undefined,
      song: song?.trim() || undefined,
      timestamp: new Date()
    });

    const savedEntry = await newEntry.save();

    // Generate AI insight for the mood entry
    let aiInsight = null;
    if (process.env.GEMINI_API_KEY) {
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const moodLabels = ['very sad', 'sad', 'neutral', 'happy', 'very happy'];
        const prompt = `Provide a brief, encouraging insight for someone who just recorded a "${moodLabels[mood]}" mood${note ? ` with the note: "${note}"` : ''}. Keep it under 50 words and be supportive.`;
        
        const result = await model.generateContent(prompt);
        aiInsight = result.response.text().trim();
      } catch (error) {
        console.error('AI insight generation failed:', error);
      }
    }

    res.json({ 
      entry: savedEntry,
      aiInsight 
    });
  } catch (error) {
    console.error('Error creating mood entry:', error);
    res.status(500).json({ error: 'Failed to create mood entry' });
  }
});

// Delete a mood entry
app.delete('/api/moods/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: 'Mood entry ID is required' });
    }

    const deletedEntry = await MoodEntry.findByIdAndDelete(id);
    
    if (!deletedEntry) {
      return res.status(404).json({ error: 'Mood entry not found' });
    }

    res.json({ message: 'Mood entry deleted successfully', entry: deletedEntry });
  } catch (error) {
    console.error('Error deleting mood entry:', error);
    res.status(500).json({ error: 'Failed to delete mood entry' });
  }
});

// Analyze music and predict mood
app.post('/api/music/analyze', async (req, res) => {
  try {
    const { songUrl, title, artist } = req.body;

    // Mock music analysis (replace with real music analysis API)
    const mockAnalysis: MusicAnalysis = {
      title: title || 'Unknown Song',
      artist: artist || 'Unknown Artist',
      energy: Math.random(),
      valence: Math.random(),
      danceability: Math.random(),
      tempo: 120 + Math.random() * 60,
      moodPrediction: ''
    };

    // Use Gemini AI to predict mood based on music features
    if (process.env.GEMINI_API_KEY) {
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = `Based on these music features, predict the mood this song might evoke (one word):
        Energy: ${mockAnalysis.energy.toFixed(2)}
        Happiness: ${mockAnalysis.valence.toFixed(2)}
        Danceability: ${mockAnalysis.danceability.toFixed(2)}
        Tempo: ${mockAnalysis.tempo.toFixed(0)} BPM
        Title: ${mockAnalysis.title}
        Artist: ${mockAnalysis.artist}`;
        
        const result = await model.generateContent(prompt);
        mockAnalysis.moodPrediction = result.response.text().trim();
      } catch (error) {
        console.error('AI mood prediction failed:', error);
        mockAnalysis.moodPrediction = 'Neutral';
      }
    } else {
      mockAnalysis.moodPrediction = 'Neutral';
    }

    res.json(mockAnalysis);
  } catch (error) {
    console.error('Error analyzing music:', error);
    res.status(500).json({ error: 'Failed to analyze music' });
  }
});

// Analyze Spotify playlist for personality insights
app.post('/api/playlist/analyze', async (req, res) => {
  try {
    const { spotifyUrl, tracks }: { spotifyUrl?: string; tracks?: PlaylistTrack[] } = req.body;

    let playlistTracks: PlaylistTrack[] = [];
    let totalPlaylistTracks = 0;
    let playlistName = '';

    // If Spotify URL is provided, fetch tracks from Spotify
    if (spotifyUrl) {
      const playlistId = extractPlaylistId(spotifyUrl);
      if (!playlistId) {
        return res.status(400).json({ 
          error: 'Invalid Spotify URL. Please provide a valid Spotify playlist URL or ID.' 
        });
      }

      const accessToken = await getSpotifyAccessToken();
      if (!accessToken) {
        return res.status(500).json({ 
          error: 'Spotify integration not configured. Please set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET.' 
        });
      }

      try {
        const spotifyData = await getSpotifyPlaylistTracks(playlistId, accessToken);
        playlistTracks = spotifyData.tracks;
        totalPlaylistTracks = spotifyData.totalTracks;
        playlistName = spotifyData.playlistName;
      } catch (error) {
        return res.status(400).json({ 
          error: 'Failed to fetch playlist from Spotify. Please check the URL and make sure the playlist is public.' 
        });
      }
    } 
    // Otherwise, use manually provided tracks
    else if (tracks && Array.isArray(tracks) && tracks.length > 0) {
      playlistTracks = tracks;
      totalPlaylistTracks = tracks.length;
      playlistName = 'Manual Playlist';
    } 
    else {
      return res.status(400).json({ 
        error: 'Please provide either a Spotify playlist URL or an array of tracks.' 
      });
    }

    if (playlistTracks.length === 0) {
      return res.status(400).json({ 
        error: 'No tracks found in the playlist.' 
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'AI service not configured' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    // Prepare playlist data for analysis
    const playlistSummary = playlistTracks.slice(0, 30).map(track => 
      `${track.title} by ${track.artist}${track.album ? ` (${track.album})` : ''}${track.year ? ` [${track.year}]` : ''}`
    ).join('\n');

    const artists = playlistTracks.map(t => t.artist);
    const years = playlistTracks.map(t => t.year).filter((year): year is number => year !== undefined);
    const uniqueArtists = [...new Set(artists)];

    const prompt = `Analyze this music playlist to create a detailed personality profile using the Big Five personality traits (Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism).

PLAYLIST ANALYSIS (${playlistTracks.length} songs):
${playlistSummary}

METADATA:
- Total tracks: ${playlistTracks.length}
- Unique artists: ${uniqueArtists.length}
- Top artists: ${uniqueArtists.slice(0, 5).join(', ')}
- Year range: ${years.length > 0 ? `${Math.min(...years)} - ${Math.max(...years)}` : 'Various'}
- Artist diversity: ${((uniqueArtists.length / playlistTracks.length) * 100).toFixed(1)}%

Based on music psychology research, analyze:
1. Musical diversity and exploration (Openness)
2. Playlist organization and consistency (Conscientiousness) 
3. Social vs. introspective music choices (Extraversion)
4. Collaborative and harmonious vs. aggressive music (Agreeableness)
5. Emotional intensity and mood patterns (Neuroticism)

Consider factors like:
- Genre diversity and experimental music choices
- Era preferences (nostalgia vs. current trends)
- Artist mainstream popularity vs. niche selections
- Emotional themes and energy levels
- Cultural and linguistic diversity

Provide a comprehensive personality analysis with scores 1-10 for each trait.

Respond with valid JSON only:
{
  "traits": {
    "openness": number,
    "conscientiousness": number,
    "extraversion": number,
    "agreeableness": number,
    "neuroticism": number
  },
  "summary": "detailed 2-3 sentence personality summary",
  "musicPreferences": ["preference1", "preference2", "preference3", "preference4"],
  "personalityInsights": ["insight1", "insight2", "insight3", "insight4"],
  "recommendations": ["recommendation1", "recommendation2", "recommendation3"]
}`;

    const result = await model.generateContent(prompt);
    let responseText = result.response.text().trim();
    
    // Clean up the response to ensure it's valid JSON
    if (responseText.startsWith('```json')) {
      responseText = responseText.replace(/```json\n?/, '').replace(/\n?```$/, '');
    }
    
    try {
      const aiResponse = JSON.parse(responseText);
      
      // Add metadata to the response
      const enhancedResponse = {
        ...aiResponse,
        playlistMetadata: {
          playlistName,
          totalTracks: totalPlaylistTracks,
          analyzedTracks: playlistTracks.length,
          uniqueArtists: uniqueArtists.length,
          yearRange: years.length > 0 ? `${Math.min(...years)} - ${Math.max(...years)}` : 'Various',
          artistDiversity: ((uniqueArtists.length / playlistTracks.length) * 100).toFixed(1) + '%',
          topArtists: uniqueArtists.slice(0, 5)
        }
      };
      
      res.json(enhancedResponse);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.error('Raw response:', responseText);
      res.status(500).json({ error: 'Failed to analyze playlist - invalid AI response format' });
    }

  } catch (error) {
    console.error('Error analyzing playlist:', error);
    res.status(500).json({ error: 'Failed to analyze playlist' });
  }
});

// AI Insights
app.get('/api/insights', async (_req, res) => {
  try {
    const moodEntries = await MoodEntry.find()
      .sort({ timestamp: -1 });

    if (moodEntries.length === 0) {
      return res.json({ 
        insights: ['Start tracking your mood to get personalized insights!'], 
        recommendations: ['Record your first mood entry to begin your journey.'],
        averageMood: 2,
        streak: 0,
        totalDays: 0,
        dailyAverages: []
      });
    }

    // Group moods by day and calculate daily averages
    const dailyMoods = new Map<string, number[]>();
    moodEntries.forEach((entry: IMoodEntry) => {
      const dateKey = entry.timestamp.toISOString().split('T')[0];
      if (!dailyMoods.has(dateKey)) {
        dailyMoods.set(dateKey, []);
      }
      dailyMoods.get(dateKey)!.push(entry.mood);
    });

    // Calculate daily averages
    const dailyAverages = Array.from(dailyMoods.entries())
      .map(([date, moods]) => ({
        date,
        averageMood: moods.reduce((sum, mood) => sum + mood, 0) / moods.length,
        entryCount: moods.length
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Calculate streak (consecutive days with mood entries)
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < dailyAverages.length; i++) {
      const entryDate = new Date(dailyAverages[i].date);
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);
      
      if (entryDate.getTime() === expectedDate.getTime()) {
        streak++;
      } else {
        break;
      }
    }

    // Overall average across all days
    const overallAverage = dailyAverages.reduce((sum, day) => sum + day.averageMood, 0) / dailyAverages.length;
    
    let insights: string[] = [];
    let recommendations: string[] = [];

    if (process.env.GEMINI_API_KEY) {
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const recentDailyMoods = dailyAverages.slice(0, 7).map(d => d.averageMood.toFixed(1));
        const prompt = `Analyze this mood data and provide 2 insights and 2 recommendations:
        Recent daily mood averages: ${recentDailyMoods.join(', ')} (scale 0-4)
        Overall average: ${overallAverage.toFixed(1)}
        Tracking streak: ${streak} days
        Total tracking days: ${dailyAverages.length}
        Recent notes: ${moodEntries.slice(0, 3).map((e: IMoodEntry) => e.note).filter(Boolean).join('; ')}
        
        Format as JSON: {"insights": ["insight1", "insight2"], "recommendations": ["rec1", "rec2"]}`;
        
        const result = await model.generateContent(prompt);
        const aiResponse = JSON.parse(result.response.text());
        insights = aiResponse.insights || [];
        recommendations = aiResponse.recommendations || [];
      } catch (error) {
        console.error('AI insights generation failed:', error);
        insights = [
          `Your average daily mood is ${overallAverage.toFixed(1)}/4 across ${dailyAverages.length} days.`,
          `You have a ${streak}-day tracking streak!`
        ];
        recommendations = [
          'Keep tracking your mood daily for better insights!',
          'Try to identify patterns in your mood changes.'
        ];
      }
    } else {
      insights = [
        `Your average daily mood is ${overallAverage.toFixed(1)}/4 across ${dailyAverages.length} days.`,
        `You have a ${streak}-day tracking streak!`
      ];
      recommendations = [
        'Keep tracking your mood daily for better insights!',
        'Try to identify patterns in your mood changes.'
      ];
    }

    res.json({ 
      insights, 
      recommendations, 
      averageMood: overallAverage,
      streak,
      totalDays: dailyAverages.length,
      dailyAverages: dailyAverages.slice(0, 30) // Return last 30 days
    });
  } catch (error) {
    console.error('Error generating insights:', error);
    res.status(500).json({ error: 'Failed to generate insights' });
  }
});

// Song Recommendations based on mood
app.post('/api/recommend-songs', async (req, res) => {
  try {
    const { mood, note, genre, previousSongs }: { mood: number; note?: string; genre?: string; previousSongs?: string[] } = req.body;

    if (typeof mood !== 'number' || mood < 0 || mood > 4) {
      return res.status(400).json({ error: 'Mood must be a number between 0 and 4' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'AI service not configured' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const moodLabels = ['very sad', 'sad', 'neutral', 'happy', 'very happy'];
    const moodLabel = moodLabels[mood];

    const prompt = `Recommend 5 songs for someone feeling "${moodLabel}"${note ? ` with the note: "${note}"` : ''}${genre ? ` who likes ${genre} music` : ''}.
    
    Consider:
    - Mood-appropriate songs (matching or uplifting)
    - Mix of popular and lesser-known tracks
    - Various artists and time periods
    ${previousSongs && previousSongs.length > 0 ? `- Avoid these recently recommended songs: ${previousSongs.join(', ')}` : ''}
    
    Return as JSON:
    {
      "recommendations": [
        {
          "title": "Song Title",
          "artist": "Artist Name",
          "reason": "Why this song fits the mood (1 sentence)",
          "energy": 3.5,
          "mood_match": 4.2
        }
      ],
      "playlist_vibe": "A brief description of the overall playlist mood and theme"
    }`;

    const result = await model.generateContent(prompt);
    let responseText = result.response.text().trim();
    
    // Clean up the response
    if (responseText.startsWith('```json')) {
      responseText = responseText.replace(/```json\n?/, '').replace(/\n?```$/, '');
    }
    
    try {
      const recommendations = JSON.parse(responseText);
      res.json(recommendations);
    } catch (parseError) {
      console.error('Failed to parse AI recommendation response:', parseError);
      console.error('Raw response:', responseText);
      
      // Fallback recommendations
      const fallbackRecommendations = {
        recommendations: [
          {
            title: "Here Comes the Sun",
            artist: "The Beatles",
            reason: "A timeless uplifting classic that brightens any mood.",
            energy: 3.8,
            mood_match: 4.0
          },
          {
            title: "Good as Hell",
            artist: "Lizzo",
            reason: "Empowering and energetic, perfect for self-love.",
            energy: 4.5,
            mood_match: mood >= 3 ? 4.2 : 3.0
          },
          {
            title: "Weightless",
            artist: "Marconi Union",
            reason: "Scientifically designed to reduce anxiety and stress.",
            energy: 1.5,
            mood_match: mood <= 2 ? 4.0 : 2.5
          }
        ].slice(0, mood >= 3 ? 2 : 3),
        playlist_vibe: mood >= 3 ? "Upbeat and energizing vibes" : "Calming and restorative atmosphere"
      };
      
      res.json(fallbackRecommendations);
    }

  } catch (error) {
    console.error('Error generating song recommendations:', error);
    res.status(500).json({ error: 'Failed to generate song recommendations' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 MoodScale Backend Server running on port ${PORT}`);
  console.log(`🤖 Gemini AI: ${process.env.GEMINI_API_KEY ? 'Enabled' : 'Disabled (set GEMINI_API_KEY)'}`);
  console.log(`🎵 Spotify: ${process.env.SPOTIFY_CLIENT_ID ? 'Enabled' : 'Disabled (set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET)'}`);
});
