import { NextResponse } from 'next/server';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const surahId = parseInt(id, 10);

    if (isNaN(surahId) || surahId < 1 || surahId > 114) {
      return NextResponse.json(
        { ok: false, error: 'Invalid surah number. Must be between 1 and 114.' },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const translation = searchParams.get('translation') || 'en.sahih';
    const reciter = searchParams.get('reciter') || 'ar.alafasy';

    // Al-Quran Cloud supports fetching multiple editions in a single comma-separated request
    const editions = `quran-uthmani,${translation},${reciter}`;
    const url = `https://api.alquran.cloud/v1/surah/${surahId}/editions/${editions}`;

    const res = await fetch(url, {
      next: { revalidate: 86400 }, // Cache 24 hours
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!res.ok) {
      // Fallback: try fetching just Arabic and translation if a reciter identifier failed
      const fallbackUrl = `https://api.alquran.cloud/v1/surah/${surahId}/editions/quran-uthmani,${translation}`;
      const fallbackRes = await fetch(fallbackUrl, { next: { revalidate: 86400 } });
      if (!fallbackRes.ok) {
        throw new Error(`Upstream Quran API returned status: ${res.status}`);
      }
      const fallbackJson = await fallbackRes.json();
      const arabicEdition = fallbackJson.data?.[0];
      const transEdition = fallbackJson.data?.[1];

      const ayahs = (arabicEdition?.ayahs || []).map((a: any, idx: number) => {
        const trans = transEdition?.ayahs?.[idx];
        return {
          number: a.number,
          numberInSurah: a.numberInSurah,
          textArabic: a.text,
          textTranslation: trans?.text || '',
          audioUrl: `https://cdn.islamic.network/quran/audio/128/${reciter}/${a.number}.mp3`,
          juz: a.juz,
          page: a.page,
          manzil: a.manzil,
          ruku: a.ruku,
          hizbQuarter: a.hizbQuarter,
          sajda: Boolean(a.sajda),
        };
      });

      return NextResponse.json(
        {
          ok: true,
          surah: {
            number: arabicEdition.number,
            name: arabicEdition.name,
            englishName: arabicEdition.englishName,
            englishNameTranslation: arabicEdition.englishNameTranslation,
            revelationType: arabicEdition.revelationType,
            numberOfAyahs: arabicEdition.numberOfAyahs,
          },
          ayahs,
        },
        {
          headers: {
            'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=86400',
          },
        }
      );
    }

    const json = await res.json();
    const data = json.data || [];
    const arabicEdition = data[0];
    const transEdition = data[1];
    const audioEdition = data[2];

    const ayahs = (arabicEdition?.ayahs || []).map((a: any, idx: number) => {
      const trans = transEdition?.ayahs?.[idx];
      const audio = audioEdition?.ayahs?.[idx];

      return {
        number: a.number,
        numberInSurah: a.numberInSurah,
        textArabic: a.text,
        textTranslation: trans?.text || '',
        audioUrl: audio?.audio || `https://cdn.islamic.network/quran/audio/128/${reciter}/${a.number}.mp3`,
        juz: a.juz,
        page: a.page,
        manzil: a.manzil,
        ruku: a.ruku,
        hizbQuarter: a.hizbQuarter,
        sajda: Boolean(a.sajda),
      };
    });

    return NextResponse.json(
      {
        ok: true,
        surah: {
          number: arabicEdition.number,
          name: arabicEdition.name,
          englishName: arabicEdition.englishName,
          englishNameTranslation: arabicEdition.englishNameTranslation,
          revelationType: arabicEdition.revelationType,
          numberOfAyahs: arabicEdition.numberOfAyahs,
        },
        ayahs,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=86400',
        },
      }
    );
  } catch (error: any) {
    console.error('Error fetching surah:', error);
    return NextResponse.json(
      { ok: false, error: error.message || 'Failed to load Surah from API' },
      { status: 500 }
    );
  }
}
