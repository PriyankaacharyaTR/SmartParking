import { pgTable, text, serial, integer, boolean, timestamp, varchar, decimal, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table for authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").default("user"), // user, admin
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Parking slots table
export const parkingSlots = pgTable("parking_slots", {
  id: serial("id").primaryKey(),
  slotNumber: varchar("slot_number").notNull().unique(),
  floor: varchar("floor").notNull(),
  zone: varchar("zone").notNull(),
  type: varchar("type").notNull(), // regular, ev_charging, disabled
  isOccupied: boolean("is_occupied").default(false),
  coordinates: jsonb("coordinates"), // {x: number, y: number}
  createdAt: timestamp("created_at").defaultNow(),
});

// Bookings table
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  userName: varchar("user_name").notNull(),
  vehicleType: varchar("vehicle_type").notNull(), // car, ev, suv, truck, bike
  licensePlate: varchar("license_plate").notNull(),
  phoneNumber: varchar("phone_number").notNull(),
  slotId: integer("slot_id").references(() => parkingSlots.id),
  duration: integer("duration").notNull(), // in hours
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status").default("active"), // active, completed, expired, cancelled
  checkInTime: timestamp("check_in_time").defaultNow(),
  checkOutTime: timestamp("check_out_time"),
  paymentStatus: varchar("payment_status").default("pending"), // pending, paid, failed
  twilioMessageSid: varchar("twilio_message_sid"),
  createdAt: timestamp("created_at").defaultNow(),
});

// QR codes table
export const qrCodes = pgTable("qr_codes", {
  id: serial("id").primaryKey(),
  code: varchar("code").notNull().unique(),
  zone: varchar("zone").notNull(),
  floor: varchar("floor").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const bookingsRelations = relations(bookings, ({ one }) => ({
  slot: one(parkingSlots, {
    fields: [bookings.slotId],
    references: [parkingSlots.id],
  }),
}));

export const parkingSlotsRelations = relations(parkingSlots, ({ many }) => ({
  bookings: many(bookings),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
  role: true,
});

export const insertParkingSlotSchema = createInsertSchema(parkingSlots).omit({
  id: true,
  createdAt: true,
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  checkInTime: true,
  createdAt: true,
  twilioMessageSid: true,
});

export const insertQrCodeSchema = createInsertSchema(qrCodes).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type ParkingSlot = typeof parkingSlots.$inferSelect;
export type InsertParkingSlot = z.infer<typeof insertParkingSlotSchema>;
export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type QrCode = typeof qrCodes.$inferSelect;
export type InsertQrCode = z.infer<typeof insertQrCodeSchema>;

// Extended types for frontend
export type BookingWithSlot = Booking & {
  slot: ParkingSlot;
};

export type DashboardStats = {
  totalSlots: number;
  occupiedSlots: number;
  availableSlots: number;
  revenue: number;
};
