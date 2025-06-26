import {
  users,
  parkingSlots,
  bookings,
  qrCodes,
  type User,
  type UpsertUser,
  type ParkingSlot,
  type InsertParkingSlot,
  type Booking,
  type InsertBooking,
  type BookingWithSlot,
  type QrCode,
  type InsertQrCode,
  type DashboardStats,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, count, sum } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Parking slot operations
  getAllSlots(): Promise<ParkingSlot[]>;
  getSlotById(id: number): Promise<ParkingSlot | undefined>;
  getAvailableSlots(vehicleType?: string): Promise<ParkingSlot[]>;
  updateSlotOccupancy(id: number, isOccupied: boolean): Promise<void>;
  createSlot(slot: InsertParkingSlot): Promise<ParkingSlot>;
  
  // Booking operations
  createBooking(booking: InsertBooking): Promise<Booking>;
  getBookingById(id: number): Promise<BookingWithSlot | undefined>;
  getActiveBookings(): Promise<BookingWithSlot[]>;
  getBookingBySlotId(slotId: number): Promise<Booking | undefined>;
  updateBookingStatus(id: number, status: string, checkOutTime?: Date): Promise<void>;
  updateBookingPaymentStatus(id: number, paymentStatus: string): Promise<void>;
  
  // QR code operations
  createQrCode(qrCode: InsertQrCode): Promise<QrCode>;
  getQrCodeByCode(code: string): Promise<QrCode | undefined>;
  
  // Dashboard operations
  getDashboardStats(): Promise<DashboardStats>;
  getRecentActivity(): Promise<any[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Parking slot operations
  async getAllSlots(): Promise<ParkingSlot[]> {
    return await db.select().from(parkingSlots);
  }

  async getSlotById(id: number): Promise<ParkingSlot | undefined> {
    const [slot] = await db.select().from(parkingSlots).where(eq(parkingSlots.id, id));
    return slot;
  }

  async getAvailableSlots(vehicleType?: string): Promise<ParkingSlot[]> {
    let query = db.select().from(parkingSlots).where(eq(parkingSlots.isOccupied, false));
    
    if (vehicleType === "ev") {
      query = query.where(eq(parkingSlots.type, "ev_charging"));
    }
    
    return await query;
  }

  async updateSlotOccupancy(id: number, isOccupied: boolean): Promise<void> {
    await db
      .update(parkingSlots)
      .set({ isOccupied })
      .where(eq(parkingSlots.id, id));
  }

  async createSlot(slot: InsertParkingSlot): Promise<ParkingSlot> {
    const [newSlot] = await db.insert(parkingSlots).values(slot).returning();
    return newSlot;
  }

  // Booking operations
  async createBooking(booking: InsertBooking): Promise<Booking> {
    const [newBooking] = await db.insert(bookings).values(booking).returning();
    return newBooking;
  }

  async getBookingById(id: number): Promise<BookingWithSlot | undefined> {
    const [booking] = await db
      .select()
      .from(bookings)
      .leftJoin(parkingSlots, eq(bookings.slotId, parkingSlots.id))
      .where(eq(bookings.id, id));
    
    if (!booking) return undefined;
    
    return {
      ...booking.bookings,
      slot: booking.parking_slots!,
    };
  }

  async getActiveBookings(): Promise<BookingWithSlot[]> {
    const result = await db
      .select()
      .from(bookings)
      .leftJoin(parkingSlots, eq(bookings.slotId, parkingSlots.id))
      .where(eq(bookings.status, "active"))
      .orderBy(desc(bookings.createdAt));
    
    return result.map(row => ({
      ...row.bookings,
      slot: row.parking_slots!,
    }));
  }

  async getBookingBySlotId(slotId: number): Promise<Booking | undefined> {
    const [booking] = await db
      .select()
      .from(bookings)
      .where(and(eq(bookings.slotId, slotId), eq(bookings.status, "active")));
    return booking;
  }

  async updateBookingStatus(id: number, status: string, checkOutTime?: Date): Promise<void> {
    const updateData: any = { status };
    if (checkOutTime) {
      updateData.checkOutTime = checkOutTime;
    }
    
    await db
      .update(bookings)
      .set(updateData)
      .where(eq(bookings.id, id));
  }

  async updateBookingPaymentStatus(id: number, paymentStatus: string): Promise<void> {
    await db
      .update(bookings)
      .set({ paymentStatus })
      .where(eq(bookings.id, id));
  }

  // QR code operations
  async createQrCode(qrCode: InsertQrCode): Promise<QrCode> {
    const [newQrCode] = await db.insert(qrCodes).values(qrCode).returning();
    return newQrCode;
  }

  async getQrCodeByCode(code: string): Promise<QrCode | undefined> {
    const [qrCode] = await db.select().from(qrCodes).where(eq(qrCodes.code, code));
    return qrCode;
  }

  // Dashboard operations
  async getDashboardStats(): Promise<DashboardStats> {
    const [totalSlotsResult] = await db.select({ count: count() }).from(parkingSlots);
    const [occupiedSlotsResult] = await db
      .select({ count: count() })
      .from(parkingSlots)
      .where(eq(parkingSlots.isOccupied, true));
    
    const [revenueResult] = await db
      .select({ total: sum(bookings.amount) })
      .from(bookings)
      .where(eq(bookings.paymentStatus, "paid"));
    
    const totalSlots = totalSlotsResult.count;
    const occupiedSlots = occupiedSlotsResult.count;
    const availableSlots = totalSlots - occupiedSlots;
    const revenue = Number(revenueResult.total) || 0;
    
    return {
      totalSlots,
      occupiedSlots,
      availableSlots,
      revenue,
    };
  }

  async getRecentActivity(): Promise<any[]> {
    const recentBookings = await db
      .select()
      .from(bookings)
      .leftJoin(parkingSlots, eq(bookings.slotId, parkingSlots.id))
      .orderBy(desc(bookings.createdAt))
      .limit(10);
    
    return recentBookings.map(row => ({
      id: row.bookings.id,
      type: row.bookings.status === "active" ? "check-in" : "check-out",
      description: `${row.bookings.userName} ${row.bookings.status === "active" ? "checked into" : "checked out from"} Slot ${row.parking_slots?.slotNumber}`,
      timestamp: row.bookings.createdAt,
      userName: row.bookings.userName,
      slotNumber: row.parking_slots?.slotNumber,
    }));
  }
}

export const storage = new DatabaseStorage();
