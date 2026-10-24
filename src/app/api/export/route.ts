import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUserDb } from '@/lib/user-db';
import * as schema from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const db = await getUserDb(userId);
    const items = await db.select().from(schema.memoryItems).where(eq(schema.memoryItems.userId, userId));

    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      user: userId,
      items: items.map((item) => ({
        id: item.id,
        type: item.type,
        title: item.title,
        url: item.url,
        content: item.content,
        summary: item.summary,
        tags: item.tags,
        createdAt: item.createdAt,
      })),
    };

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="secondmind-export-${new Date().toISOString().split('T')[0]}.json"`,
      },
    });
  } catch (error) {
    console.error('Export Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
