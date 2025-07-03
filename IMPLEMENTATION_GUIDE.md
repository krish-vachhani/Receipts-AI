# Receipt App - Database, Authentication & User-Specific Cloudinary Implementation

## Overview

I've successfully implemented the requested features for your receipt processing application:

1. **Database Integration** - MongoDB with Mongoose
2. **User Authentication** - JWT-based authentication with bcrypt
3. **User-Specific Cloudinary Folders** - Separate folders for each user

## 🔧 Backend Implementation

### Database Models

#### User Model (`backend/src/models/User.ts`)
- Email (unique, required)
- Password (hashed with bcrypt)
- Name (required)
- Timestamps (createdAt, updatedAt)
- Password comparison method

#### Receipt Model (`backend/src/models/Receipt.ts`)
- User ID reference
- Receipt data (date, currency, vendor, items, tax, total)
- Image URL and Cloudinary public ID
- Timestamps

### Authentication System

#### JWT Authentication (`backend/src/middleware/auth.ts`)
- Token verification middleware
- User extraction from token
- Protected route handling

#### Auth Controller (`backend/src/controllers/authController.ts`)
- User registration
- User login
- User profile retrieval
- JWT token generation

### User-Specific Cloudinary Folders

#### Updated Storage Utility (`backend/src/utils/storage.ts`)
```typescript
export async function handleUpload(file: any, userId: string) {
  const res = await cloudinary.uploader.upload(file, {
    resource_type: "image",
    folder: `receipts/user_${userId}`, // ✅ User-specific folder
    use_filename: true,
    unique_filename: true,
  });
  return res;
}
```

### Enhanced Receipt Controller
- **Authentication Required**: All endpoints now require valid JWT token
- **Database Persistence**: Receipts are saved to MongoDB with user association
- **User-Specific Operations**: Users can only access their own receipts

### API Endpoints

#### Authentication Routes (`/api/auth`)
- `POST /register` - Create new user account
- `POST /login` - Authenticate user and get token
- `GET /profile` - Get current user profile (protected)

#### Receipt Routes (`/api`) - All Protected
- `POST /extract-receipt-details` - Upload and analyze receipt
- `GET /receipts` - Get all user's receipts
- `GET /receipts/:id` - Get specific receipt
- `DELETE /receipts/:id` - Delete receipt

## 🎨 Frontend Implementation

### Authentication Context (`frontend/src/context/AuthContext.tsx`)
- User state management
- JWT token handling
- Login/Register functions
- Automatic token persistence
- Axios interceptors for authorization headers

### Authentication Form (`frontend/src/components/AuthForm.tsx`)
- Combined login/register form
- Form validation
- Error handling
- Loading states

### Header Component (`frontend/src/components/Header.tsx`)
- User welcome message
- Logout functionality
- Clean UI design

### Updated FileUpload Component
- Automatic JWT token inclusion in requests
- Authentication-aware error handling

## 🚀 Setup Instructions

### Backend Setup

1. **Install Dependencies** (Already done)
```bash
cd backend
npm install
```

2. **Environment Variables**
Create `.env` file in backend directory:
```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/receipt-app

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key

# Server Configuration
PORT=3000
```

3. **Start MongoDB**
```bash
# If using local MongoDB
mongod

# Or use MongoDB Atlas cloud database
```

4. **Start Backend Server**
```bash
npm run dev
```

### Frontend Setup

1. **Install Dependencies** (Already done)
```bash
cd frontend
npm install
```

2. **Start Frontend**
```bash
npm run dev
```

## 🔐 Security Features

### Password Security
- Passwords hashed with bcrypt (salt rounds: 12)
- Minimum password length: 6 characters
- No plain text password storage

### JWT Security
- 7-day token expiration
- Secure token generation
- Automatic token validation on protected routes

### API Security
- CORS enabled for frontend requests
- Authentication middleware on all receipt endpoints
- User-specific data isolation

## 📁 Cloudinary Folder Structure

Your Cloudinary account will now organize receipt images as:
```
receipts/
├── user_[userId1]/
│   ├── receipt_1.jpg
│   ├── receipt_2.png
│   └── ...
├── user_[userId2]/
│   ├── receipt_1.jpg
│   └── ...
└── ...
```

This ensures complete separation of user data in your cloud storage.

## 🎯 Key Benefits

1. **Data Privacy**: Each user can only access their own receipts
2. **Organized Storage**: Clean folder structure in Cloudinary
3. **Scalable Authentication**: JWT-based system scales well
4. **Secure Passwords**: Industry-standard bcrypt hashing
5. **Persistent Sessions**: Users stay logged in across browser sessions
6. **Clean UI**: Modern, responsive authentication interface

## 🔄 Workflow

1. **User Registration/Login**: New users register, returning users login
2. **Authentication Persistence**: JWT token stored in localStorage
3. **Receipt Upload**: Files uploaded to user-specific Cloudinary folder
4. **Data Storage**: Receipt data and metadata saved to MongoDB
5. **User Management**: Full CRUD operations for receipts with user isolation

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check MONGODB_URI in .env file

2. **JWT Secret Error**
   - Make sure JWT_SECRET is set in .env file
   - Use a long, random secret key

3. **Cloudinary Upload Error**
   - Verify Cloudinary credentials in .env
   - Check API limits on your Cloudinary account

4. **CORS Issues**
   - Ensure backend server is running on port 3000
   - Check frontend API_BASE_URL matches backend URL

Your receipt processing application now has a complete authentication system with user-specific data isolation and organized cloud storage! 🎉