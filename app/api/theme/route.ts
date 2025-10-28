import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get the active theme
    const activeTheme = await prisma.colorTheme.findFirst({
      where: { isActive: true },
    });

    // If no active theme, return default
    if (!activeTheme) {
      return NextResponse.json({ theme: 'part1' });
    }

    return NextResponse.json({ theme: activeTheme.value });
  } catch (error) {
    console.error('Error fetching theme:', error);
    return NextResponse.json({ error: 'Failed to fetch theme' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { theme } = body;

    if (!theme) {
      return NextResponse.json({ error: 'Theme is required' }, { status: 400 });
    }

    // Deactivate all themes
    await prisma.colorTheme.updateMany({
      data: { isActive: false },
    });

    // Set the selected theme as active (upsert to handle if it doesn't exist)
    const updatedTheme = await prisma.colorTheme.upsert({
      where: { name: theme },
      update: { isActive: true },
      create: {
        name: theme,
        value: theme,
        isActive: true,
      },
    });

    return NextResponse.json({ theme: updatedTheme.value });
  } catch (error) {
    console.error('Error updating theme:', error);
    return NextResponse.json({ error: 'Failed to update theme' }, { status: 500 });
  }
}
