import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { ReadingLog } from '@/models/ReadingLog';
import { Types } from 'mongoose';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('mode') || 'gregorian';
    const year = searchParams.get('year');
    const month = searchParams.get('month');
    const hijriYear = searchParams.get('hijriYear');
    const hijriMonth = searchParams.get('hijriMonth');
    const todayStr = searchParams.get('today') || new Date().toISOString().split('T')[0];

    await connectDB();

    const userId = new Types.ObjectId(session.user.id);
    let matchQuery: any = { userId };

    if (mode === 'gregorian') {
      if (!year || !month) {
        return NextResponse.json({ error: 'Gregorian year and month are required' }, { status: 400 });
      }
      matchQuery.gregorianYear = Number(year);
      matchQuery.gregorianMonth = Number(month);
    } else {
      if (!hijriYear || !hijriMonth) {
        return NextResponse.json({ error: 'Hijri year and month are required' }, { status: 400 });
      }
      matchQuery.hijriYear = Number(hijriYear);
      matchQuery.hijriMonth = Number(hijriMonth);
    }

    // Run breakdown, stats, and detailed logs in parallel
    const [breakdown, statsResult, monthLogs] = await Promise.all([
      // 1. Breakdown pipeline
      ReadingLog.aggregate([
        { $match: matchQuery },
        { $unwind: '$entries' },
        {
          $group: {
            _id: { type: '$entries.type', name: '$entries.name' },
            totalCount: { $sum: '$entries.count' },
            nameArabic: { $first: '$entries.nameArabic' },
          },
        },
        { $sort: { totalCount: -1 } },
      ]),

      // 2. Stats pipeline
      ReadingLog.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: null,
            daysLogged: { $sum: 1 },
            totalEntries: { $sum: { $size: '$entries' } },
            completeDays: { $sum: { $cond: ['$isDayComplete', 1, 0] } },
          },
        },
      ]),

      // 3. Detailed logs list for calendar grid rendering
      ReadingLog.find(matchQuery).select('date isDayComplete entries'),
    ]);

    const stats = statsResult[0] || { daysLogged: 0, totalEntries: 0, completeDays: 0 };

    // 3. Streak calculation over last 90 days
    const ninetyDaysAgo = new Date(todayStr);
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    const ninetyDaysAgoStr = ninetyDaysAgo.toISOString().split('T')[0];

    // Find all days in the last 90 days that have at least one entry
    const recentLogs = await ReadingLog.find({
      userId,
      date: { $gte: ninetyDaysAgoStr, $lte: todayStr },
      'entries.0': { $exists: true }, // at least 1 entry
    }).select('date').sort({ date: -1 });

    const loggedDates = recentLogs.map((log) => log.date);

    // Compute streak
    const datesSet = new Set(loggedDates);
    let streak = 0;
    
    // Setup date checks in current context
    const checkDate = new Date(todayStr);
    const todayFormatted = checkDate.toISOString().split('T')[0];
    
    const yesterdayDate = new Date(todayStr);
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayFormatted = yesterdayDate.toISOString().split('T')[0];

    let startFrom: Date | null = null;
    if (datesSet.has(todayFormatted)) {
      startFrom = checkDate;
    } else if (datesSet.has(yesterdayFormatted)) {
      startFrom = yesterdayDate;
    }

    if (startFrom) {
      let tempDate = new Date(startFrom);
      while (true) {
        const tempStr = tempDate.toISOString().split('T')[0];
        if (datesSet.has(tempStr)) {
          streak++;
          tempDate.setDate(tempDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    return NextResponse.json({
      breakdown,
      stats,
      streak,
      loggedDates, // also return logged dates list for heatmap
      monthLogs,
    });
  } catch (error: any) {
    console.error('Error in monthly-summary API:', error);
    return NextResponse.json({ error: 'Failed to generate monthly summary' }, { status: 500 });
  }
}
