/**
 * SushiFlow Multi-Branch & Real-Life Map Configuration
 */

export interface BranchLocationCandidate {
  id: string;
  name: string;
  districtName: string;
  lat: number;
  lng: number;
  openingCost: number;
  footTrafficTag: string;
  specialtyTag: string;
  description: string;
  emoji: string;
}

export const PRESET_BRANCH_CANDIDATES: BranchLocationCandidate[] = [
  {
    id: 'branch_ginza',
    name: '江戶前・銀座旗艦總店',
    districtName: '東京都 中央區 銀座',
    lat: 35.6719,
    lng: 139.7648,
    openingCost: 0,
    footTrafficTag: '高端商業樞紐',
    specialtyTag: '江戶前手捏正統',
    description: '品牌誕生創始店，名家匯聚，米其林評論家最常微服暗訪的旗艦殿堂。',
    emoji: '⛩️'
  },
  {
    id: 'branch_shibuya',
    name: '澀谷十字路口潮流分店',
    districtName: '東京都 澀谷區 道玄坂',
    lat: 35.6595,
    lng: 139.7005,
    openingCost: 350,
    footTrafficTag: '全球最繁華行人十字路口',
    specialtyTag: '極速翻台狂暴流',
    description: '引領東京潮流，年輕白領與國際旅客川流不息，極致考驗外場迎賓與翻台節奏！',
    emoji: '🚦'
  },
  {
    id: 'branch_shinjuku',
    name: '新宿歌舞伎町不夜城分店',
    districtName: '東京都 新宿區 歌舞伎町',
    lat: 35.6938,
    lng: 139.7034,
    openingCost: 400,
    footTrafficTag: '亞洲最大夜生活商圈',
    specialtyTag: '居酒熱潮炙燒大單',
    description: '越夜越美麗的居酒壽司勝地，深夜炙燒壽司與特選生魚拼盤銷量巨大。',
    emoji: '🏮'
  },
  {
    id: 'branch_roppongi',
    name: '六本木之丘奢華景觀分店',
    districtName: '東京都 港區 六本木',
    lat: 35.6628,
    lng: 139.7313,
    openingCost: 500,
    footTrafficTag: '頂級豪宅與跨國總部區',
    specialtyTag: '尊榮米其林無菜單',
    description: '俯瞰東京鐵塔景緻的高端殿堂，米其林評委高頻巡訪，人均單價與小費極高。',
    emoji: '👑'
  },
  {
    id: 'branch_akihabara',
    name: '秋葉原電器街動漫聯名分店',
    districtName: '東京都 千代田區 外神田',
    lat: 35.6983,
    lng: 139.7731,
    openingCost: 380,
    footTrafficTag: '全球御宅次文化聖地',
    specialtyTag: '快節奏人氣打卡店',
    description: '結合二次元與壽司物語周邊的人氣排隊名店，客流絡繹不絕，少有冷場！',
    emoji: '🎮'
  },
  {
    id: 'branch_asakusa',
    name: '淺草雷門傳統老街分店',
    districtName: '東京都 台東區 淺草',
    lat: 35.7118,
    lng: 139.7967,
    openingCost: 360,
    footTrafficTag: '歷史古寺觀光第一勝地',
    specialtyTag: '傳統和風手作工藝',
    description: '雷門大燈籠旁的古樸日料館，深受歐美自由行觀光客喜愛，注重傳統日料儀式感。',
    emoji: '🌸'
  },
  {
    id: 'branch_yokohama',
    name: '橫濱未來港海灣景觀分店',
    districtName: '神奈川縣 橫濱市 西區',
    lat: 35.4548,
    lng: 139.6315,
    openingCost: 420,
    footTrafficTag: '港灣浪漫海景勝地',
    specialtyTag: '家庭聚餐大單包廂',
    description: '依傍海港的開闊分店，適合家庭聚會與情侶包廂，大拼盤與和牛訂單佔比高。',
    emoji: '🌊'
  },
  {
    id: 'branch_kyoto',
    name: '京都祇園八坂和風旗艦分店',
    districtName: '京都府 京都市 東山區',
    lat: 35.0037,
    lng: 135.7772,
    openingCost: 550,
    footTrafficTag: '千年古都核心藝伎街區',
    specialtyTag: '極致匠人割烹懷石',
    description: '跨足關西的歷史性分店，將江戶前手藝與京都懷石完美融合，口碑享譽全日本。',
    emoji: '🏯'
  }
];

