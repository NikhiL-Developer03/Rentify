# Rentify - Car Rental System

A complete car rental management system built with Node.js, Express, SQL Server, and React.

## 🚗 Project Overview

Rentify is a comprehensive car rental platform that allows users to:
- Browse and search available cars by city, category, and price range
- Book cars with date-based availability checking
- Complete payments and download invoices
- View booking history and write reviews
- Admin features for user management, car inventory, maintenance tracking, and financial reporting

## 🛠️ Tech Stack

### Backend
- **Node.js** + **Express.js** - Server framework
- **SQL Server** - Database (using mssql package)
- **Multer** - File upload handling
- **bcrypt** - Password hashing and security
- **jsonwebtoken** - JWT authentication
- **dotenv** - Environment variables
- **ExcelJS** - Report generation

### Frontend
- **React 19** - Modern UI framework
- **Vite** - Fast build tool and dev server
- **React Router 7** - Client-side routing
- **Tailwind CSS** - Utility-first styling
- **Axios** - HTTP client
- **React Hook Form** - Form handling and validation
- **React Toastify** - Toast notifications
- **Lucide React** - Icon library
- **Radix UI** - Accessible UI primitives

## 📋 Prerequisites

Before running this project, make sure you have:

1. **Node.js** (v14 or higher)
2. **SQL Server** (Express/Developer edition or SQL Server LocalDB)
3. **npm** or **yarn** package manager

## 🚀 Quick Start

### 1. Clone and Setup

```bash
# Navigate to the project directory
cd Rentify

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies  
cd ../frontend
npm install
```

### 2. Environment Configuration

Create a `.env` file in the `backend` directory:

