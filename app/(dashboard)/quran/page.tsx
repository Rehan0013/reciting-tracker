import { Metadata } from 'next';
import SurahList from '@/components/quran/SurahList';

export const metadata: Metadata = {
  title: 'The Holy Quran - Read, Listen & Tafsir | Quran Daily Tracker',
  description: 'Read the complete Quran with authentic Uthmani script, translations, scholarly Tafsir context, and audio recitation by renowned Qaris.',
};

export default function QuranIndexPage() {
  return <SurahList />;
}
