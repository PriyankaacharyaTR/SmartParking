import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Car, QrCode, Download, Smartphone, BarChart3 } from "lucide-react";

export default function QRGenerator() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedZone, setSelectedZone] = useState("A");
  const [selectedFloor, setSelectedFloor] = useState("ground");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");

  const generateQRMutation = useMutation({
    mutationFn: async (data: { zone: string; floor: string }) => {
      const response = await apiRequest("POST", "/api/qr/generate", data);
      return response.json();
    },
    onSuccess: (data) => {
      setQrCodeUrl(data.url);
      setQrCodeDataUrl(data.dataUrl);
      toast({
        title: "QR Code Generated",
        description: "Your QR code has been successfully generated!",
      });
    },
    onError: (error) => {
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleGenerate = () => {
    generateQRMutation.mutate({
      zone: selectedZone,
      floor: selectedFloor,
    });
  };

  const downloadQRCode = () => {
    if (!qrCodeDataUrl) return;
    
    const link = document.createElement("a");
    link.download = `parking-qr-${selectedZone}-${selectedFloor}.png`;
    link.href = qrCodeDataUrl;
    link.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Navigation */}
      <nav className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Car className="text-primary text-2xl" />
              <h1 className="text-xl font-bold text-gray-800">Smart Parking System</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => setLocation("/qr")}
                className="bg-primary hover:bg-blue-700"
              >
                <QrCode className="mr-2 h-4 w-4" />
                QR Codes
              </Button>
              <Button
                onClick={() => setLocation("/book")}
                className="bg-secondary hover:bg-emerald-600"
              >
                <Smartphone className="mr-2 h-4 w-4" />
                Book Slot
              </Button>
              <Button
                onClick={() => setLocation("/dashboard")}
                variant="outline"
                className="border-gray-300 hover:bg-gray-50"
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* QR Code Generation Section */}
      <motion.div
        className="max-w-4xl mx-auto p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="shadow-xl">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              >
                <QrCode className="mx-auto text-primary text-6xl mb-4" />
              </motion.div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">QR Code Generation</h2>
              <p className="text-gray-600">Generate QR codes for parking areas to enable quick slot booking</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <motion.div
                className="space-y-6"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div>
                  <Label htmlFor="floor" className="text-sm font-medium text-gray-700 mb-2 block">
                    Floor
                  </Label>
                  <Select value={selectedFloor} onValueChange={setSelectedFloor}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select floor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ground">Ground Floor</SelectItem>
                      <SelectItem value="first">First Floor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="zone" className="text-sm font-medium text-gray-700 mb-2 block">
                    Zone
                  </Label>
                  <Select value={selectedZone} onValueChange={setSelectedZone}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select zone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">Zone A</SelectItem>
                      <SelectItem value="B">Zone B</SelectItem>
                      <SelectItem value="C">Zone C</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="qrCodeUrl" className="text-sm font-medium text-gray-700 mb-2 block">
                    QR Code URL
                  </Label>
                  <Input
                    id="qrCodeUrl"
                    value={qrCodeUrl || `${window.location.origin}/book?zone=${selectedZone}&floor=${selectedFloor}`}
                    readOnly
                    className="bg-gray-50 text-gray-600"
                  />
                </div>
                
                <Button
                  onClick={handleGenerate}
                  disabled={generateQRMutation.isPending}
                  className="w-full bg-primary hover:bg-blue-700"
                >
                  {generateQRMutation.isPending ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="mr-2"
                    >
                      <QrCode className="h-4 w-4" />
                    </motion.div>
                  ) : (
                    <Download className="mr-2 h-4 w-4" />
                  )}
                  Generate & Download QR
                </Button>
              </motion.div>
              
              <motion.div
                className="flex flex-col items-center"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="bg-gray-50 p-8 rounded-xl border-2 border-dashed border-gray-300">
                  {qrCodeDataUrl ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200 }}
                      className="text-center"
                    >
                      <img
                        src={qrCodeDataUrl}
                        alt="QR Code"
                        className="w-48 h-48 border-2 border-gray-200 rounded-lg"
                      />
                      <Button
                        onClick={downloadQRCode}
                        className="mt-4 bg-secondary hover:bg-emerald-600"
                        size="sm"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    </motion.div>
                  ) : (
                    <div className="w-48 h-48 border-2 border-gray-200 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <QrCode className="text-6xl text-gray-400 mb-4 mx-auto" />
                        <p className="text-gray-500 text-sm">QR Code Preview</p>
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-4 text-center">
                  Scan with any camera app to open booking form
                </p>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