```env
# Database Configuration
DB_USER=your_sql_server_user
DB_PASSWORD=your_password
DB_SERVER=localhost
DB_DATABASE=Rentify
DB_PORT=1433

# JWT Configuration
JWT_SECRET=your_jwt_secret_key

# Server Configuration
PORT=3000
NODE_ENV=development
```

Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:3000/api
```

### 3. Database Setup

1. **Create Database**: Create a new database named `Rentify` in SQL Server
2. **Execute SQL Script**: Run the `Rentify_database_schema.sql` script in SQL Server Management Studio or via command line

### 4. Start the Application

1. **Start Backend Server**:
   ```bash
   cd backend
   npm run dev
   ```

2. **Start Frontend Development Server**:
   ```bash
   cd frontend
   npm run dev
   ```

3. **Access the Application**:
   - Frontend: http://localhost:5173/
   - Backend API: http://localhost:3000/

### 5. Test the Setup

The health check endpoint will show if the API is running properly:
- **API Health Check**: http://localhost:3000/

## 📊 Database Schema

The system includes the following tables:

### Core Tables
- `Users` - Customer and admin accounts with role and activation status
- `Cars` - Complete vehicle inventory with specifications and availability
- `CarImages` - Multiple images per car with file paths
- `Bookings` - Rental bookings with status tracking
- `Invoices` - Billing records linked to bookings
- `Payments` - Payment transactions and methods
- `Locations` - Cities and pickup/dropoff points

### Additional Tables
- `Reviews` - Customer feedback and ratings
- `MaintenanceHistory` - Vehicle service records and repairs
- `ActivityLog` - System activity tracking

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get current user profile
- `PUT /api/auth/profile` - Update user profile

### Cars
- `GET /api/cars` - List available cars with filtering
- `GET /api/cars/:id` - Get car details with images
- `GET /api/cars/search` - Search cars with advanced filtering

### Bookings
- `POST /api/bookings` - Create a new booking
- `GET /api/bookings` - List user's bookings
- `GET /api/bookings/:id` - Get booking details
- `PUT /api/bookings/:id/cancel` - Cancel a booking

### Admin
- `GET /api/admin/users` - List all users
- `PUT /api/admin/users/:id/activate` - Activate a user
- `PUT /api/admin/users/:id/deactivate` - Deactivate a user
- `GET /api/admin/cars` - Manage car inventory
- `POST /api/admin/cars` - Add new car (with image upload)
- `GET /api/admin/bookings` - View all bookings
- `GET /api/admin/reports/bookings` - Generate booking reports
- `GET /api/admin/reports/revenue` - Generate revenue reports
- `GET /api/admin/dashboard/stats` - Get dashboard statistics

### Additional Endpoints
- `GET /api/locations` - List available locations
- `POST /api/reviews` - Submit a review
- `GET /api/invoices/:id` - Get invoice details
- `POST /api/payments` - Process a payment

## 🌟 Key Features

### User Features
- **Account Management**: Registration, login, profile updates
- **Car Browsing**: Search by location, category, price range with image gallery
- **Booking System**: Date-based availability, instant confirmation
- **Payment Processing**: Secure payment handling with invoice generation
- **Booking Management**: View, cancel, and track booking status
- **Review System**: Rate and review rental experiences

### Admin Features
- **Dashboard**: Key performance metrics and statistics
- **User Management**: View all users, activate/deactivate accounts
- **Car Management**: Add, edit, delete cars with image uploads
- **Booking Oversight**: Monitor and update booking statuses
- **Maintenance Tracking**: Log and track vehicle maintenance history
- **Reports**: Generate booking and revenue reports with Excel export

### Technical Features
- **Protected Routes**: Authentication and role-based access control
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS
- **Form Validation**: Client and server-side validation
- **Error Handling**: Consistent error responses with appropriate status codes
- **File Management**: Image upload, storage, and serving
- **API Architecture**: RESTful endpoints with proper resource organization

## 📁 Project Structure

```
Rentify/
├── backend/
│   ├── config/
│   │   └── db.js              # Database connection
│   ├── controllers/
│   │   ├── adminController.js  # Admin operations
│   │   ├── authController.js   # Authentication
│   │   ├── bookingController.js # Booking management
│   │   ├── carController.js    # Car operations
│   │   ├── invoiceController.js # Invoice handling
│   │   ├── paymentController.js # Payment processing
│   │   └── reviewController.js  # User reviews
│   ├── middleware/
│   │   ├── auth.js            # Authentication middleware
│   │   └── multer.js          # File upload configuration
│   ├── models/
│   │   ├── Booking.js         # Booking operations
│   │   ├── Car.js             # Car operations
│   │   ├── CarImage.js        # Car image handling
│   │   ├── Invoice.js         # Invoice operations
│   │   ├── Location.js        # Location operations
│   │   ├── MaintenanceHistory.js # Maintenance records
│   │   ├── Payment.js         # Payment operations
│   │   ├── Review.js          # Review operations
│   │   └── User.js            # User operations
│   ├── routers/
│   │   ├── adminRoutes.js     # Admin endpoints
│   │   ├── authRoutes.js      # Authentication endpoints
│   │   ├── bookingRoutes.js   # Booking endpoints
│   │   ├── carRoutes.js       # Car endpoints
│   │   ├── invoiceRoutes.js   # Invoice endpoints
│   │   ├── locationRoutes.js  # Location endpoints
│   │   ├── paymentRoutes.js   # Payment endpoints
│   │   ├── reviewRoutes.js    # Review endpoints
│   │   └── userRoutes.js      # User endpoints
│   ├── uploads/
│   │   ├── cars/              # Car images
│   │   └── invoices/          # Invoice PDFs
│   ├── utils/
│   │   └── jwt.js             # JWT utilities
│   ├── .env                   # Environment variables
│   ├── index.js               # Main server file
│   ├── Rentify_API_Collection.json # Postman collection
│   ├── Rentify_database_schema.sql # Database schema
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── CarCard.jsx      # Car display component
│   │   │   ├── CarSearchForm.jsx # Search interface
│   │   │   ├── ProtectedRoute.jsx # Auth protection
│   │   │   ├── admin/           # Admin components
│   │   │   ├── layout/          # Layout components
│   │   │   └── ui/              # UI components
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx  # Authentication state
│   │   ├── lib/
│   │   │   └── utils.js         # Utility functions
│   │   ├── pages/
│   │   │   ├── Home.jsx         # Homepage
│   │   │   ├── Cars.jsx         # Car listing
│   │   │   ├── CarDetail.jsx    # Car details
│   │   │   ├── Booking.jsx      # Booking page
│   │   │   ├── AdminDashboard.jsx # Admin dashboard
│   │   │   └── ...              # Other page components
│   │   ├── services/
│   │   │   ├── api.js           # Base API client
│   │   │   ├── authService.js   # Auth operations
│   │   │   ├── carService.js    # Car operations
│   │   │   └── ...              # Other services
│   │   ├── styles/
│   │   │   └── index.css        # Global styles
│   │   ├── utils/
│   │   │   └── dateValidation.js # Validation helpers
│   │   ├── App.jsx             # Root component
│   │   └── main.jsx            # Entry point
│   ├── .env                    # Environment variables
│   ├── vite.config.js          # Vite configuration
│   └── package.json
├── docs/
│   └── presentation/           # Presentation materials
└── README.md
```

## 🧪 Testing Database Connection

1. **Start the server**:
   ```bash
   cd backend
   npm run dev
   ```

2. **Test endpoints**:
   ```bash
   # Test basic connection
   curl http://localhost:3000/api/test-db

   # Initialize database (first time only)
   curl -X POST http://localhost:3000/api/init-db

   # Check database summary
   curl http://localhost:3000/api/db-summary
   ```

## 📝 Development Status

### Phase 1: Database & Core Setup ✅
- [x] SQL Server connection and configuration
- [x] Database schema creation with relationships
- [x] User model with authentication support
- [x] File upload configuration with Multer
- [x] Basic API structure and error handling

### Phase 2: Authentication System ✅
- [x] User registration and login
- [x] JWT token implementation
- [x] Password hashing with bcrypt
- [x] Admin role management
- [x] User activation/deactivation system

### Phase 3: Car Management ✅
- [x] Car CRUD operations
- [x] Image upload for cars
- [x] Car search and filtering
- [x] Availability checking

### Phase 4: Booking System ✅
- [x] Booking creation and management
- [x] Date validation and overlap prevention
- [x] Invoice generation
- [x] Payment tracking

### Phase 5: Frontend Development ✅
- [x] React components for all features
- [x] Responsive design with Tailwind
- [x] Admin dashboard with statistics
- [x] User booking interface
- [x] Protected routes and authentication flow

### Phase 6: Enhancements & Future Features ⏳
- [ ] Mobile app development
- [ ] Driver booking option
- [ ] Loyalty program implementation
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Integration with external payment gateways

## 🔧 File Upload Features

The system supports file uploads using Multer:

### Car Images
- **Location**: `/uploads/cars/`
- **Formats**: JPEG, JPG, PNG, GIF, WebP
- **Size Limit**: 5MB per image
- **Multiple**: Up to 5 images per car

### Maintenance Photos
- **Location**: `/uploads/maintenance/`
- **Formats**: JPEG, JPG, PNG, GIF, WebP
- **Size Limit**: 10MB per image
- **Purpose**: Damage reports, repair documentation

### Accessing Uploaded Files
Files are served statically at: `http://localhost:3000/uploads/[category]/[filename]`

