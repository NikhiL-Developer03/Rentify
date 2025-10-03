# Rentify Frontend Documentation

## Project Overview
Rentify is a modern car rental management system built with React and Vite. The frontend provides a responsive user interface for both customers and administrators to manage car bookings, user profiles, and administrative tasks.

## Tech Stack

- **Framework**: React 19
- **Build Tool**: Vite 7
- **Routing**: React Router DOM 7
- **Styling**: Tailwind CSS 4
- **UI Components**: Custom components using shadcn/ui patterns
- **Form Handling**: React Hook Form with Zod validation
- **HTTP Client**: Axios
- **State Management**: React Context API
- **Notifications**: React Toastify
- **Icons**: Lucide React

## Project Structure

```
frontend/
│── public/                 # Static files (favicon, logo, etc.)
│── src/
│   │── assets/             # Images and static assets
│   │   │── image 23.png
│   │   │── image 35.png
│   │   │── react.svg
│   │
│   │── components/         # Reusable UI components
│   │   │── CarCard.jsx     # Car display card component
│   │   │── CarSearchForm.jsx  # Search form for filtering cars
│   │   │── ProtectedRoute.jsx # Auth guard for protected routes
│   │   │
│   │   │── admin/         # Admin-specific components
│   │   │   │── AdminReports.jsx
│   │   │   │── BookingManagement.jsx
│   │   │   │── CarManagement.jsx
│   │   │   │── InvoiceManagement.jsx
│   │   │   │── MaintenanceLogs.jsx
│   │   │   │── UserManagement.jsx
│   │   │
│   │   │── layout/        # Layout components
│   │   │   │── Footer.jsx
│   │   │   │── Header.jsx
│   │   │   │── Layout.jsx
│   │   │
│   │   │── ui/            # Base UI components (shadcn/ui)
│   │       │── avatar.jsx
│   │       │── badge.jsx
│   │       │── button.jsx
│   │       │── card.jsx
│   │       │── form.jsx
│   │       │── input.jsx
│   │       │── label.jsx
│   │       │── select.jsx
│   │       │── separator.jsx
│   │
│   │── contexts/          # React Context providers
│   │   │── AuthContext.jsx # Authentication & user state management
│   │
│   │── lib/               # Library utilities
│   │   │── utils.js       # General utility functions
│   │
│   │── pages/             # Route-based page components
│   │   │── About.jsx      # About page
│   │   │── AdminDashboard.jsx # Admin dashboard
│   │   │── Booking.jsx    # Booking process page
│   │   │── BookingConfirmation.jsx # Booking confirmation
│   │   │── CarDetail.jsx  # Car details page
│   │   │── Cars.jsx       # Car listing page
│   │   │── Contact.jsx    # Contact page
│   │   │── Home.jsx       # Home/landing page
│   │   │── Login.jsx      # User login
│   │   │── Profile.jsx    # User profile management
│   │   │── Register.jsx   # User registration
│   │   │── UserBookings.jsx # User booking history
│   │
│   │── services/          # API service calls
│   │   │── adminService.js # Admin-related API calls
│   │   │── api.js         # Axios instance & interceptors
│   │   │── authService.js # Authentication API calls
│   │   │── bookingService.js # Booking-related API calls
│   │   │── carService.js  # Car-related API calls
│   │   │── invoiceService.js # Invoice-related API calls
│   │   │── locationService.js # Location-related API calls
│   │   │── maintenanceService.js # Maintenance-related API calls
│   │   │── userService.js # User-related API calls
│   │
│   │── styles/            # Global styles
│   │   │── index.css      # Global CSS including Tailwind
│   │
│   │── utils/             # Helper functions
│   │   │── dateUtils.js   # Date formatting utilities
│   │   │── dateValidation.js # Date validation utilities
│   │   │── events.js      # Event bus for component communication
│   │
│   │── App.jsx            # Main application component & routing
│   │── main.jsx           # Entry point
│
│── .env                   # Environment variables
│── .gitignore             # Git ignore file
│── components.json        # shadcn/ui configuration
│── eslint.config.js       # ESLint configuration
│── index.html             # HTML template
│── jsconfig.json          # JavaScript configuration (for imports)
│── package.json           # Dependencies and scripts
│── README.md              # Project documentation
│── vite.config.js         # Vite configuration
```

## Key Features

1. **Authentication System**
   - User registration and login
   - JWT-based authentication
   - Protected routes
   - Role-based access (Admin vs Regular users)

2. **Car Search & Booking**
   - Advanced filtering (location, dates, car type)
   - Car details with image gallery
   - Booking process with date selection
   - Booking history

3. **User Dashboard**
   - Profile management
   - Booking history
   - Personal information editing

4. **Admin Dashboard**
   - Car management (add, edit, delete)
   - User management
   - Booking oversight
   - Maintenance logs
   - Invoice management
   - Reports with exports

5. **Responsive Design**
   - Mobile-first approach
   - Adaptive layouts for all screen sizes

## Routing Structure

- `/` - Home page with featured cars
- `/about` - About the company
- `/contact` - Contact form
- `/login` - User login
- `/register` - User registration
- `/cars` - Car listing page with filters
- `/cars/:id` - Car details page
- `/booking` - Booking process
- `/profile` - User profile management
- `/bookings` - User's booking history
- `/admin` - Admin dashboard (protected)
  - `/admin/cars` - Car management
  - `/admin/users` - User management
  - `/admin/bookings` - Booking management
  - `/admin/maintenance` - Maintenance logs
  - `/admin/invoices` - Invoice management
  - `/admin/reports` - Reports and analytics

## State Management

The application uses React Context API for state management:

- **AuthContext** - Manages user authentication state, login/logout, and user data
- **Event Bus** - Simple event system for cross-component communication

## API Integration

All API calls are encapsulated in service modules:

- **api.js** - Core Axios instance with interceptors for authentication
- **authService.js** - Authentication API calls
- **carService.js** - Car-related API calls
- **bookingService.js** - Booking-related API calls
- etc.

## UI Component Library

The UI is built using custom components following shadcn/ui patterns:
- Not using the full shadcn/ui library, but implementing its design patterns
- Uses Tailwind CSS for styling
- Component customization through Tailwind classes

## Development

### Getting Started
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Environment Variables
Create a `.env` file in the root directory with:
```
VITE_API_URL=http://localhost:3000 # Backend API URL
```

## Known Issues / TODOs

- Booking flow needs complete implementation (form submission)
- Email notification system integration needed
- Add WebSocket for real-time updates
- Mobile app development planned for future release
