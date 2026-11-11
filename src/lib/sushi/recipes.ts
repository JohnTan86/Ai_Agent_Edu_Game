import { IngredientInfo, IngredientKey, SushiRecipe } from './types';

export const INITIAL_INGREDIENTS: Record<IngredientKey, IngredientInfo> = {
  rice: {
    key: 'rice',
    name: '越光米 (Sushi Rice)',
    unit: '份',
    emoji: '🍚',
    costPerUnit: 2,
    marketPrice: 2,
    reorderPackSize: 20,
    currentStock: 30,
    maxCapacity: 100,
    reorderThreshold: 10,
    freshnessPct: 100,
    description: '特選新潟越光米，混合赤醋與昆布高湯蒸煮，醋飯靈魂'
  },
  salmon: {
    key: 'salmon',
    name: '挪威鮭魚 (Salmon)',
    unit: '片',
    emoji: '🍣',
    costPerUnit: 5,
    marketPrice: 5,
    reorderPackSize: 10,
    currentStock: 16,
    maxCapacity: 50,
    reorderThreshold: 6,
    freshnessPct: 98,
    description: '空運頂級挪威三文魚，油脂豐腴，入口即化'
  },
  tuna: {
    key: 'tuna',
    name: '藍鰭金槍魚 (Bluefin Tuna)',
    unit: '片',
    emoji: '🐟',
    costPerUnit: 8,
    marketPrice: 8,
    reorderPackSize: 8,
    currentStock: 12,
    maxCapacity: 40,
    reorderThreshold: 5,
    freshnessPct: 96,
    description: '豐洲市場直送藍鰭金槍魚赤身與中腹，鮮甜甘醇'
  },
  uni: {
    key: 'uni',
    name: '北海道海膽 (Sea Urchin)',
    unit: '瓣',
    emoji: '🦪',
    costPerUnit: 14,
    marketPrice: 14,
    reorderPackSize: 5,
    currentStock: 6,
    maxCapacity: 25,
    reorderThreshold: 3,
    freshnessPct: 94,
    description: '北海道極上馬糞海膽，濃郁海味，如絲絨般柔滑'
  },
  wagyu: {
    key: 'wagyu',
    name: 'A5極品和牛 (A5 Wagyu)',
    unit: '片',
    emoji: '🥩',
    costPerUnit: 16,
    marketPrice: 16,
    reorderPackSize: 5,
    currentStock: 5,
    maxCapacity: 20,
    reorderThreshold: 2,
    freshnessPct: 95,
    description: '日本鹿兒島 A5 霜降黑毛和牛，雪花細密，炙燒香氣逼人'
  },
  nori: {
    key: 'nori',
    name: '有明海苔 (Crispy Nori)',
    unit: '張',
    emoji: '🍙',
    costPerUnit: 1,
    marketPrice: 1,
    reorderPackSize: 25,
    currentStock: 25,
    maxCapacity: 100,
    reorderThreshold: 8,
    freshnessPct: 100,
    description: '九州有明海特選初摘烤海苔，香脆清甜'
  },
  wasabi: {
    key: 'wasabi',
    name: '靜岡本山葵 (Fresh Wasabi)',
    unit: '份',
    emoji: '🌿',
    costPerUnit: 1.5,
    marketPrice: 1.5,
    reorderPackSize: 20,
    currentStock: 20,
    maxCapacity: 60,
    reorderThreshold: 6,
    freshnessPct: 97,
    description: '靜岡天城山生鮮本山葵現磨，辛香清甜不刺鼻'
  },
  avocado: {
    key: 'avocado',
    name: '熟成酪梨 (Creamy Avocado)',
    unit: '塊',
    emoji: '🥑',
    costPerUnit: 3,
    marketPrice: 3,
    reorderPackSize: 10,
    currentStock: 10,
    maxCapacity: 40,
    reorderThreshold: 4,
    freshnessPct: 96,
    description: '黃金熟成墨西哥酪梨，素食者的頂級植物油脂選擇'
  }
};