## 🛡️ Security Features

- JWT-based authentication with expiration
- Password hashing with bcrypt (10 salt rounds)
- Role-based access control (user/admin)
- Account activation/deactivation capability
- SQL injection prevention using parameterized queries
- File upload validation (type, size, extension)
- Token verification middleware
- Environment variable protection
- Proper error handling with sanitized messages in production

## 🐛 Troubleshooting

### Database Connection Issues
1. Verify SQL Server is running
2. Check database exists (`Rentify`)
3. Verify credentials in `.env` file
4. Ensure SQL Server allows TCP/IP connections

### Module Not Found Errors
```bash
# Reinstall dependencies
cd backend
npm install
```

### Port Already in Use
```bash
# Change PORT in .env file or kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <process_id> /F
```

## � Presentation Materials

A complete presentation deck for this project is available in the `docs/presentation` directory:

- `Rentify_Presentation_Deck.md` - Full slide content with speaker notes
- `Outline.txt` - Quick slide list for reference
- `README.md` - Instructions for creating the presentation

The presentation covers:
- Project overview and objectives
- System architecture and database design
- Key features for users and admins
- Technical implementation highlights
- Security measures and best practices

## �📞 Support

For questions or issues:
1. Check the troubleshooting section above
2. Verify all prerequisites are installed
3. Ensure environment variables are correctly set
4. Test database connection using the provided endpoints

## 📄 License

This project is licensed under the MIT License.