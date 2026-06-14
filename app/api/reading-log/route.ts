import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { ReadingLog } from '@/models/ReadingLog';
import { Types } from 'mongoose';

// GET: Fetch a reading log for a specific date
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date'); // "YYYY-MM-DD"

    if (!date) {
      return NextResponse.json({ error: 'Date parameter is required' }, { status: 400 });
    }

    await connectDB();

    const log = await ReadingLog.findOne({
      userId: new Types.ObjectId(session.user.id),
      date,
    });

    return NextResponse.json(log);
  } catch (error: any) {
    console.error('Error in GET reading-log:', error);
    return NextResponse.json({ error: 'Failed to fetch reading log' }, { status: 500 });
  }
}

// POST: Add a reading entry (upserts the day log and pushes the entry)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      date,
      hijriDate,
      hijriDay,
      hijriMonth,
      hijriMonthName,
      hijriYear,
      gregorianMonth,
      gregorianYear,
      entry, // can be a single entry object OR an array of entry objects
    } = body;

    if (!date || !entry) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const entriesArray = Array.isArray(entry) ? entry : [entry];

    // Validate entries
    for (const item of entriesArray) {
      if (!item.type || !item.name || item.count === undefined) {
        return NextResponse.json({ error: 'Invalid entry details' }, { status: 400 });
      }
    }

    await connectDB();

    const userId = new Types.ObjectId(session.user.id);

    // Upsert pattern using $each for pushing multiple entries
    const log = await ReadingLog.findOneAndUpdate(
      { userId, date },
      {
        $setOnInsert: {
          hijriDate,
          hijriDay,
          hijriMonth,
          hijriMonthName,
          hijriYear,
          gregorianMonth: Number(gregorianMonth),
          gregorianYear: Number(gregorianYear),
          isDayComplete: false,
        },
        $push: { entries: { $each: entriesArray } },
      },
      { upsert: true, new: true }
    );

    return NextResponse.json(log);
  } catch (error: any) {
    console.error('Error in POST reading-log:', error);
    return NextResponse.json({ error: 'Failed to create reading log' }, { status: 500 });
  }
}

// PATCH: Edit an existing reading entry's details
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { date, entryId, updates } = await request.json();

    if (!date || !entryId || !updates) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    await connectDB();

    const userId = new Types.ObjectId(session.user.id);

    const setFields: any = {};
    if (updates.count !== undefined) {
      setFields['entries.$[el].count'] = updates.count;
    }
    if (updates.notes !== undefined) {
      setFields['entries.$[el].notes'] = updates.notes;
    }

    const log = await ReadingLog.findOneAndUpdate(
      { userId, date },
      { $set: setFields },
      {
        arrayFilters: [{ 'el._id': new Types.ObjectId(entryId) }],
        new: true,
      }
    );

    if (!log) {
      return NextResponse.json({ error: 'Log not found' }, { status: 404 });
    }

    return NextResponse.json(log);
  } catch (error: any) {
    console.error('Error in PATCH reading-log:', error);
    return NextResponse.json({ error: 'Failed to update reading entry' }, { status: 500 });
  }
}

// DELETE: Delete a reading entry
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { date, entryId } = await request.json();

    if (!date || !entryId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    await connectDB();

    const userId = new Types.ObjectId(session.user.id);

    const log = await ReadingLog.findOneAndUpdate(
      { userId, date },
      { $pull: { entries: { _id: new Types.ObjectId(entryId) } } },
      { new: true }
    );

    if (!log) {
      return NextResponse.json({ error: 'Log not found' }, { status: 404 });
    }

    return NextResponse.json(log);
  } catch (error: any) {
    console.error('Error in DELETE reading-log:', error);
    return NextResponse.json({ error: 'Failed to delete reading entry' }, { status: 500 });
  }
}
