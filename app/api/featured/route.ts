import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const featured = await prisma.featuredItem.findMany();

    // Convert to the format expected by the frontend
    const featuredItems: Record<string, string | null> = {};
    featured.forEach((item) => {
      featuredItems[item.type] = item.itemId;
    });

    return NextResponse.json(featuredItems);
  } catch (error) {
    console.error('Error fetching featured items:', error);
    return NextResponse.json({ error: 'Failed to fetch featured items' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { type, itemId } = body;

    const featured = await prisma.featuredItem.upsert({
      where: { type },
      update: { itemId },
      create: { type, itemId },
    });

    return NextResponse.json(featured);
  } catch (error) {
    console.error('Error updating featured item:', error);
    return NextResponse.json({ error: 'Failed to update featured item' }, { status: 500 });
  }
}
