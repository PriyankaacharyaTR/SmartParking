# Smart Parking System

## Overview
This is a full-stack smart parking management system built with React (frontend), Express.js (backend), and PostgreSQL database. The system provides QR code generation for parking zones, real-time slot booking, and an admin dashboard for monitoring parking operations. It features real-time updates via WebSocket connections and integrates with Twilio for WhatsApp notifications.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack React Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: Radix UI primitives with custom styling
- **Animations**: Framer Motion for smooth animations and transitions

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Real-time Communication**: WebSocket server for live updates
- **Session Management**: PostgreSQL session storage
- **Build Process**: ESBuild for server bundling

## Key Components

### Database Schema
The system uses PostgreSQL with the following main entities:
- **Sessions**: Stores user session data for authentication
- **Users**: User profiles with role-based access (user/admin)
- **Parking Slots**: Physical parking spaces with location, type, and occupancy status
- **Bookings**: Reservation records linking users to parking slots
- **QR Codes**: Generated codes for zone-based booking access

### API Structure
RESTful API endpoints organized by functionality:
- `/api/qr/*` - QR code generation and management
- `/api/slots/*` - Parking slot operations and availability
- `/api/bookings/*` - Booking creation, updates, and checkout
- WebSocket endpoint `/ws` for real-time dashboard updates

### Real-time Features
- **WebSocket Integration**: Live parking grid updates and dashboard statistics
- **Slot Allocation**: Multiple algorithms (BFS, DFS) for optimal slot assignment
- **Status Broadcasting**: Real-time occupancy and booking status updates

## Data Flow

1. **QR Code Generation**: Admin generates QR codes for specific zones/floors
2. **User Booking**: Users scan QR codes to access booking forms with pre-filled location data
3. **Slot Allocation**: System automatically assigns optimal parking slots based on vehicle type and availability
4. **Real-time Updates**: Dashboard receives live updates via WebSocket connections
5. **Notification System**: Twilio integration sends WhatsApp confirmations to users
6. **Checkout Process**: Admin can process checkouts and free up parking slots

## External Dependencies

### Core Dependencies
- **Database**: Neon serverless PostgreSQL for cloud database hosting
- **UI Framework**: Radix UI components for accessible interface elements
- **Validation**: Zod for runtime type checking and form validation
- **HTTP Client**: Native fetch API with custom wrapper for API requests

### Optional Integrations
- **Twilio**: WhatsApp messaging service for booking confirmations (optional)
- **QR Code Generation**: qrcode library for generating scannable codes
- **Session Storage**: connect-pg-simple for PostgreSQL session management

### Development Tools
- **TypeScript**: Static type checking across the entire stack
- **ESLint/Prettier**: Code formatting and linting (configuration pending)
- **Drizzle Kit**: Database migration and schema management tools

## Deployment Strategy

### Development Environment
- **Replit Configuration**: Integrated development environment with live reload
- **Hot Module Replacement**: Vite HMR for instant frontend updates
- **Development Server**: Express server with Vite middleware integration
- **Port Configuration**: Frontend and backend served on port 5000

### Production Build
- **Frontend Build**: Vite bundles React app to static assets in `dist/public`
- **Backend Build**: ESBuild compiles TypeScript server to `dist/index.js`
- **Static Serving**: Express serves frontend build in production mode
- **Database Migrations**: Drizzle handles schema updates and migrations

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string (required)
- `TWILIO_ACCOUNT_SID`: Twilio account identifier (optional)
- `TWILIO_AUTH_TOKEN`: Twilio authentication token (optional)
- `TWILIO_WHATSAPP_NUMBER`: WhatsApp business number (optional)

## Changelog
- June 26, 2025. Initial setup
- June 26, 2025. Updated parking grid colors to white (empty), green (available), red (occupied)
- June 26, 2025. Fixed WhatsApp message to remove logout button reference

## User Preferences
Preferred communication style: Simple, everyday language.
Preferred parking grid colors: White for empty slots, green for available, red for occupied.