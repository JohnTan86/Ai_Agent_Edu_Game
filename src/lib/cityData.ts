import { Hub, DeliveryRobot, Order } from './types';

export interface RoadNode {
  id: string;
  name: string;
  nameZh: string;
  lat: number;
  lng: number;
  neighbors: string[]; // Connected road node IDs
  sector?: number; // Progressive district expansion sector (1, 2, 3, 4, 5, 6, 7, 8, ... unlimited!)
}

export const CITY_SECTOR_NAMES: Record<string, Record<number, { en: string; zh: string }>> = {
  singapore: {
    1: { en: 'Sector 1: Marina Bay Financial Core', zh: '一区：滨海湾金融核心区' },
    2: { en: 'Sector 2: Civic District & Suntec Belt', zh: '二区：市政厅与新达城片区' },
    3: { en: 'Sector 3: Chinatown, Clarke Quay & Orchard', zh: '三区：牛车水与乌节商业走廊' },
    4: { en: 'Sector 4: Greater Metropolis (Bugis, Novena & Outram)', zh: '四区：大都会外环拓建区 (武吉士/诺维娜/欧南园)' },
    5: { en: 'Sector 5: East Coast & Changi Airport Air-Cargo Belt', zh: '五区：东海岸与樟宜空港货运走廊 (加冷/巴耶利峇/樟宜)' },
    6: { en: 'Sector 6: West Innovation Corridor & Jurong Gateway', zh: '六区：西部科技走廊与裕廊新城 (波那维斯达/金文泰/裕廊)' },
    7: { en: 'Sector 7: Northern Green Belt & Woodlands Hub', zh: '七区：北部生态走廊与兀兰跨境枢纽 (碧山/宏茂桥/兀兰)' },
    8: { en: 'Sector 8: Global Maritime & Deepwater Logistics Terminal', zh: '八区：全球深水物流巨港与自由贸易区 (大士超大型物流港)' }
  },
  tokyo: {
    1: { en: 'Sector 1: Shibuya Crossing Core', zh: '一区：涩谷中心街核心区' },
    2: { en: 'Sector 2: Omotesando & Harajuku Belt', zh: '二区：表参道与原宿时尚走廊' },
    3: { en: 'Sector 3: Roppongi Hills & Midtown', zh: '三区：六本木之丘与东京中城' },
    4: { en: 'Sector 4: Greater Metropolis (Ebisu, Daikanyama & Akasaka)', zh: '四区：大都会外环拓建区 (惠比寿/代官山/赤坂)' },
    5: { en: 'Sector 5: Shinjuku West High-Rise & Okubo Tech Belt', zh: '五区：新宿西口摩天大楼与大久保走廊' },
    6: { en: 'Sector 6: Ginza Luxury District & Tsukiji Waterfront', zh: '六区：银座中央通与筑地滨水物流港' },
    7: { en: 'Sector 7: Akihabara Electronics & Ueno Cultural Hub', zh: '七区：秋叶原数码谷与上野交通枢纽' },
    8: { en: 'Sector 8: Odaiba Bay & Haneda Airport Logistics Gate', zh: '八区：台场临海副都心与羽田空港货运大动脉' }
  },
  newyork: {
    1: { en: 'Sector 1: Times Square & Broadway Core', zh: '一区：时代广场与百老汇核心区' },
    2: { en: 'Sector 2: Fifth Ave & Grand Central East', zh: '二区：第五大道与大中央车站片区' },
    3: { en: 'Sector 3: Penn Station & Hudson Yards', zh: '三区：帝国大厦与哈德逊园区' },
    4: { en: 'Sector 4: Greater Midtown (Central Park South & Chelsea)', zh: '四区：大都会外环拓建区 (哥伦布圆环/熨斗区/切尔西)' },
    5: { en: 'Sector 5: Financial District & Wall Street South', zh: '五区：下曼哈顿华尔街与世贸中心' },
    6: { en: 'Sector 6: SoHo Arts & Greenwich Village Hub', zh: '六区：SoHo艺术区与格林威治村商业片区' },
    7: { en: 'Sector 7: Brooklyn Bridge Gateway & DUMBO Waterfront', zh: '七区：布鲁克林大桥水岸与DUMBO科技园区' },
    8: { en: 'Sector 8: Long Island City & Queens Metro Logistics Belt', zh: '八区：长岛市与皇后区大都会物流动脉' }
  }
};

export function getSectorNameInfo(cityId: string, sector: number): { en: string; zh: string } {
  const map = CITY_SECTOR_NAMES[cityId] || CITY_SECTOR_NAMES.singapore;
  if (map[sector]) {
    return map[sector];
  }
  return {
    zh: `第 ${sector} 扩张区：全城智能蜂窝超级物流环线 (${sector * 2.5}km)`,
    en: `Sector ${sector}: Deep Metro Perimeter Logistics Ring (${sector * 2.5}km)`
  };
}

export function isNodeOccupiedByHub(node: RoadNode, hubs: Hub[]): boolean {
  return hubs.some(
    h =>
      Math.hypot((h.position.lat || 0) - node.lat, (h.position.lng || 0) - node.lng) < 0.0014
  );
}

export interface CitySectorStatus {
  unlockedSector: number; // Unlimited!
  currentSectorNameEn: string;
  currentSectorNameZh: string;
  currentSectorBuilt: number;
  currentSectorTotal: number;
  totalBuiltNodes: number;
  totalCityNodes: number;
  unlockedNodes: RoadNode[];
  availableBuildNodes: RoadNode[];
  nextLockedSectorNodes: RoadNode[];
  nextSectorNumber: number | null;
}

/**
 * Procedurally generates perimeter expansion nodes if player expands beyond static sectors
 */
export function getProceduralSectorNodes(city: CityData, sector: number): RoadNode[] {
  // 1. If static road nodes define this sector, return them
  const staticNodes = city.roadNodes.filter(n => (n.sector || 1) === sector);
  if (staticNodes.length > 0) return staticNodes;

  // 2. Otherwise procedurally generate perimeter radial nodes so availableBuildNodes NEVER runs out!
  const [centerLat, centerLng] = city.center;
  const radius = 0.038 + (sector - 8) * 0.015;
  const cardinalOffsets = [
    { angle: 0.785, nameEn: 'North-East Radial Gate', nameZh: '东北放射线智慧分部' },
    { angle: 2.356, nameEn: 'South-East Coastal Link', nameZh: '东南沿海物流中继站' },
    { angle: 3.927, nameEn: 'South-West Industrial Pier', nameZh: '西南临港重载调度站' },
    { angle: 5.497, nameEn: 'North-West Tech Gateway', nameZh: '西北科技长廊分拨站' }
  ];

  const parentSectorNodes = city.roadNodes.filter(n => (n.sector || 1) === sector - 1);
  const fallbackParentId = parentSectorNodes[0]?.id || city.roadNodes[city.roadNodes.length - 1]?.id || 'n1';

  return cardinalOffsets.map((c, idx) => {
    const lat = centerLat + Math.sin(c.angle) * radius;
    const lng = centerLng + Math.cos(c.angle) * radius * 1.15;
    const id = `${city.id}-s${sector}-node-${idx + 1}`;
    const neighborId = parentSectorNodes[idx % parentSectorNodes.length]?.id || fallbackParentId;

    return {
      id,
      name: `${city.name} S${sector}: ${c.nameEn} #${idx + 1}`,
      nameZh: `${city.nameZh} 第${sector}区：${c.nameZh} #${idx + 1}`,
      lat: +lat.toFixed(4),
      lng: +lng.toFixed(4),
      neighbors: [neighborId],
      sector
    };
  });
}

