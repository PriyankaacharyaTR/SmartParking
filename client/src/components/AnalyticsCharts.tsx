import { Card, CardContent } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import { useState } from "react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

// Sample data for charts
const monthlyRevenueData = [
  { name: "Jan", revenue: 12400 },
  { name: "Feb", revenue: 14800 },
  { name: "Mar", revenue: 15900 },
  { name: "Apr", revenue: 19200 },
  { name: "May", revenue: 24500 },
  { name: "Jun", revenue: 28700 },
  { name: "Jul", revenue: 31200, forecasted: true },
  { name: "Aug", revenue: 33800, forecasted: true },
];

const occupancyTrendsData = [
  { name: "Mon", occupancy: 62 },
  { name: "Tue", occupancy: 68 },
  { name: "Wed", occupancy: 72 },
  { name: "Thu", occupancy: 83 },
  { name: "Fri", occupancy: 92 },
  { name: "Sat", occupancy: 78 },
  { name: "Sun", occupancy: 56 },
];

const hourlyOccupancyData = [
  { hour: "6 AM", occupancy: 15 },
  { hour: "8 AM", occupancy: 45 },
  { hour: "10 AM", occupancy: 68 },
  { hour: "12 PM", occupancy: 82 },
  { hour: "2 PM", occupancy: 75 },
  { hour: "4 PM", occupancy: 87 },
  { hour: "6 PM", occupancy: 93 },
  { hour: "8 PM", occupancy: 65 },
  { hour: "10 PM", occupancy: 42 },
];

const vehicleTypeData = [
  { name: "Car", value: 62 },
  { name: "EV", value: 15 },
  { name: "SUV", value: 12 },
  { name: "Bike", value: 8 },
  { name: "Truck", value: 3 },
];

const VEHICLE_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

const bookingDurationData = [
  { name: "< 1 hour", count: 120 },
  { name: "1-2 hours", count: 245 },
  { name: "2-4 hours", count: 178 },
  { name: "4-8 hours", count: 85 },
  { name: "8+ hours", count: 42 },
];

const forecastMetricsData = [
  { name: "Today", revenue: 4200, occupancy: 76, bookings: 68 },
  { name: "Tomorrow", revenue: 4400, occupancy: 82, bookings: 72, forecasted: true },
  { name: "+2 Days", revenue: 4600, occupancy: 88, bookings: 75, forecasted: true },
  { name: "Weekend", revenue: 6200, occupancy: 94, bookings: 89, forecasted: true },
];

