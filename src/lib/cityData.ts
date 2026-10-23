import { Hub, DeliveryRobot, Order } from './types';

export interface RoadNode {
  id: string;
  name: string;
  nameZh: string;
  lat: number;
  lng: number;
  neighbors: string[]; // Connected road node IDs
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
    { id: 'sg-n1', name: 'Marina Boulevard Junction', nameZh: '滨海大道交叉口', lat: 1.2805, lng: 103.8540, neighbors: ['sg-n2', 'sg-n5', 'sg-n7'] },
    { id: 'sg-n2', name: 'Raffles Quay / Collyer Quay', nameZh: '莱佛士码头', lat: 1.2835, lng: 103.8530, neighbors: ['sg-n1', 'sg-n3', 'sg-n6'] },
    { id: 'sg-n3', name: 'Fullerton Road / Victoria St', nameZh: '浮尔顿路', lat: 1.2870, lng: 103.8535, neighbors: ['sg-n2', 'sg-n4', 'sg-n8'] },
    { id: 'sg-n4', name: 'Esplanade Bridge / Marina Bay Sands', nameZh: '滨海艺术中心桥', lat: 1.2890, lng: 103.8570, neighbors: ['sg-n3', 'sg-n5', 'sg-n9'] },
    { id: 'sg-n5', name: 'Bayfront Avenue / MBS', nameZh: '海湾道 (金沙)', lat: 1.2830, lng: 103.8595, neighbors: ['sg-n4', 'sg-n1', 'sg-n10'] },
    { id: 'sg-n6', name: 'Raffles Place / Battery Road', nameZh: '莱佛士坊中心', lat: 1.2845, lng: 103.8510, neighbors: ['sg-n2', 'sg-n7', 'sg-n11'] },
    { id: 'sg-n7', name: 'Shenton Way / Robinson Rd', nameZh: '珊顿道', lat: 1.2760, lng: 103.8490, neighbors: ['sg-n1', 'sg-n6', 'sg-n12'] },
    { id: 'sg-n8', name: 'Bras Basah / City Hall', nameZh: '百胜路 / 政府大厦', lat: 1.2930, lng: 103.8520, neighbors: ['sg-n3', 'sg-n9', 'sg-n13'] },
    { id: 'sg-n9', name: 'Suntec City / Temasek Blvd', nameZh: '新达城 / 坦马锡林荫道', lat: 1.2940, lng: 103.8580, neighbors: ['sg-n4', 'sg-n8', 'sg-n10'] },
    { id: 'sg-n10', name: 'Marina Coastal Expressway (MCE)', nameZh: '滨海高速 (MCE)', lat: 1.2750, lng: 103.8610, neighbors: ['sg-n5', 'sg-n9', 'sg-n12'] },
    { id: 'sg-n11', name: 'Chinatown / South Bridge Rd', nameZh: '牛车水 / 南桥路', lat: 1.2830, lng: 103.8440, neighbors: ['sg-n6', 'sg-n12', 'sg-n14'] },
    { id: 'sg-n12', name: 'Tanjong Pagar / Anson Rd', nameZh: '丹戎巴葛', lat: 1.2740, lng: 103.8450, neighbors: ['sg-n7', 'sg-n10', 'sg-n11'] },
    { id: 'sg-n13', name: 'Dhoby Ghaut / Orchard Rd Entrance', nameZh: '多美歌 / 乌节路入口', lat: 1.2990, lng: 103.8460, neighbors: ['sg-n8', 'sg-n14', 'sg-n15'] },
    { id: 'sg-n14', name: 'Clarke Quay / River Valley Rd', nameZh: '克拉码头 / 里峇峇利路', lat: 1.2900, lng: 103.8440, neighbors: ['sg-n11', 'sg-n13', 'sg-n15'] },
    { id: 'sg-n15', name: 'Orchard Central / Somerset Rd', nameZh: '乌节中心 / 索美塞', lat: 1.3008, lng: 103.8390, neighbors: ['sg-n13', 'sg-n14'] }
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
    { id: 'ty-n1', name: 'Shibuya Scramble Crossing', nameZh: '涩谷十字路口', lat: 35.6595, lng: 139.7004, neighbors: ['ty-n2', 'ty-n4', 'ty-n6'] },
    { id: 'ty-n2', name: 'Shibuya Station East Exit', nameZh: '涩谷站东口', lat: 35.6580, lng: 139.7030, neighbors: ['ty-n1', 'ty-n3', 'ty-n5'] },
    { id: 'ty-n3', name: 'Aoyama-dori Junction', nameZh: '青山通交叉路口', lat: 35.6620, lng: 139.7110, neighbors: ['ty-n2', 'ty-n4', 'ty-n7'] },
    { id: 'ty-n4', name: 'Cat Street / Omotesando', nameZh: '猫街 / 表参道', lat: 35.6655, lng: 139.7060, neighbors: ['ty-n1', 'ty-n3', 'ty-n8'] },
    { id: 'ty-n5', name: 'Shuto Expressway Route 3', nameZh: '首都高3号线', lat: 35.6540, lng: 139.7150, neighbors: ['ty-n2', 'ty-n7', 'ty-n9'] },
    { id: 'ty-n6', name: 'Dogenzaka / Shibuya 109', nameZh: '道玄坂 / 109大楼', lat: 35.6598, lng: 139.6980, neighbors: ['ty-n1', 'ty-n8'] },
    { id: 'ty-n7', name: 'Nogi-zaka / Roppongi Entrance', nameZh: '乃木坂 / 六本木入口', lat: 35.6640, lng: 139.7240, neighbors: ['ty-n3', 'ty-n5', 'ty-n10'] },
    { id: 'ty-n8', name: 'Harajuku Takeshita Street', nameZh: '原宿竹下通', lat: 35.6710, lng: 139.7030, neighbors: ['ty-n4', 'ty-n6', 'ty-n11'] },
    { id: 'ty-n9', name: 'Hiroo / Azabu Border', nameZh: '广尾 / 麻布交界', lat: 35.6520, lng: 139.7220, neighbors: ['ty-n5', 'ty-n10'] },
    { id: 'ty-n10', name: 'Roppongi Hills Mori Tower', nameZh: '六本木之丘森大厦', lat: 35.6605, lng: 139.7292, neighbors: ['ty-n7', 'ty-n9', 'ty-n12'] },
    { id: 'ty-n11', name: 'Meiji Jingu Shrine Gateway', nameZh: '明治神宫大鸟居', lat: 35.6740, lng: 139.6990, neighbors: ['ty-n8'] },
    { id: 'ty-n12', name: 'Tokyo Midtown Roppongi', nameZh: '东京中城 (六本木)', lat: 35.6658, lng: 139.7310, neighbors: ['ty-n10'] }
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
    { id: 'ny-n1', name: 'Times Square (7th Ave & 42nd St)', nameZh: '时代广场 (7大道42街)', lat: 40.7560, lng: -73.9868, neighbors: ['ny-n2', 'ny-n4', 'ny-n6'] },
    { id: 'ny-n2', name: 'Broadway & 47th St', nameZh: '百老汇大道47街', lat: 40.7595, lng: -73.9845, neighbors: ['ny-n1', 'ny-n3', 'ny-n5'] },
    { id: 'ny-n3', name: 'Rockefeller Center (5th Ave & 50th St)', nameZh: '洛克菲勒中心 (5大道50街)', lat: 40.7587, lng: -73.9787, neighbors: ['ny-n2', 'ny-n5', 'ny-n7'] },
    { id: 'ny-n4', name: 'Bryant Park / NYPL (6th Ave & 42nd St)', nameZh: '布莱恩特公园 (6大道42街)', lat: 40.7536, lng: -73.9832, neighbors: ['ny-n1', 'ny-n5', 'ny-n8'] },
    { id: 'ny-n5', name: 'Grand Central Terminal (Park Ave & 42nd)', nameZh: '大中央车站 (公园大道42街)', lat: 40.7527, lng: -73.9772, neighbors: ['ny-n2', 'ny-n3', 'ny-n4', 'ny-n9'] },
    { id: 'ny-n6', name: 'Port Authority Bus Terminal (8th Ave & 42nd)', nameZh: '港务局客运总站 (8大道42街)', lat: 40.7570, lng: -73.9900, neighbors: ['ny-n1', 'ny-n10'] },
    { id: 'ny-n7', name: 'St. Patrick\'s Cathedral (5th Ave)', nameZh: '圣帕特里克大教堂', lat: 40.7585, lng: -73.9760, neighbors: ['ny-n3', 'ny-n9'] },
    { id: 'ny-n8', name: 'Empire State Building (5th Ave & 34th St)', nameZh: '帝国大厦 (5大道34街)', lat: 40.7484, lng: -73.9857, neighbors: ['ny-n4', 'ny-n9', 'ny-n11'] },
    { id: 'ny-n9', name: 'Chrysler Building / 42nd St East', nameZh: '克莱斯勒大厦', lat: 40.7516, lng: -73.9755, neighbors: ['ny-n5', 'ny-n7', 'ny-n8'] },
    { id: 'ny-n10', name: 'Hudson Yards / The Vessel', nameZh: '哈德逊园区 / 大松果', lat: 40.7538, lng: -74.0022, neighbors: ['ny-n6', 'ny-n11'] },
    { id: 'ny-n11', name: 'Penn Station / Madison Square Garden', nameZh: '宾州车站 / 麦迪逊广场花园', lat: 40.7505, lng: -73.9935, neighbors: ['ny-n8', 'ny-n10'] }
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
