import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ParkingSlot } from "@/lib/types";

interface ParkingGridProps {
  slots: ParkingSlot[];
}

export function ParkingGrid({ slots }: ParkingGridProps) {
  // Group slots by floor and zone
  const groupedSlots = slots.reduce((acc, slot) => {
    const key = `${slot.floor}-${slot.zone}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(slot);
    return acc;
  }, {} as Record<string, ParkingSlot[]>);

  // Sort slots within each group
  Object.keys(groupedSlots).forEach(key => {
    groupedSlots[key].sort((a, b) => a.slotNumber.localeCompare(b.slotNumber));
  });

  const getSlotColor = (slot: ParkingSlot) => {
    if (slot.isOccupied) {
      return slot.type === "ev_charging" ? "bg-amber-500" : "bg-red-500";
    }
    return slot.type === "ev_charging" ? "bg-yellow-400" : "bg-green-500";
  };

  const getSlotStatus = (slot: ParkingSlot) => {
    if (slot.isOccupied) {
      return slot.type === "ev_charging" ? "EV Charging" : "Occupied";
    }
    return slot.type === "ev_charging" ? "EV Available" : "Available";
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">Parking Grid - Ground Floor</h3>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span>Occupied</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-400 rounded"></div>
              <span>EV Available</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-amber-500 rounded"></div>
              <span>EV Charging</span>
            </div>
          </div>
        </div>

        {/* Display slots by rows */}
        <div className="space-y-4">
          {['A', 'B', 'C'].map((zone, zoneIndex) => {
            const zoneSlots = groupedSlots[`ground-${zone}`] || [];
            
            return (
              <motion.div
                key={zone}
                className="grid grid-cols-10 gap-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: zoneIndex * 0.1 }}
              >
                {Array.from({ length: 10 }, (_, i) => {
                  const slotNumber = `${zone}-${(i + 1).toString().padStart(2, '0')}`;
                  const slot = zoneSlots.find(s => s.slotNumber === slotNumber);
                  
                  if (!slot) {
                    return (
                      <div
                        key={slotNumber}
                        className="w-12 h-8 bg-gray-200 rounded shadow-sm flex items-center justify-center text-xs font-medium text-gray-500"
                      >
                        {slotNumber.replace('-', '')}
                      </div>
                    );
                  }

                  return (
                    <Tooltip key={slot.id}>
                      <TooltipTrigger>
                        <motion.div
                          className={`parking-slot w-12 h-8 ${getSlotColor(slot)} rounded shadow-sm flex items-center justify-center text-xs font-medium text-white cursor-pointer`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          transition={{ type: "spring", stiffness: 400, damping: 17 }}
                        >
                          {slot.slotNumber.replace('-', '')}
                        </motion.div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="text-sm">
                          <p className="font-semibold">Slot {slot.slotNumber}</p>
                          <p>Status: {getSlotStatus(slot)}</p>
                          <p>Type: {slot.type === "ev_charging" ? "EV Charging" : "Regular"}</p>
                          <p>Floor: {slot.floor}</p>
                          <p>Zone: {slot.zone}</p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </motion.div>
            );
          })}
        </div>

        {/* Row labels */}
        <div className="mt-4 text-xs text-gray-500 text-center">
          Rows: A (Top) • B (Middle) • C (Bottom)
        </div>
      </CardContent>
    </Card>
  );
}