import { Customer, SpecialDietaryTag } from './types';
import { SUSHI_RECIPES } from './recipes';

export interface BranchCustomerArchetype {
  namesZh: string[];
  namesEn: string[];
  avatars: string[];
  vipNamesZh: string[];
  vipNamesEn: string[];
  vipAvatars: string[];
  preferredRecipes: string[];
  dietaryTendency: {
    noWasabiChance: number;
    vegetarianChance: number;
    rushChance: number;
  };
  patienceMultiplier: number;
  tipMultiplier: number;
}

export const BRANCH_CUSTOMER_ARCHETYPES: Record<string, BranchCustomerArchetype> = {
  branch_ginza: {
    namesZh: ['松本 總裁', '神谷 夫人', '德川 律師', '竹田 評論家', '白石 貴婦', '佐藤 董事', '北野 博士', '早川 收藏家'],
    namesEn: ['President Matsumoto', 'Mrs. Kamiya', 'Attorney Tokugawa', 'Critic Takeda', 'Lady Shiraishi', 'Director Sato', 'Dr. Kitano', 'Collector Hayakawa'],
    avatars: ['🧑‍💼', '👩‍💼', '👵', '👴', '👱‍♂️'],
    vipNamesZh: ['【VIP】米其林密探・小野先生', '【VIP】銀座美饌家・佐藤', '【VIP】商界元老・德川'],
    vipNamesEn: ['【VIP】Michelin Inspector Ono', '【VIP】Ginza Gourmet Sato', '【VIP】Elder Statesman Tokugawa'],
    vipAvatars: ['🎩', '👑', '🤵'],
    preferredRecipes: ['omakase_supreme', 'uni_gunkan', 'tuna_nigiri', 'salmon_nigiri'],
    dietaryTendency: { noWasabiChance: 0.15, vegetarianChance: 0.1, rushChance: 0.1 },
    patienceMultiplier: 1.1,
    tipMultiplier: 1.3
  },
  branch_shibuya: {
    namesZh: ['早川 蓮', '星野 結愛', '西園寺 拓海', '愛麗絲 (網紅)', '木村 翼', '長谷川 翔', '藤井 奈奈', '高橋 翔太', '佐佐木 健', '鈴木 莉子'],
    namesEn: ['Ren Hayakawa', 'Yua Hoshino', 'Takumi Saionji', 'Alice (Influencer)', 'Tsubasa Kimura', 'Sho Hasegawa', 'Nana Fujii', 'Shota Takahashi', 'Ken Sasaki', 'Riko Suzuki'],
    avatars: ['👱‍♂️', '👩‍🦰', '👩‍💻', '🧑‍🎤', '🧑‍🎨'],
    vipNamesZh: ['【VIP】百萬潮流博主・愛麗絲', '【VIP】澀谷街頭主理人・翔', '【VIP】超人氣偶像・蓮'],
    vipNamesEn: ['【VIP】Trend Influencer Alice', '【VIP】Shibuya Curator Sho', '【VIP】Pop Idol Ren'],
    vipAvatars: ['✨', '🎧', '⚡'],
    preferredRecipes: ['salmon_nigiri', 'veggie_roll', 'tuna_nigiri'],
    dietaryTendency: { noWasabiChance: 0.35, vegetarianChance: 0.35, rushChance: 0.65 },
    patienceMultiplier: 0.8,
    tipMultiplier: 1.0
  },
  branch_shinjuku: {
    namesZh: ['黑澤 龍', '神崎 美咲', '橘 駿', '一之瀨 茜', 'DJ 健次郎', '桐生 徹', '雨宮 遙', '冴島 勇樹', '真島 浩二'],
    namesEn: ['Ryu Kurosawa', 'Misaki Kanzaki', 'Shun Tachibana', 'Akane Ichinose', 'DJ Kenjiro', 'Tohru Kiryu', 'Haruka Amamiya', 'Yuki Saejima', 'Koji Majima'],
    avatars: ['🧔', '🧑‍🎤', '👩‍🦰', '👨‍🎨', '😎'],
    vipNamesZh: ['【VIP】歌舞伎町傳奇店主・桐生', '【VIP】深夜老饕・黑澤', '【VIP】俱樂部王牌・美咲'],
    vipNamesEn: ['【VIP】Kabukicho Legend Kiryu', '【VIP】Midnight Foodie Ryu', '【VIP】Nightclub Ace Misaki'],
    vipAvatars: ['🕶️', '🔥', '🍷'],
    preferredRecipes: ['wagyu_aburi', 'tuna_nigiri', 'uni_gunkan'],
    dietaryTendency: { noWasabiChance: 0.15, vegetarianChance: 0.05, rushChance: 0.2 },
    patienceMultiplier: 1.0,
    tipMultiplier: 1.25
  },
  branch_roppongi: {
    namesZh: ['Ambassador Charles (查爾斯大使)', 'Elena Rostova (影業製片)', 'Sir Arthur Pendelton', '佐佐木 建築大師', 'Camilla (珠寶鑑賞)', 'Nicholas (跨國基金合夥人)', 'Diane de Poitiers'],
    namesEn: ['Ambassador Charles', 'Elena Rostova (Producer)', 'Sir Arthur Pendelton', 'Architect Sasaki', 'Camilla (Jeweler)', 'Nicholas (Fund Partner)', 'Diane de Poitiers'],
    avatars: ['👨‍💼', '👩‍💼', '👱‍♂️', '👵', '👸'],
    vipNamesZh: ['【VIP】米其林評審秘書長・Charles', '【VIP】跨國基金主席・Nicholas', '【VIP】國際電影節主席・Elena'],
    vipNamesEn: ['【VIP】Michelin Secretary Charles', '【VIP】Chairman Nicholas', '【VIP】Film Festival Chair Elena'],
    vipAvatars: ['👑', '💎', '🥂'],
    preferredRecipes: ['omakase_supreme', 'uni_gunkan', 'wagyu_aburi'],
    dietaryTendency: { noWasabiChance: 0.25, vegetarianChance: 0.3, rushChance: 0.15 },
    patienceMultiplier: 0.9,
    tipMultiplier: 1.5
  },
  branch_akihabara: {
    namesZh: ['芽衣 (職業 Coser)', '大輝 (遊戲實況主)', '御手洗 博士', '小日向 櫻', '風間 駿介', '初音 鐵粉・健二', '千代田 電子匠人', '星空 漫研社長'],
    namesEn: ['Mei (Cosplayer)', 'Daiki (Streamer)', 'Dr. Mitarai', 'Sakura Kohinata', 'Shunsuke Kazama', 'Kenji (Anime Fan)', 'Akiba Engineer', 'Manga Club President'],
    avatars: ['🧑‍💻', '👩‍🎤', '👨‍💻', '🧑‍🎨', '🤖'],
    vipNamesZh: ['【VIP】超人氣動漫偶像・芽衣', '【VIP】百萬訂閱遊戲主播・大輝', '【VIP】傳奇機器人工程博士'],
    vipNamesEn: ['【VIP】Anime Idol Mei', '【VIP】Top Streamer Daiki', '【VIP】Robotics Master Dr. Mitarai'],
    vipAvatars: ['🎮', '👾', '🎀'],
    preferredRecipes: ['veggie_roll', 'salmon_nigiri', 'tuna_nigiri'],
    dietaryTendency: { noWasabiChance: 0.4, vegetarianChance: 0.3, rushChance: 0.4 },
    patienceMultiplier: 1.15,
    tipMultiplier: 1.05
  },
  branch_asakusa: {
    namesZh: ['Lucas & Sophie (背包客)', 'Pierre (巴黎名廚)', '吉田 陶藝大師', 'Hans (德國攝影家)', '春日 婆婆', 'Mateo (文化學者)', '山田 茶道師範'],
    namesEn: ['Lucas & Sophie (Backpackers)', 'Pierre (Paris Chef)', 'Master Yoshida (Potter)', 'Hans (Photographer)', 'Grandma Kasuga', 'Mateo (Scholar)', 'Master Yamada (Tea Ceremony)'],
    avatars: ['👱‍♂️', '👩‍🦰', '👴', '👵', '📸'],
    vipNamesZh: ['【VIP】國際旅行指南主筆・Lucas', '【VIP】法國藍帶名廚・Pierre', '【VIP】國寶陶藝大師・吉田'],
    vipNamesEn: ['【VIP】Travel Guide Editor Lucas', '【VIP】Cordon Bleu Chef Pierre', '【VIP】Master Potter Yoshida'],
    vipAvatars: ['🌸', '⛩️', '🍵'],
    preferredRecipes: ['tuna_nigiri', 'salmon_nigiri', 'uni_gunkan'],
    dietaryTendency: { noWasabiChance: 0.25, vegetarianChance: 0.2, rushChance: 0.1 },
    patienceMultiplier: 1.2,
    tipMultiplier: 1.2
  },
  branch_yokohama: {
    namesZh: ['渡邊 一家 (3人家庭)', '健太與優香 (甜蜜情侶)', '橫濱商會 岡本 會長', '海野 船長', '森田 夫婦', '港灣物流 鈴木 經理'],
    namesEn: ['The Watanabe Family', 'Kenta & Yuka (Couple)', 'President Okamoto', 'Captain Unno', 'Mr. & Mrs. Morita', 'Port Manager Suzuki'],
    avatars: ['👨‍👩‍👧', '👩‍❤️‍👨', '👱‍♂️', '👴', '⚓'],
    vipNamesZh: ['【VIP】橫濱商工會議所會長・岡本', '【VIP】港灣觀光親善大使・優香', '【VIP】遠洋郵輪船長・海野'],
    vipNamesEn: ['【VIP】Chamber President Okamoto', '【VIP】Port Goodwill Ambassador Yuka', '【VIP】Cruise Captain Unno'],
    vipAvatars: ['🌊', '⛵', '🛳️'],
    preferredRecipes: ['omakase_supreme', 'wagyu_aburi', 'salmon_nigiri'],
    dietaryTendency: { noWasabiChance: 0.2, vegetarianChance: 0.15, rushChance: 0.2 },
    patienceMultiplier: 1.05,
    tipMultiplier: 1.2
  },
  branch_kyoto: {
    namesZh: ['八坂 藝伎 小鈴', '西陣織大師 吉野', '京都大學 藤原 教授', '茶道宗匠 千代', '祇園老舖主理人 近藤', '妙心寺 禪師'],
    namesEn: ['Geisha Kosuzu (Yasaka)', 'Weaver Master Yoshino', 'Professor Fujiwara', 'Tea Master Chiyo', 'Gion Historic Owner Kondo', 'Zen Monk of Myoshin-ji'],
    avatars: ['👘', '👴', '👵', '🍵', '🎋'],
    vipNamesZh: ['【VIP】祇園甲部名藝伎・小鈴', '【VIP】西陣織人間國寶・吉野', '【VIP】裏千家茶道宗匠・千代'],
    vipNamesEn: ['【VIP】Master Geisha Kosuzu', '【VIP】National Treasure Yoshino', '【VIP】Grand Tea Master Chiyo'],
    vipAvatars: ['🏯', '🌸', '🎎'],
    preferredRecipes: ['omakase_supreme', 'veggie_roll', 'uni_gunkan'],
    dietaryTendency: { noWasabiChance: 0.1, vegetarianChance: 0.45, rushChance: 0.05 },
    patienceMultiplier: 1.3,
    tipMultiplier: 1.35
  }
};

