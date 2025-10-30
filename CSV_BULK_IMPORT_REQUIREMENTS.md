# CSV Bulk Import Requirements

## Scope & Goal
- Bulk import menu items from CSV and map them to existing or newly created Main/Sub categories.
- Operates on current Prisma schema (numeric IDs). Adds support fields on MenuItem: `isAvailable` (boolean, default true), `allergens` (JSON array), `dietaryTags` (JSON array).

## CSV Format
- Header required (UTF-8, LF). Columns:
  - Required: `main_category`, `sub_category`, `item_name`, `description`, `price`, `image`, `sort_order`
  - Optional: `is_available`, `allergens`, `dietary_tags`, `card_size`, `media_type`
- Example:
  `メイン料理,肉料理,ハンバーグステーキ,ジューシーな牛肉,1200,https://images.unsplash.com/...,1,"卵,乳","人気,おすすめ",normal,image`

## Semantics & Business Rules
- Category resolution: find by name; if missing, create with next `sortOrder`. Same for subcategory (unique per main category).
- Upsert policy for items: within a subcategory, if `item_name` matches existing, update it; otherwise create new.
- `price`: integer (>=0). `is_available`: accepts 1/0/true/false (case‑insensitive), default true.
- `allergens`/`dietary_tags`: comma‑separated list → JSON array (trimmed). Empty allowed.
- `image`: stored as provided; no remote fetch/validation. Note: Next/Image allows only hosts configured in `next.config.js` (default: `images.unsplash.com`).
- `card_size` one of `normal|large` (optional). `media_type` one of `image|video` (optional).

## API & Behavior
- Endpoint: `POST /api/import/csv` (multipart/form-data or raw text). Returns JSON summary: `{created, updated, skipped, errors:[{row,msg}]}`.
- Processing: stream or chunk read; validate each row; per‑row DB transaction; continue on error; collect report.

## Validation Rules
- Trim all fields; reject rows missing required columns.
- Numeric parsing for `price`, `sort_order`; coerce booleans for `is_available`.
- Enforce idempotency via upsert by `(subCategoryId, name)`; if DB unique index is later added, rely on it.

## Schema Changes (Prisma)
- Add to `MenuItem`: `isAvailable Boolean @default(true)`, `allergens Json?`, `dietaryTags Json?`.
- Optionally add `@@unique([subCategoryId, name])` to prevent duplicates.

## Security & Limits
- Admin‑only access; file size limit (e.g., 5MB) and row cap (e.g., 5,000 rows).
- Do not resolve remote URLs server‑side. Sanitize text; ignore unexpected columns.

## Test Criteria
- Imports create missing categories/subcategories and upsert items correctly.
- Boolean/array coercion works; invalid rows reported with row numbers.
- Next/Image displays images when host is allowed (adjust config if needed).
