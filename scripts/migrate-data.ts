import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 既存のlocalStorageデータ（現在のコードから抽出）
const CATEGORIES_DATA = {
  mainCategories: [
    {
      id: 1,
      name: "メイン料理",
      sortOrder: 0,
      subCategories: [
        { id: 1, name: "揚げ物", displayType: "text", sortOrder: 0 },
        { id: 2, name: "肉料理", displayType: "text", sortOrder: 1 },
      ],
    },
    {
      id: 2,
      name: "サイド",
      sortOrder: 1,
      subCategories: [
        { id: 3, name: "サラダ", displayType: "text", sortOrder: 0 },
        { id: 4, name: "スープ", displayType: "text", sortOrder: 1 },
      ],
    },
    {
      id: 3,
      name: "ドリンク",
      sortOrder: 2,
      subCategories: [
        { id: 5, name: "ビール", displayType: "text", sortOrder: 0 },
        { id: 6, name: "ハイボール", displayType: "text", sortOrder: 1 },
        { id: 7, name: "ワイン", displayType: "text", sortOrder: 2 },
        { id: 8, name: "ソフトドリンク", displayType: "text", sortOrder: 3 },
      ],
    },
    {
      id: 4,
      name: "デザート",
      sortOrder: 3,
      subCategories: [
        { id: 9, name: "アイス", displayType: "text", sortOrder: 0 },
        { id: 10, name: "ケーキ", displayType: "text", sortOrder: 1 },
        { id: 11, name: "パイ・タルト", displayType: "text", sortOrder: 2 },
      ],
    },
  ],
};

