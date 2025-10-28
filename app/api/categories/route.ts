import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const categories = await prisma.mainCategory.findMany({
      include: {
        subCategories: {
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, ...data } = body;

    if (type === 'main') {
      const category = await prisma.mainCategory.create({
        data: {
          name: data.name,
          sortOrder: data.sortOrder || 0,
        },
      });
      return NextResponse.json(category);
    } else if (type === 'sub') {
      const subCategory = await prisma.subCategory.create({
        data,
      });
      return NextResponse.json(subCategory);
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { type, id, ...data } = body;

    if (type === 'main') {
      const category = await prisma.mainCategory.update({
        where: { id },
        data,
      });
      return NextResponse.json(category);
    } else if (type === 'sub') {
      const subCategory = await prisma.subCategory.update({
        where: { id },
        data,
      });
      return NextResponse.json(subCategory);
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');

    if (!id || !type) {
      return NextResponse.json({ error: 'ID and type are required' }, { status: 400 });
    }

    if (type === 'main') {
      await prisma.mainCategory.delete({
        where: { id: parseInt(id) },
      });
    } else if (type === 'sub') {
      await prisma.subCategory.delete({
        where: { id: parseInt(id) },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}
