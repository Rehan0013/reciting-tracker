import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const surah = searchParams.get('surah');
    const ayah = searchParams.get('ayah');
    const tafsirId = searchParams.get('tafsirId') || '169'; // Default: Ibn Kathir (English)

    if (!surah || !ayah) {
      return NextResponse.json(
        { ok: false, error: 'Both surah and ayah query parameters are required.' },
        { status: 400 }
      );
    }

    const surahNum = parseInt(surah, 10);
    const ayahNum = parseInt(ayah, 10);

    if (isNaN(surahNum) || isNaN(ayahNum)) {
      return NextResponse.json(
        { ok: false, error: 'Surah and ayah must be valid numbers.' },
        { status: 400 }
      );
    }

    // Parallel fetch: Verse Tafsir from Quran.com + Surah Historical Info
    const [tafsirRes, chapterInfoRes] = await Promise.all([
      fetch(`https://api.quran.com/api/v4/tafsirs/${tafsirId}/by_ayah/${surahNum}:${ayahNum}`, {
        next: { revalidate: 86400 },
      }),
      fetch(`https://api.quran.com/api/v4/chapters/${surahNum}/info?language=en`, {
        next: { revalidate: 86400 },
      }),
    ]);

    let tafsirData = null;
    if (tafsirRes.ok) {
      tafsirData = await tafsirRes.json();
    }

    let chapterInfoData = null;
    if (chapterInfoRes.ok) {
      chapterInfoData = await chapterInfoRes.json();
    }

    const tafsirItem = tafsirData?.tafsir;
    const chapterInfo = chapterInfoData?.chapter_info;

    return NextResponse.json(
      {
        ok: true,
        surah: surahNum,
        ayah: ayahNum,
        tafsir: {
          id: parseInt(tafsirId, 10),
          resourceName: tafsirItem?.resource_name || tafsirItem?.translated_name?.name || 'Tafsir',
          slug: tafsirItem?.slug || '',
          text: tafsirItem?.text || '<p>No specific tafsir commentary text was returned for this verse.</p>',
        },
        surahContext: {
          shortText: chapterInfo?.short_text || '',
          text: chapterInfo?.text || '',
          source: chapterInfo?.source || 'Tafhim al-Qur\'an',
        },
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=86400',
        },
      }
    );
  } catch (error: any) {
    console.error('Error in GET /api/quran/tafsir:', error);
    return NextResponse.json(
      { ok: false, error: error.message || 'Failed to fetch tafsir data' },
      { status: 500 }
    );
  }
}
