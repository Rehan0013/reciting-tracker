import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { ReadingLog } from '@/models/ReadingLog';
import { Types } from 'mongoose';

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { date, isDayComplete } = await request.json();

    if (!date || isDayComplete === undefined) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    await connectDB();

    const userId = new Types.ObjectId(session.user.id);

    const log = await ReadingLog.findOneAndUpdate(
      { userId, date },
      { $set: { isDayComplete } },
      { new: true }
    );

    if (!log) {
      return NextResponse.json({ error: 'Log not found' }, { status: 404 });
    }

    return NextResponse.json(log);
  } catch (error: any) {
    console.error('Error in PATCH reading-log/complete:', error);
    return NextResponse.json({ error: 'Failed to update day completion' }, { status: 500 });
  }
}