const MENU_ITEMS = [
  // メイン料理 - 揚げ物
  {
    id: 1,
    name: "チーズバーガー",
    price: 580,
    description: "とろけるチーズと100%ビーフパティの絶妙なハーモニー",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd",
    category: "メイン料理",
    subCategory: "揚げ物",
    sortOrder: 0,
  },
  {
    id: 2,
    name: "アボカドバーガー",
    price: 680,
    description: "新鮮なアボカドとジューシーなパティの組み合わせ",
    image: "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9",
    category: "メイン料理",
    subCategory: "揚げ物",
    sortOrder: 1,
  },
  {
    id: 3,
    name: "フライドチキン",
    price: 650,
    description: "サクサクの衣とジューシーな鶏肉の絶品フライドチキン",
    image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec",
    category: "メイン料理",
    subCategory: "揚げ物",
    sortOrder: 2,
  },
  {
    id: 4,
    name: "エビフライ",
    price: 720,
    description: "プリプリの大きなエビを使用した贅沢なエビフライ",
    image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0",
    category: "メイン料理",
    subCategory: "揚げ物",
    sortOrder: 3,
  },
  {
    id: 28,
    name: "特製ハンバーガー",
    price: 880,
    description: "職人が丁寧に焼き上げる特製ハンバーガー",
    image: "https://videos.pexels.com/video-files/3195650/3195650-uhd_2560_1440_25fps.mp4",
    category: "メイン料理",
    subCategory: "揚げ物",
    cardSize: "normal",
    mediaType: "video",
    sortOrder: 4,
  },
  // メイン料理 - 肉料理
  {
    id: 5,
    name: "ビーフステーキ",
    price: 1280,
    description: "厳選された牛肉を使用したジューシーなステーキ",
    image: "https://images.unsplash.com/photo-1600891964092-4316c288032e",
    category: "メイン料理",
    subCategory: "肉料理",
    sortOrder: 0,
  },
  {
    id: 6,
    name: "ポークソテー",
    price: 890,
    description: "柔らかい豚肉のソテーにマスタードソース添え",
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d",
    category: "メイン料理",
    subCategory: "肉料理",
    sortOrder: 1,
  },
  {
    id: 7,
    name: "ハンバーグステーキ",
    price: 780,
    description: "デミグラスソースたっぷりの本格ハンバーグ",
    image: "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=800",
    category: "メイン料理",
    subCategory: "肉料理",
    sortOrder: 2,
  },
  // サイド - サラダ
  {
    id: 8,
    name: "シーザーサラダ",
    price: 580,
    description: "新鮮なロメインレタスとクリーミーなシーザードレッシング",
    image: "https://images.unsplash.com/photo-1546793665-c74683f339c1",
    category: "サイド",
    subCategory: "サラダ",
    sortOrder: 0,
  },
  {
    id: 9,
    name: "コブサラダ",
    price: 680,
    description: "アボカドとチキンたっぷりのボリューム満点サラダ",
    image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe",
    category: "サイド",
    subCategory: "サラダ",
    sortOrder: 1,
  },
  {
    id: 10,
    name: "グリーンサラダ",
    price: 480,
    description: "シンプルで新鮮な野菜のサラダ",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd",
    category: "サイド",
    subCategory: "サラダ",
    sortOrder: 2,
  },
  // サイド - スープ
  {
    id: 11,
    name: "オニオンスープ",
    price: 450,
    description: "じっくり煮込んだ玉ねぎの甘みが広がるスープ",
    image: "https://images.unsplash.com/photo-1547592166-23ac45744acd",
    category: "サイド",
    subCategory: "スープ",
    sortOrder: 0,
  },
  {
    id: 12,
    name: "クラムチャウダー",
    price: 520,
    description: "濃厚でクリーミーなクラムチャウダー",
    image: "https://images.unsplash.com/photo-1604152135912-04a022e23696",
    category: "サイド",
    subCategory: "スープ",
    sortOrder: 1,
  },
  // ドリンク - ビール
  {
    id: 13,
    name: "生ビール",
    price: 580,
    description: "キンキンに冷えた生ビール",
    image: "https://images.unsplash.com/photo-1608270586620-248524c67de9",
    category: "ドリンク",
    subCategory: "ビール",
    sortOrder: 0,
  },
  {
    id: 14,
    name: "クラフトビール",
    price: 720,
    description: "厳選されたクラフトビール各種",
    image: "https://images.unsplash.com/photo-1535958636474-b021ee887b13",
    category: "ドリンク",
    subCategory: "ビール",
    sortOrder: 1,
  },
  // ドリンク - ハイボール
  {
    id: 15,
    name: "ハイボール",
    price: 520,
    description: "すっきり爽やかなハイボール",
    image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b",
    category: "ドリンク",
    subCategory: "ハイボール",
    sortOrder: 0,
  },
  {
    id: 16,
    name: "レモンハイボール",
    price: 580,
    description: "フレッシュレモンが香るハイボール",
    image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd",
    category: "ドリンク",
    subCategory: "ハイボール",
    sortOrder: 1,
  },
  // ドリンク - ワイン
  {
    id: 17,
    name: "赤ワイン",
    price: 680,
    description: "フルボディの深い味わいの赤ワイン",
    image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3",
    category: "ドリンク",
    subCategory: "ワイン",
    sortOrder: 0,
  },
  {
    id: 18,
    name: "白ワイン",
    price: 680,
    description: "すっきりとした辛口の白ワイン",
    image: "https://images.unsplash.com/photo-1547595628-c61a29f496f0",
    category: "ドリンク",
    subCategory: "ワイン",
    sortOrder: 1,
  },
  // ドリンク - ソフトドリンク
  {
    id: 19,
    name: "コーラ",
    price: 320,
    description: "炭酸たっぷりの爽快コーラ",
    image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97",
    category: "ドリンク",
    subCategory: "ソフトドリンク",
    sortOrder: 0,
  },
  {
    id: 20,
    name: "オレンジジュース",
    price: 350,
    description: "搾りたての新鮮なオレンジジュース",
    image: "https://images.unsplash.com/photo-1600271886742-f049cd451bba",
    category: "ドリンク",
    subCategory: "ソフトドリンク",
    sortOrder: 1,
  },
  {
    id: 21,
    name: "アイスコーヒー",
    price: 380,
    description: "こだわりの豆を使用した本格アイスコーヒー",
    image: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5",
    category: "ドリンク",
    subCategory: "ソフトドリンク",
    sortOrder: 2,
  },
  // デザート - アイス
  {
    id: 22,
    name: "バニラアイス",
    price: 420,
    description: "なめらかで濃厚なバニラアイスクリーム",
    image: "https://images.unsplash.com/photo-1549395156-e0c1fe6fc7a5",
    category: "デザート",
    subCategory: "アイス",
    sortOrder: 0,
  },
  {
    id: 23,
    name: "チョコレートサンデー",
    price: 520,
    description: "濃厚チョコレートソースとバニラアイスの贅沢なデザート",
    image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb",
    category: "デザート",
    subCategory: "アイス",
    sortOrder: 1,
  },
  // デザート - ケーキ
  {
    id: 24,
    name: "チーズケーキ",
    price: 480,
    description: "しっとり濃厚な特製ベイクドチーズケーキ",
    image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad",
    category: "デザート",
    subCategory: "ケーキ",
    sortOrder: 0,
  },
  {
    id: 25,
    name: "チョコレートケーキ",
    price: 520,
    description: "リッチなチョコレートの味わいが楽しめるケーキ",
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587",
    category: "デザート",
    subCategory: "ケーキ",
    sortOrder: 1,
  },
  // デザート - パイ・タルト
  {
    id: 26,
    name: "アップルパイ",
    price: 450,
    description: "サクサクのパイ生地と甘酸っぱいリンゴの絶妙なハーモニー",
    image: "https://images.unsplash.com/photo-1568571780765-9276ac8b75a2",
    category: "デザート",
    subCategory: "パイ・タルト",
    sortOrder: 0,
  },
  {
    id: 27,
    name: "フルーツタルト",
    price: 580,
    description: "季節のフルーツをたっぷり使用した華やかなタルト",
    image: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3",
    category: "デザート",
    subCategory: "パイ・タルト",
    sortOrder: 1,
  },
];

