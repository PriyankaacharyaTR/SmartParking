import { createContext, useContext, useState, ReactNode, useEffect } from "react";

// Define the user type based on booking form data
export interface User {
  id: string;
  userName: string;
  phoneNumber: string;
  licensePlate: string;
  vehicleType: string;
  lastBooking: string;
  status: "Active" | "Pending";
  role: "User" | "Admin";
}

interface UsersContextType {
  users: User[];
  addUser: (userData: Omit<User, "id" | "status" | "role" | "lastBooking">) => void;
  updateUserStatus: (userId: string, status: User["status"]) => void;
  updateUserRole: (userId: string, role: User["role"]) => void;
}

// Create the context with a default value
const UsersContext = createContext<UsersContextType | undefined>(undefined);

// Initial sample users
const initialUsers: User[] = [
  {
    id: "U1001",
    userName: "John Smith",
    phoneNumber: "555-123-4567",
    licensePlate: "ABC123",
    vehicleType: "car",
    lastBooking: "2025-06-26",
    status: "Active",
    role: "Admin"
  },
  {
    id: "U1002",
    userName: "Sarah Johnson",
    phoneNumber: "555-987-6543",
    licensePlate: "XYZ789",
    vehicleType: "suv",
    lastBooking: "2025-06-25",
    status: "Active",
    role: "User"
  },
  {
    id: "U1003",
    userName: "Michael Brown",
    phoneNumber: "555-456-7890",
    licensePlate: "DEF456",
    vehicleType: "ev",
    lastBooking: "2025-06-24",
    status: "Pending",
    role: "User"
  }
];

// Create a provider component
export function UsersProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  
  // Load users from localStorage on component mount
  useEffect(() => {
    const storedUsers = localStorage.getItem('sps_users');
    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    } else {
      // If no users in localStorage, use initial sample users
      setUsers(initialUsers);
      localStorage.setItem('sps_users', JSON.stringify(initialUsers));
    }
  }, []);

  // Save users to localStorage whenever they change
  useEffect(() => {
    if (users.length > 0) {
      localStorage.setItem('sps_users', JSON.stringify(users));
    }
  }, [users]);

  // Add a new user
  const addUser = (userData: Omit<User, "id" | "status" | "role" | "lastBooking">) => {
    const newUser: User = {
      ...userData,
      id: `U${1000 + users.length + 1}`, // Generate a simple ID
      lastBooking: new Date().toISOString().split('T')[0], // Today's date as YYYY-MM-DD
      status: "Active",
      role: "User"
    };
    
    // Check if user with the same phone number already exists
    const existingUser = users.find(user => user.phoneNumber === userData.phoneNumber);
    
    if (existingUser) {
      // Update existing user with new booking info
      const updatedUsers = users.map(user => 
        user.phoneNumber === userData.phoneNumber 
          ? { 
              ...user, 
              licensePlate: userData.licensePlate, 
              vehicleType: userData.vehicleType,
              lastBooking: newUser.lastBooking 
            } 
          : user
      );
      setUsers(updatedUsers);
    } else {
      // Add new user
      setUsers(prevUsers => [...prevUsers, newUser]);
    }
  };

  // Update a user's status
  const updateUserStatus = (userId: string, status: User["status"]) => {
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.id === userId ? { ...user, status } : user
      )
    );
  };

  // Update a user's role
  const updateUserRole = (userId: string, role: User["role"]) => {
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.id === userId ? { ...user, role } : user
      )
    );
  };

  return (
    <UsersContext.Provider value={{ users, addUser, updateUserStatus, updateUserRole }}>
      {children}
    </UsersContext.Provider>
  );
}

// Custom hook to use the users context
export function useUsers() {
  const context = useContext(UsersContext);
  if (context === undefined) {
    throw new Error("useUsers must be used within a UsersProvider");
  }
  return context;
}
