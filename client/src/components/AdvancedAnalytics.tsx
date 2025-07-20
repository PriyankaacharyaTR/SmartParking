import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { 
  ChevronDown, ChevronUp, Clock, Calendar, 
  AlertCircle, RefreshCw, BarChart3 
} from "lucide-react";

// Sample data
const vehicleBreakdown = [
  { name: 'Car', value: 62, color: '#3b82f6' },
  { name: 'EV', value: 15, color: '#10b981' },
  { name: 'SUV', value: 12, color: '#f59e0b' },
  { name: 'Bike', value: 8, color: '#ef4444' },
  { name: 'Truck', value: 3, color: '#8b5cf6' },
];

const timeDistribution = [
  { name: 'Morning (6AM - 12PM)', value: 32 },
  { name: 'Afternoon (12PM - 5PM)', value: 28 },
  { name: 'Evening (5PM - 9PM)', value: 30 },
  { name: 'Night (9PM - 6AM)', value: 10 },
];

const weekdayData = [
  { name: 'Monday', count: 145 },
  { name: 'Tuesday', count: 156 },
  { name: 'Wednesday', count: 162 },
  { name: 'Thursday', count: 178 },
  { name: 'Friday', count: 210 },
  { name: 'Saturday', count: 187 },
  { name: 'Sunday', count: 148 },
];

const durationBreakdown = [
  { name: '< 1 hour', count: 120, color: '#a8a29e' },
  { name: '1-2 hours', count: 245, color: '#d6d3d1' },
  { name: '2-4 hours', count: 178, color: '#a1a1aa' },
  { name: '4-8 hours', count: 85, color: '#71717a' },
  { name: '8+ hours', count: 42, color: '#52525b' },
];

export function AdvancedAnalytics() {
  const [activeTab, setActiveTab] = useState('vehicles');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    
    // Simulate data refresh
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1500);
  };

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader className="pb-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium flex items-center">
            <BarChart3 className="mr-2 h-5 w-5" />
            Advanced Breakdown Analysis
          </CardTitle>
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className={`text-gray-500 ${isRefreshing ? 'animate-spin' : ''}`}
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-gray-500"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="vehicles" className="text-xs">
              Vehicle Types
            </TabsTrigger>
            <TabsTrigger value="times" className="text-xs">
              Time Distribution
            </TabsTrigger>
            <TabsTrigger value="weekdays" className="text-xs">
              Weekday Analysis
            </TabsTrigger>
            <TabsTrigger value="duration" className="text-xs">
              Duration Analysis
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="vehicles">
            <div className={`h-${isExpanded ? '96' : '64'}`}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={vehicleBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={isExpanded ? 130 : 80}
                    fill="#8884d8"
                    dataKey="value"
                    animationDuration={1000}
                  >
                    {vehicleBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`${value}%`, "Percentage"]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {isExpanded && (
              <div className="mt-4 grid grid-cols-5 gap-2">
                {vehicleBreakdown.map((item) => (
                  <Card key={item.name} className="px-3 py-2 bg-gray-50">
                    <div className="text-xs font-medium">{item.name}</div>
                    <div className="text-lg font-bold">{item.value}%</div>
                    <div 
                      className="h-1 mt-1 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    ></div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="times">
            <div className={`h-${isExpanded ? '96' : '64'}`}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={timeDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `${value}%`} />
                  <Tooltip formatter={(value: number) => [`${value}%`, "Percentage"]} />
                  <Legend />
                  <Bar 
                    dataKey="value" 
                    fill="#8b5cf6" 
                    radius={[4, 4, 0, 0]}
                    animationDuration={1000}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {isExpanded && (
              <div className="mt-4 grid grid-cols-1 gap-3">
                <div className="flex items-center p-3 bg-purple-50 border border-purple-100 rounded-lg">
                  <Clock className="h-5 w-5 text-purple-600 mr-3" />
                  <div>
                    <h4 className="font-medium text-purple-900">Peak Hours</h4>
                    <p className="text-sm text-purple-700 mt-1">
                      The highest occupancy rates are observed between 5-7PM, with an average of 93% occupancy.
                      Consider implementing surge pricing during these peak hours to optimize revenue.
                    </p>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-amber-50 border border-amber-100 rounded-lg">
                  <Calendar className="h-5 w-5 text-amber-600 mr-3" />
                  <div>
                    <h4 className="font-medium text-amber-900">Off-Peak Opportunity</h4>
                    <p className="text-sm text-amber-700 mt-1">
                      Night time (9PM-6AM) shows only 10% utilization. Consider implementing night passes or 
                      special overnight rates to increase utilization during these hours.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="weekdays">
            <div className={`h-${isExpanded ? '96' : '64'}`}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weekdayData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => [`${value}`, "Bookings"]} />
                  <Legend />
                  <Bar 
                    dataKey="count" 
                    fill="#3b82f6" 
                    radius={[4, 4, 0, 0]}
                    animationDuration={1000}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {isExpanded && (
              <div className="mt-4">
                <div className="flex items-center p-3 bg-blue-50 border border-blue-100 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-blue-600 mr-3" />
                  <div>
                    <h4 className="font-medium text-blue-900">Weekly Patterns</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Friday has the highest booking volume (210 bookings), which is 44.8% higher than Sunday (148 bookings).
                      This pattern suggests implementing dynamic pricing to maximize revenue on high-demand days and 
                      special offers during weekdays to balance utilization.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="duration">
            <div className={`h-${isExpanded ? '96' : '64'}`}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={durationBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => [`${value}`, "Bookings"]} />
                  <Legend />
                  <Bar 
                    dataKey="count" 
                    radius={[4, 4, 0, 0]}
                    animationDuration={1000}
                  >
                    {durationBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            {isExpanded && (
              <div className="mt-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Duration</th>
                      <th className="text-right py-2">Count</th>
                      <th className="text-right py-2">% of Total</th>
                      <th className="text-right py-2">Avg. Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2">&lt; 1 hour</td>
                      <td className="text-right">120</td>
                      <td className="text-right">17.9%</td>
                      <td className="text-right">₹45</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2">1-2 hours</td>
                      <td className="text-right">245</td>
                      <td className="text-right">36.6%</td>
                      <td className="text-right">₹90</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2">2-4 hours</td>
                      <td className="text-right">178</td>
                      <td className="text-right">26.6%</td>
                      <td className="text-right">₹170</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2">4-8 hours</td>
                      <td className="text-right">85</td>
                      <td className="text-right">12.7%</td>
                      <td className="text-right">₹310</td>
                    </tr>
                    <tr>
                      <td className="py-2">8+ hours</td>
                      <td className="text-right">42</td>
                      <td className="text-right">6.2%</td>
                      <td className="text-right">₹450</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
