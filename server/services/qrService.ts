export class QRService {
  static generateQRCodeUrl(zone: string, floor: string): string {
    // Use environment variables or fallback to localhost with dynamic detection
    const hostIp = process.env.HOST_IP || '172.17.13.254'; 
    const port = process.env.PORT || 5000;
    
    const baseUrl = process.env.REPLIT_DOMAINS 
      ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}`
      : `http://${hostIp}:${port}`;
    
    const bookingUrl = `${baseUrl}/book?zone=${encodeURIComponent(zone)}&floor=${encodeURIComponent(floor)}`;
    return bookingUrl;
  }

  static async generateQRCodeDataUrl(text: string): Promise<string> {
    try {
      // Dynamic import to avoid requiring QR code library if not needed
      const QRCode = await import("qrcode");
      
      const qrCodeDataUrl = await QRCode.default.toDataURL(text, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      return qrCodeDataUrl;
    } catch (error) {
      console.error("QR code generation failed:", error);
      // Return a placeholder data URL
      return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y5ZjlmOSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzMzMzMzMyI+UVIgQ29kZTwvdGV4dD48L3N2Zz4=";
    }
  }

  static extractZoneFromUrl(url: string): { zone?: string; floor?: string } {
    try {
      const urlObj = new URL(url);
      const zone = urlObj.searchParams.get("zone");
      const floor = urlObj.searchParams.get("floor");
      
      return { zone: zone || undefined, floor: floor || undefined };
    } catch (error) {
      return {};
    }
  }
}