/**
 * Collects all road nodes for sectors 1 through upToSector (static + procedural)
 */
export function getAllUnlockedCityNodes(city: CityData, upToSector: number): RoadNode[] {
  const result: RoadNode[] = [];
  for (let s = 1; s <= upToSector; s++) {
    result.push(...getProceduralSectorNodes(city, s));
  }
  return result;
}

export function getCitySectorStatus(city: CityData, hubs: Hub[]): CitySectorStatus {
  let unlockedSector = 1;

  // Step through sectors indefinitely: if all nodes in a sector are built, auto-advance to next sector!
  while (true) {
    const sNodes = getProceduralSectorNodes(city, unlockedSector);
    const allBuilt = sNodes.length > 0 && sNodes.every(n => isNodeOccupiedByHub(n, hubs));
    if (allBuilt) {
      unlockedSector++;
    } else {
      break;
    }
  }

  const currentSectorNodes = getProceduralSectorNodes(city, unlockedSector);
  const currentSectorBuilt = currentSectorNodes.filter(n => isNodeOccupiedByHub(n, hubs)).length;
  const unlockedNodes = getAllUnlockedCityNodes(city, unlockedSector);
  let availableBuildNodes = unlockedNodes.filter(n => !isNodeOccupiedByHub(n, hubs));

  // Zero-Cap Safeguard: If somehow availableBuildNodes is empty, immediately open the next sector!
  if (availableBuildNodes.length === 0) {
    unlockedSector++;
    const nextNodes = getProceduralSectorNodes(city, unlockedSector);
    unlockedNodes.push(...nextNodes);
    availableBuildNodes = unlockedNodes.filter(n => !isNodeOccupiedByHub(n, hubs));
  }

  const nextSectorNumber = unlockedSector + 1;
  const nextLockedSectorNodes = getProceduralSectorNodes(city, nextSectorNumber).filter(n => !isNodeOccupiedByHub(n, hubs));
  const sectorNameInfo = getSectorNameInfo(city.id, unlockedSector);

  return {
    unlockedSector,
    currentSectorNameEn: sectorNameInfo.en,
    currentSectorNameZh: sectorNameInfo.zh,
    currentSectorBuilt,
    currentSectorTotal: currentSectorNodes.length,
    totalBuiltNodes: hubs.length,
    totalCityNodes: unlockedNodes.length,
    unlockedNodes,
    availableBuildNodes,
    nextLockedSectorNodes,
    nextSectorNumber
  };
}

export interface TrafficCorridor {
  id: string;
  name: string;
  nameZh: string;
  coordinates: Array<[number, number]>;
  status: 'flowing' | 'moderate' | 'congested' | 'severe';
  multiplier: number;
  speedKmh: number;
}

export interface CityData {
  id: string;
  name: string;
  nameZh: string;
  country: string;
  countryZh: string;
  flag: string;
  center: [number, number];
  zoom: number;
  description: string;
  descriptionZh: string;
  hubs: Hub[];
  roadNodes: RoadNode[];
  trafficCorridors: TrafficCorridor[];
  initialOrders: Order[];
  initialRobots: DeliveryRobot[];
}

