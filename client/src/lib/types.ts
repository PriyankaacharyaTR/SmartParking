export interface ParkingSlot {
  id: number;
  slotNumber: string;
  floor: string;
  zone: string;
  type: string;
  isOccupied: boolean;
  coordinates?: { x: number; y: number };
}

export interface Booking {
  id: number;
  userName: string;
  vehicleType: string;
  licensePlate: string;
  phoneNumber: string;
  slotId: number;
  duration: number;
  amount: string;
  status: string;
  checkInTime: string;
  checkOutTime?: string;
  paymentStatus: string;
}

export interface BookingWithSlot extends Booking {
  slot: ParkingSlot;
}

export interface DashboardStats {
  totalSlots: number;
  occupiedSlots: number;
  availableSlots: number;
  revenue: number;
}

export interface RecentActivity {
  id: number;
  type: string;
  description: string;
  timestamp: string;
  userName: string;
  slotNumber: string;
}

export interface WebSocketMessage {
  type: string;
  data: {
    slots: ParkingSlot[];
    stats: DashboardStats;
    activeBookings: BookingWithSlot[];
    recentActivity: RecentActivity[];
    timestamp: string;
  };
}
