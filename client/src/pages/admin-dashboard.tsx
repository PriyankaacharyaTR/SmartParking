import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useWebSocket } from "@/hooks/useWebSocket";
import { ParkingGrid } from "@/components/ParkingGrid";
import { BookingStats } from "@/components/BookingStats";
import { CurrentBookings } from "@/components/CurrentBookings";
import { RecentActivity } from "@/components/RecentActivity";
import { Car, QrCode, Smartphone, BarChart3, Wifi, WifiOff } from "lucide-react";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { isConnected, lastMessage } = useWebSocket("/ws");

  const data = lastMessage?.data || {
    slots: [],
    stats: { totalSlots: 0, occupiedSlots: 0, availableSlots: 0, revenue: 0 },
    activeBookings: [],
    recentActivity: [],
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
                variant="outline"
                className="border-gray-300 hover:bg-gray-50"
              >
                <QrCode className="mr-2 h-4 w-4" />
                QR Codes
              </Button>
              <Button
                onClick={() => setLocation("/book")}
                variant="outline"
                className="border-gray-300 hover:bg-gray-50"
              >
                <Smartphone className="mr-2 h-4 w-4" />
                Book Slot
              </Button>
              <Button
                onClick={() => setLocation("/dashboard")}
                className="bg-gray-600 hover:bg-gray-700"
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <BookingStats stats={data.stats} />
        </motion.div>

        {/* Real-time Status Indicator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6"
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <motion.div
                    animate={{ scale: isConnected ? [1, 1.2, 1] : 1 }}
                    transition={{ duration: 2, repeat: isConnected ? Infinity : 0 }}
                    className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {isConnected ? 'Live Updates Active' : 'Connection Lost'}
                  </span>
                  {isConnected ? (
                    <Wifi className="h-4 w-4 text-green-500" />
                  ) : (
                    <WifiOff className="h-4 w-4 text-red-500" />
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  Last updated: {lastMessage ? new Date(lastMessage.data.timestamp).toLocaleTimeString() : 'Never'}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Dashboard Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Parking Grid */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <ParkingGrid slots={data.slots} />
          </motion.div>

          {/* Current Bookings */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <CurrentBookings bookings={data.activeBookings} />
          </motion.div>
        </div>

        {/* Recent Activity */}
        <motion.div
          className="mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <RecentActivity activities={data.recentActivity} />
        </motion.div>
      </div>
    </div>
  );
}