const DEFAULT_ARCHETYPE: BranchCustomerArchetype = {
  namesZh: ['鈴木 祥平', '井上 彩乃', '高木 達也', '松井 健太郎', '山根 結衣', '長尾 俊介', '森川 葵'],
  namesEn: ['Shohei Suzuki', 'Ayano Inoue', 'Tatsuya Takagi', 'Kentaro Matsui', 'Yui Yamane', 'Shunsuke Nagao', 'Aoi Morikawa'],
  avatars: ['🧑‍💼', '👩‍💻', '👨‍🎨', '👵', '👴', '👱‍♂️', '👩‍🦰', '🧔'],
  vipNamesZh: ['【VIP】名譽客座美食家・鈴木', '【VIP】國際連鎖品評顧問・彩乃'],
  vipNamesEn: ['【VIP】Distinguished Gourmet Suzuki', '【VIP】Franchise Critic Ayano'],
  vipAvatars: ['👑', '⭐', '✨'],
  preferredRecipes: ['salmon_nigiri', 'tuna_nigiri', 'veggie_roll', 'wagyu_aburi'],
  dietaryTendency: { noWasabiChance: 0.25, vegetarianChance: 0.2, rushChance: 0.25 },
  patienceMultiplier: 1.0,
  tipMultiplier: 1.1
};

