import { GridCell, Hub } from './types';
import { CityData, RoadNode } from './cityData';
import { PRECOMPUTED_STREET_ROUTES } from './streetGeometry';

export interface Point {
  x: number;
  y: number;
  lat?: number;
  lng?: number;
}

/**
 * Looks up precomputed exact street route geometry from OSRM street network
 */
export function lookupStreetRoute(
  startLat: number,
  startLng: number,
  goalLat: number,
  goalLng: number,
  maxDistanceThreshold: number = 0.0008 // ~85m tight proximity search (prevents cross-river jumps)
): Array<[number, number]> | null {
  // 1. Direct exact key lookup (forward)
  const exactKey = `${startLat.toFixed(4)},${startLng.toFixed(4)}->${goalLat.toFixed(4)},${goalLng.toFixed(4)}`;
  if (PRECOMPUTED_STREET_ROUTES[exactKey]) {
    return PRECOMPUTED_STREET_ROUTES[exactKey];
  }

  // 2. Direct exact key lookup (reverse)
  const reverseKey = `${goalLat.toFixed(4)},${goalLng.toFixed(4)}->${startLat.toFixed(4)},${startLng.toFixed(4)}`;
  if (PRECOMPUTED_STREET_ROUTES[reverseKey]) {
    return [...PRECOMPUTED_STREET_ROUTES[reverseKey]].reverse();
  }

  // 3. Tight proximity search among precomputed routes (forward & reverse)
  let bestMatch: Array<[number, number]> | null = null;
  let bestDist = Infinity;

  for (const [key, coords] of Object.entries(PRECOMPUTED_STREET_ROUTES)) {
    const [fromStr, toStr] = key.split('->');
    const [kFromLat, kFromLng] = fromStr.split(',').map(Number);
    const [kToLat, kToLng] = toStr.split(',').map(Number);

    // Forward proximity
    const distFrom = Math.hypot(startLat - kFromLat, startLng - kFromLng);
    const distTo = Math.hypot(goalLat - kToLat, goalLng - kToLng);

    if (distFrom <= maxDistanceThreshold && distTo <= maxDistanceThreshold) {
      const totalDist = distFrom + distTo;
      if (totalDist < bestDist) {
        bestDist = totalDist;
        bestMatch = coords;
      }
    }

    // Reverse proximity
    const revDistFrom = Math.hypot(startLat - kToLat, startLng - kToLng);
    const revDistTo = Math.hypot(goalLat - kFromLat, goalLng - kFromLng);

    if (revDistFrom <= maxDistanceThreshold && revDistTo <= maxDistanceThreshold) {
      const totalRevDist = revDistFrom + revDistTo;
      if (totalRevDist < bestDist) {
        bestDist = totalRevDist;
        bestMatch = [...coords].reverse();
      }
    }
  }

  return bestMatch;
}

/**
 * Resamples high-density street coordinates into smooth, evenly-spaced waypoints
 * perfectly paced for tick-by-tick vehicle movement.
 */
export function resampleStreetCoordinates(
  coords: Array<[number, number]>,
  start: Point,
  goal: Point,
  desiredSteps?: number
): Point[] {
  if (!coords || coords.length === 0) {
    return [start, goal];
  }

  // Adaptive number of steps: between 14 and 22 steps for ideal delivery pacing
  const stepsCount = desiredSteps || Math.max(14, Math.min(22, Math.round(coords.length / 3.2)));

  const points: Point[] = [];
  const total = coords.length;

  for (let i = 0; i < stepsCount; i++) {
    const fraction = i / (stepsCount - 1);
    const index = Math.min(total - 1, Math.round(fraction * (total - 1)));
    const [lat, lng] = coords[index];

    points.push({
      x: Math.round(lat * 100) % 18,
      y: Math.round(lng * 100) % 18,
      lat,
      lng
    });
  }

  // Ensure first waypoint snaps to start and last waypoint snaps to destination
  if (points.length > 0) {
    points[0] = {
      x: start.x,
      y: start.y,
      lat: start.lat ?? points[0].lat,
      lng: start.lng ?? points[0].lng
    };
    points[points.length - 1] = {
      x: goal.x,
      y: goal.y,
      lat: goal.lat ?? points[points.length - 1].lat,
      lng: goal.lng ?? points[points.length - 1].lng
    };
  }

  return points;
}

interface Node {
  x: number;
  y: number;
  lat?: number;
  lng?: number;
  g: number; // Cost from start
  h: number; // Heuristic cost to goal
  f: number; // Total estimated cost
  parent?: Node;
}

