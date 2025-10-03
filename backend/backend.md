# Rentify Backend Documentation

## Overview
The Rentify Backend is a REST API built with Node.js and Express, providing functionality for a car rental application. It uses SQL Server as the database and follows a structured architecture with controllers, models, and routers.

## Technology Stack
- **Node.js**: JavaScript runtime environment
- **Express**: Web application framework
- **SQL Server**: Database management system
- **JWT**: JSON Web Tokens for authentication
- **Bcrypt**: Password hashing
- **Multer**: File uploads
- **Dotenv**: Environment variables

## Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- SQL Server
- npm or yarn

### Setup Instructions
1. Clone the repository
2. Navigate to the backend directory:
   ```bash
   cd Rentify/backend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a `.env` file with the following variables:
   ```
   PORT=3000
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_SERVER=your_db_server
   DB_DATABASE=Rentify
   DB_PORT=1433
   JWT_SECRET=your_jwt_secret
   NODE_ENV=development
   ```
5. Run the SQL script to create the database schema:
   ```bash
   # Use SQL Server Management Studio or other tools to run Rentify_database_schema.sql
   ```
6. Start the development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
backend/
├── config/              # Configuration files
│   └── db.js            # Database connection setup
├── controllers/         # API controllers
│   ├── adminController.js
│   ├── authController.js
│   ├── bookingController.js
│   ├── carController.js
│   ├── invoiceController.js
│   ├── paymentController.js
│   └── reviewController.js
├── middleware/          # Express middleware
│   ├── auth.js          # JWT authentication middleware
│   └── multer.js        # File upload middleware
├── models/              # Data models
│   ├── Booking.js
│   ├── Car.js
│   ├── CarImage.js
│   ├── Invoice.js
│   ├── Location.js
│   ├── MaintenanceHistory.js
│   ├── Payment.js
│   ├── Review.js
│   └── User.js
├── routers/             # API routes
│   ├── adminRoutes.js
│   ├── authRoutes.js
│   ├── bookingRoutes.js
│   ├── carRoutes.js
│   ├── invoiceRoutes.js
│   ├── locationRoutes.js
│   ├── paymentRoutes.js
│   ├── reviewRoutes.js
│   └── userRoutes.js
├── uploads/             # Uploaded files (images, PDFs)
│   ├── cars/            # Car images
│   └── invoices/        # Generated PDF invoices
├── utils/               # Utility functions
│   └── jwt.js           # JWT token generation
├── .env                 # Environment variables
├── index.js             # Main application entry point
├── package.json         # Project dependencies
└── Rentify_database_schema.sql  # Database schema
```

## API Endpoints

### Authentication
- **POST /api/auth/register**
  - Create a new user account
  - Request body: `{name, email, phone, password}`
  - Response: User details with JWT token
  
- **POST /api/auth/login**
  - Login to existing account
  - Request body: `{email, password}`
  - Response: User details with JWT token
  
- **GET /api/auth/me**
  - Get current user's profile
  - Header: `Authorization: Bearer <token>`
  - Response: User details

### Cars
- **GET /api/cars**
  - Get all available cars
  - Query parameters: `location`, `startDate`, `endDate`, `category`, `minPrice`, `maxPrice`
  - Response: List of cars with details and images

- **GET /api/cars/:id**
  - Get details of a specific car
  - Response: Car details with images and availability

- **GET /api/cars/:id/availability**
  - Check availability for a specific car
  - Query parameters: `startDate`, `endDate`
  - Response: Available status and conflicting bookings if any

- **GET /api/cars/:id/reviews**
  - Get reviews for a specific car
  - Response: List of reviews with user details

### Bookings
- **POST /api/bookings**
  - Create a new booking
  - Header: `Authorization: Bearer <token>`
  - Request body: `{carId, startDate, endDate, locationId, totalAmount}`
  - Response: Booking details

- **GET /api/bookings**
  - Get all bookings for current user
  - Header: `Authorization: Bearer <token>`
  - Response: List of bookings with car details