// ==========================================
// 1. SINGAPORE (Downtown / Marina Bay / Orchard)
// ==========================================
export const SINGAPORE_CITY: CityData = {
  id: 'singapore',
  name: 'Singapore',
  nameZh: '新加坡',
  country: 'Singapore',
  countryZh: '新加坡',
  flag: '🇸🇬',
  center: [1.2838, 103.8551],
  zoom: 15,
  description: 'Ultra-dense smart nation urban grid covering Marina Bay Financial District, Raffles Place, and Orchard Road shopping belt.',
  descriptionZh: '高密度智慧国度城网，覆盖滨海湾金融中心、莱佛士坊商业枢纽与乌节路商圈。',
  hubs: [
    {
      id: 'sg-hub-marina',
      name: 'Marina Bay Financial Hub',
      position: { x: 5, y: 5, lat: 1.2805, lng: 103.8540 },
      chargingBays: 3,
      availableChargers: 3,
      zone: 'Marina Bay'
    },
    {
      id: 'sg-hub-orchard',
      name: 'Orchard Central Depot',
      position: { x: 2, y: 12, lat: 1.3008, lng: 103.8390 },
      chargingBays: 3,
      availableChargers: 3,
      zone: 'Orchard'
    },
    {
      id: 'sg-hub-shenton',
      name: 'Shenton Way Logistics Depot',
      position: { x: 10, y: 3, lat: 1.2760, lng: 103.8490 },
      chargingBays: 2,
      availableChargers: 2,
      zone: 'Shenton Way'
    }
  ],
  roadNodes: [
    // Sector 1: Marina Bay & Financial Core
    { id: 'sg-n1', name: 'Marina Boulevard Junction', nameZh: '滨海大道交叉口', lat: 1.2805, lng: 103.8540, neighbors: ['sg-n2', 'sg-n5', 'sg-n7'], sector: 1 },
    { id: 'sg-n2', name: 'Raffles Quay / Collyer Quay', nameZh: '莱佛士码头', lat: 1.2835, lng: 103.8530, neighbors: ['sg-n1', 'sg-n3', 'sg-n6'], sector: 1 },
    { id: 'sg-n5', name: 'Bayfront Avenue / MBS', nameZh: '海湾道 (金沙)', lat: 1.2830, lng: 103.8595, neighbors: ['sg-n4', 'sg-n1', 'sg-n10'], sector: 1 },
    { id: 'sg-n6', name: 'Raffles Place / Battery Road', nameZh: '莱佛士坊中心', lat: 1.2845, lng: 103.8510, neighbors: ['sg-n2', 'sg-n7', 'sg-n11'], sector: 1 },
    { id: 'sg-n7', name: 'Shenton Way / Robinson Rd', nameZh: '珊顿道', lat: 1.2760, lng: 103.8490, neighbors: ['sg-n1', 'sg-n6', 'sg-n12'], sector: 1 },
    // Sector 2: Civic District & Suntec Belt
    { id: 'sg-n3', name: 'Fullerton Road / Victoria St', nameZh: '浮尔顿路', lat: 1.2870, lng: 103.8535, neighbors: ['sg-n2', 'sg-n4', 'sg-n8'], sector: 2 },
    { id: 'sg-n4', name: 'Esplanade Bridge / Marina Bay Sands', nameZh: '滨海艺术中心桥', lat: 1.2890, lng: 103.8570, neighbors: ['sg-n3', 'sg-n5', 'sg-n9'], sector: 2 },
    { id: 'sg-n8', name: 'Bras Basah / City Hall', nameZh: '百胜路 / 政府大厦', lat: 1.2930, lng: 103.8520, neighbors: ['sg-n3', 'sg-n9', 'sg-n13', 'sg-n16'], sector: 2 },
    { id: 'sg-n9', name: 'Suntec City / Temasek Blvd', nameZh: '新达城 / 坦马锡林荫道', lat: 1.2940, lng: 103.8580, neighbors: ['sg-n4', 'sg-n8', 'sg-n10', 'sg-n16'], sector: 2 },
    { id: 'sg-n10', name: 'Marina Coastal Expressway (MCE)', nameZh: '滨海高速 (MCE)', lat: 1.2750, lng: 103.8610, neighbors: ['sg-n5', 'sg-n9', 'sg-n12'], sector: 2 },
    // Sector 3: Chinatown, Clarke Quay & Orchard Corridor
    { id: 'sg-n11', name: 'Chinatown / South Bridge Rd', nameZh: '牛车水 / 南桥路', lat: 1.2830, lng: 103.8440, neighbors: ['sg-n6', 'sg-n12', 'sg-n14', 'sg-n19'], sector: 3 },
    { id: 'sg-n12', name: 'Tanjong Pagar / Anson Rd', nameZh: '丹戎巴葛', lat: 1.2740, lng: 103.8450, neighbors: ['sg-n7', 'sg-n10', 'sg-n11', 'sg-n19'], sector: 3 },
    { id: 'sg-n13', name: 'Dhoby Ghaut / Orchard Rd Entrance', nameZh: '多美歌 / 乌节路入口', lat: 1.2990, lng: 103.8460, neighbors: ['sg-n8', 'sg-n14', 'sg-n15', 'sg-n16', 'sg-n17'], sector: 3 },
    { id: 'sg-n14', name: 'Clarke Quay / River Valley Rd', nameZh: '克拉码头 / 里峇峇利路', lat: 1.2900, lng: 103.8440, neighbors: ['sg-n11', 'sg-n13', 'sg-n15', 'sg-n19'], sector: 3 },
    { id: 'sg-n15', name: 'Orchard Central / Somerset Rd', nameZh: '乌节中心 / 索美塞', lat: 1.3008, lng: 103.8390, neighbors: ['sg-n13', 'sg-n14', 'sg-n18'], sector: 3 },
    // Sector 4: Greater Metropolis Expansion (Bugis, Little India, Newton/Novena, Outram Medical)
    { id: 'sg-n16', name: 'Bugis Junction / Victoria St', nameZh: '武吉士商业枢纽', lat: 1.2995, lng: 103.8555, neighbors: ['sg-n8', 'sg-n9', 'sg-n13', 'sg-n17'], sector: 4 },
    { id: 'sg-n17', name: 'Little India / Tekka Centre', nameZh: '小印度 / 竹脚中心', lat: 1.3065, lng: 103.8518, neighbors: ['sg-n13', 'sg-n16', 'sg-n18'], sector: 4 },
    { id: 'sg-n18', name: 'Newton Circus / Novena Hub', nameZh: '纽顿圈 / 诺维娜枢纽', lat: 1.3125, lng: 103.8385, neighbors: ['sg-n15', 'sg-n17'], sector: 4 },
    { id: 'sg-n19', name: 'Outram Park / SGH Medical Hub', nameZh: '欧南园医疗中心', lat: 1.2800, lng: 103.8365, neighbors: ['sg-n11', 'sg-n12', 'sg-n14'], sector: 4 },
    // Sector 5: East Coast & Changi Airport Air-Cargo Belt
    { id: 'sg-n20', name: 'Kallang Wave / National Stadium', nameZh: '加冷体育城', lat: 1.3035, lng: 103.8745, neighbors: ['sg-n9', 'sg-n16', 'sg-n21'], sector: 5 },
    { id: 'sg-n21', name: 'Paya Lebar Central Hub', nameZh: '巴耶利峇商业中心', lat: 1.3175, lng: 103.8925, neighbors: ['sg-n20', 'sg-n22', 'sg-n23'], sector: 5 },
    { id: 'sg-n22', name: 'Marine Parade / East Coast Park', nameZh: '马林百列/东海岸', lat: 1.3020, lng: 103.9065, neighbors: ['sg-n21', 'sg-n23'], sector: 5 },
    { id: 'sg-n23', name: 'Changi Airport Cargo Megaplex', nameZh: '樟宜空港数码货运站', lat: 1.3644, lng: 103.9915, neighbors: ['sg-n21', 'sg-n22'], sector: 5 },
    // Sector 6: West Innovation Corridor & Jurong Gateway
    { id: 'sg-n24', name: 'Alexandra / Queenstown Hub', nameZh: '亚历山大/女皇镇', lat: 1.2885, lng: 103.8055, neighbors: ['sg-n14', 'sg-n19', 'sg-n25'], sector: 6 },
    { id: 'sg-n25', name: 'Buona Vista one-north Tech Park', nameZh: '波那维斯达/纬壹科技城', lat: 1.2995, lng: 103.7875, neighbors: ['sg-n24', 'sg-n26'], sector: 6 },
    { id: 'sg-n26', name: 'Clementi Town Logistics Center', nameZh: '金文泰数码换乘站', lat: 1.3150, lng: 103.7650, neighbors: ['sg-n25', 'sg-n27'], sector: 6 },
    { id: 'sg-n27', name: 'Jurong Gateway / JCube Centre', nameZh: '裕廊商业中心/湖畔枢纽', lat: 1.3330, lng: 103.7425, neighbors: ['sg-n26'], sector: 6 },
    // Sector 7: Northern Green Belt & Woodlands Hub
    { id: 'sg-n28', name: 'Toa Payoh Central Hub', nameZh: '大巴窑中枢', lat: 1.3325, lng: 103.8475, neighbors: ['sg-n18', 'sg-n29'], sector: 7 },
    { id: 'sg-n29', name: 'Bishan Junction 8', nameZh: '碧山商圈', lat: 1.3505, lng: 103.8485, neighbors: ['sg-n28', 'sg-n30'], sector: 7 },
    { id: 'sg-n30', name: 'Ang Mo Kio Central', nameZh: '宏茂桥交通枢纽', lat: 1.3695, lng: 103.8495, neighbors: ['sg-n29', 'sg-n31'], sector: 7 },
    { id: 'sg-n31', name: 'Woodlands Integrated Transport Hub', nameZh: '兀兰跨境枢纽中心', lat: 1.4370, lng: 103.7865, neighbors: ['sg-n30'], sector: 7 },
    // Sector 8: Global Maritime & Deepwater Logistics Terminal
    { id: 'sg-n32', name: 'Jurong Industrial Complex', nameZh: '裕廊工业重镇', lat: 1.3180, lng: 103.7120, neighbors: ['sg-n27', 'sg-n33'], sector: 8 },
    { id: 'sg-n33', name: 'Tuas Mega Port Automated Depot', nameZh: '大士超大型深水自动码头', lat: 1.2720, lng: 103.6360, neighbors: ['sg-n32', 'sg-n34'], sector: 8 },
    { id: 'sg-n34', name: 'Jurong Island Logistics Pier', nameZh: '裕廊岛自贸货运港', lat: 1.2650, lng: 103.6950, neighbors: ['sg-n33', 'sg-n35'], sector: 8 },
    { id: 'sg-n35', name: 'Sentosa South Marine Terminal', nameZh: '圣淘沙南端海洋配送站', lat: 1.2480, lng: 103.8300, neighbors: ['sg-n7', 'sg-n12'], sector: 8 }
  ],
  trafficCorridors: [
    {
      id: 'sg-tf-mce',
      name: 'Marina Coastal Expressway (MCE)',
      nameZh: '滨海湾跨海高速 (MCE)',
      coordinates: [
        [1.2740, 103.8450],
        [1.2750, 103.8490],
        [1.2750, 103.8610],
        [1.2830, 103.8595]
      ],
      status: 'severe',
      multiplier: 3.2,
      speedKmh: 12
    },
    {
      id: 'sg-tf-orchard',
      name: 'Orchard Road Shopping Corridor',
      nameZh: '乌节路商业主干道',
      coordinates: [
        [1.3008, 103.8390],
        [1.2990, 103.8460],
        [1.2930, 103.8520]
      ],
      status: 'congested',
      multiplier: 2.3,
      speedKmh: 18
    },
    {
      id: 'sg-tf-shenton',
      name: 'Shenton Way Financial Artery',
      nameZh: '珊顿道金融主干线',
      coordinates: [
        [1.2760, 103.8490],
        [1.2805, 103.8540],
        [1.2835, 103.8530]
      ],
      status: 'moderate',
      multiplier: 1.7,
      speedKmh: 28
    }
  ],
  initialOrders: [
    {
      id: '101',
      sender: 'Marina Bay Sands Hotel',
      recipientAddress: { x: 5, y: 9, zone: 'Bayfront Sands', lat: 1.2838, lng: 103.8592 },
      deadlineTick: 38,
      reward: 65,
      weightKg: 3.5,
      status: 'pending',
      createdAtTick: 1,
      pickupHubId: 'sg-hub-marina'
    },
    {
      id: '102',
      sender: 'Raffles Medical Group',
      recipientAddress: { x: 6, y: 6, zone: 'Raffles Place Tower', lat: 1.2845, lng: 103.8510 },
      deadlineTick: 45,
      reward: 75,
      weightKg: 2.0,
      status: 'pending',
      createdAtTick: 1,
      pickupHubId: 'sg-hub-marina'
    },
    {
      id: '103',
      sender: 'Apple Store Orchard',
      recipientAddress: { x: 2, y: 12, zone: 'Somerset Residences', lat: 1.2990, lng: 103.8460 },
      deadlineTick: 32,
      reward: 55,
      weightKg: 4.8,
      status: 'pending',
      createdAtTick: 1,
      pickupHubId: 'sg-hub-orchard'
    },
    {
      id: '104',
      sender: 'Suntec Convention Centre',
      recipientAddress: { x: 9, y: 9, zone: 'Temasek Boulevard', lat: 1.2940, lng: 103.8580 },
      deadlineTick: 50,
      reward: 80,
      weightKg: 8.2,
      status: 'pending',
      createdAtTick: 3,
      pickupHubId: 'sg-hub-marina'
    },
    {
      id: '105',
      sender: 'Tanjong Pagar DistriPark',
      recipientAddress: { x: 11, y: 3, zone: 'Chinatown Point', lat: 1.2830, lng: 103.8440 },
      deadlineTick: 42,
      reward: 58,
      weightKg: 5.5,
      status: 'pending',
      createdAtTick: 6,
      pickupHubId: 'sg-hub-shenton'
    }
  ],
  initialRobots: [
    {
      id: 'sg-bot-01',
      name: 'MerlionRover-01',
      position: { x: 5, y: 5, lat: 1.2805, lng: 103.8540 },
      batteryPct: 92,
      maxCapacityKg: 12,
      currentPayloadKg: 0,
      speed: 1,
      costPerTick: 0.15,
      status: 'idle',
      homeHubId: 'sg-hub-marina',
      pathQueue: [],
      totalDistanceTraveled: 0,
      totalDeliveriesCompleted: 0,
      color: '#06b6d4'
    },
    {
      id: 'sg-bot-02',
      name: 'BayfrontPulse-02',
      position: { x: 5, y: 6, lat: 1.2815, lng: 103.8550 },
      batteryPct: 85,
      maxCapacityKg: 8,
      currentPayloadKg: 0,
      speed: 1,
      costPerTick: 0.18,
      status: 'idle',
      homeHubId: 'sg-hub-marina',
      pathQueue: [],
      totalDistanceTraveled: 0,
      totalDeliveriesCompleted: 0,
      color: '#3b82f6'
    },
    {
      id: 'sg-bot-03',
      name: 'OrchardSprint-03',
      position: { x: 2, y: 12, lat: 1.3008, lng: 103.8390 },
      batteryPct: 78,
      maxCapacityKg: 15,
      currentPayloadKg: 0,
      speed: 1,
      costPerTick: 0.22,
      status: 'idle',
      homeHubId: 'sg-hub-orchard',
      pathQueue: [],
      totalDistanceTraveled: 0,
      totalDeliveriesCompleted: 0,
      color: '#10b981'
    },
    {
      id: 'sg-bot-04',
      name: 'ShentonHauler-04',
      position: { x: 10, y: 3, lat: 1.2760, lng: 103.8490 },
      batteryPct: 68,
      maxCapacityKg: 20,
      currentPayloadKg: 0,
      speed: 1,
      costPerTick: 0.25,
      status: 'idle',
      homeHubId: 'sg-hub-shenton',
      pathQueue: [],
      totalDistanceTraveled: 0,
      totalDeliveriesCompleted: 0,
      color: '#f59e0b'
    }
  ]
};