/**
 * Calculates Manhattan distance between two points on the grid.
 */
export function manhattanDistance(a: Point, b: Point): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

/**
 * Calculates Euclidean distance between two points.
 */
export function euclideanDistance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/**
 * Calculates Haversine distance in meters between two GPS coordinates
 */
export function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * A* Pathfinding algorithm on real-life city street graph.
 * Navigates along authentic city avenues and roads while factoring in dynamic traffic congestion.
 */
export function findCityRoadPath(
  start: Point,
  goal: Point,
  city: CityData,
  options: {
    avoidHighTraffic?: boolean;
    closedNodeId?: string;
    isRushHour?: boolean;
  } = {}
): Point[] {
  const closedNode = options.closedNodeId ? city.roadNodes.find(n => n.id === options.closedNodeId) : null;

  // 1. High-Precision Authentic Street Route Lookup
  if (start.lat !== undefined && start.lng !== undefined && goal.lat !== undefined && goal.lng !== undefined) {
    const directDist = haversineDistance(start.lat, start.lng, goal.lat, goal.lng);
    if (directDist < 35) {
      // Less than 35m apart -> already at destination
      return [start, goal];
    }

    const exactStreetCoords = lookupStreetRoute(start.lat, start.lng, goal.lat, goal.lng);
    // If a route exists, check if it is blocked by an active road closure
    const isBlockedByClosure = closedNode && exactStreetCoords && exactStreetCoords.some(
      coord => haversineDistance(coord[0], coord[1], closedNode.lat, closedNode.lng) < 180
    );

    if (exactStreetCoords && exactStreetCoords.length > 0 && !isBlockedByClosure) {
      return resampleStreetCoordinates(exactStreetCoords, start, goal);
    }
  }

  const nodes = city.roadNodes;
  if (!nodes || nodes.length === 0) {
    return [start, goal];
  }

  // Helper to find closest road node to a coordinate
  const findClosestNode = (pt: Point): RoadNode => {
    let closest = nodes[0];
    let minDist = Infinity;

    for (const node of nodes) {
      const dist = pt.lat !== undefined && pt.lng !== undefined
        ? haversineDistance(pt.lat, pt.lng, node.lat, node.lng)
        : manhattanDistance(pt, { x: node.lat, y: node.lng });

      if (dist < minDist) {
        minDist = dist;
        closest = node;
      }
    }
    return closest;
  };

  const startNode = findClosestNode(start);
  const goalNode = findClosestNode(goal);

  if (startNode.id === goalNode.id) {
    return [
      { x: start.x, y: start.y, lat: start.lat || startNode.lat, lng: start.lng || startNode.lng },
      { x: startNode.lat, y: startNode.lng, lat: startNode.lat, lng: startNode.lng },
      { x: goal.x, y: goal.y, lat: goal.lat || goalNode.lat, lng: goal.lng || goalNode.lng }
    ];
  }

  // A* Graph Search
  interface GraphState {
    id: string;
    node: RoadNode;
    g: number;
    h: number;
    f: number;
    parent?: GraphState;
  }

  const openList: GraphState[] = [];
  const closedSet = new Set<string>();

  const startState: GraphState = {
    id: startNode.id,
    node: startNode,
    g: 0,
    h: haversineDistance(startNode.lat, startNode.lng, goalNode.lat, goalNode.lng),
    f: haversineDistance(startNode.lat, startNode.lng, goalNode.lat, goalNode.lng)
  };

  openList.push(startState);

  while (openList.length > 0) {
    // Pick lowest f
    let lowestIdx = 0;
    for (let i = 1; i < openList.length; i++) {
      if (openList[i].f < openList[lowestIdx].f) {
        lowestIdx = i;
      }
    }

    const current = openList.splice(lowestIdx, 1)[0];
    closedSet.add(current.id);

    if (current.id === goalNode.id) {
      // Reconstruct sequence of road nodes from A*
      const nodeChain: RoadNode[] = [];
      let curr: GraphState | undefined = current;
      while (curr) {
        nodeChain.unshift(curr.node);
        curr = curr.parent;
      }

      // Stitch high-precision OSRM street geometry along every consecutive road segment!
      const stitchedCoords: Array<[number, number]> = [];
      const appendSegment = (fromLat: number, fromLng: number, toLat: number, toLng: number) => {
        if (haversineDistance(fromLat, fromLng, toLat, toLng) < 15) return;
        const segCoords = lookupStreetRoute(fromLat, fromLng, toLat, toLng, 0.0012);
        if (segCoords && segCoords.length > 0) {
          if (stitchedCoords.length > 0) {
            stitchedCoords.push(...segCoords.slice(1));
          } else {
            stitchedCoords.push(...segCoords);
          }
        } else {
          if (stitchedCoords.length === 0) {
            stitchedCoords.push([fromLat, fromLng]);
          }
          stitchedCoords.push([toLat, toLng]);
        }
      };

      const originLat = start.lat ?? startNode.lat;
      const originLng = start.lng ?? startNode.lng;
      const destLat = goal.lat ?? goalNode.lat;
      const destLng = goal.lng ?? goalNode.lng;

      // 1. Connector from actual start point to first roadNode
      appendSegment(originLat, originLng, nodeChain[0].lat, nodeChain[0].lng);

      // 2. Street segments between each roadNode in the A* chain
      for (let i = 0; i < nodeChain.length - 1; i++) {
        appendSegment(
          nodeChain[i].lat,
          nodeChain[i].lng,
          nodeChain[i + 1].lat,
          nodeChain[i + 1].lng
        );
      }

      // 3. Connector from last roadNode to actual goal point
      const lastNode = nodeChain[nodeChain.length - 1];
      appendSegment(lastNode.lat, lastNode.lng, destLat, destLng);

      if (stitchedCoords.length >= 2) {
        const desiredSteps = Math.max(14, Math.min(28, Math.round(stitchedCoords.length / 3)));
        return resampleStreetCoordinates(stitchedCoords, start, goal, desiredSteps);
      }

      // Fallback if stitchedCoords had fewer than 2 points
      return [
        { x: start.x, y: start.y, lat: originLat, lng: originLng },
        { x: goal.x, y: goal.y, lat: destLat, lng: destLng }
      ];
    }

    // Expand neighbors
    for (const neighborId of current.node.neighbors) {
      if (closedSet.has(neighborId)) continue;
      // Skip if this road node is currently blocked by an emergency closure
      if (options.closedNodeId && neighborId === options.closedNodeId) continue;

      const neighborNode = nodes.find(n => n.id === neighborId);
      if (!neighborNode) continue;

      // Base physical distance in meters
      let edgeCost = haversineDistance(current.node.lat, current.node.lng, neighborNode.lat, neighborNode.lng);

      // Check if this segment is in a congested traffic corridor
      const inCongestion = city.trafficCorridors.find(c => {
        // Simple check if corridor points near current/neighbor
        return c.coordinates.some(
          coord => haversineDistance(coord[0], coord[1], neighborNode.lat, neighborNode.lng) < 600
        );
      });

      if (inCongestion) {
        const rushSurge = options.isRushHour ? 1.8 : 1.0;
        edgeCost *= (options.avoidHighTraffic ? inCongestion.multiplier * 2.5 : inCongestion.multiplier) * rushSurge;
      }

      const tentativeG = current.g + edgeCost;
      const existingOpen = openList.find(s => s.id === neighborId);

      if (existingOpen) {
        if (tentativeG < existingOpen.g) {
          existingOpen.g = tentativeG;
          existingOpen.f = tentativeG + existingOpen.h;
          existingOpen.parent = current;
        }
      } else {
        const h = haversineDistance(neighborNode.lat, neighborNode.lng, goalNode.lat, goalNode.lng);
        openList.push({
          id: neighborId,
          node: neighborNode,
          g: tentativeG,
          h,
          f: tentativeG + h,
          parent: current
        });
      }
    }
  }

  // Fallback: direct origin to goal
  return [
    { x: start.x, y: start.y, lat: start.lat || startNode.lat, lng: start.lng || startNode.lng },
    { x: goal.x, y: goal.y, lat: goal.lat || goalNode.lat, lng: goal.lng || goalNode.lng }
  ];
}