- **GET /api/bookings/:id**
  - Get details of a specific booking
  - Header: `Authorization: Bearer <token>`
  - Response: Booking details with car and invoice information

- **PATCH /api/bookings/:id/cancel**
  - Cancel a booking
  - Header: `Authorization: Bearer <token>`
  - Response: Updated booking status

### Payments
- **POST /api/payments**
  - Process payment for a booking
  - Header: `Authorization: Bearer <token>`
  - Request body: `{bookingId, amount, paymentMethod}`
  - Response: Payment confirmation

- **GET /api/payments/:id**
  - Get payment details
  - Header: `Authorization: Bearer <token>`
  - Response: Payment details with invoice

### Reviews
- **POST /api/reviews**
  - Add a review for a car
  - Header: `Authorization: Bearer <token>`
  - Request body: `{carId, rating, comment}`
  - Response: Created review

- **GET /api/reviews**
  - Get all reviews by current user
  - Header: `Authorization: Bearer <token>`
  - Response: List of reviews

### Locations
- **GET /api/locations**
  - Get all available pickup/drop locations
  - Response: List of locations with address details

### Admin Routes
- **GET /api/admin/cars**
  - Get all cars (including unavailable)
  - Header: `Authorization: Bearer <token>` (admin only)
  - Response: Complete list of cars with details

- **POST /api/admin/cars**
  - Add a new car
  - Header: `Authorization: Bearer <token>` (admin only)
  - Request body: Car details
  - Response: Created car

- **PUT /api/admin/cars/:id**
  - Update car details
  - Header: `Authorization: Bearer <token>` (admin only)
  - Request body: Updated car details
  - Response: Updated car

- **POST /api/admin/cars/:id/images**
  - Upload images for a car
  - Header: `Authorization: Bearer <token>` (admin only)
  - Request: Multipart form with images
  - Response: Uploaded images info

- **GET /api/admin/bookings**
  - Get all bookings
  - Header: `Authorization: Bearer <token>` (admin only)
  - Query params: `status`, `startDate`, `endDate`
  - Response: List of all bookings

- **GET /api/admin/users**
  - Get all users
  - Header: `Authorization: Bearer <token>` (admin only)
  - Response: List of all users

- **GET /api/admin/stats**
  - Get system statistics
  - Header: `Authorization: Bearer <token>` (admin only)
  - Response: Booking stats, revenue, etc.

## Authentication & Authorization

The backend uses JWT (JSON Web Token) for authentication:
1. When a user registers or logs in, a JWT token is generated
2. This token must be included in the `Authorization` header as a Bearer token for protected routes
3. The `auth.js` middleware validates these tokens and extracts user information

There are two permission levels:
- **Regular users**: Can manage their own bookings, make payments, and add reviews
- **Admins**: Can manage cars, view all bookings, access user data, and view system statistics

## Database Schema

The database uses SQL Server with the following tables:
- **Users**: Store user accounts and authentication details
- **Cars**: Car inventory with specifications and rental rates
- **CarImages**: Images associated with each car
- **Locations**: Pickup and drop-off locations
- **Bookings**: Rental bookings with dates and statuses
- **Payments**: Payment records for bookings
- **Invoices**: Generated invoices for completed bookings
- **Reviews**: User reviews for cars
- **Categories**: Car categories (Sedan, SUV, etc.)
- **MaintenanceHistory**: Records of car maintenance activities

## File Upload

The application uses Multer middleware for handling file uploads:
- Car images are stored in the `uploads/cars/` directory
- Invoice PDFs are stored in the `uploads/invoices/` directory

## Error Handling

The backend implements centralized error handling:
- Specific error responses for common issues (authentication, validation)
- Generic error responses for unexpected server errors
- Error logging for debugging purposes

## Development & Deployment

### Development
- Use `npm run dev` to start the development server with nodemon
- Environment variables are loaded from `.env` file

### Production
- Use `npm start` to start the production server
- Set `NODE_ENV=production` in environment variables
- Consider using a process manager like PM2

## API Testing

The API can be tested using the included Postman collection:
- Import `Rentify_API_Collection.json` into Postman
- Update the environment variables for your server