export function getBranchArchetype(branchId: string): BranchCustomerArchetype {
  return BRANCH_CUSTOMER_ARCHETYPES[branchId] || DEFAULT_ARCHETYPE;
}

export function spawnCustomerForBranch(
  branchId: string,
  tick: number,
  isRush: boolean = false,
  forceVip: boolean = false,
  vipBonus: number = 0,
  specialRequestsFrequency: number = 0.25
): Customer {
  const archetype = getBranchArchetype(branchId);
  const custId = `${branchId.slice(0, 8)}_CUST_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

  const isVip = forceVip || Math.random() < (0.15 + vipBonus);
  const isSpecial = forceVip || Math.random() < specialRequestsFrequency;

  let name: string;
  let avatar: string;

  if (isVip) {
    const vipIdx = Math.floor(Math.random() * archetype.vipNamesZh.length);
    name = archetype.vipNamesZh[vipIdx];
    avatar = archetype.vipAvatars[vipIdx % archetype.vipAvatars.length];
  } else {
    const regIdx = Math.floor(Math.random() * archetype.namesZh.length);
    name = archetype.namesZh[regIdx];
    avatar = archetype.avatars[Math.floor(Math.random() * archetype.avatars.length)];
  }

  let specialPreference: SpecialDietaryTag = 'none';
  let specialNote = '';

  if (isVip) {
    specialPreference = 'vip_critic';
    specialNote = '米其林指南秘密稽查員，對鮮度要求極高！';
  } else if (isSpecial) {
    const roll = Math.random();
    const dt = archetype.dietaryTendency;
    const totalTendency = dt.noWasabiChance + dt.vegetarianChance + dt.rushChance;
    const normWasabi = dt.noWasabiChance / totalTendency;
    const normVeggie = (dt.noWasabiChance + dt.vegetarianChance) / totalTendency;

    if (roll < normWasabi) {
      specialPreference = 'no_wasabi';
      specialNote = '對芥末辛辣敏感，要求【不要放山葵/芥末】';
    } else if (roll < normVeggie) {
      specialPreference = 'vegetarian';
      specialNote = '嚴格素食主義者，【僅食用酪梨蔬食卷】';
    } else {
      specialPreference = 'rush_hurry';
      specialNote = '趕搭高鐵班次，要求出餐必須極速！';
    }
  }

  // Select recipes from branch preferred pool
  const orders: { recipeId: string; quantity: number }[] = [];
  if (specialPreference === 'vegetarian') {
    orders.push({ recipeId: 'veggie_roll', quantity: 1 });
  } else if (isVip) {
    orders.push({ recipeId: archetype.preferredRecipes.includes('omakase_supreme') ? 'omakase_supreme' : archetype.preferredRecipes[0], quantity: 1 });
  } else {
    const pool = archetype.preferredRecipes;
    const pick1 = pool[Math.floor(Math.random() * pool.length)];
    orders.push({ recipeId: pick1, quantity: 1 });
    if (Math.random() < 0.45) {
      const pick2 = pool[Math.floor(Math.random() * pool.length)];
      orders.push({ recipeId: pick2, quantity: 1 });
    }
  }

  const billAmount = orders.reduce(
    (acc, o) => acc + (SUSHI_RECIPES[o.recipeId]?.price || 15) * o.quantity,
    0
  );

  const basePatience = isVip ? 36 : (specialPreference === 'rush_hurry' ? 24 : 44);
  const patienceMax = Math.round(basePatience * archetype.patienceMultiplier);

  return {
    id: custId,
    name,
    avatar,
    arrivalTick: tick,
    status: 'in_queue',
    orders,
    specialPreference,
    specialNote,
    patienceMax,
    patienceRemaining: patienceMax,
    satisfactionStars: 5,
    isVip,
    billAmount,
    tipAmount: 0
  };
}
