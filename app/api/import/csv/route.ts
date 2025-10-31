import { NextRequest, NextResponse } from 'next/server';
import Papa from 'papaparse';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

type CSVRow = {
  main_category: string;
  sub_category: string;
  item_name: string;
  description: string;
  price: string;
  image: string;
  sort_order: string;
  is_available?: string;
  allergens?: string;
  dietary_tags?: string;
  card_size?: string;
  media_type?: string;
};

type ImportResult = {
  created: number;
  updated: number;
  skipped: number;
  errors: Array<{ row: number; message: string }>;
};

// Coerce boolean from various formats
function parseBoolean(value: string | undefined): boolean {
  if (!value) return true; // default
  const normalized = value.trim().toLowerCase();
  return normalized === 'true' || normalized === '1';
}

// Parse comma-separated string to JSON array
function parseArray(value: string | undefined): string[] {
  if (!value || value.trim() === '') return [];
  return value.split(',').map(item => item.trim()).filter(Boolean);
}

// Validate required fields
function validateRow(row: CSVRow, rowIndex: number): string | null {
  const required = ['main_category', 'sub_category', 'item_name', 'description', 'price', 'image', 'sort_order'];

  for (const field of required) {
    if (!row[field as keyof CSVRow]?.trim()) {
      return `Row ${rowIndex}: Missing required field "${field}"`;
    }
  }

  const price = parseInt(row.price);
  if (isNaN(price) || price < 0) {
    return `Row ${rowIndex}: Invalid price "${row.price}"`;
  }

  const sortOrder = parseInt(row.sort_order);
  if (isNaN(sortOrder)) {
    return `Row ${rowIndex}: Invalid sort_order "${row.sort_order}"`;
  }

  // Validate card_size if provided
  if (row.card_size && !['normal', 'large'].includes(row.card_size.trim().toLowerCase())) {
    return `Row ${rowIndex}: Invalid card_size "${row.card_size}". Must be "normal" or "large"`;
  }

  // Validate media_type if provided
  if (row.media_type && !['image', 'video'].includes(row.media_type.trim().toLowerCase())) {
    return `Row ${rowIndex}: Invalid media_type "${row.media_type}". Must be "image" or "video"`;
  }

  return null;
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options });
          },
        },
      }
    );

    // Check authentication (admin only)
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: `Unauthorized - ${authError?.message || 'Not authenticated'}` }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Parse request body
    const contentType = request.headers.get('content-type') || '';
    let csvText: string;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File;

      if (!file) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 });
      }

      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 });
      }

      csvText = await file.text();
    } else {
      csvText = await request.text();
    }

    // Parse CSV
    const parseResult = Papa.parse<CSVRow>(csvText, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
    });

    if (parseResult.errors.length > 0) {
      return NextResponse.json(
        {
          error: 'CSV parsing error',
          details: parseResult.errors.map(e => e.message)
        },
        { status: 400 }
      );
    }

    const rows = parseResult.data;

    // Check row limit (5000 rows)
    if (rows.length > 5000) {
      return NextResponse.json({ error: 'Too many rows (max 5000)' }, { status: 400 });
    }

    const result: ImportResult = {
      created: 0,
      updated: 0,
      skipped: 0,
      errors: [],
    };

    // Process each row
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowIndex = i + 2; // +2 for header and 1-based indexing

      try {
        // Validate row
        const validationError = validateRow(row, rowIndex);
        if (validationError) {
          result.errors.push({ row: rowIndex, message: validationError });
          result.skipped++;
          continue;
        }

        // Trim all fields
        const mainCategoryName = row.main_category.trim();
        const subCategoryName = row.sub_category.trim();
        const itemName = row.item_name.trim();

        // 1. Find or create main category
        let { data: mainCategory, error: mainCatError } = await supabase
          .from('main_categories')
          .select('id, sort_order')
          .eq('name', mainCategoryName)
          .single();

        if (mainCatError && mainCatError.code === 'PGRST116') {
          // Category doesn't exist, create it
          const { data: maxSortOrder } = await supabase
            .from('main_categories')
            .select('sort_order')
            .order('sort_order', { ascending: false })
            .limit(1)
            .single();

          const nextSortOrder = (maxSortOrder?.sort_order || 0) + 1;

          const { data: newMainCat, error: createError } = await supabase
            .from('main_categories')
            .insert({ name: mainCategoryName, sort_order: nextSortOrder })
            .select()
            .single();

          if (createError) {
            result.errors.push({ row: rowIndex, message: `Failed to create main category: ${createError.message}` });
            result.skipped++;
            continue;
          }

          mainCategory = newMainCat;
        } else if (mainCatError) {
          result.errors.push({ row: rowIndex, message: `Main category error: ${mainCatError.message}` });
          result.skipped++;
          continue;
        }

        // 2. Find or create sub category
        let { data: subCategory, error: subCatError } = await supabase
          .from('sub_categories')
          .select('id')
          .eq('name', subCategoryName)
          .eq('main_category_id', mainCategory!.id)
          .single();

        if (subCatError && subCatError.code === 'PGRST116') {
          // Sub category doesn't exist, create it
          const { data: maxSortOrder } = await supabase
            .from('sub_categories')
            .select('sort_order')
            .eq('main_category_id', mainCategory!.id)
            .order('sort_order', { ascending: false })
            .limit(1)
            .single();

          const nextSortOrder = (maxSortOrder?.sort_order || 0) + 1;

          const { data: newSubCat, error: createError } = await supabase
            .from('sub_categories')
            .insert({
              name: subCategoryName,
              main_category_id: mainCategory!.id,
              sort_order: nextSortOrder
            })
            .select()
            .single();

          if (createError) {
            result.errors.push({ row: rowIndex, message: `Failed to create sub category: ${createError.message}` });
            result.skipped++;
            continue;
          }

          subCategory = newSubCat;
        } else if (subCatError) {
          result.errors.push({ row: rowIndex, message: `Sub category error: ${subCatError.message}` });
          result.skipped++;
          continue;
        }

        // 3. Check if menu item exists (by name and sub_category_id)
        const { data: existingItem } = await supabase
          .from('menu_items')
          .select('id')
          .eq('name', itemName)
          .eq('sub_category_id', subCategory!.id)
          .single();

        // Prepare menu item data
        const menuItemData = {
          name: itemName,
          description: row.description.trim(),
          price: parseInt(row.price),
          image: row.image.trim(),
          category: mainCategoryName,
          sub_category: subCategoryName,
          sub_category_id: subCategory!.id,
          sort_order: parseInt(row.sort_order),
          is_available: parseBoolean(row.is_available),
          allergens: parseArray(row.allergens),
          dietary_tags: parseArray(row.dietary_tags),
          card_size: row.card_size?.trim().toLowerCase() || null,
          media_type: row.media_type?.trim().toLowerCase() || null,
        };

        if (existingItem) {
          // Update existing item
          const { error: updateError } = await supabase
            .from('menu_items')
            .update(menuItemData)
            .eq('id', existingItem.id);

          if (updateError) {
            result.errors.push({ row: rowIndex, message: `Failed to update item: ${updateError.message}` });
            result.skipped++;
            continue;
          }

          result.updated++;
        } else {
          // Create new item
          const { error: insertError } = await supabase
            .from('menu_items')
            .insert(menuItemData);

          if (insertError) {
            result.errors.push({ row: rowIndex, message: `Failed to create item: ${insertError.message}` });
            result.skipped++;
            continue;
          }

          result.created++;
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        result.errors.push({ row: rowIndex, message });
        result.skipped++;
      }
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('CSV import error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Import failed', details: message }, { status: 500 });
  }
}
