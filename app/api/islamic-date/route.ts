import { NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';

// Cached fetch helper to avoid hitting Aladhan API repeatedly
const fetchIslamicCalendar = async (month: string, year: string) => {
  const url = `https://api.aladhan.com/v1/gToHCalendar/${month}/${year}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Aladhan API responded with status ${response.status}`);
  }
  
  return response.json();
};

const getCachedIslamicCalendar = unstable_cache(
  async (month: string, year: string) => fetchIslamicCalendar(month, year),
  ['islamic-calendar-cache'],
  { revalidate: 86400 } // 24 hours cache
);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    if (!month || !year) {
      return NextResponse.json(
        { error: 'Month and year parameters are required.' },
        { status: 400 }
      );
    }

    // Call cached helper
    const data = await getCachedIslamicCalendar(month, year);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error fetching Islamic calendar from proxy:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch Islamic calendar' },
      { status: 500 }
    );
  }
}
