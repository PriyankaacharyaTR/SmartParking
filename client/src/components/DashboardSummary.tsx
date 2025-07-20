import { Card, CardContent } from "@/components/ui/card";
import { 
  TrendingUp, TrendingDown, Users, Clock, Car
} from "lucide-react";

interface SummaryCardProps {
  title: string;
  value: string | number;
  trend: number;
  icon: React.ReactNode;
  positive?: boolean;
  loading?: boolean;
}

function SummaryCard({ title, value, trend, icon, positive = true, loading = false }: SummaryCardProps) {
  return (
    <Card className="bg-white shadow-sm border">
      <CardContent className="p-6">
        <div className="flex justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            {loading ? (
              <div className="h-8 w-24 bg-gray-200 animate-pulse rounded"></div>
            ) : (
              <p className="text-2xl font-bold">{value}</p>
            )}
          </div>
          <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
            positive ? 'bg-green-100' : 'bg-red-100'
          }`}>
            {icon}
          </div>
        </div>
        {!loading && (
          <div className="flex items-center mt-4">
            <div className={`flex items-center ${positive ? 'text-green-600' : 'text-red-600'}`}>
              {positive ? (
                <TrendingUp className="mr-1 h-4 w-4" />
              ) : (
                <TrendingDown className="mr-1 h-4 w-4" />
              )}
              <span className="text-sm font-medium">{trend}%</span>
            </div>
            <span className="ml-2 text-xs text-muted-foreground">vs. last period</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function DashboardSummary() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <SummaryCard 
        title="Total Revenue" 
        value="₹28,700" 
        trend={17.4} 
        positive={true} 
        icon={<TrendingUp className="h-6 w-6 text-green-600" />} 
      />
      
      <SummaryCard 
        title="Today's Bookings" 
        value={156} 
        trend={8.2} 
        positive={true} 
        icon={<Users className="h-6 w-6 text-blue-600" />} 
      />
      
      <SummaryCard 
        title="Avg. Parking Duration" 
        value="2h 45m" 
        trend={5.1} 
        positive={false} 
        icon={<Clock className="h-6 w-6 text-amber-600" />} 
      />
      
      <SummaryCard 
        title="Occupancy Rate" 
        value="82%" 
        trend={12.8} 
        positive={true}
        icon={<Car className="h-6 w-6 text-purple-600" />} 
      />
    </div>
  );
}

export function TinyAreaChart() {
  return (
    <svg width="100" height="40" viewBox="0 0 100 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path 
        d="M0 40L5 35.3333L10 32L15 28.6667L20 30.6667L25 32.6667L30 30L35 26.6667L40 28L45 24.6667L50 20L55 21.3333L60 22.6667L65 20L70 16L75 10.6667L80 13.3333L85 16L90 10.6667L95 5.33333L100 0V40H0Z" 
        fill="url(#paint0_linear_trend)" 
      />
      <defs>
        <linearGradient id="paint0_linear_trend" x1="50" y1="0" x2="50" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3b82f6" stopOpacity="0.3" />
          <stop offset="1" stopColor="#3b82f6" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}