/**
 * A* Pathfinding algorithm on grid with obstacle avoidance and dynamic traffic weighting.
 */
export function findPathAStar(
  start: Point,
  goal: Point,
  grid: GridCell[][],
  options: { avoidHighTraffic?: boolean } = {}
): Point[] {
  const width = grid.length;
  if (width === 0) return [];
  const height = grid[0].length;

  // Boundary checks
  if (
    start.x < 0 || start.x >= width || start.y < 0 || start.y >= height ||
    goal.x < 0 || goal.x >= width || goal.y < 0 || goal.y >= height
  ) {
    return [];
  }

  // If already at goal
  if (start.x === goal.x && start.y === goal.y) {
    return [{ x: start.x, y: start.y, lat: start.lat, lng: start.lng }];
  }

  const openList: Node[] = [];
  const closedSet = new Set<string>();

  const key = (x: number, y: number) => `${x},${y}`;

  const startNode: Node = {
    x: start.x,
    y: start.y,
    lat: start.lat,
    lng: start.lng,
    g: 0,
    h: manhattanDistance(start, goal),
    f: manhattanDistance(start, goal)
  };

  openList.push(startNode);

  // 4-directional Manhattan cardinal directions for urban grid streets
  const directions = [
    { x: 0, y: -1 }, // North
    { x: 1, y: 0 },  // East
    { x: 0, y: 1 },  // South
    { x: -1, y: 0 }  // West
  ];

  let iterations = 0;
  const MAX_ITERATIONS = 2000;

  while (openList.length > 0 && iterations < MAX_ITERATIONS) {
    iterations++;

    let lowestIdx = 0;
    for (let i = 1; i < openList.length; i++) {
      if (openList[i].f < openList[lowestIdx].f) {
        lowestIdx = i;
      }
    }

    const current = openList.splice(lowestIdx, 1)[0];
    closedSet.add(key(current.x, current.y));

    if (current.x === goal.x && current.y === goal.y) {
      const path: Point[] = [];
      let curr: Node | undefined = current;
      while (curr) {
        path.unshift({ x: curr.x, y: curr.y, lat: curr.lat, lng: curr.lng });
        curr = curr.parent;
      }
      return path;
    }

    for (const dir of directions) {
      const nx = current.x + dir.x;
      const ny = current.y + dir.y;

      if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
      if (closedSet.has(key(nx, ny))) continue;

      const cell = grid[nx][ny];

      const isGoal = nx === goal.x && ny === goal.y;
      if (!isGoal && (cell.type === 'building' || cell.type === 'water')) {
        continue;
      }

      const trafficPenalty = options.avoidHighTraffic 
        ? cell.trafficMultiplier * 2.0 
        : cell.trafficMultiplier;
      const movementCost = 1.0 * trafficPenalty;
      const tentativeG = current.g + movementCost;

      const existingOpen = openList.find(n => n.x === nx && n.y === ny);

      if (existingOpen) {
        if (tentativeG < existingOpen.g) {
          existingOpen.g = tentativeG;
          existingOpen.f = tentativeG + existingOpen.h;
          existingOpen.parent = current;
        }
      } else {
        const h = manhattanDistance({ x: nx, y: ny }, goal);
        openList.push({
          x: nx,
          y: ny,
          g: tentativeG,
          h,
          f: tentativeG + h,
          parent: current
        });
      }
    }
  }

  return generateManhattanFallbackPath(start, goal);
}