export const SUSHI_RECIPES: Record<string, SushiRecipe> = {
  salmon_nigiri: {
    id: 'salmon_nigiri',
    name: '特上鮭魚握壽司',
    japaneseName: 'サーモン握り',
    emoji: '🍣',
    category: 'nigiri',
    price: 15,
    prepTicks: 4,
    ingredients: [
      { ingredient: 'rice', amount: 1 },
      { ingredient: 'salmon', amount: 1 },
      { ingredient: 'wasabi', amount: 1 }
    ],
    description: '脂香四溢的鮭魚搭配微溫醋飯與現磨生山葵',
    containsRawFish: true
  },
  tuna_nigiri: {
    id: 'tuna_nigiri',
    name: '熟成金槍魚握壽司',
    japaneseName: '本鮪赤身握り',
    emoji: '🐟',
    category: 'nigiri',
    price: 20,
    prepTicks: 4,
    ingredients: [
      { ingredient: 'rice', amount: 1 },
      { ingredient: 'tuna', amount: 1 },
      { ingredient: 'wasabi', amount: 1 }
    ],
    description: '深海赤身魚香，微酸旨味在舌尖綻放',
    containsRawFish: true
  },
  wagyu_aburi: {
    id: 'wagyu_aburi',
    name: '炙燒A5和牛壽司',
    japaneseName: 'A5和牛炙り握り',
    emoji: '🥩',
    category: 'nigiri',
    price: 35,
    prepTicks: 6,
    ingredients: [
      { ingredient: 'rice', amount: 1 },
      { ingredient: 'wagyu', amount: 1 },
      { ingredient: 'wasabi', amount: 1 }
    ],
    description: '直火微炙釋放牛脂焦香，灑上法國鹽之花',
    containsRawFish: false
  },
  uni_gunkan: {
    id: 'uni_gunkan',
    name: '北海道極上海膽軍艦',
    japaneseName: '極上海胆軍艦',
    emoji: '🦪',
    category: 'gunkan',
    price: 42,
    prepTicks: 5,
    ingredients: [
      { ingredient: 'rice', amount: 1 },
      { ingredient: 'nori', amount: 1 },
      { ingredient: 'uni', amount: 1 }
    ],
    description: '滿溢的北海道甘甜海膽，脆口海苔絕妙搭配',
    containsRawFish: true
  },
  california_roll: {
    id: 'california_roll',
    name: '經典加州酪梨卷',
    japaneseName: 'カリフォルニアロール',
    emoji: '🍱',
    category: 'maki',
    price: 18,
    prepTicks: 5,
    ingredients: [
      { ingredient: 'rice', amount: 2 },
      { ingredient: 'nori', amount: 1 },
      { ingredient: 'salmon', amount: 1 },
      { ingredient: 'avocado', amount: 1 }
    ],
    description: '軟糯酪梨與鮮美三文魚反卷，佐烘烤白芝麻',
    containsRawFish: true
  },
  veggie_roll: {
    id: 'veggie_roll',
    name: '翠玉酪梨蔬食卷 (素)',
    japaneseName: 'アボカド精進巻き',
    emoji: '🥑',
    category: 'maki',
    price: 14,
    prepTicks: 3,
    ingredients: [
      { ingredient: 'rice', amount: 2 },
      { ingredient: 'nori', amount: 1 },
      { ingredient: 'avocado', amount: 1 }
    ],
    description: '純淨無肉無魚配方，素食及健康主義顧客首選',
    containsRawFish: false
  },
  omakase_supreme: {
    id: 'omakase_supreme',
    name: '大將極致特選無菜單 (Omakase)',
    japaneseName: '料理長厳選おまかせ盛り',
    emoji: '⭐',
    category: 'omakase',
    price: 88,
    prepTicks: 8,
    ingredients: [
      { ingredient: 'rice', amount: 2 },
      { ingredient: 'salmon', amount: 1 },
      { ingredient: 'tuna', amount: 1 },
      { ingredient: 'uni', amount: 1 },
      { ingredient: 'wagyu', amount: 1 },
      { ingredient: 'nori', amount: 1 },
      { ingredient: 'wasabi', amount: 1 }
    ],
    description: '匯集四大頂級海陸珍饈，大將手作殿堂級盛宴',
    containsRawFish: true
  }
};

/**
 * Checks if restaurant pantry has enough ingredients to make a recipe
 */
export function canCraftRecipe(
  recipe: SushiRecipe,
  inventory: Record<IngredientKey, IngredientInfo>,
  customNote?: string
): { canCraft: boolean; missing: IngredientKey[] } {
  const missing: IngredientKey[] = [];
  const skipWasabi = customNote?.includes('no_wasabi') || customNote?.includes('不吃芥末') || customNote?.includes('不要芥末');

  for (const req of recipe.ingredients) {
    if (req.ingredient === 'wasabi' && skipWasabi) {
      continue;
    }
    const currentStock = inventory[req.ingredient]?.currentStock ?? 0;
    if (currentStock < req.amount) {
      missing.push(req.ingredient);
    }
  }

  return {
    canCraft: missing.length === 0,
    missing
  };
}

/**
 * Calculates raw ingredient cost for a recipe
 */
export function calculateRecipeCost(recipe: SushiRecipe, inventory: Record<IngredientKey, IngredientInfo>): number {
  return recipe.ingredients.reduce((acc, req) => {
    const item = inventory[req.ingredient];
    return acc + (item ? item.costPerUnit * req.amount : 0);
  }, 0);
}
