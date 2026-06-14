import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IReadingEntry {
  _id?: mongoose.Types.ObjectId;
  type: string;          // "surah" | "dhikr" | "dua" | "salah" | "pages" | "juz" | "custom"
  name: string;          // "Al-Fatiha", "SubhanAllah", "Fajr"
  nameArabic?: string;
  count: number;
  notes?: string;
}

export interface IReadingLog extends Document {
  userId: mongoose.Types.ObjectId;
  date: string;            // "YYYY-MM-DD" Gregorian
  hijriDate: string;       // "DD-MM-YYYY"
  hijriDay: number;
  hijriMonth: number;      // 1–12
  hijriMonthName: string;  // "Dhul Hijjah"
  hijriYear: number;
  gregorianMonth: number;
  gregorianYear: number;
  entries: IReadingEntry[];
  isDayComplete: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ReadingEntrySchema = new Schema<IReadingEntry>({
  type:       { type: String, required: true },
  name:       { type: String, required: true },
  nameArabic: { type: String },
  count:      { type: Number, required: true, min: 1 },
  notes:      { type: String },
}, { _id: true });

const ReadingLogSchema = new Schema<IReadingLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: String, required: true },
    hijriDate: { type: String },
    hijriDay: { type: Number },
    hijriMonth: { type: Number },
    hijriMonthName: { type: String },
    hijriYear: { type: Number },
    gregorianMonth: { type: Number, index: true },
    gregorianYear: { type: Number, index: true },
    entries: [ReadingEntrySchema],
    isDayComplete: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// One document per user per day
ReadingLogSchema.index({ userId: 1, date: 1 }, { unique: true });
// For Gregorian monthly summary
ReadingLogSchema.index({ userId: 1, gregorianYear: 1, gregorianMonth: 1 });
// For Islamic monthly summary
ReadingLogSchema.index({ userId: 1, hijriYear: 1, hijriMonth: 1 });

export const ReadingLog: Model<IReadingLog> =
  mongoose.models.ReadingLog || mongoose.model<IReadingLog>('ReadingLog', ReadingLogSchema);
