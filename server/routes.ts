import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { SlotAllocationService } from "./services/slotAllocation";
import { TwilioService } from "./services/twilioService";
import { QRService } from "./services/qrService";
import { insertBookingSchema, insertQrCodeSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const twilioService = new TwilioService();

  // Initialize sample data
  await initializeSampleData();

  // QR Code generation endpoints
  app.post("/api/qr/generate", async (req, res) => {
    try {
      const { zone, floor } = req.body;
      
      if (!zone || !floor) {
        return res.status(400).json({ message: "Zone and floor are required" });
      }

      const bookingUrl = QRService.generateQRCodeUrl(zone, floor);
      const qrCodeDataUrl = await QRService.generateQRCodeDataUrl(bookingUrl);
      
      // Save QR code to database
      const qrCode = await storage.createQrCode({
        code: `${zone}-${floor}-${Date.now()}`,
        zone,
        floor,
        isActive: true,
      });

      res.json({
        url: bookingUrl,
        dataUrl: qrCodeDataUrl,
        qrCode,
      });
    } catch (error) {
      console.error("QR generation error:", error);
      res.status(500).json({ message: "Failed to generate QR code" });
    }
  });

  // Parking slot endpoints
  app.get("/api/slots", async (req, res) => {
    try {
      const slots = await storage.getAllSlots();
      res.json(slots);
    } catch (error) {
      console.error("Error fetching slots:", error);
      res.status(500).json({ message: "Failed to fetch slots" });
    }
  });

  app.get("/api/slots/available", async (req, res) => {
    try {
      const { vehicleType } = req.query;
      const slots = await storage.getAvailableSlots(vehicleType as string);
      res.json(slots);
    } catch (error) {
      console.error("Error fetching available slots:", error);
      res.status(500).json({ message: "Failed to fetch available slots" });
    }
  });

  // Booking endpoints
  app.post("/api/bookings", async (req, res) => {
    try {
      const bookingData = insertBookingSchema.parse(req.body);
      
      // Get available slots
      const availableSlots = await storage.getAvailableSlots(bookingData.vehicleType);
      
      if (availableSlots.length === 0) {
        return res.status(400).json({ message: "No available slots for this vehicle type" });
      }

      // Allocate slot using A* algorithm
      const allocationResult = SlotAllocationService.allocateSlot(
        availableSlots, 
        bookingData.vehicleType,
        "astar"
      );

      if (!allocationResult) {
        return res.status(400).json({ message: "Failed to allocate slot" });
      }

      // Calculate amount based on duration
      const hourlyRate = bookingData.vehicleType === "ev" ? 8 : 5;
      const amount = (bookingData.duration * hourlyRate).toString();

      // Create booking
      const booking = await storage.createBooking({
        ...bookingData,
        slotId: allocationResult.slot.id,
        amount,
        status: "active",
        paymentStatus: "pending",
      });

      // Update slot occupancy
      await storage.updateSlotOccupancy(allocationResult.slot.id, true);

      // Send WhatsApp confirmation
      const messageSid = await twilioService.sendBookingConfirmation(
        {
          userName: booking.userName,
          slotNumber: allocationResult.slot.slotNumber,
          duration: booking.duration,
          amount: Number(booking.amount),
          bookingId: booking.id,
        },
        booking.phoneNumber
      );

      if (messageSid) {
        await storage.updateBookingPaymentStatus(booking.id, "paid");
      }

      // Broadcast update to connected WebSocket clients
      broadcastSlotUpdate();

      res.json({
        booking,
        slot: allocationResult.slot,
        algorithm: allocationResult.algorithm,
        messageSid,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid booking data", errors: error.errors });
      }
      console.error("Booking creation error:", error);
      res.status(500).json({ message: "Failed to create booking" });
    }
  });

  app.get("/api/bookings/active", async (req, res) => {
    try {
      const bookings = await storage.getActiveBookings();
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching active bookings:", error);
      res.status(500).json({ message: "Failed to fetch active bookings" });
    }
  });

  app.post("/api/bookings/:id/checkout", async (req, res) => {
    try {
      const bookingId = parseInt(req.params.id);
      const booking = await storage.getBookingById(bookingId);
      
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      if (booking.status !== "active") {
        return res.status(400).json({ message: "Booking is not active" });
      }

      // Update booking status
      await storage.updateBookingStatus(bookingId, "completed", new Date());
      
      // Free up the slot
      if (booking.slotId) {
        await storage.updateSlotOccupancy(booking.slotId, false);
      }

      // Send receipt via WhatsApp
      await twilioService.sendReceipt(
        {
          userName: booking.userName,
          slotNumber: booking.slot.slotNumber,
          duration: booking.duration,
          amount: Number(booking.amount),
          bookingId: booking.id,
        },
        booking.phoneNumber
      );

      // Broadcast update to connected WebSocket clients
      broadcastSlotUpdate();

      res.json({ message: "Checkout successful", booking });
    } catch (error) {
      console.error("Checkout error:", error);
      res.status(500).json({ message: "Failed to checkout" });
    }
  });

  // Dashboard endpoints
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  app.get("/api/dashboard/activity", async (req, res) => {
    try {
      const activity = await storage.getRecentActivity();
      res.json(activity);
    } catch (error) {
      console.error("Error fetching recent activity:", error);
      res.status(500).json({ message: "Failed to fetch recent activity" });
    }
  });

  // Twilio webhook endpoint
  app.post("/api/webhooks/twilio", async (req, res) => {
    try {
      const webhookResult = await twilioService.handleWebhook(req.body);
      
      if (webhookResult.action === "checkout" && webhookResult.bookingId) {
        // Handle checkout request from WhatsApp
        // Implementation depends on how you associate phone numbers with bookings
      }

      res.status(200).send("OK");
    } catch (error) {
      console.error("Twilio webhook error:", error);
      res.status(500).json({ message: "Webhook processing failed" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  // Set up WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  const connectedClients = new Set<WebSocket>();

  wss.on('connection', (ws) => {
    connectedClients.add(ws);
    console.log('WebSocket client connected');

    ws.on('close', () => {
      connectedClients.delete(ws);
      console.log('WebSocket client disconnected');
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      connectedClients.delete(ws);
    });

    // Send initial data
    sendSlotUpdate(ws);
  });

  // Function to broadcast slot updates to all connected clients
  function broadcastSlotUpdate() {
    connectedClients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        sendSlotUpdate(client);
      }
    });
  }

  async function sendSlotUpdate(ws: WebSocket) {
    try {
      const [slots, stats, activeBookings, recentActivity] = await Promise.all([
        storage.getAllSlots(),
        storage.getDashboardStats(),
        storage.getActiveBookings(),
        storage.getRecentActivity(),
      ]);

      const update = {
        type: 'dashboard_update',
        data: {
          slots,
          stats,
          activeBookings,
          recentActivity,
          timestamp: new Date().toISOString(),
        },
      };

      ws.send(JSON.stringify(update));
    } catch (error) {
      console.error('Error sending slot update:', error);
    }
  }

  return httpServer;
}

// Initialize sample parking slots
async function initializeSampleData() {
  try {
    const existingSlots = await storage.getAllSlots();
    if (existingSlots.length > 0) {
      return; // Data already exists
    }

    // Create sample parking slots
    const slots = [];
    const zones = ['A', 'B', 'C'];
    const floors = ['ground', 'first'];
    
    for (const floor of floors) {
      for (const zone of zones) {
        for (let i = 1; i <= 10; i++) {
          const slotNumber = `${zone}-${i.toString().padStart(2, '0')}`;
          const type = (zone === 'A' && i <= 2) || (zone === 'B' && i === 5) || (zone === 'C' && i === 6) 
            ? 'ev_charging' 
            : 'regular';
          
          slots.push({
            slotNumber,
            floor,
            zone,
            type,
            isOccupied: Math.random() > 0.7, // 30% chance of being occupied
            coordinates: { x: i * 50, y: zones.indexOf(zone) * 40 },
          });
        }
      }
    }

    // Create all slots
    await Promise.all(slots.map(slot => storage.createSlot(slot)));
    console.log(`Created ${slots.length} sample parking slots`);
  } catch (error) {
    console.error("Error initializing sample data:", error);
  }
}
