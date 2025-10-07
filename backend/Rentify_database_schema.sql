CREATE DATABASE Rentify;
GO

USE Rentify;  -- Make sure you are in the right database
GO

-- =============================================
-- Rentify Car Rental - Complete Database Schema & Sample Data
-- Delhi NCR Region: Delhi, Noida, Gurgaon, Faridabad
-- Updated: September 2025
-- =============================================

    -- =============================================
    -- DROP EXISTING TABLES (in reverse dependency order)
    -- =============================================
    
    IF OBJECT_ID('dbo.Reviews', 'U') IS NOT NULL DROP TABLE dbo.Reviews;
    IF OBJECT_ID('dbo.Payments', 'U') IS NOT NULL DROP TABLE dbo.Payments;
    IF OBJECT_ID('dbo.MaintenanceHistory', 'U') IS NOT NULL DROP TABLE dbo.MaintenanceHistory;
    IF OBJECT_ID('dbo.Invoices', 'U') IS NOT NULL DROP TABLE dbo.Invoices;
    IF OBJECT_ID('dbo.Bookings', 'U') IS NOT NULL DROP TABLE dbo.Bookings;
    IF OBJECT_ID('dbo.CarImages', 'U') IS NOT NULL DROP TABLE dbo.CarImages;
    IF OBJECT_ID('dbo.Cars', 'U') IS NOT NULL DROP TABLE dbo.Cars;
    IF OBJECT_ID('dbo.Users', 'U') IS NOT NULL DROP TABLE dbo.Users;
    IF OBJECT_ID('dbo.Locations', 'U') IS NOT NULL DROP TABLE dbo.Locations;
    IF OBJECT_ID('dbo.Categories', 'U') IS NOT NULL DROP TABLE dbo.Categories;

    -- =============================================
    -- CREATE TABLE DEFINITIONS
    -- =============================================

    -- Categories Table (Independent)
    CREATE TABLE dbo.Categories (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Name NVARCHAR(50) NOT NULL UNIQUE,
        Description NVARCHAR(255),
        CreatedAt DATETIME2 DEFAULT GETDATE(),
        UpdatedAt DATETIME2 DEFAULT GETDATE()
    );

    -- Locations Table (Independent)
    CREATE TABLE dbo.Locations (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        City NVARCHAR(100) NOT NULL,
        State NVARCHAR(100) NOT NULL,
        Pincode NVARCHAR(10) NOT NULL,
        Address NVARCHAR(500) NOT NULL,
        CreatedAt DATETIME2 DEFAULT GETDATE(),
        UpdatedAt DATETIME2 DEFAULT GETDATE()
    );

    -- Users Table (Independent)
    CREATE TABLE dbo.Users (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Name NVARCHAR(255) NOT NULL,
        Email NVARCHAR(255) NOT NULL UNIQUE,
        Phone NVARCHAR(20) NOT NULL,
        PasswordHash NVARCHAR(255) NOT NULL,
        IsAdmin BIT NOT NULL DEFAULT 0,
        IsActive BIT NOT NULL DEFAULT 1,
        CreatedAt DATETIME2 DEFAULT GETDATE(),
        UpdatedAt DATETIME2 DEFAULT GETDATE()
    );

    -- Cars Table (Depends on Locations and Categories)
    CREATE TABLE dbo.Cars (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        RegistrationNumber NVARCHAR(20) NOT NULL UNIQUE,
        Make NVARCHAR(100) NOT NULL,
        Model NVARCHAR(100) NOT NULL,
        Year INT NOT NULL,
        Category NVARCHAR(50) NOT NULL,
        Seats INT NOT NULL,
        Transmission NVARCHAR(20) NOT NULL,
        FuelType NVARCHAR(20) NOT NULL,
        BasePricePerDay DECIMAL(10,2) NOT NULL,
        LocationId INT NOT NULL,
        Available BIT NOT NULL DEFAULT 1,
        CreatedAt DATETIME2 DEFAULT GETDATE(),
        UpdatedAt DATETIME2 DEFAULT GETDATE(),
        FOREIGN KEY (LocationId) REFERENCES dbo.Locations(Id),
        FOREIGN KEY (Category) REFERENCES dbo.Categories(Name),
        CHECK (Year >= 1900 AND Year <= YEAR(GETDATE()) + 1),
        CHECK (Seats > 0 AND Seats <= 20),
        CHECK (BasePricePerDay > 0)
    );

    -- Bookings Table (Depends on Users and Cars)
    CREATE TABLE dbo.Bookings (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        UserId INT NOT NULL,
        CarId INT NOT NULL,
        StartDate DATE NOT NULL,
        EndDate DATE NOT NULL,
        TotalAmount DECIMAL(10,2) NOT NULL,
        Status NVARCHAR(20) NOT NULL DEFAULT 'pending',
        CreatedAt DATETIME2 DEFAULT GETDATE(),
        UpdatedAt DATETIME2 DEFAULT GETDATE(),
        FOREIGN KEY (UserId) REFERENCES dbo.Users(Id),
        FOREIGN KEY (CarId) REFERENCES dbo.Cars(Id),
        CHECK (EndDate > StartDate),
        CHECK (TotalAmount >= 0),
        CHECK (Status IN ('pending', 'confirmed', 'completed', 'cancelled'))
    );

    -- CarImages Table (Depends on Cars)
    CREATE TABLE dbo.CarImages (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        CarId INT NOT NULL,
        FilePath NVARCHAR(500) NOT NULL,
        FileName NVARCHAR(255) NOT NULL,
        FileSize BIGINT NOT NULL,
        MimeType NVARCHAR(100) NOT NULL,
        AltText NVARCHAR(255),
        CreatedAt DATETIME2 DEFAULT GETDATE(),
        FOREIGN KEY (CarId) REFERENCES dbo.Cars(Id) ON DELETE CASCADE,
        CHECK (FileSize > 0)
    );

    -- Invoices Table (Depends on Bookings)
    CREATE TABLE dbo.Invoices (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        BookingId INT NOT NULL,
        InvoiceNumber NVARCHAR(50) NOT NULL UNIQUE,
        Amount DECIMAL(10,2) NOT NULL,
        Tax DECIMAL(10,2) NOT NULL DEFAULT 0,
        Status NVARCHAR(50) NOT NULL DEFAULT 'pending',
        PdfPath NVARCHAR(500),
        CreatedAt DATETIME2 DEFAULT GETDATE(),
        UpdatedAt DATETIME2 DEFAULT GETDATE(),
        FOREIGN KEY (BookingId) REFERENCES dbo.Bookings(Id),
        CHECK (Amount >= 0),
        CHECK (Tax >= 0),
        CHECK (Status IN ('pending', 'paid', 'cancelled', 'overdue'))
    );

    -- Payments Table (Depends on Bookings)
    CREATE TABLE dbo.Payments (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        BookingId INT NOT NULL,
        Provider NVARCHAR(50) NOT NULL,
        ProviderPaymentId NVARCHAR(255) NOT NULL UNIQUE,
        Amount DECIMAL(10,2) NOT NULL,
        Status NVARCHAR(20) NOT NULL DEFAULT 'pending',
        PaidAt DATETIME2,
        CreatedAt DATETIME2 DEFAULT GETDATE(),
        FOREIGN KEY (BookingId) REFERENCES dbo.Bookings(Id),
        CHECK (Amount > 0),
        CHECK (Status IN ('pending', 'completed', 'failed', 'refunded'))
    );

    -- Reviews Table (Depends on Bookings)
    CREATE TABLE dbo.Reviews (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        BookingId INT NOT NULL,
        Rating INT NOT NULL,
        Comment NVARCHAR(1000),
        CreatedAt DATETIME2 DEFAULT GETDATE(),
        UpdatedAt DATETIME2 DEFAULT GETDATE(),
        FOREIGN KEY (BookingId) REFERENCES dbo.Bookings(Id),
        CHECK (Rating >= 1 AND Rating <= 5)
    );

    -- MaintenanceHistory Table (Depends on Cars and Users)
    CREATE TABLE dbo.MaintenanceHistory (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        CarId INT NOT NULL,
        RecordedBy INT NOT NULL,
        Type NVARCHAR(50) NOT NULL,
        Description NVARCHAR(1000) NOT NULL,
        Cost DECIMAL(10,2) NOT NULL DEFAULT 0,
        CreatedAt DATETIME2 DEFAULT GETDATE(),
        FOREIGN KEY (CarId) REFERENCES dbo.Cars(Id),
        FOREIGN KEY (RecordedBy) REFERENCES dbo.Users(Id),
        CHECK (Cost >= 0),
        CHECK (Type IN ('maintenance', 'repair', 'service', 'inspection', 'other'))
    );

    -- =============================================
    -- INSERT SAMPLE DATA (in dependency order)
    -- =============================================

    -- 1. INSERT CATEGORIES (Independent table)
    SET IDENTITY_INSERT dbo.Categories ON;
    INSERT INTO dbo.Categories (Id, Name, Description) VALUES
    (1, 'Sedan', 'Mid-size cars with separate trunk, suitable for comfortable rides'),
    (2, 'SUV', 'Sport Utility Vehicles with higher ground clearance and spacious interiors'),
    (3, 'Hatchback', 'Compact cars ideal for city driving and small families'),
    (4, 'MPV', 'Multi-Purpose Vehicles designed for large families and groups'),
    (5, 'Luxury', 'Premium cars with advanced features and superior comfort'),
    (6, 'Electric', 'Environment-friendly electric vehicles with zero emissions');
    SET IDENTITY_INSERT dbo.Categories OFF;

    -- 2. INSERT LOCATIONS (Independent table)
    SET IDENTITY_INSERT dbo.Locations ON;
    INSERT INTO dbo.Locations (Id, City, State, Pincode, Address) VALUES
    (1, 'Delhi', 'Delhi', '110001', 'Connaught Place, Central Delhi, New Delhi'),
    (2, 'Noida', 'Uttar Pradesh', '201301', 'Sector 18, Noida, Uttar Pradesh'),
    (3, 'Gurgaon', 'Haryana', '122001', 'Cyber City, Gurgaon, Haryana'),
    (4, 'Faridabad', 'Haryana', '121001', 'NIT Faridabad, Sector 20, Faridabad, Haryana');
    SET IDENTITY_INSERT dbo.Locations OFF;

    -- 3. INSERT USERS (Independent table)
    -- Hash for 'password123' - bcrypt hash
    DECLARE @password_hash NVARCHAR(255) = '$2b$10$f5cV3ip89QffMcjdapEVfecfiSZp/V6xiBwwmDhzV3trSC3M63WyC';

    SET IDENTITY_INSERT dbo.Users ON;
    INSERT INTO dbo.Users (Id, Name, Email, Phone, PasswordHash, IsAdmin, IsActive) VALUES
    (1, 'Rajesh Kumar Sharma', 'rajesh.sharma@gmail.com', '+91-9876543210', @password_hash, 0, 1),
    (2, 'Priya Singh', 'priya.singh@gmail.com', '+91-9876543211', @password_hash, 0, 1),
    (3, 'Amit Patel', 'amit.patel@gmail.com', '+91-9876543212', @password_hash, 0, 1),
    (4, 'Sneha Reddy', 'sneha.reddy@gmail.com', '+91-9876543213', @password_hash, 0, 1),
    (5, 'Vikash Gupta', 'vikash.gupta@gmail.com', '+91-9876543214', @password_hash, 1, 1);
    SET IDENTITY_INSERT dbo.Users OFF;

    -- 4. INSERT CARS (Depends on Locations and Categories)
    SET IDENTITY_INSERT dbo.Cars ON;
    INSERT INTO dbo.Cars (Id, RegistrationNumber, Make, Model, Year, Category, Seats, Transmission, FuelType, BasePricePerDay, LocationId, Available) VALUES
    (1, 'DL-01-AB-1234', 'Maruti Suzuki', 'Swift Dzire', 2023, 'Sedan', 5, 'Manual', 'Petrol', 1200.00, 1, 1),
    (2, 'UP-16-CA-5678', 'Hyundai', 'Creta', 2022, 'SUV', 5, 'Automatic', 'Diesel', 2500.00, 2, 1),
    (3, 'HR-26-MN-9876', 'Mahindra', 'XUV700', 2023, 'SUV', 7, 'Automatic', 'Diesel', 3500.00, 3, 1),
    (4, 'HR-81-XY-4567', 'Tata', 'Nexon EV', 2023, 'Electric', 5, 'Automatic', 'Electric', 2200.00, 4, 1),
    (5, 'DL-08-PQ-7890', 'Honda', 'City', 2022, 'Sedan', 5, 'CVT', 'Petrol', 1800.00, 1, 1);
    SET IDENTITY_INSERT dbo.Cars OFF;

    -- 5. INSERT BOOKINGS (Depends on Users and Cars)
    SET IDENTITY_INSERT dbo.Bookings ON;
    INSERT INTO dbo.Bookings (Id, UserId, CarId, StartDate, EndDate, TotalAmount, Status) VALUES
    (1, 1, 1, '2025-01-15', '2025-01-18', 3600.00, 'completed'),
    (2, 2, 2, '2025-01-20', '2025-01-22', 5000.00, 'completed'),
    (3, 3, 3, '2025-02-01', '2025-02-05', 14000.00, 'completed'),
    (4, 4, 4, '2025-02-10', '2025-02-12', 4400.00, 'completed'),
    (5, 1, 5, '2025-10-15', '2025-10-17', 3600.00, 'confirmed');
    SET IDENTITY_INSERT dbo.Bookings OFF;

    -- 6. INSERT CAR IMAGES (Depends on Cars)
    SET IDENTITY_INSERT dbo.CarImages ON;
    INSERT INTO dbo.CarImages (Id, CarId, FilePath, FileName, FileSize, MimeType, AltText) VALUES
    (1, 1, '/uploads/cars/swift-dzire-front.jpg', 'swift-dzire-front.jpg', 245760, 'image/jpeg', 'Maruti Suzuki Swift Dzire - Front View'),
    (2, 1, '/uploads/cars/swift-dzire-interior.jpg', 'swift-dzire-interior.jpg', 198432, 'image/jpeg', 'Maruti Suzuki Swift Dzire - Interior View'),
    (3, 2, '/uploads/cars/creta-front.jpg', 'creta-front.jpg', 312576, 'image/jpeg', 'Hyundai Creta - Front View'),
    (4, 2, '/uploads/cars/creta-side.jpg', 'creta-side.jpg', 278934, 'image/jpeg', 'Hyundai Creta - Side View'),
    (5, 3, '/uploads/cars/xuv700-front.jpg', 'xuv700-front.jpg', 389120, 'image/jpeg', 'Mahindra XUV700 - Front View'),
    (6, 3, '/uploads/cars/xuv700-interior.jpg', 'xuv700-interior.jpg', 356789, 'image/jpeg', 'Mahindra XUV700 - Interior View'),
    (7, 4, '/uploads/cars/nexon-ev-front.jpg', 'nexon-ev-front.jpg', 267543, 'image/jpeg', 'Tata Nexon EV - Front View'),
    (8, 4, '/uploads/cars/nexon-ev-charging.jpg', 'nexon-ev-charging.jpg', 289765, 'image/jpeg', 'Tata Nexon EV - Charging Port'),
    (9, 5, '/uploads/cars/honda-city-front.jpg', 'honda-city-front.jpg', 298456, 'image/jpeg', 'Honda City - Front View'),
    (10, 5, '/uploads/cars/honda-city-interior.jpg', 'honda-city-interior.jpg', 245789, 'image/jpeg', 'Honda City - Interior View');
    SET IDENTITY_INSERT dbo.CarImages OFF;

    -- 7. INSERT INVOICES (Depends on Bookings)
    SET IDENTITY_INSERT dbo.Invoices ON;
    INSERT INTO dbo.Invoices (Id, BookingId, InvoiceNumber, Amount, Tax, PdfPath) VALUES
    (1, 1, 'DEL-2025-001', 4248.00, 648.00, '/uploads/invoices/DEL-2025-001.pdf'),
    (2, 2, 'NOI-2025-002', 5900.00, 900.00, '/uploads/invoices/NOI-2025-002.pdf'),
    (3, 3, 'GUR-2025-003', 16520.00, 2520.00, '/uploads/invoices/GUR-2025-003.pdf'),
    (4, 4, 'FAR-2025-004', 5192.00, 792.00, '/uploads/invoices/FAR-2025-004.pdf'),
    (5, 5, 'DEL-2025-005', 4248.00, 648.00, '/uploads/invoices/DEL-2025-005.pdf');
    SET IDENTITY_INSERT dbo.Invoices OFF;

    -- 8. INSERT PAYMENTS (Depends on Bookings)
    SET IDENTITY_INSERT dbo.Payments ON;
    INSERT INTO dbo.Payments (Id, BookingId, Provider, ProviderPaymentId, Amount, Status, PaidAt) VALUES
    (1, 1, 'Razorpay', 'pay_razorpay_NCR123456789', 3600.00, 'completed', '2025-01-14 14:30:00'),
    (2, 2, 'Paytm', 'paytm_txn_NCR987654321', 5000.00, 'completed', '2025-01-19 10:15:00'),
    (3, 3, 'PhonePe', 'phonepe_NCR456789123', 14000.00, 'completed', '2025-01-31 16:45:00'),
    (4, 4, 'Google Pay', 'gpay_NCR789123456', 4400.00, 'completed', '2025-02-09 12:20:00'),
    (5, 5, 'Razorpay', 'pay_razorpay_pending_NCR', 3600.00, 'pending', NULL);
    SET IDENTITY_INSERT dbo.Payments OFF;

    -- 9. INSERT REVIEWS (Depends on Bookings)
    SET IDENTITY_INSERT dbo.Reviews ON;
    INSERT INTO dbo.Reviews (Id, BookingId, Rating, Comment) VALUES
    (1, 1, 5, 'Excellent experience with Swift Dzire! Very comfortable car for city drives. The car was clean and well-maintained. Driver was professional and punctual. Highly recommended for budget-friendly rentals.'),
    (2, 2, 4, 'Hyundai Creta is amazing! Very spacious and comfortable for family trips from Noida to nearby hill stations. Fuel efficiency is also good. The automatic transmission made city driving very easy. Would definitely book again.'),
    (3, 3, 5, 'Outstanding experience with XUV700! Perfect 7-seater SUV for our large family trip from Gurgaon to Rajasthan. The car has all premium features and excellent comfort. Mahindra has really improved their build quality.'),
    (4, 4, 4, 'Nexon EV is the future of mobility! Silent and smooth drive from Faridabad to Delhi. Zero fuel cost and eco-friendly. Charging infrastructure is improving but needs more work. Overall great experience with electric vehicle.'),
    (5, 5, 3, 'Honda City is decent for city commuting. Good fuel average and smooth automatic transmission. The car was clean but AC performance could be better during Delhi summers. Service was professional and on-time pickup.');
    SET IDENTITY_INSERT dbo.Reviews OFF;

    -- 10. INSERT MAINTENANCE HISTORY (Depends on Cars and Users)
    SET IDENTITY_INSERT dbo.MaintenanceHistory ON;
    INSERT INTO dbo.MaintenanceHistory (Id, CarId, RecordedBy, Type, Description, Cost) VALUES
    (1, 1, 5, 'maintenance', 'Regular service - oil change, filter replacement, general inspection', 2500.00),
    (2, 2, 5, 'maintenance', 'Tire rotation and wheel alignment', 1800.00),
    (3, 3, 5, 'repair', 'Minor scratch repair on rear bumper', 3200.00),
    (4, 4, 5, 'maintenance', 'Battery health check and software update', 800.00),
    (5, 5, 5, 'maintenance', 'AC servicing and cabin filter replacement', 1500.00);
    SET IDENTITY_INSERT dbo.MaintenanceHistory OFF;