/**
 * Generates simple Manhattan grid path when direct A* is blocked
 */
export function generateManhattanFallbackPath(start: Point, goal: Point): Point[] {
  const path: Point[] = [{ x: start.x, y: start.y, lat: start.lat, lng: start.lng }];
  let cx = start.x;
  let cy = start.y;

  while (cx !== goal.x) {
    cx += (goal.x > cx) ? 1 : -1;
    path.push({ x: cx, y: cy });
  }

  while (cy !== goal.y) {
    cy += (goal.y > cy) ? 1 : -1;
    path.push({ x: cx, y: cy });
  }

  return path;
}

/**
 * Finds the closest charging hub to a given coordinate.
 */
export function findNearestHub(point: Point, hubs: Hub[]): Hub | undefined {
  if (hubs.length === 0) return undefined;

  let nearest = hubs[0];
  const pLat = point.lat;
  const pLng = point.lng;
  const nLat = nearest.position.lat;
  const nLng = nearest.position.lng;

  let minDistance = pLat !== undefined && pLng !== undefined && nLat !== undefined && nLng !== undefined
    ? haversineDistance(pLat, pLng, nLat, nLng)
    : manhattanDistance(point, nearest.position);

  for (let i = 1; i < hubs.length; i++) {
    const hLat = hubs[i].position.lat;
    const hLng = hubs[i].position.lng;
    const dist = pLat !== undefined && pLng !== undefined && hLat !== undefined && hLng !== undefined
      ? haversineDistance(pLat, pLng, hLat, hLng)
      : manhattanDistance(point, hubs[i].position);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = hubs[i];
    }
  }

  return nearest;
}