export function RevenueChart() {
  const chartConfig = {
    revenue: {
      label: "Revenue (₹)",
      theme: {
        light: "#16a34a",
        dark: "#4ade80",
      },
    },
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="text-lg font-medium mb-4">Monthly Revenue</h3>
        <div className="h-72">
          <ChartContainer config={chartConfig}>
            <AreaChart data={monthlyRevenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" />
              <YAxis 
                tickFormatter={(value) => `₹${value.toLocaleString()}`}
              />
              <Tooltip 
                formatter={(value: number) => [`₹${value.toLocaleString()}`, "Revenue"]}
              />
              <Legend />
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#16a34a"
                fillOpacity={1}
                fill="url(#revenueGradient)"
                strokeWidth={2}
                activeDot={{ r: 6 }}
                isAnimationActive={true}
              />
            </AreaChart>
          </ChartContainer>
        </div>
        <div className="mt-3 text-sm text-green-600 flex justify-end">
          <span>Revenue growth: +15.4% compared to last month</span>
        </div>
      </CardContent>
    </Card>
  );
}

export function OccupancyTrendChart() {
  const chartConfig = {
    occupancy: {
      label: "Occupancy (%)",
      theme: {
        light: "#2563eb",
        dark: "#3b82f6",
      },
    },
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="text-lg font-medium mb-4">Weekly Occupancy</h3>
        <div className="h-60">
          <ChartContainer config={chartConfig}>
            <BarChart 
              data={occupancyTrendsData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              barSize={30}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis 
                dataKey="name" 
                padding={{ left: 10, right: 10 }} 
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                tickFormatter={(value) => `${value}%`} 
                width={45}
                tick={{ fontSize: 12 }}
                domain={[0, 100]}
              />
              <Tooltip 
                formatter={(value: number) => [`${value}%`, "Occupancy"]}
                contentStyle={{ fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar 
                dataKey="occupancy" 
                name="Occupancy Rate"
                fill="#3b82f6" 
                radius={[4, 4, 0, 0]}
                animationDuration={1000}
              />
            </BarChart>
          </ChartContainer>
        </div>
        <div className="mt-4 pt-2 text-sm text-blue-600 border-t border-gray-100 flex justify-center">
          <div className="px-3 py-1 bg-blue-50 rounded-full">
            Peak occupancy on Fridays at 92%
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function VehicleTypesChart() {
  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="text-lg font-medium mb-4">Vehicle Distribution</h3>
        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={vehicleTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                animationDuration={1000}
              >
                {vehicleTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={VEHICLE_COLORS[index % VEHICLE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => [`${value}%`, "Percentage"]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function HourlyOccupancyChart() {
  const chartConfig = {
    occupancy: {
      label: "Occupancy (%)",
      theme: {
        light: "#8b5cf6",
        dark: "#a78bfa",
      },
    },
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="text-lg font-medium mb-4">Hourly Occupancy</h3>
        <div className="h-60">
          <ChartContainer config={chartConfig}>
            <LineChart data={hourlyOccupancyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="hour" />
              <YAxis tickFormatter={(value) => `${value}%`} />
              <Tooltip formatter={(value: number) => [`${value}%`, "Occupancy"]} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="occupancy" 
                stroke="#8b5cf6" 
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 6 }}
                animationDuration={1000}
              />
            </LineChart>
          </ChartContainer>
        </div>
        <div className="mt-2 text-sm text-purple-600">
          Peak time: 6-7 PM with 93% occupancy
        </div>
      </CardContent>
    </Card>
  );
}

export function BookingDurationChart() {
  const chartConfig = {
    count: {
      label: "Number of Bookings",
      theme: {
        light: "#f59e0b",
        dark: "#fbbf24",
      },
    },
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="text-lg font-medium mb-4">Booking Duration Distribution</h3>
        <div className="h-60">
          <ChartContainer config={chartConfig}>
            <BarChart data={bookingDurationData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar 
                dataKey="count" 
                fill="#f59e0b" 
                radius={[4, 4, 0, 0]} 
                animationDuration={1000}
              />
            </BarChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function ForecastMetricsChart() {
  const chartConfig = {
    occupancy: {
      label: "Occupancy (%)",
      theme: {
        light: "#3b82f6",
        dark: "#60a5fa",
      },
    },
    bookings: {
      label: "Bookings Count",
      theme: {
        light: "#f59e0b",
        dark: "#fbbf24",
      },
    },
  };

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardContent className="pt-6">
        <h3 className="text-lg font-medium mb-4">Forecasted Metrics (Next 3 Days)</h3>
        <div className="h-72">
          <ChartContainer config={chartConfig}>
            <BarChart data={forecastMetricsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" orientation="left" tickFormatter={(value) => `${value}%`} />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip formatter={(value: any, name: string) => {
                if (name === "occupancy") return [`${value}%`, "Occupancy"];
                if (name === "bookings") return [`${value}`, "Bookings"];
                return [value, name];
              }} />
              <Legend />
              <Bar
                yAxisId="left" 
                dataKey="occupancy" 
                fill="#3b82f6" 
                radius={[4, 4, 0, 0]}
                animationDuration={1000}
              />
              <Bar 
                yAxisId="right"
                dataKey="bookings" 
                fill="#f59e0b" 
                radius={[4, 4, 0, 0]} 
                animationDuration={1000}
              />
            </BarChart>
          </ChartContainer>
        </div>
        <div className="mt-3 text-sm text-gray-600 flex items-center justify-end font-medium">
          <span>Note: Data for future dates is forecasted based on historical patterns</span>
        </div>
      </CardContent>
    </Card>
  );
}
