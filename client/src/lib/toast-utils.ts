import { toast } from "@/hooks/use-toast";

// Helper functions for toast
export const showToast = {
  success: (message: string) => {
    toast({
      title: "Success",
      description: message,
      variant: "default", // Use the default variant which is the success style
    });
  },
  error: (message: string) => {
    toast({
      title: "Error",
      description: message,
      variant: "destructive",
    });
  },
  info: (message: string) => {
    toast({
      title: "Info",
      description: message,
    });
  },
  warning: (message: string) => {
    toast({
      title: "Warning",
      description: message,
      variant: "destructive",
    });
  }
};
