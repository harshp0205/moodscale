import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface MoodEntry {
  _id: string;
  mood: number;
  timestamp: Date;
  note?: string;
  song?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MusicAnalysis {
  title: string;
  artist: string;
  energy: number;
  valence: number;
  danceability: number;
  tempo: number;
  moodPrediction: string;
}

export interface AIInsights {
  insights: string[];
  recommendations: string[];
  averageMood: number;
  streak: number;
  totalDays: number;
  dailyAverages: {
    date: string;
    averageMood: number;
    entryCount: number;
  }[];
}

export interface PlaylistTrack {
  title: string;
  artist: string;
  genre?: string;
  year?: number;
}

export interface PersonalityProfile {
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
  playlistMetadata?: {
    playlistName: string;
    totalTracks: number;
    analyzedTracks: number;
    uniqueArtists: number;
    yearRange: string;
    artistDiversity: string;
    topArtists: string[];
  };
}

// Mood API
export const moodAPI = {
  getMoods: async (): Promise<MoodEntry[]> => {
    const response = await api.get('/moods');
    return response.data;
  },

  createMood: async (mood: number, note?: string, song?: string) => {
    const response = await api.post('/moods', { mood, note, song });
    return response.data;
  },

  deleteMood: async (id: string) => {
    const response = await api.delete(`/moods/${id}`);
    return response.data;
  },
};

// Music API
export const musicAPI = {
  analyzeSong: async (songUrl: string, title?: string, artist?: string): Promise<MusicAnalysis> => {
    const response = await api.post('/music/analyze', { songUrl, title, artist });
    return response.data;
  },
};

// Insights API
export const insightsAPI = {
  getInsights: async (): Promise<AIInsights> => {
    const response = await api.get('/insights');
    return response.data;
  },
};

// Playlist Personality Analysis API
export const playlistAPI = {
  analyzePlaylist: async (tracks: PlaylistTrack[]): Promise<PersonalityProfile> => {
    const response = await api.post('/playlist/analyze', { tracks });
    return response.data;
  },

  analyzeSpotifyPlaylist: async (spotifyUrl: string): Promise<PersonalityProfile> => {
    const response = await api.post('/playlist/analyze', { spotifyUrl });
    return response.data;
  },
};

export interface SongRecommendation {
  title: string;
  artist: string;
  reason: string;
  energy: number;
  mood_match: number;
}

export interface SongRecommendations {
  recommendations: SongRecommendation[];
  playlist_vibe: string;
}

// ...existing code...

// Song Recommendations API
export const recommendationsAPI = {
  getSongRecommendations: async (
    mood: number, 
    note?: string, 
    genre?: string, 
    previousSongs?: string[]
  ): Promise<SongRecommendations> => {
    const response = await api.post('/recommend-songs', { 
      mood, 
      note, 
      genre, 
      previousSongs 
    });
    return response.data;
  },
};

// Health check
export const healthCheck = async () => {
  const response = await api.get('/health');
  return response.data;
};
