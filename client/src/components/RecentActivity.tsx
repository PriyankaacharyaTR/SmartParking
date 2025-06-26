import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { RecentActivity as Activity } from "@/lib/types";
import { LogIn, LogOut, MessageCircle, User } from "lucide-react";

interface RecentActivityProps {
  activities: Activity[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "check-in":
        return LogIn;
      case "check-out":
        return LogOut;
      case "whatsapp":
        return MessageCircle;
      default:
        return User;
    }
  };

  const getActivityIconColor = (type: string) => {
    switch (type) {
      case "check-in":
        return "text-green-600 bg-green-100";
      case "check-out":
        return "text-red-600 bg-red-100";
      case "whatsapp":
        return "text-blue-600 bg-blue-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} days ago`;
  };

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h3>
        
        {activities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <User className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>No recent activity</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.slice(0, 10).map((activity, index) => {
              const IconComponent = getActivityIcon(activity.type);
              const iconColorClass = getActivityIconColor(activity.type);
              
              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <motion.div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${iconColorClass}`}
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <IconComponent className="text-sm" />
                  </motion.div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{activity.description}</p>
                    <p className="text-xs text-gray-500">{formatTimeAgo(activity.timestamp)}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
