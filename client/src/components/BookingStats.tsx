import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { DashboardStats } from "@/lib/types";
import { LayoutGrid, Car, CheckCircle, DollarSign } from "lucide-react";

interface BookingStatsProps {
  stats: DashboardStats;
}

export function BookingStats({ stats }: BookingStatsProps) {
  const occupancyRate = stats.totalSlots > 0 ? Math.round((stats.occupiedSlots / stats.totalSlots) * 100) : 0;

  const statCards = [
    {
      title: "Total Slots",
      value: stats.totalSlots,
      icon: LayoutGrid,
      bgColor: "bg-blue-100",
      iconColor: "text-primary",
    },
    {
      title: "Occupied",
      value: stats.occupiedSlots,
      icon: Car,
      bgColor: "bg-red-100",
      iconColor: "text-red-500",
      badge: `${occupancyRate}% Full`,
      badgeColor: "bg-red-100 text-red-800",
    },
    {
      title: "Available",
      value: stats.availableSlots,
      icon: CheckCircle,
      bgColor: "bg-green-100",
      iconColor: "text-green-500",
    },
    {
      title: "Revenue Today",
      value: `$${stats.revenue.toLocaleString()}`,
      icon: DollarSign,
      bgColor: "bg-yellow-100",
      iconColor: "text-yellow-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {statCards.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <Card className="hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">{stat.title}</p>
                  <motion.p
                    className="text-3xl font-bold text-gray-800"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 + index * 0.1, type: "spring", stiffness: 200 }}
                  >
                    {stat.value}
                  </motion.p>
                </div>
                <motion.div
                  className={`${stat.bgColor} p-3 rounded-full`}
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <stat.icon className={`${stat.iconColor} text-xl`} />
                </motion.div>
              </div>
              {stat.badge && (
                <div className="mt-2">
                  <motion.span
                    className={`text-xs ${stat.badgeColor} px-2 py-1 rounded-full`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    {stat.badge}
                  </motion.span>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
