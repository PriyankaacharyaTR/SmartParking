import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { BookingWithSlot } from "@/lib/types";
import { MessageCircle, LogOut, Clock, AlertTriangle, Car } from "lucide-react";

interface CurrentBookingsProps {
  bookings: BookingWithSlot[];
}

export function CurrentBookings({ bookings }: CurrentBookingsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const checkoutMutation = useMutation({
    mutationFn: async (bookingId: number) => {
      const response = await apiRequest("POST", `/api/bookings/${bookingId}/checkout`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings/active"] });
      toast({
        title: "Checkout Successful",
        description: "The booking has been completed and slot freed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Checkout Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCheckout = (bookingId: number) => {
    checkoutMutation.mutate(bookingId);
  };

  const getTimeRemaining = (checkInTime: string, duration: number) => {
    const checkIn = new Date(checkInTime);
    const expiry = new Date(checkIn.getTime() + duration * 60 * 60 * 1000);
    const now = new Date();
    const remaining = expiry.getTime() - now.getTime();
    
    if (remaining <= 0) return "Expired";
    
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getStatusBadge = (checkInTime: string, duration: number) => {
    const remaining = getTimeRemaining(checkInTime, duration);
    
    if (remaining === "Expired") {
      return <Badge variant="destructive">Expired</Badge>;
    }
    
    const checkIn = new Date(checkInTime);
    const expiry = new Date(checkIn.getTime() + duration * 60 * 60 * 1000);
    const now = new Date();
    const timeLeft = expiry.getTime() - now.getTime();
    
    if (timeLeft <= 30 * 60 * 1000) { // 30 minutes
      return <Badge className="bg-yellow-100 text-yellow-800">Expiring Soon</Badge>;
    }
    
    return <Badge className="bg-green-100 text-green-800">Active</Badge>;
  };

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Current Bookings</h3>
        
        {bookings.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Car className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>No active bookings</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking, index) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800">{booking.userName}</h4>
                    <p className="text-sm text-gray-600">
                      {booking.vehicleType.toUpperCase()} • {booking.licensePlate}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center mt-1">
                      <Clock className="h-3 w-3 mr-1" />
                      Slot {booking.slot.slotNumber} • {getTimeRemaining(booking.checkInTime, booking.duration)} remaining
                    </p>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(booking.checkInTime, booking.duration)}
                    <p className="text-sm font-medium text-gray-800 mt-1">${booking.amount}</p>
                  </div>
                </div>
                
                <div className="mt-3 flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100"
                  >
                    <MessageCircle className="h-3 w-3 mr-1" />
                    Send Reminder
                  </Button>
                  
                  {getTimeRemaining(booking.checkInTime, booking.duration) === "Expired" ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs bg-red-50 text-red-800 border-red-200 hover:bg-red-100"
                      onClick={() => handleCheckout(booking.id)}
                      disabled={checkoutMutation.isPending}
                    >
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Force Checkout
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs bg-green-50 text-green-800 border-green-200 hover:bg-green-100"
                      onClick={() => handleCheckout(booking.id)}
                      disabled={checkoutMutation.isPending}
                    >
                      <LogOut className="h-3 w-3 mr-1" />
                      Checkout
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