const FEATURED_ITEMS = {
  slide1: "28",  // 特製ハンバーガー (video)
  slide2: "2",   // アボカドバーガー
  slide3: "1",   // チーズバーガー
  slide4: "1",   // チーズバーガー
  slide5: "2",   // アボカドバーガー
};

async function migrate() {
  console.log('Starting data migration...');

  try {
    // Clear existing data
    await prisma.colorTheme.deleteMany();
    await prisma.featuredItem.deleteMany();
    await prisma.menuItem.deleteMany();
    await prisma.subCategory.deleteMany();
    await prisma.mainCategory.deleteMany();

    console.log('Cleared existing data');

    // Create default theme
    await prisma.colorTheme.create({
      data: {
        name: 'part1',
        value: 'part1',
        isActive: true,
      },
    });
    console.log('Created default theme (part1)');

    // Migrate categories
    for (const mainCat of CATEGORIES_DATA.mainCategories) {
      const createdMainCat = await prisma.mainCategory.create({
        data: {
          name: mainCat.name,
          sortOrder: mainCat.sortOrder,
        },
      });

      console.log(`Created main category: ${mainCat.name}`);

      // Migrate subcategories
      for (const subCat of mainCat.subCategories) {
        await prisma.subCategory.create({
          data: {
            name: subCat.name,
            displayType: subCat.displayType || 'text',
            sortOrder: subCat.sortOrder,
            mainCategoryId: createdMainCat.id,
          },
        });

        console.log(`  Created subcategory: ${subCat.name}`);
      }
    }

    // Migrate menu items and track IDs
    const createdItems: { [key: string]: string } = {};

    for (const item of MENU_ITEMS) {
      const createdItem = await prisma.menuItem.create({
        data: {
          name: item.name,
          price: item.price,
          description: item.description,
          image: item.image,
          category: item.category,
          subCategory: item.subCategory,
          sortOrder: item.sortOrder,
          mediaType: item.mediaType || 'image',
          cardSize: item.cardSize || 'normal',
        },
      });

      // Store IDs for featured items (using original id from data)
      createdItems[item.id.toString()] = createdItem.id.toString();

      console.log(`Created menu item: ${item.name} (ID: ${createdItem.id})`);
    }

    // Migrate featured items using the mapped IDs
    for (const [type, originalItemId] of Object.entries(FEATURED_ITEMS)) {
      const actualItemId = createdItems[originalItemId] || originalItemId;

      await prisma.featuredItem.create({
        data: {
          type,
          itemId: actualItemId,
        },
      });

      console.log(`Created featured item: ${type} -> ${actualItemId}`);
    }

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

migrate();