-- =============================================
-- HELPFUL QUERIES FOR DEVELOPMENT
-- =============================================

    -- Check inserted data counts
    PRINT 'Data insertion completed successfully. Record counts:'
    SELECT 'Locations' as TableName, COUNT(*) as RecordCount FROM dbo.Locations
    UNION ALL
    SELECT 'Users', COUNT(*) FROM dbo.Users
    UNION ALL
    SELECT 'Categories', COUNT(*) FROM dbo.Categories
    UNION ALL
    SELECT 'Cars', COUNT(*) FROM dbo.Cars
    UNION ALL
    SELECT 'Bookings', COUNT(*) FROM dbo.Bookings
    UNION ALL
    SELECT 'CarImages', COUNT(*) FROM dbo.CarImages
    UNION ALL
    SELECT 'Invoices', COUNT(*) FROM dbo.Invoices
    UNION ALL
    SELECT 'Payments', COUNT(*) FROM dbo.Payments
    UNION ALL
    SELECT 'Reviews', COUNT(*) FROM dbo.Reviews
    UNION ALL
    SELECT 'MaintenanceHistory', COUNT(*) FROM dbo.MaintenanceHistory
    ORDER BY TableName;

    -- Sample joined query to verify relationships work correctly
    PRINT 'Sample data verification with relationships:'
    SELECT TOP 5
        u.Name as UserName,
        c.Make + ' ' + c.Model as CarModel,
        c.Category,
        l.City as Location,
        b.StartDate,
        b.EndDate,  
        b.TotalAmount,
        b.Status,
        r.Rating,
        LEFT(ISNULL(r.Comment, 'No review'), 50) + CASE WHEN LEN(ISNULL(r.Comment, '')) > 50 THEN '...' ELSE '' END as ReviewSnippet
    FROM dbo.Bookings b
    INNER JOIN dbo.Users u ON b.UserId = u.Id
    INNER JOIN dbo.Cars c ON b.CarId = c.Id
    INNER JOIN dbo.Locations l ON c.LocationId = l.Id
    LEFT JOIN dbo.Reviews r ON b.Id = r.BookingId
    ORDER BY b.CreatedAt DESC;

    -- Verify foreign key constraints are working
    PRINT 'Foreign key constraints verification:'
    SELECT 
        OBJECT_NAME(f.parent_object_id) AS TableName,
        COL_NAME(fc.parent_object_id, fc.parent_column_id) AS ColumnName,
        OBJECT_NAME(f.referenced_object_id) AS ReferencedTableName,
        COL_NAME(fc.referenced_object_id, fc.referenced_column_id) AS ReferencedColumnName
    FROM sys.foreign_keys AS f
    INNER JOIN sys.foreign_key_columns AS fc ON f.object_id = fc.constraint_object_id
    WHERE f.parent_object_id IN (
        OBJECT_ID('dbo.Cars'),
        OBJECT_ID('dbo.Bookings'),
        OBJECT_ID('dbo.CarImages'),
        OBJECT_ID('dbo.Invoices'),
        OBJECT_ID('dbo.Payments'),
        OBJECT_ID('dbo.Reviews'),
        OBJECT_ID('dbo.MaintenanceHistory')
    )
    ORDER BY TableName, ColumnName;

    PRINT 'Database schema and sample data created successfully!';

-- Query to check all table structures

SELECT 
    t.TABLE_NAME,
    c.COLUMN_NAME,
    c.DATA_TYPE,
    c.IS_NULLABLE,
    c.COLUMN_DEFAULT,
    c.CHARACTER_MAXIMUM_LENGTH
FROM INFORMATION_SCHEMA.TABLES t
INNER JOIN INFORMATION_SCHEMA.COLUMNS c ON t.TABLE_NAME = c.TABLE_NAME
WHERE t.TABLE_SCHEMA = 'dbo' 
    AND t.TABLE_TYPE = 'BASE TABLE'
    AND t.TABLE_NAME IN ('Locations', 'Users', 'Categories', 'Cars', 'Bookings', 'CarImages', 'Invoices', 'Payments', 'Reviews', 'MaintenanceHistory')
ORDER BY t.TABLE_NAME, c.ORDINAL_POSITION;


-- =============================================
-- END OF COMPLETE DATABASE SCHEMA
-- =============================================