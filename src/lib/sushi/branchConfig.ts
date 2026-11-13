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