// ==========================================
// 2. TOKYO (Shibuya / Shinjuku / Roppongi)
// ==========================================
export const TOKYO_CITY: CityData = {
  id: 'tokyo',
  name: 'Tokyo',
  nameZh: '东京',
  country: 'Japan',
  countryZh: '日本',
  flag: '🇯🇵',
  center: [35.6595, 139.7004],
  zoom: 15,
  description: 'Megacity navigation through the bustling alleys of Shibuya Crossing, Meiji Shrine avenues, and Roppongi Hills.',
  descriptionZh: '全球顶级超级都市，穿越涩谷十字路口、明治神宫林荫大道与六本木之丘的高能运力网络。',
  hubs: [
    {
      id: 'ty-hub-shibuya',
      name: 'Shibuya Station Depot',
      position: { x: 4, y: 4, lat: 35.6580, lng: 139.7016 },
      chargingBays: 3,
      availableChargers: 3,
      zone: 'Shibuya'
    },
    {
      id: 'ty-hub-roppongi',
      name: 'Roppongi Hills Logistics Bay',
      position: { x: 12, y: 6, lat: 35.6605, lng: 139.7292 },
      chargingBays: 3,
      availableChargers: 3,
      zone: 'Roppongi'
    },
    {
      id: 'ty-hub-harajuku',
      name: 'Harajuku Express Center',
      position: { x: 4, y: 12, lat: 35.6702, lng: 139.7027 },
      chargingBays: 2,
      availableChargers: 2,
      zone: 'Harajuku'
    }
  ],
  roadNodes: [
    // Sector 1: Shibuya Core
    { id: 'ty-n1', name: 'Shibuya Scramble Crossing', nameZh: '涩谷十字路口', lat: 35.6595, lng: 139.7004, neighbors: ['ty-n2', 'ty-n4', 'ty-n6', 'ty-n14'], sector: 1 },
    { id: 'ty-n2', name: 'Shibuya Station East Exit', nameZh: '涩谷站东口', lat: 35.6580, lng: 139.7030, neighbors: ['ty-n1', 'ty-n3', 'ty-n5', 'ty-n13'], sector: 1 },
    { id: 'ty-n5', name: 'Shuto Expressway Route 3', nameZh: '首都高3号线', lat: 35.6540, lng: 139.7150, neighbors: ['ty-n2', 'ty-n7', 'ty-n9', 'ty-n13'], sector: 1 },
    { id: 'ty-n6', name: 'Dogenzaka / Shibuya 109', nameZh: '道玄坂 / 109大楼', lat: 35.6598, lng: 139.6980, neighbors: ['ty-n1', 'ty-n8', 'ty-n14'], sector: 1 },
    // Sector 2: Omotesando & Harajuku Belt
    { id: 'ty-n3', name: 'Aoyama-dori Junction', nameZh: '青山通交叉路口', lat: 35.6620, lng: 139.7110, neighbors: ['ty-n2', 'ty-n4', 'ty-n7', 'ty-n15'], sector: 2 },
    { id: 'ty-n4', name: 'Cat Street / Omotesando', nameZh: '猫街 / 表参道', lat: 35.6655, lng: 139.7060, neighbors: ['ty-n1', 'ty-n3', 'ty-n8'], sector: 2 },
    { id: 'ty-n8', name: 'Harajuku Takeshita Street', nameZh: '原宿竹下通', lat: 35.6710, lng: 139.7030, neighbors: ['ty-n4', 'ty-n6', 'ty-n11', 'ty-n15'], sector: 2 },
    { id: 'ty-n11', name: 'Meiji Jingu Shrine Gateway', nameZh: '明治神宫大鸟居', lat: 35.6740, lng: 139.6990, neighbors: ['ty-n8', 'ty-n15'], sector: 2 },
    // Sector 3: Roppongi Hills & Midtown
    { id: 'ty-n7', name: 'Nogi-zaka / Roppongi Entrance', nameZh: '乃木坂 / 六本木入口', lat: 35.6640, lng: 139.7240, neighbors: ['ty-n3', 'ty-n5', 'ty-n10'], sector: 3 },
    { id: 'ty-n9', name: 'Hiroo / Azabu Border', nameZh: '广尾 / 麻布交界', lat: 35.6520, lng: 139.7220, neighbors: ['ty-n5', 'ty-n10', 'ty-n13'], sector: 3 },
    { id: 'ty-n10', name: 'Roppongi Hills Mori Tower', nameZh: '六本木之丘森大厦', lat: 35.6605, lng: 139.7292, neighbors: ['ty-n7', 'ty-n9', 'ty-n12', 'ty-n16'], sector: 3 },
    { id: 'ty-n12', name: 'Tokyo Midtown Roppongi', nameZh: '东京中城 (六本木)', lat: 35.6658, lng: 139.7310, neighbors: ['ty-n10', 'ty-n16'], sector: 3 },
    // Sector 4: Greater Metropolis Expansion
    { id: 'ty-n13', name: 'Ebisu Garden Place', nameZh: '惠比寿花园广场', lat: 35.6468, lng: 139.7100, neighbors: ['ty-n2', 'ty-n5', 'ty-n9', 'ty-n14'], sector: 4 },
    { id: 'ty-n14', name: 'Daikanyama T-Site', nameZh: '代官山文化区', lat: 35.6490, lng: 139.6995, neighbors: ['ty-n1', 'ty-n6', 'ty-n13'], sector: 4 },
    { id: 'ty-n15', name: 'National Stadium / Sendagaya', nameZh: '国立竞技场 / 千駄谷', lat: 35.6775, lng: 139.7145, neighbors: ['ty-n3', 'ty-n8', 'ty-n11', 'ty-n16', 'ty-n17', 'ty-n19'], sector: 4 },
    { id: 'ty-n16', name: 'Akasaka Biz Tower', nameZh: '赤坂商业中心', lat: 35.6725, lng: 139.7360, neighbors: ['ty-n10', 'ty-n12', 'ty-n15', 'ty-n21', 'ty-n24'], sector: 4 },
    // Sector 5: Shinjuku West High-Rise & Okubo Tech Belt
    { id: 'ty-n17', name: 'Shinjuku Station West Exit / Metropolitan Gov', nameZh: '新宿站西口 / 都厅大厦', lat: 35.6895, lng: 139.6917, neighbors: ['ty-n11', 'ty-n15', 'ty-n18'], sector: 5 },
    { id: 'ty-n18', name: 'Shin-Okubo Korean & Tech Corridor', nameZh: '新大久保科技创新街区', lat: 35.7010, lng: 139.7005, neighbors: ['ty-n17', 'ty-n19', 'ty-n20'], sector: 5 },
    { id: 'ty-n19', name: 'Shinjuku Gyoen National Garden Gate', nameZh: '新宿御苑前枢纽', lat: 35.6885, lng: 139.7110, neighbors: ['ty-n15', 'ty-n17', 'ty-n18'], sector: 5 },
    { id: 'ty-n20', name: 'Kagurazaka Traditional Tech District', nameZh: '神乐坂风情科技走廊', lat: 35.7015, lng: 139.7405, neighbors: ['ty-n18', 'ty-n25'], sector: 5 },
    // Sector 6: Ginza Luxury District & Tsukiji Waterfront
    { id: 'ty-n21', name: 'Ginza 4-Chome Scramble / Wako Clock', nameZh: '银座四丁目 / 和光大钟核心', lat: 35.6715, lng: 139.7650, neighbors: ['ty-n16', 'ty-n22', 'ty-n23'], sector: 6 },
    { id: 'ty-n22', name: 'Tsukiji Outer Market Logistics Pier', nameZh: '筑地外市场滨水货运码头', lat: 35.6655, lng: 139.7705, neighbors: ['ty-n21', 'ty-n24', 'ty-n29'], sector: 6 },
    { id: 'ty-n23', name: 'Tokyo Station Marunouchi Plaza', nameZh: '东京站丸之内中央商务广场', lat: 35.6812, lng: 139.7671, neighbors: ['ty-n21', 'ty-n25'], sector: 6 },
    { id: 'ty-n24', name: 'Shiodome City Center / Hamarikyu', nameZh: '汐留城市中心 / 滨离宫', lat: 35.6620, lng: 139.7595, neighbors: ['ty-n10', 'ty-n16', 'ty-n21', 'ty-n22'], sector: 6 },
    // Sector 7: Akihabara Electronics & Ueno Cultural Hub
    { id: 'ty-n25', name: 'Akihabara Electric Town / Cyber Valley', nameZh: '秋叶原电器街 / 数码硅谷', lat: 35.6985, lng: 139.7710, neighbors: ['ty-n20', 'ty-n23', 'ty-n26'], sector: 7 },
    { id: 'ty-n26', name: 'Ueno Station & Onshi Cultural Park', nameZh: '上野综合交通站 / 恩赐公园', lat: 35.7135, lng: 139.7770, neighbors: ['ty-n25', 'ty-n27'], sector: 7 },
    { id: 'ty-n27', name: 'Asakusa Senso-ji & Sumida River Walk', nameZh: '浅草寺雷门 / 隅田川水岸走廊', lat: 35.7145, lng: 139.7965, neighbors: ['ty-n26', 'ty-n28'], sector: 7 },
    { id: 'ty-n28', name: 'Tokyo Skytree Town Megaplex', nameZh: '东京晴空塔商圈综合体', lat: 35.7100, lng: 139.8105, neighbors: ['ty-n27'], sector: 7 },
    // Sector 8: Odaiba Bay & Haneda Airport Logistics Gate
    { id: 'ty-n29', name: 'Rainbow Bridge Waterfront Expressway', nameZh: '彩虹大桥跨海动脉', lat: 35.6365, lng: 139.7630, neighbors: ['ty-n22', 'ty-n24', 'ty-n30'], sector: 8 },
    { id: 'ty-n30', name: 'Odaiba DiverCity Cyber Logistics Hub', nameZh: '台场临海副都心数码物流总署', lat: 35.6250, lng: 139.7755, neighbors: ['ty-n29', 'ty-n31'], sector: 8 },
    { id: 'ty-n31', name: 'Tokyo Big Sight International Terminal', nameZh: '东京国际展示场码头', lat: 35.6300, lng: 139.7940, neighbors: ['ty-n30', 'ty-n32'], sector: 8 },
    { id: 'ty-n32', name: 'Haneda Airport Automated Air-Cargo Superport', nameZh: '羽田空港全自动航空物流超级港', lat: 35.5494, lng: 139.7798, neighbors: ['ty-n31'], sector: 8 }
  ],
  trafficCorridors: [
    {
      id: 'ty-tf-shuto',
      name: 'Shuto Expressway Route 3 (Shibuya Line)',
      nameZh: '首都高速3号涩谷线',
      coordinates: [
        [35.6580, 139.7030],
        [35.6540, 139.7150],
        [35.6520, 139.7220]
      ],
      status: 'severe',
      multiplier: 3.5,
      speedKmh: 10
    },
    {
      id: 'ty-tf-aoyama',
      name: 'Aoyama-dori (Route 246)',
      nameZh: '青山通 (国道246号)',
      coordinates: [
        [35.6595, 139.7004],
        [35.6620, 139.7110],
        [35.6640, 139.7240]
      ],
      status: 'congested',
      multiplier: 2.4,
      speedKmh: 16
    }
  ],
  initialOrders: [
    {
      id: '201',
      sender: 'Sony Interactive Entertainment',
      recipientAddress: { x: 12, y: 6, zone: 'Roppongi Mori Tower', lat: 35.6605, lng: 139.7292 },
      deadlineTick: 40,
      reward: 70,
      weightKg: 2.5,
      status: 'pending',
      createdAtTick: 1,
      pickupHubId: 'ty-hub-shibuya'
    },
    {
      id: '202',
      sender: 'Nintendo Tokyo Store',
      recipientAddress: { x: 4, y: 12, zone: 'Omotesando Hills', lat: 35.6655, lng: 139.7060 },
      deadlineTick: 30,
      reward: 50,
      weightKg: 3.2,
      status: 'pending',
      createdAtTick: 1,
      pickupHubId: 'ty-hub-shibuya'
    },
    {
      id: '203',
      sender: 'Tokyo Midtown Medical Clinic',
      recipientAddress: { x: 12, y: 10, zone: 'Midtown Tower', lat: 35.6658, lng: 139.7310 },
      deadlineTick: 55,
      reward: 85,
      weightKg: 6.0,
      status: 'pending',
      createdAtTick: 2,
      pickupHubId: 'ty-hub-roppongi'
    }
  ],
  initialRobots: [
    {
      id: 'ty-bot-01',
      name: 'ShibuyaRunner-01',
      position: { x: 4, y: 4, lat: 35.6580, lng: 139.7016 },
      batteryPct: 90,
      maxCapacityKg: 10,
      currentPayloadKg: 0,
      speed: 1,
      costPerTick: 0.16,
      status: 'idle',
      homeHubId: 'ty-hub-shibuya',
      pathQueue: [],
      totalDistanceTraveled: 0,
      totalDeliveriesCompleted: 0,
      color: '#06b6d4'
    },
    {
      id: 'ty-bot-02',
      name: 'MoriExpress-02',
      position: { x: 12, y: 6, lat: 35.6605, lng: 139.7292 },
      batteryPct: 82,
      maxCapacityKg: 16,
      currentPayloadKg: 0,
      speed: 1,
      costPerTick: 0.22,
      status: 'idle',
      homeHubId: 'ty-hub-roppongi',
      pathQueue: [],
      totalDistanceTraveled: 0,
      totalDeliveriesCompleted: 0,
      color: '#10b981'
    }
  ]
};

