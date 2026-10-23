import { Metadata } from 'next';
import SurahReader from '@/components/quran/SurahReader';
import { getSurahMeta } from '@/lib/quranData';

interface SurahPageProps {
  params: Promise<{ surah: string }>;
}

export async function generateMetadata(props: SurahPageProps): Promise<Metadata> {
  const { surah } = await props.params;
  const surahNum = parseInt(surah, 10) || 1;
  const meta = getSurahMeta(surahNum);

  if (!meta) {
    return {
      title: 'Surah Not Found | Quran Daily Tracker',
    };
  }

  return {
    title: `Surah ${meta.english} (${meta.arabic}) - Read & Listen | Quran Daily Tracker`,
    description: `Read Surah ${meta.english} (${meta.verses} verses) with translations, Tafsir context, and audio recitations by world renowned Qaris.`,
  };
}

export default async function SurahDetailPage(props: SurahPageProps) {
  const { surah } = await props.params;
  const surahNum = parseInt(surah, 10) || 1;

  return <SurahReader surahNumber={surahNum} />;
}
