 # Rentify - Car Rental System

A modern car rental management system built with Node.js, Express, SQL Server, and React.

## 🚗 Project Overview

Rentify provides a complete solution for car rental businesses:
- Browse and search cars by location, category, and price
- Book vehicles with availability checking
- Process payments and generate invoices
- View booking history and write reviews
- Admin dashboard for fleet and user management

## 🛠️ Tech Stack

**Backend:** Node.js, Express.js, SQL Server, JWT, bcrypt, Multer, ExcelJS, puppeteer (PDF generation)

**Frontend:** React 19, Vite, React Router 7, Tailwind CSS, React Hook Form

## 📋 Prerequisites

- **Node.js** (v14+)
- **SQL Server** (Express/Developer edition)
- **npm** or **yarn**

## 🚀 Quick Start

### 1. Setup
```bash
# Install dependencies
cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure Environment
Create `.env` files in both directories:

**Backend `.env`**:
```env
DB_USER=your_sql_user
DB_PASSWORD=your_password
DB_SERVER=localhost
DB_DATABASE=Rentify
DB_PORT=1433
JWT_SECRET=your_jwt_secret_key
PORT=3000
```

**Frontend `.env`**:
```env
VITE_API_URL=http://localhost:3000/api
```

### 3. Setup Database
- Create database named `Rentify` in SQL Server
- Run `Rentify_database_schema.sql` script

### 4. Run Application
```bash
# Backend (http://localhost:3000)
cd backend && npm run dev

# Frontend (http://localhost:5173)
cd frontend && npm run dev
```

## 📊 Database Schema

The database includes the following key tables:
- `Users` - Customer/admin accounts with authentication
- `Cars` - Vehicle inventory with availability status
- `Bookings` - Rental records with date tracking
- `Invoices` - Payment documentation and PDF storage
- `Reviews`, `CarImages`, `Locations`, `Payments`, `MaintenanceHistory`

## 🔧 API Endpoints

The API follows RESTful principles with these main endpoint groups:

- **Auth**: `/api/auth/*` - Registration, login, profile management
- **Cars**: `/api/cars/*` - Browse, search, and filter available vehicles
- **Bookings**: `/api/bookings/*` - Create and manage reservations
- **Admin**: `/api/admin/*` - User management, reports, dashboard
- **Supporting**: Locations, reviews, invoices, payments

Full API documentation available in the Postman collection: `Rentify_API_Collection.json`

## 🌟 Key Features

**Customer Features:**
- Account management and authentication
- Car search with filters (location, price, type)
- Booking system with availability checking
- Payment processing and invoice downloads
- Review submission for past rentals

**Admin Features:**
- Analytics dashboard with KPIs
- Complete fleet management
- User account administration
- Booking oversight and reporting
- Excel report generation

## 📁 Project Structure

```
Rentify/
├── backend/              # Node.js & Express API server
│   ├── config/           # Configuration files
│   ├── controllers/      # Request handlers
│   ├── middleware/       # Authentication & uploads
│   ├── models/           # Data models
│   ├── routers/          # API endpoints
│   ├── uploads/          # Stored files (images, PDFs)
│   ├── utils/            # Utility functions
│   ├── .env              # Environment variables
│   ├── index.js          # Entry point
│   └── Rentify_database_schema.sql # SQL schema
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
└── frontend/             # React SPA
    ├── src/
    │   ├── components/     # UI components
    │   ├── contexts/       # State management
    │   ├── pages/          # Page components
    │   ├── services/       # API integration
    │   ├── App.jsx        # Main component
    │   └── main.jsx       # Entry point
    └── .env               # Environment variables
```

## 🧪 Testing & Verification

```bash
# Test database connection
curl http://localhost:3000/api/test-db

# Initialize database (first run)
curl -X POST http://localhost:3000/api/init-db
```

## 📝 Project Status

**Completed:**
- ✅ Database setup & SQL Server integration
- ✅ Authentication system with JWT
- ✅ Car management with image uploads
- ✅ Booking system with availability checks
- ✅ Invoice generation with PDF downloads
- ✅ Admin dashboard with reporting

**Planned Features:**
- 📱 Mobile app development
- 🚘 Driver booking options
- 📊 Enhanced analytics dashboard
- 🌐 Multi-language support

## 🔧 File Management

**Car Images:** JPEG/PNG/WebP, max 5MB, stored in `/uploads/cars/`  
**Invoice PDFs:** Generated with puppeteer, stored in `/uploads/invoices/`  

Files are served at: `http://localhost:3000/uploads/[category]/[filename]`

## 🛡️ Security Features

- JWT authentication with role-based access control
- Password hashing with bcrypt
- SQL injection protection via parameterized queries
- Secure file upload validation
- Database connection timeouts and error handling

## 🐛 Troubleshooting

- **Database:** Verify SQL Server is running, check credentials in `.env`
- **Dependencies:** Run `npm install` in both backend and frontend
- **Port conflict:** Change PORT in `.env` or run `taskkill /PID <id> /F`

## 📊 Documentation

Presentation materials available in `docs/presentation/` cover system architecture, features and implementation details.

## 📞 Support

For issues, verify environment setup and run the test endpoints found in the Testing section.

## 📄 License

This project is licensed under the MIT License.