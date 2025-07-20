import { ParkingSlot } from "@shared/schema";

export interface SlotAllocationResult {
  slot: ParkingSlot;
  algorithm: string;
  score: number;
}

// Helper: Build a grid map from slots
function buildGrid(slots: ParkingSlot[]) {
  const grid: Record<string, ParkingSlot> = {};
  slots.forEach(slot => {
    const coords = slot.coordinates as { x: number; y: number } | undefined;
    if (coords && typeof coords.x === "number" && typeof coords.y === "number") {
      grid[`${coords.x},${coords.y}`] = slot;
    }
  });
  return grid;
}

// Helper: Get neighbors (adjacent slots)
function getNeighbors(slot: ParkingSlot, grid: Record<string, ParkingSlot>) {
  const dirs = [
    [0, 1], [1, 0], [0, -1], [-1, 0] // up, right, down, left
  ];
  const neighbors: ParkingSlot[] = [];
  const coords = slot.coordinates as { x: number; y: number } | undefined;
  if (!coords) return neighbors;
  for (const [dx, dy] of dirs) {
    const nx = coords.x + dx;
    const ny = coords.y + dy;
    const neighbor = grid[`${nx},${ny}`];
    if (neighbor && !neighbor.isOccupied) {
      neighbors.push(neighbor);
    }
  }
  return neighbors;
}

// Helper: Manhattan distance
function manhattan(a: ParkingSlot, b: ParkingSlot) {
  const ca = a.coordinates as { x: number; y: number } | undefined;
  const cb = b.coordinates as { x: number; y: number } | undefined;
  if (!ca || !cb) return Infinity;
  return Math.abs(ca.x - cb.x) + Math.abs(ca.y - cb.y);
}

export class SlotAllocationService {
  // DFS for bikes: allocate inner/back slots
  static dfsAllocation(availableSlots: ParkingSlot[], vehicleType: string): SlotAllocationResult | null {
    if (availableSlots.length === 0) return null;
    const grid = buildGrid(availableSlots);
    // Start from entrance/front (lowest y)
    const start = availableSlots.reduce((min, s) => {
      const sCoords = s.coordinates as { x: number; y: number } | undefined;
      const minCoords = min?.coordinates as { x: number; y: number } | undefined;
      if (!min || (sCoords && minCoords && sCoords.y < minCoords.y)) return s;
      return min;
    }, null as ParkingSlot | null);
    const visited = new Set<string>();
    let result: ParkingSlot | null = null;
    function dfs(slot: ParkingSlot) {
      const coords = slot.coordinates as { x: number; y: number } | undefined;
      if (!coords) return;
      const key = `${coords.x},${coords.y}`;
      if (visited.has(key)) return;
      visited.add(key);
      // Always go deeper (higher y)
      const neighbors = getNeighbors(slot, grid).sort((a, b) => {
        const aCoords = a.coordinates as { x: number; y: number } | undefined;
        const bCoords = b.coordinates as { x: number; y: number } | undefined;
        return (bCoords?.y ?? 0) - (aCoords?.y ?? 0);
      });
      for (const n of neighbors) {
        dfs(n);
      }
      // Last visited is deepest
      result = slot;
    }
    if (start) dfs(start);
    if (result) {
      return { slot: result, algorithm: "DFS", score: 100 };
    }
    return null;
  }

  // BFS for cars: allocate nearest/front slots
  static bfsAllocation(availableSlots: ParkingSlot[], vehicleType: string): SlotAllocationResult | null {
    if (availableSlots.length === 0) return null;
    const grid = buildGrid(availableSlots);
    // Start from entrance/front (lowest y)
    const start = availableSlots.reduce((min, s) => {
      const sCoords = s.coordinates as { x: number; y: number } | undefined;
      const minCoords = min?.coordinates as { x: number; y: number } | undefined;
      if (!min || (sCoords && minCoords && sCoords.y < minCoords.y)) return s;
      return min;
    }, null as ParkingSlot | null);
    if (!start) return null;
    const queue: ParkingSlot[] = [start];
    const visited = new Set<string>();
    while (queue.length > 0) {
      const slot = queue.shift()!;
      const coords = slot.coordinates as { x: number; y: number } | undefined;
      if (!coords) continue;
      const key = `${coords.x},${coords.y}`;
      if (visited.has(key)) continue;
      visited.add(key);
      if (!slot.isOccupied) {
        return { slot, algorithm: "BFS", score: 100 };
      }
      const neighbors = getNeighbors(slot, grid);
      queue.push(...neighbors);
    }
    return null;
  }

