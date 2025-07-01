import mongoose, { Document, Schema } from 'mongoose';

// MoodEntry interface extending Mongoose Document
export interface IMoodEntry extends Document {
  mood: number;
  timestamp: Date;
  note?: string;
  song?: string;
}

// MongoDB Schema for MoodEntry
const MoodEntrySchema: Schema = new Schema({
  mood: {
    type: Number,
    required: true,
    min: 0,
    max: 4 // 0-4 scale (matching frontend 😢😕😐😊😄)
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  note: {
    type: String,
    maxlength: 500
  },
  song: {
    type: String,
    maxlength: 200
  }
}, {
  timestamps: true // Adds createdAt and updatedAt automatically
});

// Create and export the model
export const MoodEntry = mongoose.model<IMoodEntry>('MoodEntry', MoodEntrySchema);
