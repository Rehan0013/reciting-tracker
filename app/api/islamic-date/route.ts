import { NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';

const ARABIC_WEEKDAYS: Record<string, { en: string; ar: string }> = {
  Sunday: { en: 'Al Ahad', ar: 'الأحد' },
  Monday: { en: 'Al Ithnin', ar: 'الإثنين' },
  Tuesday: { en: 'Al Thulatha', ar: 'الثلاثاء' },
  Wednesday: { en: "Al Arba'a", ar: 'الأربعاء' },
  Thursday: { en: 'Al Khamees', ar: 'الخميس' },
  Friday: { en: "Al Juma'a", ar: 'الجمعة' },
  Saturday: { en: 'Al Sabt', ar: 'السبت' },
};

// Fetch today's verified Islamic date in Indian Standard Time (Asia/Kolkata)
const fetchIndianIslamicToday = async () => {
  try {
    const res = await fetch('https://chandkitarikh.in/api/today.json', {
      headers: { 'User-Agent': 'QuranTracker/1.0' },
      next: { revalidate: 3600 },
    });
    if (!res.ok) {
      console.warn(`Chand Ki Tarikh API returned status ${res.status}`);
      return null;
    }
    return await res.json();
  } catch (error) {
    console.error('Error fetching from Chand Ki Tarikh API:', error);
    return null;
  }
};

// Fetch monthly calendar from Aladhan
const fetchAladhanCalendar = async (month: number, year: number) => {
  const url = `https://api.aladhan.com/v1/gToHCalendar/${month}/${year}`;
  const response = await fetch(url, {
    next: { revalidate: 3600 },
  });
  if (!response.ok) {
    throw new Error(`Aladhan API responded with status ${response.status}`);
  }
  return response.json();
};

// Cached monthly calendar builder synced with Indian moon sighting
const fetchSyncedIslamicCalendar = async (monthStr: string, yearStr: string) => {
  const month = parseInt(monthStr, 10);
  const year = parseInt(yearStr, 10);

  // 1. Fetch Indian today status & Aladhan month data in parallel
  const [indianData, aladhanData] = await Promise.all([
    fetchIndianIslamicToday(),
    fetchAladhanCalendar(month, year),
  ]);

  // Determine Indian offset relative to default Umm al-Qura calculation (typically -1 day in India)
  let offset = -1;
  if (indianData?.today?.gregorian && indianData?.today?.hijri) {
    const indianGreg = indianData.today.gregorian;
    if (Number(indianGreg.month) === month && Number(indianGreg.year) === year) {
      const dayIdx = Number(indianGreg.day) - 1;
      const aladhanToday = aladhanData.data?.[dayIdx]?.hijri;
      const indianDayNum = Number(indianData.today.hijri.day);
      const aladhanDayNum = Number(aladhanToday?.day);

      if (aladhanToday) {
        if (indianDayNum === aladhanDayNum) {
          offset = 0;
        } else if (indianDayNum < aladhanDayNum || (indianDayNum >= 29 && aladhanDayNum === 1)) {
          offset = -1;
        } else if (indianDayNum > aladhanDayNum) {
          offset = 1;
        }
      }
    }
  }

  // Fetch previous month buffer if -1 offset needed for the 1st of current month
  let prevMonthData: any = null;
  if (offset === -1) {
    const prevM = month === 1 ? 12 : month - 1;
    const prevY = month === 1 ? year - 1 : year;
    try {
      prevMonthData = await fetchAladhanCalendar(prevM, prevY);
    } catch (e) {
      console.warn('Failed to fetch previous month buffer for calibration:', e);
    }
  }

  const rawDays = aladhanData.data || [];
  const calibratedDays = rawDays.map((dayItem: any, idx: number) => {
    let hijriItem: any;

    if (offset === 0) {
      hijriItem = { ...dayItem.hijri };
    } else if (offset === -1) {
      if (idx === 0) {
        const prevDays = prevMonthData?.data || [];
        hijriItem = prevDays[prevDays.length - 1]?.hijri
          ? { ...prevDays[prevDays.length - 1].hijri }
          : { ...dayItem.hijri };
      } else {
        hijriItem = rawDays[idx - 1]?.hijri
          ? { ...rawDays[idx - 1].hijri }
          : { ...dayItem.hijri };
      }
    } else {
      hijriItem = rawDays[idx + 1]?.hijri
        ? { ...rawDays[idx + 1].hijri }
        : { ...dayItem.hijri };
    }

    // Fix weekday mapping so it matches the Gregorian day
    const weekdayName = dayItem.gregorian?.weekday?.en;
    if (weekdayName && ARABIC_WEEKDAYS[weekdayName]) {
      hijriItem.weekday = ARABIC_WEEKDAYS[weekdayName];
    }

    // Exact override for today if within this month
    if (
      indianData?.today &&
      Number(indianData.today.gregorian.month) === month &&
      Number(indianData.today.gregorian.year) === year &&
      idx + 1 === Number(indianData.today.gregorian.day)
    ) {
      hijriItem = {
        ...hijriItem,
        day: String(indianData.today.hijri.day),
        date: `${String(indianData.today.hijri.day).padStart(2, '0')}-${String(indianData.today.hijri.month).padStart(2, '0')}-${indianData.today.hijri.year}`,
        month: {
          number: indianData.today.hijri.month,
          en: indianData.today.hijri.monthEn,
          ar: indianData.today.hijri.monthAr,
          days: hijriItem.month?.days || 30,
        },
        year: String(indianData.today.hijri.year),
      };
    }

    return {
      ...dayItem,
      hijri: hijriItem,
    };
  });

  return {
    code: 200,
    status: 'OK',
    timezone: 'Asia/Kolkata',
    offset,
    indianToday: indianData?.today || null,
    data: calibratedDays,
  };
};

const getCachedIslamicCalendar = unstable_cache(
  async (month: string, year: string) => fetchSyncedIslamicCalendar(month, year),
  ['islamic-calendar-cache-ist-v1'],
  { revalidate: 3600 } // 1 hour cache
);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    const year = searchParams.get('year');
    const todayOnly = searchParams.get('today');

    if (todayOnly === 'true' && (!month || !year)) {
      const indianToday = await fetchIndianIslamicToday();
      return NextResponse.json(
        { ok: true, timezone: 'Asia/Kolkata', ...indianToday },
        {
          headers: {
            'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600',
          },
        }
      );
    }

    if (!month || !year) {
      return NextResponse.json(
        { error: 'Month and year parameters are required.' },
        { status: 400 }
      );
    }

    const data = await getCachedIslamicCalendar(month, year);
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600',
      },
    });
  } catch (error: any) {
    console.error('Error fetching Islamic calendar from proxy:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch Islamic calendar' },
      { status: 500 }
    );
  }
}
