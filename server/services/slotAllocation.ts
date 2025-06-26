import { ParkingSlot } from "@shared/schema";

export interface SlotAllocationResult {
  slot: ParkingSlot;
  algorithm: string;
  score: number;
}

export class SlotAllocationService {
  // Basic First-Fit algorithm (simplified BFS approach)
  static bfsAllocation(availableSlots: ParkingSlot[], vehicleType: string): SlotAllocationResult | null {
    if (availableSlots.length === 0) return null;
    
    // For EV vehicles, prioritize EV charging slots
    if (vehicleType === "ev") {
      const evSlot = availableSlots.find(slot => slot.type === "ev_charging");
      if (evSlot) {
        return {
          slot: evSlot,
          algorithm: "BFS",
          score: 100,
        };
      }
    }
    
    // Return first available slot
    return {
      slot: availableSlots[0],
      algorithm: "BFS",
      score: 80,
    };
  }

  // Depth-First Search approach (finds deepest available slot)
  static dfsAllocation(availableSlots: ParkingSlot[], vehicleType: string): SlotAllocationResult | null {
    if (availableSlots.length === 0) return null;
    
    // Sort by zone and slot number to simulate DFS traversal
    const sorted = [...availableSlots].sort((a, b) => {
      if (a.zone !== b.zone) return a.zone.localeCompare(b.zone);
      return a.slotNumber.localeCompare(b.slotNumber);
    });
    
    // For EV vehicles, prioritize EV charging slots
    if (vehicleType === "ev") {
      const evSlot = sorted.find(slot => slot.type === "ev_charging");
      if (evSlot) {
        return {
          slot: evSlot,
          algorithm: "DFS",
          score: 95,
        };
      }
    }
    
    return {
      slot: sorted[sorted.length - 1], // Take the "deepest" slot
      algorithm: "DFS",
      score: 75,
    };
  }

  // A* algorithm - optimal slot selection based on multiple factors
  static aStarAllocation(availableSlots: ParkingSlot[], vehicleType: string): SlotAllocationResult | null {
    if (availableSlots.length === 0) return null;
    
    const scoredSlots = availableSlots.map(slot => {
      let score = 0;
      
      // Base score for availability
      score += 50;
      
      // Vehicle type matching
      if (vehicleType === "ev" && slot.type === "ev_charging") {
        score += 30;
      } else if (vehicleType !== "ev" && slot.type === "regular") {
        score += 20;
      }
      
      // Prefer ground floor (assuming it's more convenient)
      if (slot.floor === "ground") {
        score += 15;
      }
      
      // Prefer certain zones (A is closest to entrance)
      if (slot.zone === "A") {
        score += 10;
      } else if (slot.zone === "B") {
        score += 5;
      }
      
      // Prefer lower slot numbers (closer to entrance)
      const slotNum = parseInt(slot.slotNumber.split("-")[1] || "0");
      score += Math.max(0, 10 - slotNum);
      
      return { slot, score };
    });
    
    // Sort by score descending
    scoredSlots.sort((a, b) => b.score - a.score);
    
    return {
      slot: scoredSlots[0].slot,
      algorithm: "A*",
      score: scoredSlots[0].score,
    };
  }

  // Main allocation method that tries different algorithms
  static allocateSlot(availableSlots: ParkingSlot[], vehicleType: string, algorithm: string = "astar"): SlotAllocationResult | null {
    switch (algorithm.toLowerCase()) {
      case "bfs":
        return this.bfsAllocation(availableSlots, vehicleType);
      case "dfs":
        return this.dfsAllocation(availableSlots, vehicleType);
      case "astar":
      default:
        return this.aStarAllocation(availableSlots, vehicleType);
    }
  }
}