// ==========================================
// 3. NEW YORK (Midtown Manhattan / 5th Ave)
// ==========================================
export const NEW_YORK_CITY: CityData = {
  id: 'newyork',
  name: 'New York',
  nameZh: '纽约 (曼哈顿)',
  country: 'United States',
  countryZh: '美国',
  flag: '🇺🇸',
  center: [40.7580, -73.9855],
  zoom: 15,
  description: 'Iconic Manhattan grid system connecting Times Square, Empire State Building, Grand Central, and Hudson Yards.',
  descriptionZh: '经典曼哈顿正交街区系统，贯通时代广场、帝国大厦、大中央总站与哈德逊园区。',
  hubs: [
    {
      id: 'ny-hub-timesq',
      name: 'Times Square Central Depot',
      position: { x: 4, y: 6, lat: 40.7580, lng: -73.9855 },
      chargingBays: 3,
      availableChargers: 3,
      zone: 'Times Square'
    },
    {
      id: 'ny-hub-grandcentral',
      name: 'Grand Central Logistics Station',
      position: { x: 10, y: 6, lat: 40.7527, lng: -73.9772 },
      chargingBays: 3,
      availableChargers: 3,
      zone: 'Grand Central'
    },
    {
      id: 'ny-hub-hudson',
      name: 'Hudson Yards Express Terminal',
      position: { x: 2, y: 2, lat: 40.7538, lng: -74.0022 },
      chargingBays: 2,
      availableChargers: 2,
      zone: 'Hudson Yards'
    }
  ],
  roadNodes: [
    // Sector 1: Times Square & Broadway Core
    { id: 'ny-n1', name: 'Times Square (7th Ave & 42nd St)', nameZh: '时代广场 (7大道42街)', lat: 40.7560, lng: -73.9868, neighbors: ['ny-n2', 'ny-n4', 'ny-n6'], sector: 1 },
    { id: 'ny-n2', name: 'Broadway & 47th St', nameZh: '百老汇大道47街', lat: 40.7595, lng: -73.9845, neighbors: ['ny-n1', 'ny-n3', 'ny-n5', 'ny-n12'], sector: 1 },
    { id: 'ny-n4', name: 'Bryant Park / NYPL (6th Ave & 42nd St)', nameZh: '布莱恩特公园 (6大道42街)', lat: 40.7536, lng: -73.9832, neighbors: ['ny-n1', 'ny-n5', 'ny-n8'], sector: 1 },
    { id: 'ny-n6', name: 'Port Authority Bus Terminal (8th Ave & 42nd)', nameZh: '港务局客运总站 (8大道42街)', lat: 40.7570, lng: -73.9900, neighbors: ['ny-n1', 'ny-n10'], sector: 1 },
    // Sector 2: Fifth Ave & Grand Central East
    { id: 'ny-n3', name: 'Rockefeller Center (5th Ave & 50th St)', nameZh: '洛克菲勒中心 (5大道50街)', lat: 40.7587, lng: -73.9787, neighbors: ['ny-n2', 'ny-n5', 'ny-n7', 'ny-n12'], sector: 2 },
    { id: 'ny-n5', name: 'Grand Central Terminal (Park Ave & 42nd)', nameZh: '大中央车站 (公园大道42街)', lat: 40.7527, lng: -73.9772, neighbors: ['ny-n2', 'ny-n3', 'ny-n4', 'ny-n9'], sector: 2 },
    { id: 'ny-n7', name: 'St. Patrick\'s Cathedral (5th Ave)', nameZh: '圣帕特里克大教堂', lat: 40.7585, lng: -73.9760, neighbors: ['ny-n3', 'ny-n9'], sector: 2 },
    { id: 'ny-n9', name: 'Chrysler Building / 42nd St East', nameZh: '克莱斯勒大厦', lat: 40.7516, lng: -73.9755, neighbors: ['ny-n5', 'ny-n7', 'ny-n8'], sector: 2 },
    // Sector 3: Penn Station, Empire State & Hudson Yards
    { id: 'ny-n8', name: 'Empire State Building (5th Ave & 34th St)', nameZh: '帝国大厦 (5大道34街)', lat: 40.7484, lng: -73.9857, neighbors: ['ny-n4', 'ny-n9', 'ny-n11', 'ny-n14'], sector: 3 },
    { id: 'ny-n10', name: 'Hudson Yards / The Vessel', nameZh: '哈德逊园区 / 大松果', lat: 40.7538, lng: -74.0022, neighbors: ['ny-n6', 'ny-n11', 'ny-n15'], sector: 3 },
    { id: 'ny-n11', name: 'Penn Station / Madison Square Garden', nameZh: '宾州车站 / 麦迪逊广场花园', lat: 40.7505, lng: -73.9935, neighbors: ['ny-n8', 'ny-n10', 'ny-n14', 'ny-n15'], sector: 3 },
    // Sector 4: Greater Midtown Expansion (Central Park South, Flatiron, Chelsea)
    { id: 'ny-n12', name: 'Columbus Circle / Central Park South', nameZh: '哥伦布圆环 / 中央公园南', lat: 40.7680, lng: -73.9819, neighbors: ['ny-n2', 'ny-n3', 'ny-n13'], sector: 4 },
    { id: 'ny-n13', name: 'Lincoln Center Plaza', nameZh: '林肯中心广场', lat: 40.7725, lng: -73.9835, neighbors: ['ny-n12'], sector: 4 },
    { id: 'ny-n14', name: 'Flatiron Building / 23rd St', nameZh: '熨斗大厦 / 23街', lat: 40.7411, lng: -73.9897, neighbors: ['ny-n8', 'ny-n11', 'ny-n15', 'ny-n16', 'ny-n17'], sector: 4 },
    { id: 'ny-n15', name: 'Chelsea Market / High Line', nameZh: '切尔西市场 / 高线公园', lat: 40.7424, lng: -74.0061, neighbors: ['ny-n10', 'ny-n11', 'ny-n14', 'ny-n16', 'ny-n21'], sector: 4 },
    // Sector 5: Financial District & Wall Street South
    { id: 'ny-n16', name: 'Washington Square Park / NYU', nameZh: '华盛顿广场公园 / 纽约大学', lat: 40.7308, lng: -73.9973, neighbors: ['ny-n14', 'ny-n15', 'ny-n17', 'ny-n20'], sector: 5 },
    { id: 'ny-n17', name: 'Union Square Crossroads', nameZh: '联合广场交通枢纽', lat: 40.7359, lng: -73.9911, neighbors: ['ny-n14', 'ny-n16', 'ny-n18'], sector: 5 },
    { id: 'ny-n18', name: 'East Village Tech Hub', nameZh: '东村科技创新走廊', lat: 40.7265, lng: -73.9815, neighbors: ['ny-n17', 'ny-n19', 'ny-n28'], sector: 5 },
    { id: 'ny-n19', name: 'Lower East Side Waterfront', nameZh: '下东区滨水大道', lat: 40.7150, lng: -73.9840, neighbors: ['ny-n18', 'ny-n23', 'ny-n24'], sector: 5 },
    // Sector 6: SoHo Arts & Greenwich Village Hub
    { id: 'ny-n20', name: 'SoHo Broadway Cast Iron District', nameZh: 'SoHo 铸铁历史街区', lat: 40.7233, lng: -73.9985, neighbors: ['ny-n16', 'ny-n21', 'ny-n22'], sector: 6 },
    { id: 'ny-n21', name: 'Tribeca Cobblestone Logistics Depot', nameZh: '翠贝卡前置配送中心', lat: 40.7190, lng: -74.0090, neighbors: ['ny-n15', 'ny-n20', 'ny-n22'], sector: 6 },
    { id: 'ny-n22', name: 'One World Trade Center / Oculus', nameZh: '世贸中心一号楼 / 飞鸟枢纽', lat: 40.7128, lng: -74.0134, neighbors: ['ny-n20', 'ny-n21', 'ny-n23'], sector: 6 },
    { id: 'ny-n23', name: 'Wall Street & New York Stock Exchange', nameZh: '华尔街纽交所金融核心', lat: 40.7070, lng: -74.0090, neighbors: ['ny-n19', 'ny-n22', 'ny-n24'], sector: 6 },
    // Sector 7: Brooklyn Bridge Gateway & DUMBO Waterfront
    { id: 'ny-n24', name: 'Brooklyn Bridge Manhattan Anchorage', nameZh: '布鲁克林大桥曼哈顿主桥头', lat: 40.7105, lng: -74.0005, neighbors: ['ny-n19', 'ny-n23', 'ny-n25'], sector: 7 },
    { id: 'ny-n25', name: 'DUMBO Tech Hub & Brooklyn Bridge Park', nameZh: 'DUMBO 科技园区 / 水岸公园', lat: 40.7035, lng: -73.9890, neighbors: ['ny-n24', 'ny-n26', 'ny-n27'], sector: 7 },
    { id: 'ny-n26', name: 'Downtown Brooklyn MetroTech Center', nameZh: '布鲁克林科技大学城', lat: 40.6935, lng: -73.9860, neighbors: ['ny-n25', 'ny-n27'], sector: 7 },
    { id: 'ny-n27', name: 'Brooklyn Navy Yard Advanced Logistics Terminal', nameZh: '布鲁克林海军造船厂高科技货运站', lat: 40.7020, lng: -73.9715, neighbors: ['ny-n25', 'ny-n26', 'ny-n28'], sector: 7 },
    // Sector 8: Long Island City & Queens Metro Logistics Belt
    { id: 'ny-n28', name: 'Williamsburg Waterfront Gateway', nameZh: '威廉斯堡水岸新城', lat: 40.7175, lng: -73.9620, neighbors: ['ny-n18', 'ny-n27', 'ny-n29'], sector: 8 },
    { id: 'ny-n29', name: 'Queensboro Bridge / Long Island City Hub', nameZh: '皇后区大桥 / 长岛市枢纽', lat: 40.7510, lng: -73.9450, neighbors: ['ny-n9', 'ny-n28', 'ny-n30'], sector: 8 },
    { id: 'ny-n30', name: 'Sunnyside Rail Yard Mega Depot', nameZh: '森尼赛德铁路超级集散港', lat: 40.7480, lng: -73.9270, neighbors: ['ny-n29', 'ny-n31'], sector: 8 },
    { id: 'ny-n31', name: 'JFK Airport Air-Cargo Superport Interlink', nameZh: 'JFK 肯尼迪空港货运大动脉', lat: 40.6413, lng: -73.7781, neighbors: ['ny-n30'], sector: 8 }
  ],
  trafficCorridors: [
    {
      id: 'ny-tf-5th',
      name: '5th Avenue Midtown Corridor',
      nameZh: '第5大道中城主干道',
      coordinates: [
        [40.7484, -73.9857],
        [40.7536, -73.9832],
        [40.7587, -73.9787],
        [40.7585, -73.9760]
      ],
      status: 'severe',
      multiplier: 3.4,
      speedKmh: 9
    },
    {
      id: 'ny-tf-42nd',
      name: '42nd Street Crosstown Busway',
      nameZh: '42街东西贯通动脉',
      coordinates: [
        [40.7570, -73.9900],
        [40.7560, -73.9868],
        [40.7536, -73.9832],
        [40.7527, -73.9772]
      ],
      status: 'congested',
      multiplier: 2.6,
      speedKmh: 14
    }
  ],
  initialOrders: [
    {
      id: '301',
      sender: 'Morgan Stanley Headquarters',
      recipientAddress: { x: 5, y: 7, zone: 'Rockefeller Center', lat: 40.7587, lng: -73.9787 },
      deadlineTick: 35,
      reward: 85,
      weightKg: 3.0,
      status: 'pending',
      createdAtTick: 1,
      pickupHubId: 'ny-hub-timesq'
    },
    {
      id: '302',
      sender: 'Empire State Tech Club',
      recipientAddress: { x: 8, y: 3, zone: 'Empire State Observatory', lat: 40.7484, lng: -73.9857 },
      deadlineTick: 48,
      reward: 60,
      weightKg: 5.2,
      status: 'pending',
      createdAtTick: 1,
      pickupHubId: 'ny-hub-grandcentral'
    }
  ],
  initialRobots: [
    {
      id: 'ny-bot-01',
      name: 'ManhattanRover-01',
      position: { x: 4, y: 6, lat: 40.7580, lng: -73.9855 },
      batteryPct: 88,
      maxCapacityKg: 12,
      currentPayloadKg: 0,
      speed: 1,
      costPerTick: 0.17,
      status: 'idle',
      homeHubId: 'ny-hub-timesq',
      pathQueue: [],
      totalDistanceTraveled: 0,
      totalDeliveriesCompleted: 0,
      color: '#06b6d4'
    },
    {
      id: 'ny-bot-02',
      name: 'GrandCentralBot-02',
      position: { x: 10, y: 6, lat: 40.7527, lng: -73.9772 },
      batteryPct: 95,
      maxCapacityKg: 18,
      currentPayloadKg: 0,
      speed: 1,
      costPerTick: 0.22,
      status: 'idle',
      homeHubId: 'ny-hub-grandcentral',
      pathQueue: [],
      totalDistanceTraveled: 0,
      totalDeliveriesCompleted: 0,
      color: '#10b981'
    }
  ]
};

// All available global cities
export const CITIES_DATA: Record<string, CityData> = {
  singapore: SINGAPORE_CITY,
  tokyo: TOKYO_CITY,
  newyork: NEW_YORK_CITY
};

export const DEFAULT_CITY = SINGAPORE_CITY;
