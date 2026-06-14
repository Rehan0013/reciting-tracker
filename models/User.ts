import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IReadingType {
  label: string;
  unit: string;        // "times" | "pages" | "rakaat"
  isActive: boolean;
  isCustom: boolean;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  readingTypes: IReadingType[];
  reminderTime: string | null;   // e.g. "20:00"
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  name:         { type: String, required: true, trim: true },
  email:        { type: String, required: true, unique: true, lowercase: true },
  password:     { type: String, required: true },
  readingTypes: [{
    label:    { type: String, required: true },
    unit:     { type: String, default: 'times' },
    isActive: { type: Boolean, default: true },
    isCustom: { type: Boolean, default: false },
  }],
  reminderTime: { type: String, default: null },
}, { timestamps: true });

// Hash password before save
UserSchema.pre('save', async function (this: any) {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Seed default reading types on first register
UserSchema.pre('save', function (this: any) {
  if (this.isNew && (!this.readingTypes || this.readingTypes.length === 0)) {
    this.readingTypes = [
      { label: 'Surah',       unit: 'times',  isActive: true, isCustom: false },
      { label: 'Quran Pages', unit: 'pages',  isActive: true, isCustom: false },
      { label: 'Juz',         unit: 'times',  isActive: true, isCustom: false },
      { label: 'Dhikr',       unit: 'times',  isActive: true, isCustom: false },
      { label: 'Dua',         unit: 'times',  isActive: true, isCustom: false },
      { label: 'Salah',       unit: 'times',  isActive: true, isCustom: false },
      { label: 'Tahajjud',    unit: 'rakaat', isActive: true, isCustom: false },
    ];
  }
});

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
