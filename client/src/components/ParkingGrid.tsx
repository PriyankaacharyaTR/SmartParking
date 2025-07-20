import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ParkingSlot, BookingWithSlot } from "@/lib/types";
import { Car, Truck, Settings, Battery, Bike } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

interface ParkingGridProps {
  slots: ParkingSlot[];
  activeBookings?: BookingWithSlot[];
  gridSize?: string; // e.g. "4x8"
  slotSize?: number;
  slotGap?: number;
}

export function ParkingGrid({ slots, activeBookings = [], gridSize = "4x8", slotSize = 80, slotGap = 10 }: ParkingGridProps) {
  const [showSettings, setShowSettings] = useState(false);

  // Parse gridSize (e.g. "4x8")
  const [numRows, numCols] = gridSize.split('x').map(Number);
  const zoneLabels = Array.from({ length: numRows }, (_, i) => String.fromCharCode(65 + i)); // ['A', 'B', ...]

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

  const getVehicleIcon = (slot: ParkingSlot) => {
    if (!slot.isOccupied) return null;
    
    // Find the active booking for this slot to get the vehicle type
    const booking = activeBookings.find(booking => booking.slotId === slot.id);
    const vehicleType = booking?.vehicleType || 'car'; // Default to car if not found
    
    // Return appropriate icon based on vehicle type
    switch(vehicleType) {
      case 'truck':
        return <Truck className="text-gray-800" size={slotSize * 0.5} />;
      case 'bike':
        return <Bike className="text-gray-800" size={slotSize * 0.5} />;
      case 'ev':
        return <Battery className="text-gray-800" size={slotSize * 0.5} />;
      case 'car':
      case 'suv':
      default:
        return <Car className="text-gray-800" size={slotSize * 0.5} />;
    }
  };

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <CardContent className="p-4 md:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
          <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-2 sm:mb-0">
            Parking Grid - {gridSize} Layout
          </h3>
          <div className="flex items-center gap-2">
            <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-green-300/60 border border-green-600/30 rounded"></div>
                <span>Available</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-red-300/60 border border-red-600/30 rounded"></div>
                <span>Occupied</span>
              </div>
            </div>
            <Button 
              size="sm" 
              variant="outline" 
              className="ml-2 flex items-center"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings size={16} className="mr-1" /> Settings
            </Button>
          </div>
        </div>

        {/* Grid Settings Panel */}
        {showSettings && (
          <motion.div 
            className="mb-6 p-4 border rounded-lg bg-gray-50"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
          >
            <h4 className="text-sm font-semibold mb-3">Grid Settings</h4>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Slot Size: {slotSize}px</label>
                <Slider 
                  value={[slotSize]} 
                  onValueChange={() => {}} // Read-only
                  min={50} 
                  max={120} 
                  step={5}
                  className="max-w-xs"
                  disabled
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Gap Between Slots: {slotGap}px</label>
                <Slider 
                  value={[slotGap]} 
                  onValueChange={() => {}} // Read-only
                  min={5} 
                  max={30} 
                  step={1}
                  className="max-w-xs"
                  disabled
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* 3D Parking Grid */}
        <div className="pb-4">
          <div className="space-y-6">
            {zoneLabels.map((zone, zoneIndex) => {
              const zoneSlots = groupedSlots[`ground-${zone}`] || [];
              return (
                <motion.div
                  key={zone}
                  className="flex flex-wrap gap-2 justify-center"
                  style={{ gap: `${slotGap}px` }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: zoneIndex * 0.1 }}
                >
                  {Array.from({ length: numCols }, (_, i) => {
                    const slotNumber = `${zone}-${(i + 1).toString().padStart(2, '0')}`;
                    const slot = zoneSlots.find(s => s.slotNumber === slotNumber) || {
                      id: `dummy-${slotNumber}`,
                      slotNumber: slotNumber,
                      zone: zone,
                      floor: "ground",
                      isOccupied: false,
                      price: 50
                    };
                    return (
                      <Tooltip key={slot.id}>
                        <TooltipTrigger>
                          <motion.div
                            className="relative cursor-pointer"
                            style={{ 
                              height: `${slotSize * 1.2}px`, 
                              width: `${slotSize}px`,
                              maxWidth: '100%'
                            }}
                            whileHover={{ scale: 1.05, translateY: -5 }}
                            whileTap={{ scale: 0.95 }}
                            transition={{ type: "spring", stiffness: 400, damping: 17 }}
                          >
                            {/* Parking Spot Base (Ground) */}
                            <div 
                              className="absolute bottom-0 w-full rounded-md"
                              style={{ 
                                height: `${slotSize * 0.15}px`,
                                backgroundColor: '#888',
                                transform: 'skewX(-5deg)', 
                                transformOrigin: 'bottom', 
                                zIndex: 1
                              }}
                            ></div>
                            {/* Parking Spot 3D Block */}
                            <div 
                              className={`absolute bottom-0 w-full flex flex-col items-center justify-center rounded-md border ${
                                slot.isOccupied 
                                  ? "bg-red-300/60 border-red-400/40" 
                                  : "bg-green-300/60 border-green-400/40"
                              }`}
                              style={{ 
                                height: `${slotSize * 0.5}px`,
                                zIndex: 2,
                                boxShadow: slot.isOccupied 
                                  ? 'inset 0px 10px 20px -10px rgba(200, 30, 30, 0.3)' 
                                  : 'inset 0px 10px 20px -10px rgba(30, 200, 30, 0.3)'
                              }}
                            >
                              <span className={`text-xs font-medium ${slot.isOccupied ? "text-red-900" : "text-green-900"}`}>
                                {slot.slotNumber.replace('-', '')}
                              </span>
                            </div>
                            {/* Vehicle (if occupied) */}
                            {slot.isOccupied && (
                              <motion.div
                                className="absolute z-10 flex items-center justify-center"
                                style={{ 
                                  bottom: `${slotSize * 0.5}px`,
                                  width: `${slotSize}px`,
                                  height: `${slotSize * 0.6}px`
                                }}
                                initial={{ y: -50, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                              >
                                {getVehicleIcon(slot)}
                              </motion.div>
                            )}
                          </motion.div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="px-2 py-1">
                            <div className="font-semibold">{`Slot ${slot.slotNumber}`}</div>
                            <div className="text-sm">Status: {slot.isOccupied ? "Occupied" : "Available"}</div>
                            {!slot.isOccupied && 'price' in slot && <div className="text-sm">Price: ₹{slot.price}/hr</div>}
                            {slot.isOccupied && (() => {
                              const booking = activeBookings.find(b => b.slotId === slot.id);
                              if (booking) {
                                const vehicleEmoji = {
                                  'car': '🚗',
                                  'ev': '🔋',
                                  'suv': '🚙',
                                  'truck': '🚛',
                                  'bike': '🏍️'
                                }[booking.vehicleType] || '🚗';
                                return (
                                  <>
                                    <div className="text-sm">Vehicle: {vehicleEmoji} {booking.vehicleType.toUpperCase()}</div>
                                    <div className="text-sm">License: {booking.licensePlate}</div>
                                  </>
                                );
                              }
                              return null;
                            })()}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Row labels */}
        <div className="mt-4 text-xs text-gray-500 text-center">
          Rows: A (Top) • B • C • D (Bottom)
        </div>
      </CardContent>
    </Card>
  );
}
