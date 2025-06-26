export interface WhatsAppMessage {
  to: string;
  message: string;
  buttons?: Array<{
    id: string;
    title: string;
  }>;
}

export interface BookingConfirmation {
  userName: string;
  slotNumber: string;
  duration: number;
  amount: number;
  bookingId: number;
}

export class TwilioService {
  private accountSid: string;
  private authToken: string;
  private whatsappNumber: string;

  constructor() {
    this.accountSid = process.env.TWILIO_ACCOUNT_SID || process.env.TWILIO_SID || "";
    this.authToken = process.env.TWILIO_AUTH_TOKEN || process.env.TWILIO_TOKEN || "";
    this.whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER || "whatsapp:+14155238886";
    
    if (!this.accountSid || !this.authToken) {
      console.warn("Twilio credentials not found. WhatsApp features will be disabled.");
    }
  }

  async sendBookingConfirmation(booking: BookingConfirmation, phoneNumber: string): Promise<string | null> {
    if (!this.accountSid || !this.authToken) {
      console.log("Twilio not configured - would send booking confirmation to:", phoneNumber);
      return null;
    }

    try {
      const message = `🅿️ *Parking Confirmed!*

Hello ${booking.userName}! Your parking slot has been reserved.

📍 *Slot:* ${booking.slotNumber}
⏰ *Duration:* ${booking.duration} hours
💰 *Amount:* $${booking.amount}
🎫 *Booking ID:* #${booking.bookingId}

Your slot is now reserved. Please proceed to the parking area.

To check out, simply click the button below when you're ready to leave.`;

      // In a real implementation, you would use the Twilio SDK here
      const twilio = await this.getTwilioClient();
      if (!twilio) return null;

      const response = await twilio.messages.create({
        from: this.whatsappNumber,
        to: `whatsapp:${phoneNumber}`,
        body: message,
        // Add interactive buttons for checkout
        // Note: This requires Twilio's Interactive Message templates
      });

      return response.sid;
    } catch (error) {
      console.error("Failed to send WhatsApp message:", error);
      return null;
    }
  }

  async sendCheckoutReminder(userName: string, slotNumber: string, phoneNumber: string): Promise<string | null> {
    if (!this.accountSid || !this.authToken) {
      console.log("Twilio not configured - would send checkout reminder to:", phoneNumber);
      return null;
    }

    try {
      const message = `⏰ *Parking Time Reminder*

Hi ${userName}! Your parking time is about to expire.

📍 *Slot:* ${slotNumber}
⚠️ *Status:* Expiring soon

Please return to your vehicle or extend your parking time to avoid penalties.

Click below to extend or check out:`;

      const twilio = await this.getTwilioClient();
      if (!twilio) return null;

      const response = await twilio.messages.create({
        from: this.whatsappNumber,
        to: `whatsapp:${phoneNumber}`,
        body: message,
      });

      return response.sid;
    } catch (error) {
      console.error("Failed to send checkout reminder:", error);
      return null;
    }
  }

  async sendReceipt(booking: BookingConfirmation, phoneNumber: string): Promise<string | null> {
    if (!this.accountSid || !this.authToken) {
      console.log("Twilio not configured - would send receipt to:", phoneNumber);
      return null;
    }

    try {
      const message = `🧾 *Parking Receipt*

Thank you ${booking.userName}!

📍 *Slot:* ${booking.slotNumber}
⏰ *Duration:* ${booking.duration} hours
💰 *Total Paid:* $${booking.amount}
🎫 *Booking ID:* #${booking.bookingId}

✅ Payment successful
✅ Checkout complete

We hope you had a great experience with Smart Parking System!`;

      const twilio = await this.getTwilioClient();
      if (!twilio) return null;

      const response = await twilio.messages.create({
        from: this.whatsappNumber,
        to: `whatsapp:${phoneNumber}`,
        body: message,
      });

      return response.sid;
    } catch (error) {
      console.error("Failed to send receipt:", error);
      return null;
    }
  }

  async handleWebhook(webhookData: any): Promise<{ action: string; bookingId?: number }> {
    // Handle incoming WhatsApp webhook for interactive buttons
    const messageBody = webhookData.Body?.toLowerCase() || "";
    const from = webhookData.From;

    if (messageBody.includes("checkout") || messageBody.includes("check out")) {
      // Extract booking ID from message context or database lookup by phone
      return { action: "checkout" };
    }

    if (messageBody.includes("extend")) {
      return { action: "extend" };
    }

    return { action: "unknown" };
  }

  private async getTwilioClient() {
    if (!this.accountSid || !this.authToken) return null;
    
    try {
      // Dynamic import to avoid requiring Twilio SDK if not needed
      const twilio = await import("twilio");
      return twilio.default(this.accountSid, this.authToken);
    } catch (error) {
      console.error("Twilio SDK not available:", error);
      return null;
    }
  }
}
