import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Car, User, Clock, CreditCard, Phone, CheckCircle, QrCode, BarChart3, Smartphone } from "lucide-react";

const bookingSchema = z.object({
  userName: z.string().min(2, "Name must be at least 2 characters"),
  vehicleType: z.string().min(1, "Please select a vehicle type"),
  duration: z.string().min(1, "Please select duration"),
  licensePlate: z.string().min(3, "License plate must be at least 3 characters"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
});

type BookingFormData = z.infer<typeof bookingSchema>;

export default function BookingForm() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [bookingResult, setBookingResult] = useState<any>(null);
  const [zone, setZone] = useState("A");
  const [floor, setFloor] = useState("Ground Floor");

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      userName: "",
      vehicleType: "",
      duration: "",
      licensePlate: "",
      phoneNumber: "",
    },
  });

  // Extract zone and floor from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const zoneParam = urlParams.get("zone");
    const floorParam = urlParams.get("floor");
    
    if (zoneParam) setZone(zoneParam);
    if (floorParam) setFloor(floorParam === "ground" ? "Ground Floor" : "First Floor");
  }, []);

  const bookingMutation = useMutation({
    mutationFn: async (data: BookingFormData) => {
      const bookingData = {
        ...data,
        duration: parseInt(data.duration),
      };
      const response = await apiRequest("POST", "/api/bookings", bookingData);
      return response.json();
    },
    onSuccess: (data) => {
      setBookingResult(data);
      toast({
        title: "Slot Booked Successfully!",
        description: `Your slot ${data.slot.slotNumber} has been reserved.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Booking Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: BookingFormData) => {
    bookingMutation.mutate(data);
  };

  const getPriceForDuration = (duration: string) => {
    const hours = parseInt(duration);
    const baseRate = form.watch("vehicleType") === "ev" ? 8 : 5;
    return hours * baseRate;
  };

  if (bookingResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          <Card className="w-full max-w-md shadow-xl">
            <CardContent className="p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              >
                <CheckCircle className="mx-auto text-secondary text-6xl mb-4" />
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Booking Confirmed!</h2>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Slot:</span>
                    <span>{bookingResult.slot.slotNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Floor:</span>
                    <span>{bookingResult.slot.floor}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Duration:</span>
                    <span>{bookingResult.booking.duration} hours</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-primary">${bookingResult.booking.amount}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  A WhatsApp confirmation has been sent to your phone with checkout instructions.
                </p>
                
                <Button
                  onClick={() => setLocation("/dashboard")}
                  className="w-full bg-primary hover:bg-blue-700"
                >
                  View Dashboard
                </Button>
                
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="w-full"
                >
                  Book Another Slot
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

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

      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="shadow-xl overflow-hidden">
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-primary to-blue-600 p-6 text-white">
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                >
                  <Car className="text-3xl mb-2 mx-auto" />
                </motion.div>
                <h2 className="text-xl font-bold">Book Parking Slot</h2>
                <p className="text-blue-100 text-sm">Zone {zone} - {floor}</p>
              </div>
            </div>
            
            {/* Form */}
            <CardContent className="p-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="userName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center text-sm font-medium text-gray-700">
                          <User className="mr-2 h-4 w-4 text-gray-400" />
                          Full Name
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="vehicleType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center text-sm font-medium text-gray-700">
                          <Car className="mr-2 h-4 w-4 text-gray-400" />
                          Vehicle Type
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select vehicle type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="car">🚗 Car</SelectItem>
                            <SelectItem value="ev">🔋 Electric Vehicle</SelectItem>
                            <SelectItem value="suv">🚙 SUV</SelectItem>
                            <SelectItem value="truck">🚛 Truck</SelectItem>
                            <SelectItem value="bike">🏍️ Motorcycle</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center text-sm font-medium text-gray-700">
                          <Clock className="mr-2 h-4 w-4 text-gray-400" />
                          Duration
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select duration" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1">1 Hour - ${getPriceForDuration("1")}</SelectItem>
                            <SelectItem value="2">2 Hours - ${getPriceForDuration("2")}</SelectItem>
                            <SelectItem value="4">4 Hours - ${getPriceForDuration("4")}</SelectItem>
                            <SelectItem value="8">8 Hours - ${getPriceForDuration("8")}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="licensePlate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center text-sm font-medium text-gray-700">
                          <CreditCard className="mr-2 h-4 w-4 text-gray-400" />
                          License Plate
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="ABC-1234" className="uppercase" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center text-sm font-medium text-gray-700">
                          <Phone className="mr-2 h-4 w-4 text-gray-400" />
                          Phone Number
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="+1 (555) 123-4567" type="tel" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button
                    type="submit"
                    disabled={bookingMutation.isPending}
                    className="w-full bg-secondary hover:bg-emerald-600 text-white py-4 px-6 rounded-lg transition-all transform hover:scale-105 shadow-lg"
                  >
                    {bookingMutation.isPending ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="mr-2"
                      >
                        <Car className="h-4 w-4" />
                      </motion.div>
                    ) : (
                      <CheckCircle className="mr-2 h-4 w-4" />
                    )}
                    {bookingMutation.isPending ? "Finding Slot..." : "Find Available Slot"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
