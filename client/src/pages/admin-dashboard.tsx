import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWebSocket } from "@/hooks/useWebSocket";
import { ParkingGrid } from "@/components/ParkingGrid";
import { BookingStats } from "@/components/BookingStats";
import { CurrentBookings } from "@/components/CurrentBookings";
import { RecentActivity } from "@/components/RecentActivity";
import { DashboardSummary } from "@/components/DashboardSummary";
import { 
  RevenueChart, 
  OccupancyTrendChart, 
  VehicleTypesChart, 
  BookingDurationChart
} from "@/components/AnalyticsCharts";
import { useIsMobile } from "@/hooks/use-mobile";
import { useUsers } from "@/hooks/use-users";
import { 
  Car, QrCode, Smartphone, BarChart3, Wifi, WifiOff, Menu, X, 
  Settings, Users, FileText, AlertCircle, UserCog, Banknote,
  Search, Filter, PlusCircle, CheckCircle, XCircle, UserPlus, 
  MoreHorizontal, Edit, ShieldAlert, ShieldCheck,
  Download
} from "lucide-react";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { showToast } from "@/lib/toast-utils";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { isConnected, lastMessage } = useWebSocket("/ws");
  const isMobile = useIsMobile();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { users, updateUserStatus, updateUserRole } = useUsers();
  const [searchQuery, setSearchQuery] = useState("");
  const [userRoleDialog, setUserRoleDialog] = useState<{isOpen: boolean, userId: string, currentRole: "Admin" | "User"}>({
    isOpen: false,
    userId: "",
    currentRole: "User"
  });
  const [userStatusDialog, setUserStatusDialog] = useState<{isOpen: boolean, userId: string, currentStatus: "Active" | "Pending"}>({
    isOpen: false,
    userId: "",
    currentStatus: "Active"
  });
  
  // Settings state
  const [parkingRates, setParkingRates] = useState({
    standardRate: 50,
    premiumRate: 80,
    monthlyPass: 3000
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    smsNotifications: true,
    emailReports: "Daily" // Daily, Weekly, Monthly
  });
  
  const [gridSettings, setGridSettings] = useState({
    gridSize: "4x8",
    floorLevels: "1",
    slotSize: 80,
    gapBetweenSlots: 10
  });
  
  const [colorScheme, setColorScheme] = useState({
    available: "bg-green-300/60 border-green-400/40",
    occupied: "bg-red-300/60 border-red-400/40",
    premium: "bg-blue-300/60 border-blue-400/40",
    reserved: "bg-yellow-300/60 border-yellow-400/40"
  });
  
  // Dialog states for settings
  const [rateDialog, setRateDialog] = useState<{
    isOpen: boolean;
    type: "standard" | "premium" | "monthly";
    currentRate: number;
    newRate: string;
  }>({
    isOpen: false,
    type: "standard",
    currentRate: 50,
    newRate: ""
  });
  
  const [emailFrequencyDialog, setEmailFrequencyDialog] = useState({
    isOpen: false,
    frequency: "Daily"
  });
  
  const [colorCustomizeDialog, setColorCustomizeDialog] = useState({
    isOpen: false,
    slotType: "available" as "available" | "occupied" | "premium" | "reserved",
    colorClass: "bg-green-300/60"
  });
  
  // Added state to manage recent activity
  const [recentActivityData, setRecentActivityData] = useState<any[]>([]);

  const data = lastMessage?.data || {
    slots: [],
    stats: { totalSlots: 0, occupiedSlots: 0, availableSlots: 0, revenue: 0 },
    activeBookings: [],
    recentActivity: [],
  };

  // Sync websocket data with our local state
  useEffect(() => {
    if (lastMessage?.data?.recentActivity) {
      setRecentActivityData(lastMessage.data.recentActivity);
    }
  }, [lastMessage?.data?.recentActivity]);

  // Function to clear recent activities
  const handleClearRecentActivity = () => {
    setRecentActivityData([]);
    showToast.success("Recent activity has been cleared");
  };
  
  // Function handlers for settings
  const openRateEditDialog = (type: "standard" | "premium" | "monthly", currentRate: number) => {
    setRateDialog({
      isOpen: true,
      type,
      currentRate,
      newRate: currentRate.toString()
    });
  };

  const handleRateChange = () => {
    const newRateNum = parseFloat(rateDialog.newRate);
    
    if (isNaN(newRateNum) || newRateNum <= 0) {
      showToast.error("Please enter a valid rate amount");
      return;
    }
    
    switch (rateDialog.type) {
      case "standard":
        setParkingRates(prev => ({ ...prev, standardRate: newRateNum }));
        showToast.success(`Standard rate updated to ₹${newRateNum}`);
        break;
      case "premium":
        setParkingRates(prev => ({ ...prev, premiumRate: newRateNum }));
        showToast.success(`Premium rate updated to ₹${newRateNum}`);
        break;
      case "monthly":
        setParkingRates(prev => ({ ...prev, monthlyPass: newRateNum }));
        showToast.success(`Monthly pass rate updated to ₹${newRateNum}`);
        break;
    }
    
    setRateDialog(prev => ({ ...prev, isOpen: false }));
  };
  
  const toggleSmsNotifications = () => {
    setNotificationSettings(prev => {
      const newValue = !prev.smsNotifications;
      showToast.success(`SMS notifications ${newValue ? 'enabled' : 'disabled'}`);
      return { ...prev, smsNotifications: newValue };
    });
  };
  
  const openEmailFrequencyDialog = () => {
    setEmailFrequencyDialog({
      isOpen: true,
      frequency: notificationSettings.emailReports
    });
  };
  
  const handleEmailFrequencyChange = () => {
    setNotificationSettings(prev => ({ 
      ...prev, 
      emailReports: emailFrequencyDialog.frequency 
    }));
    showToast.success(`Email reports frequency set to ${emailFrequencyDialog.frequency}`);
    setEmailFrequencyDialog(prev => ({ ...prev, isOpen: false }));
  };
  
  const updateGridSize = (size: string) => {
    setGridSettings(prev => ({ ...prev, gridSize: size }));
    showToast.success('Grid size updated');
  };
  
  const updateFloorLevels = (levels: string) => {
    setGridSettings(prev => ({ ...prev, floorLevels: levels }));
    showToast.success('Floor levels updated');
  };
  
  const updateSlotSize = (size: number) => {
    setGridSettings(prev => ({ ...prev, slotSize: size }));
  };
  
  const updateGapSize = (size: number) => {
    setGridSettings(prev => ({ ...prev, gapBetweenSlots: size }));
  };
  
  const saveAppearanceSettings = () => {
    // In a real app, this would save to backend
    showToast.success("Appearance settings saved");
  };
  
  const openColorCustomizeDialog = (slotType: "available" | "occupied" | "premium" | "reserved") => {
    setColorCustomizeDialog({
      isOpen: true,
      slotType,
      colorClass: colorScheme[slotType]
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-100">
      {/* Navigation */}
      <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Car className="text-primary text-2xl" />
              <h1 className={`text-xl font-bold text-gray-800 ${isMobile ? 'hidden sm:block' : ''}`}>
                Smart Parking System
              </h1>
              {isMobile && <h1 className="text-lg font-bold text-gray-800 sm:hidden">SPS Admin</h1>}
            </div>
            
            {/* Mobile menu button */}
            {isMobile && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="sm:hidden"
              >
                {showMobileMenu ? <X /> : <Menu />}
              </Button>
            )}
            
            {/* Desktop Navigation */}
            <div className={`items-center space-x-3 ${isMobile ? 'hidden sm:flex' : 'flex'}`}>
              <Button
                onClick={() => setLocation("/qr")}
                variant="outline"
                size={isMobile ? "sm" : "default"}
                className="border-gray-300 hover:bg-gray-50"
              >
                <QrCode className={`${isMobile ? 'mr-0' : 'mr-2'} h-4 w-4`} />
                {!isMobile && "QR Codes"}
              </Button>
              <Button
                onClick={() => setLocation("/book")}
                variant="outline"
                size={isMobile ? "sm" : "default"}
                className="border-gray-300 hover:bg-gray-50"
              >
                <Smartphone className={`${isMobile ? 'mr-0' : 'mr-2'} h-4 w-4`} />
                {!isMobile && "Book Slot"}
              </Button>
              <Button
                onClick={() => setLocation("/dashboard")}
                size={isMobile ? "sm" : "default"}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <BarChart3 className={`${isMobile ? 'mr-0' : 'mr-2'} h-4 w-4`} />
                {!isMobile && "Dashboard"}
              </Button>
            </div>
          </div>
        </div>
        
        {/* Mobile Navigation Menu */}
        {isMobile && showMobileMenu && (
          <motion.div 
            className="sm:hidden bg-white border-t border-gray-100 shadow-lg"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex flex-col space-y-2 p-4">
              <Button
                onClick={() => {
                  setLocation("/qr");
                  setShowMobileMenu(false);
                }}
                variant="ghost"
                className="flex items-center justify-start"
              >
                <QrCode className="mr-3 h-5 w-5" />
                QR Codes
              </Button>
              <Button
                onClick={() => {
                  setLocation("/book");
                  setShowMobileMenu(false);
                }}
                variant="ghost"
                className="flex items-center justify-start"
              >
                <Smartphone className="mr-3 h-5 w-5" />
                Book Slot
              </Button>
              <Button
                onClick={() => {
                  setLocation("/dashboard");
                  setShowMobileMenu(false);
                }}
                variant="ghost"
                className="flex items-center justify-start bg-blue-50"
              >
                <BarChart3 className="mr-3 h-5 w-5 text-blue-600" />
                Dashboard
              </Button>
            </div>
          </motion.div>
        )}
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 md:mb-0">Admin Dashboard</h1>
          
          {/* Real-time Status Indicator */}
          <Card className="w-full md:w-auto">
            <CardContent className="p-3 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <motion.div
                  animate={{ scale: isConnected ? [1, 1.2, 1] : 1 }}
                  transition={{ duration: 2, repeat: isConnected ? Infinity : 0 }}
                  className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
                />
                <span className="text-xs md:text-sm font-medium text-gray-700">
                  {isConnected ? 'Live Updates Active' : 'Connection Lost'}
                </span>
                {isConnected ? (
                  <Wifi className="h-4 w-4 text-green-500" />
                ) : (
                  <WifiOff className="h-4 w-4 text-red-500" />
                )}
              </div>
              <div className="text-xs text-gray-500 ml-2">
                Updated: {lastMessage ? new Date(lastMessage.data.timestamp).toLocaleTimeString() : 'Never'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <BookingStats stats={data.stats} />
        </motion.div>
        
        {/* Admin Dashboard Tabs */}
        <Tabs defaultValue="overview" className="mt-6">
          <TabsList className="grid grid-cols-2 md:grid-cols-5 lg:w-[600px] mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-0 space-y-6">
            {/* Main Dashboard Grid */}
            <div className="grid md:grid-cols-3 gap-6">
              {/* Parking Grid */}
              <motion.div
                className="md:col-span-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <ParkingGrid 
                  slots={data.slots} 
                  activeBookings={data.activeBookings} 
                  gridSize={gridSettings.gridSize}
                  slotSize={gridSettings.slotSize}
                  slotGap={gridSettings.gapBetweenSlots}
                />
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <RecentActivity 
                activities={recentActivityData} 
                onClearActivities={handleClearRecentActivity} 
              />
            </motion.div>
          </TabsContent>
          
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  User Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center">
                      <h3 className="text-lg font-medium">Registered Users</h3>
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full ml-2">
                        {users.length} Total
                      </span>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search users..."
                          className="pl-8 h-9"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                      <Button size="sm" variant="outline" className="h-9">
                        <Filter className="mr-2 h-4 w-4" /> Filter
                      </Button>
                      <Button size="sm" className="h-9 bg-blue-600 hover:bg-blue-700">
                        <UserPlus className="mr-2 h-4 w-4" /> Add User
                      </Button>
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left">User ID</th>
                          <th className="px-4 py-2 text-left">Name</th>
                          <th className="px-4 py-2 text-left">Phone</th>
                          <th className="px-4 py-2 text-left">Vehicle</th>
                          <th className="px-4 py-2 text-left">License</th>
                          <th className="px-4 py-2 text-left">Last Booking</th>
                          <th className="px-4 py-2 text-left">Role</th>
                          <th className="px-4 py-2 text-left">Status</th>
                          <th className="px-4 py-2 text-left">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users
                          .filter(user => 
                            user.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            user.phoneNumber.includes(searchQuery) ||
                            user.licensePlate.toLowerCase().includes(searchQuery.toLowerCase())
                          )
                          .map(user => (
                            <tr key={user.id} className="border-b hover:bg-gray-50">
                              <td className="px-4 py-3">{user.id}</td>
                              <td className="px-4 py-3 font-medium">{user.userName}</td>
                              <td className="px-4 py-3">{user.phoneNumber}</td>
                              <td className="px-4 py-3">
                                {(() => {
                                  const vehicleEmoji = {
                                    'car': '🚗',
                                    'ev': '🔋',
                                    'suv': '🚙',
                                    'truck': '🚛',
                                    'bike': '🏍️'
                                  }[user.vehicleType] || '🚗';
                                  return (
                                    <span>
                                      {vehicleEmoji} {user.vehicleType.toUpperCase()}
                                    </span>
                                  );
                                })()}
                              </td>
                              <td className="px-4 py-3">{user.licensePlate}</td>
                              <td className="px-4 py-3">{user.lastBooking}</td>
                              <td className="px-4 py-3">
                                <span 
                                  className={`${
                                    user.role === 'Admin' 
                                      ? 'bg-blue-100 text-blue-800' 
                                      : 'bg-gray-100 text-gray-800'
                                  } text-xs px-2 py-1 rounded-full cursor-pointer`}
                                  onClick={() => setUserRoleDialog({
                                    isOpen: true,
                                    userId: user.id,
                                    currentRole: user.role
                                  })}
                                >
                                  {user.role === 'Admin' ? (
                                    <ShieldAlert className="h-3 w-3 inline-block mr-1" />
                                  ) : (
                                    <ShieldCheck className="h-3 w-3 inline-block mr-1" />
                                  )}
                                  {user.role}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span 
                                  className={`${
                                    user.status === 'Active' 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-yellow-100 text-yellow-800'
                                  } text-xs px-2 py-1 rounded-full cursor-pointer`}
                                  onClick={() => setUserStatusDialog({
                                    isOpen: true,
                                    userId: user.id,
                                    currentStatus: user.status
                                  })}
                                >
                                  {user.status === 'Active' ? (
                                    <CheckCircle className="h-3 w-3 inline-block mr-1" />
                                  ) : (
                                    <XCircle className="h-3 w-3 inline-block mr-1" />
                                  )}
                                  {user.status}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem>
                                      <Edit className="mr-2 h-4 w-4" />
                                      Edit User
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => {
                                      updateUserStatus(
                                        user.id, 
                                        user.status === 'Active' ? 'Pending' : 'Active'
                                      );
                                    }}>
                                      {user.status === 'Active' ? (
                                        <XCircle className="mr-2 h-4 w-4" />
                                      ) : (
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                      )}
                                      {user.status === 'Active' ? 'Deactivate' : 'Activate'}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => {
                                      updateUserRole(
                                        user.id, 
                                        user.role === 'Admin' ? 'User' : 'Admin'
                                      );
                                    }}>
                                      {user.role === 'Admin' ? (
                                        <ShieldCheck className="mr-2 h-4 w-4" />
                                      ) : (
                                        <ShieldAlert className="mr-2 h-4 w-4" />
                                      )}
                                      {user.role === 'Admin' ? 'Make User' : 'Make Admin'}
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </td>
                            </tr>
                          ))}
                        {users.filter(user => 
                          user.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          user.phoneNumber.includes(searchQuery) ||
                          user.licensePlate.toLowerCase().includes(searchQuery.toLowerCase())
                        ).length === 0 && (
                          <tr>
                            <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                              {searchQuery ? 'No users found matching your search.' : 'No users found. Add a user to get started.'}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Change User Role Dialog */}
            <Dialog 
              open={userRoleDialog.isOpen} 
              onOpenChange={(open) => !open && setUserRoleDialog(prev => ({...prev, isOpen: false}))}
            >
              <DialogContent className="max-w-sm">
                <DialogHeader>
                  <DialogTitle>Change User Role</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to change this user's role to {userRoleDialog.currentRole === 'Admin' ? 'User' : 'Admin'}?
                    {userRoleDialog.currentRole !== 'Admin' && (
                      <p className="mt-2 text-amber-500">
                        <ShieldAlert className="inline-block mr-1 h-4 w-4" />
                        Admin users have full access to all system settings.
                      </p>
                    )}
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-end">
                  <Button 
                    variant="outline" 
                    onClick={() => setUserRoleDialog(prev => ({...prev, isOpen: false}))}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => {
                      updateUserRole(
                        userRoleDialog.userId,
                        userRoleDialog.currentRole === 'Admin' ? 'User' : 'Admin'
                      );
                      setUserRoleDialog(prev => ({...prev, isOpen: false}));
                    }}
                  >
                    Confirm
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            {/* Change User Status Dialog */}
            <Dialog 
              open={userStatusDialog.isOpen} 
              onOpenChange={(open) => !open && setUserStatusDialog(prev => ({...prev, isOpen: false}))}
            >
              <DialogContent className="max-w-sm">
                <DialogHeader>
                  <DialogTitle>Change User Status</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to {userStatusDialog.currentStatus === 'Active' ? 'deactivate' : 'activate'} this user?
                    {userStatusDialog.currentStatus === 'Active' && (
                      <p className="mt-2 text-amber-500">
                        <XCircle className="inline-block mr-1 h-4 w-4" />
                        Deactivated users won't be able to make new bookings.
                      </p>
                    )}
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-end">
                  <Button 
                    variant="outline" 
                    onClick={() => setUserStatusDialog(prev => ({...prev, isOpen: false}))}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => {
                      updateUserStatus(
                        userStatusDialog.userId,
                        userStatusDialog.currentStatus === 'Active' ? 'Pending' : 'Active'
                      );
                      setUserStatusDialog(prev => ({...prev, isOpen: false}));
                    }}
                  >
                    Confirm
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>
          
          <TabsContent value="reports">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div>
                <h2 className="text-2xl font-bold tracking-tight mb-1">Reports & Analytics</h2>
                <p className="text-sm text-muted-foreground">
                  Simple insights into parking system performance
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-1" /> Export CSV
                </Button>
                
                <Button 
                  size="sm"
                  className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700" 
                  onClick={() => {
                    const printContents = document.getElementById('reports-print-section')?.innerHTML;
                    const originalContents = document.body.innerHTML;

                    if (printContents) {
                      document.body.innerHTML = `
                        <div class="print-header" style="text-align:center; padding: 20px 0; border-bottom: 1px solid #ddd; margin-bottom: 20px;">
                          <h1 style="font-size: 24px; margin-bottom: 10px;">Smart Parking System Analytics Report</h1>
                          <p style="font-size: 14px; color: #666;">Generated on ${new Date().toLocaleDateString()}</p>
                        </div>
                        ${printContents}
                      `;
                      
                      window.print();
                      document.body.innerHTML = originalContents;
                    }
                  }}
                >
                  <FileText className="h-4 w-4" />
                  <span>Print Report</span>
                </Button>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <div className="bg-blue-100 p-2 rounded-full mr-4">
                  <BarChart3 className="h-6 w-6 text-blue-700" />
                </div>
                <div>
                  <h3 className="font-medium text-blue-800">Analytics Dashboard</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Key metrics and performance insights for your parking system
                  </p>
                </div>
              </div>
            </div>
            
            {/* Dashboard Summary component */}
            <DashboardSummary />
            
            <div id="reports-print-section">
              {/* Import the components */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <RevenueChart />
                <OccupancyTrendChart />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <VehicleTypesChart />
                <BookingDurationChart />
              </div>

              <Card className="mb-6">
                <CardContent className="pt-6">
                  <h3 className="text-lg font-medium mb-4">Analytics Insights</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-green-50 rounded-md border border-green-100">
                      <h4 className="font-medium text-green-800">Revenue Growth</h4>
                      <p className="mt-1 text-sm text-green-700">
                        Revenue has increased by 17% compared to last month.
                      </p>
                    </div>
                    
                    <div className="p-4 bg-blue-50 rounded-md border border-blue-100">
                      <h4 className="font-medium text-blue-800">Peak Occupancy</h4>
                      <p className="mt-1 text-sm text-blue-700">
                        Highest occupancy rates are observed on Fridays (92%).
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="mr-2 h-5 w-5" />
                  System Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="rounded-lg border p-4">
                    <h3 className="text-lg font-medium mb-4">Parking Rates</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span>Standard Rate (Hourly)</span>
                        <div className="flex items-center">
                          <span className="font-medium mr-2">₹{parkingRates.standardRate}</span>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => openRateEditDialog("standard", parkingRates.standardRate)}
                          >
                            Edit
                          </Button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Premium Spots (Hourly)</span>
                        <div className="flex items-center">
                          <span className="font-medium mr-2">₹{parkingRates.premiumRate}</span>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => openRateEditDialog("premium", parkingRates.premiumRate)}
                          >
                            Edit
                          </Button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Monthly Pass</span>
                        <div className="flex items-center">
                          <span className="font-medium mr-2">₹{parkingRates.monthlyPass}</span>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => openRateEditDialog("monthly", parkingRates.monthlyPass)}
                          >
                            Edit
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="rounded-lg border p-4">
                    <h3 className="text-lg font-medium mb-4">Notification Settings</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span>SMS Notifications</span>
                        <div className="flex items-center">
                          <span className="mr-2 text-green-600">{notificationSettings.smsNotifications ? 'Enabled' : 'Disabled'}</span>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={toggleSmsNotifications}
                          >
                            {notificationSettings.smsNotifications ? 'Disable' : 'Enable'}
                          </Button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Email Reports</span>
                        <div className="flex items-center">
                          <span className="mr-2 text-green-600">{notificationSettings.emailReports}</span>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={openEmailFrequencyDialog}
                          >
                            Change
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Parking Grid Settings */}
                  <div className="md:col-span-2 rounded-lg border p-4">
                    <h3 className="text-lg font-medium mb-4">Parking Grid Settings</h3>
                    <div className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-sm mb-3">Grid Layout</h4>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span>Grid Size</span>
                              <div className="flex items-center space-x-2">
                                <select 
                                  className="text-sm border rounded p-1"
                                  value={gridSettings.gridSize}
                                  onChange={(e) => updateGridSize(e.target.value)}
                                >
                                  <option value="4x8">4x8 (Current)</option>
                                  <option value="3x10">3x10</option>
                                  <option value="4x10">4x10</option>
                                  <option value="5x10">5x10</option>
                                  <option value="3x15">3x15</option>
                                </select>
                                <Button size="sm" variant="outline" onClick={() => showToast.success('Grid size updated')}>
                                  Apply
                                </Button>
                              </div>
                            </div>
                            <div className="flex justify-between items-center">
                              <span>Floor Levels</span>
                              <div className="flex items-center space-x-2">
                                <select 
                                  className="text-sm border rounded p-1"
                                  value={gridSettings.floorLevels}
                                  onChange={(e) => updateFloorLevels(e.target.value)}
                                >
                                  <option value="1">1 Floor</option>
                                  <option value="2">2 Floors</option>
                                  <option value="3">3 Floors</option>
                                </select>
                                <Button size="sm" variant="outline" onClick={() => showToast.success('Floor levels updated')}>
                                  Apply
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-sm mb-3">Slot Appearance</h4>
                          <div className="space-y-3">
                            <div>
                              <label className="text-sm block mb-1">Slot Size</label>
                              <div className="flex items-center gap-2">
                                <input 
                                  type="range" 
                                  min="50" 
                                  max="120" 
                                  value={gridSettings.slotSize}
                                  className="w-full"
                                  onChange={(e) => updateSlotSize(parseInt(e.target.value))}
                                />
                                <span className="text-sm">{gridSettings.slotSize}px</span>
                              </div>
                            </div>
                            <div>
                              <label className="text-sm block mb-1">Gap Between Slots</label>
                              <div className="flex items-center gap-2">
                                <input 
                                  type="range" 
                                  min="5" 
                                  max="30" 
                                  value={gridSettings.gapBetweenSlots}
                                  className="w-full"
                                  onChange={(e) => updateGapSize(parseInt(e.target.value))}
                                />
                                <span className="text-sm">{gridSettings.gapBetweenSlots}px</span>
                              </div>
                            </div>
                            <Button 
                              size="sm" 
                              variant="default" 
                              className="mt-2"
                              onClick={saveAppearanceSettings}
                            >
                              Save Appearance
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="pt-4 border-t">
                        <h4 className="font-medium text-sm mb-3">Color Scheme</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div className="flex flex-col items-center">
                            <div className="w-10 h-10 bg-green-300/60 border border-green-400/40 rounded-md mb-2"></div>
                            <span className="text-xs">Available</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <div className="w-10 h-10 bg-red-300/60 border border-red-400/40 rounded-md mb-2"></div>
                            <span className="text-xs">Occupied</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <div className="w-10 h-10 bg-blue-300/60 border border-blue-400/40 rounded-md mb-2"></div>
                            <span className="text-xs">Premium</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <div className="w-10 h-10 bg-yellow-300/60 border border-yellow-400/40 rounded-md mb-2"></div>
                            <span className="text-xs">Reserved</span>
                          </div>
                        </div>
                        <Button size="sm" variant="link" className="mt-2" onClick={() => openColorCustomizeDialog("available")}>
                          Customize Colors
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="alerts">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertCircle className="mr-2 h-5 w-5" />
                  System Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border">
                  <div className="bg-amber-50 p-4 border-b border-amber-200">
                    <div className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 mr-3" />
                      <div>
                        <h3 className="text-sm font-medium text-amber-800">Sensor Malfunction - Zone B</h3>
                        <p className="text-sm text-amber-700 mt-1">
                          Parking slot sensor B-05 reported inconsistent readings. Maintenance required.
                        </p>
                        <div className="flex items-center mt-2 text-xs text-amber-600">
                          <span>2 hours ago</span>
                          <Button size="sm" variant="ghost" className="ml-4 h-7 text-xs">Mark Resolved</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-red-50 p-4 border-b border-red-200">
                    <div className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-3" />
                      <div>
                        <h3 className="text-sm font-medium text-red-800">Payment Gateway Error</h3>
                        <p className="text-sm text-red-700 mt-1">
                          3 failed payment transactions in the last hour. Payment provider may be experiencing issues.
                        </p>
                        <div className="flex items-center mt-2 text-xs text-red-600">
                          <span>45 minutes ago</span>
                          <Button size="sm" variant="ghost" className="ml-4 h-7 text-xs">Investigate</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-4">
                    <div className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                      <div>
                        <h3 className="text-sm font-medium text-gray-800">System Maintenance Complete</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Scheduled database optimization completed successfully.
                        </p>
                        <div className="flex items-center mt-2 text-xs text-gray-500">
                          <span>Yesterday, 11:43 PM</span>
                          <Button size="sm" variant="ghost" className="ml-4 h-7 text-xs">Dismiss</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Button className="mt-4" variant="outline">
                  View All Alerts
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Add Dialogs for Settings */}
          
          {/* Rate Edit Dialog */}
          <Dialog
            open={rateDialog.isOpen}
            onOpenChange={(open) => !open && setRateDialog(prev => ({ ...prev, isOpen: false }))}
          >
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle>
                  Edit {rateDialog.type === "standard" ? "Standard" : 
                        rateDialog.type === "premium" ? "Premium" : "Monthly"} Rate
                </DialogTitle>
                <DialogDescription>
                  Enter the new rate amount
                </DialogDescription>
              </DialogHeader>
              
              <div className="py-4">
                <div className="flex items-center space-x-2">
                  <span className="text-xl">₹</span>
                  <Input
                    type="number" 
                    min="1" 
                    step={rateDialog.type === "monthly" ? "100" : "5"}
                    value={rateDialog.newRate}
                    onChange={(e) => setRateDialog(prev => ({ 
                      ...prev, 
                      newRate: e.target.value
                    }))}
                    className="text-lg"
                    placeholder="Enter amount"
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setRateDialog(prev => ({ ...prev, isOpen: false }))}>
                  Cancel
                </Button>
                <Button onClick={handleRateChange}>
                  Save Changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          {/* Email Frequency Dialog */}
          <Dialog
            open={emailFrequencyDialog.isOpen}
            onOpenChange={(open) => !open && setEmailFrequencyDialog(prev => ({ ...prev, isOpen: false }))}
          >
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle>
                  Email Report Frequency
                </DialogTitle>
                <DialogDescription>
                  Select how often you want to receive email reports
                </DialogDescription>
              </DialogHeader>
              
              <div className="py-4">
                <Select 
                  value={emailFrequencyDialog.frequency} 
                  onValueChange={(value) => setEmailFrequencyDialog(prev => ({ ...prev, frequency: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Daily">Daily</SelectItem>
                    <SelectItem value="Weekly">Weekly</SelectItem>
                    <SelectItem value="Monthly">Monthly</SelectItem>
                    <SelectItem value="Never">Never</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setEmailFrequencyDialog(prev => ({ ...prev, isOpen: false }))}>
                  Cancel
                </Button>
                <Button onClick={handleEmailFrequencyChange}>
                  Save Changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          {/* Color Customize Dialog */}
          <Dialog
            open={colorCustomizeDialog.isOpen}
            onOpenChange={(open) => !open && setColorCustomizeDialog(prev => ({ ...prev, isOpen: false }))}
          >
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle>
                  Customize Colors
                </DialogTitle>
                <DialogDescription>
                  Select colors for different parking slot states
                </DialogDescription>
              </DialogHeader>
              
              <div className="py-4 space-y-4">
                <div className="space-y-2">
                  <Label>Available Slots</Label>
                  <div className="grid grid-cols-5 gap-2">
                    <div 
                      className={`w-10 h-10 bg-green-100 border border-green-200 rounded-md cursor-pointer ${colorCustomizeDialog.slotType === "available" && colorCustomizeDialog.colorClass === "bg-green-100" ? "ring-2 ring-offset-2 ring-blue-500" : ""}`}
                      onClick={() => setColorCustomizeDialog(prev => ({ ...prev, colorClass: "bg-green-100" }))}
                    ></div>
                    <div 
                      className={`w-10 h-10 bg-green-200 border border-green-300 rounded-md cursor-pointer ${colorCustomizeDialog.slotType === "available" && colorCustomizeDialog.colorClass === "bg-green-200" ? "ring-2 ring-offset-2 ring-blue-500" : ""}`}
                      onClick={() => setColorCustomizeDialog(prev => ({ ...prev, colorClass: "bg-green-200" }))}
                    ></div>
                    <div 
                      className={`w-10 h-10 bg-green-300 border border-green-400 rounded-md cursor-pointer ${colorCustomizeDialog.slotType === "available" && colorCustomizeDialog.colorClass === "bg-green-300" ? "ring-2 ring-offset-2 ring-blue-500" : ""}`}
                      onClick={() => setColorCustomizeDialog(prev => ({ ...prev, colorClass: "bg-green-300" }))}
                    ></div>
                    <div 
                      className={`w-10 h-10 bg-teal-200 border border-teal-300 rounded-md cursor-pointer ${colorCustomizeDialog.slotType === "available" && colorCustomizeDialog.colorClass === "bg-teal-200" ? "ring-2 ring-offset-2 ring-blue-500" : ""}`}
                      onClick={() => setColorCustomizeDialog(prev => ({ ...prev, colorClass: "bg-teal-200" }))}
                    ></div>
                    <div 
                      className={`w-10 h-10 bg-emerald-200 border border-emerald-300 rounded-md cursor-pointer ${colorCustomizeDialog.slotType === "available" && colorCustomizeDialog.colorClass === "bg-emerald-200" ? "ring-2 ring-offset-2 ring-blue-500" : ""}`}
                      onClick={() => setColorCustomizeDialog(prev => ({ ...prev, colorClass: "bg-emerald-200" }))}
                    ></div>
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setColorCustomizeDialog(prev => ({ ...prev, isOpen: false }))}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  setColorScheme(prev => ({ 
                    ...prev, 
                    [colorCustomizeDialog.slotType]: colorCustomizeDialog.colorClass 
                  }));
                  showToast.success("Color updated");
                  setColorCustomizeDialog(prev => ({ ...prev, isOpen: false }));
                }}>
                  Apply Color
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </Tabs>
      </div>
      {/* Footer */}
      <footer className="bg-white border-t mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex justify-center md:justify-start space-x-6">
              <a href="#" className="text-gray-500 hover:text-gray-700">
                About
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-700">
                Privacy
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-700">
                Terms
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-700">
                Contact
              </a>
            </div>
            <div className="mt-8 md:mt-0">
              <p className="text-center md:text-right text-sm text-gray-500">
                &copy; 2025 Smart Parking System. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