  // A* for trucks: shortest, obstacle-free exit
  static aStarAllocation(availableSlots: ParkingSlot[], vehicleType: string): SlotAllocationResult | null {
    if (availableSlots.length === 0) return null;
    const grid = buildGrid(availableSlots);
    // Assume entrance is at lowest y
    const entrance = availableSlots.reduce((min, s) => {
      const sCoords = s.coordinates as { x: number; y: number } | undefined;
      const minCoords = min?.coordinates as { x: number; y: number } | undefined;
      if (!min || (sCoords && minCoords && sCoords.y < minCoords.y)) return s;
      return min;
    }, null as ParkingSlot | null);
    if (!entrance) return null;
    // For each slot, compute A* path to entrance
    let bestSlot: ParkingSlot | null = null;
    let bestScore = Infinity;
    for (const slot of availableSlots) {
      const slotCoords = slot.coordinates as { x: number; y: number } | undefined;
      const entranceCoords = entrance.coordinates as { x: number; y: number } | undefined;
      if (!slotCoords || !entranceCoords) continue;
      // A* search from slot to entrance
      const open = [slot];
      const cameFrom: Record<string, string | null> = {};
      const gScore: Record<string, number> = { [`${slotCoords.x},${slotCoords.y}`]: 0 };
      const fScore: Record<string, number> = { [`${slotCoords.x},${slotCoords.y}`]: manhattan(slot, entrance) };
      const closed = new Set<string>();
      let found = false;
      while (open.length > 0) {
        open.sort((a, b) => {
          const aCoords = a.coordinates as { x: number; y: number } | undefined;
          const bCoords = b.coordinates as { x: number; y: number } | undefined;
          return (fScore[`${aCoords?.x},${aCoords?.y}`] ?? Infinity) - (fScore[`${bCoords?.x},${bCoords?.y}`] ?? Infinity);
        });
        const current = open.shift()!;
        const currentCoords = current.coordinates as { x: number; y: number } | undefined;
        if (!currentCoords) continue;
        const key = `${currentCoords.x},${currentCoords.y}`;
        if (closed.has(key)) continue;
        closed.add(key);
        if (current === entrance) {
          found = true;
          break;
        }
        for (const neighbor of getNeighbors(current, grid)) {
          const nCoords = neighbor.coordinates as { x: number; y: number } | undefined;
          if (!nCoords) continue;
          const nKey = `${nCoords.x},${nCoords.y}`;
          const tentativeG = (gScore[key] ?? Infinity) + 1;
          if (tentativeG < (gScore[nKey] ?? Infinity)) {
            cameFrom[nKey] = key;
            gScore[nKey] = tentativeG;
            fScore[nKey] = tentativeG + manhattan(neighbor, entrance);
            open.push(neighbor);
          }
        }
      }
      if (found && gScore[`${entranceCoords.x},${entranceCoords.y}`] < bestScore) {
        bestScore = gScore[`${entranceCoords.x},${entranceCoords.y}`];
        bestSlot = slot;
      }
    }
    if (bestSlot) {
      return { slot: bestSlot, algorithm: "A*", score: 100 - bestScore };
    }
    return null;
  }

  // EVs: allocate nearest available charging slot (front row)
  static evAllocation(availableSlots: ParkingSlot[]): SlotAllocationResult | null {
    const evSlots = availableSlots.filter(slot => slot.type === "ev_charging");
    if (evSlots.length === 0) return null;
    // Pick the one with lowest y (front)
    const frontEv = evSlots.reduce((min, s) => {
      const sCoords = s.coordinates as { x: number; y: number } | undefined;
      const minCoords = min?.coordinates as { x: number; y: number } | undefined;
      if (!min || (sCoords && minCoords && sCoords.y < minCoords.y)) return s;
      return min;
    }, null as ParkingSlot | null);
    if (frontEv) {
      return { slot: frontEv, algorithm: "EV", score: 100 };
    }
    return null;
  }

  // Main allocation method
  static allocateSlot(availableSlots: ParkingSlot[], vehicleType: string): SlotAllocationResult | null {
    switch (vehicleType) {
      case "bike":
        return this.dfsAllocation(availableSlots, vehicleType);
      case "car":
      case "suv":
        return this.bfsAllocation(availableSlots, vehicleType);
      case "truck":
        return this.aStarAllocation(availableSlots, vehicleType);
      case "ev":
        return this.evAllocation(availableSlots);
      default:
        return this.bfsAllocation(availableSlots, vehicleType);
    }
  }
}
