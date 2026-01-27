# How LearnTrace Works - Complete Guide

## 🏗️ System Architecture

### High-Level Overview

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Browser   │ ──────> │   Frontend  │ ──────> │   Backend   │
│  (React)    │ <────── │  (Vite)     │ <────── │  (Express)  │
└─────────────┘         └─────────────┘         └─────────────┘
                                                         │
                                                         ▼
                                                  ┌─────────────┐
                                                  │ PostgreSQL  │
                                                  │  Database   │
                                                  └─────────────┘
```

## 🔐 Authentication Flow (Login Page)

### Step-by-Step Login Process

#### 1. **User Visits Login Page**
   - URL: `http://localhost:5173/login`
   - Component: `frontend/src/pages/Login.tsx`
   - User sees email and password input fields

#### 2. **User Enters Credentials**
   ```
   Email: secondarymail251045@gmail.com
   Password: pasword@123
   ```

#### 3. **Form Submission**
   - User clicks "Sign In" button
   - React Hook Form validates inputs (email format, password not empty)
   - `handleSubmit` function is called

#### 4. **Frontend API Call**
   ```typescript
   // frontend/src/pages/Login.tsx
   await login(email, password);
   
   // This calls: frontend/src/contexts/AuthContext.tsx
   const response = await authAPI.login({ email, password });
   ```

#### 5. **HTTP Request Sent**
   ```
   POST http://localhost:3001/auth/login
   Content-Type: application/json
   
   {
     "email": "secondarymail251045@gmail.com",
     "password": "pasword@123"
   }
   ```

#### 6. **Backend Receives Request**
   - Route: `backend/src/index.ts` → `POST /auth/login`
   - Controller: `backend/src/controllers/authController.ts`
   - Validates input using express-validator

#### 7. **Backend Authentication Process**
   ```typescript
   // backend/src/services/authService.ts
   
   // Step 1: Find user by email
   const user = await prisma.user.findUnique({
     where: { email: data.email }
   });
   
   // Step 2: Compare password with stored hash
   const isValid = await bcrypt.compare(data.password, user.passwordHash);
   
   // Step 3: Generate JWT token if valid
   const token = jwt.sign(
     { userId: user.id, email: user.email },
     JWT_SECRET,
     { expiresIn: '7d' }
   );
   ```

#### 8. **Response Sent Back**
   ```json
   {
     "user": {
       "id": "uuid-here",
       "firstName": "Demo",
       "lastName": "User",
       "email": "secondarymail251045@gmail.com"
     },
     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   }
   ```

#### 9. **Frontend Stores Token**
   ```typescript
   // frontend/src/contexts/AuthContext.tsx
   localStorage.setItem('token', response.token);
   localStorage.setItem('user', JSON.stringify(response.user));
   setUser(response.user); // Update React state
   ```

#### 10. **Redirect to Dashboard**
   ```typescript
   navigate('/dashboard'); // React Router redirect
   ```

#### 11. **Protected Routes**
   - All dashboard routes are protected
   - `ProtectedRoute` component checks if user exists
   - If no user → redirects to `/login`
   - If user exists → renders the page

### Security Features

1. **Password Hashing**
   - Passwords are NEVER stored in plain text
   - bcrypt hashes password with 10 salt rounds
   - Example: `pasword@123` → `$2b$10$hashed...`

2. **JWT Tokens**
   - Token contains: `userId` and `email`
   - Signed with secret key
   - Expires after 7 days
   - Stored in browser localStorage

3. **Route Protection**
   - Every API request includes token in header:
     ```
     Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     ```
   - Backend middleware validates token before allowing access

## 📊 Data Flow Example: Adding a Learning Entry

### 1. User Fills Form
   - Title: "Complete React Course"
   - Platform: "Udemy"
   - Domain: "Programming"
   - Skills: ["React", "JavaScript"]
   - Certificate: [Image file]

### 2. Form Submission
   ```typescript
   // frontend/src/pages/AddEntry.tsx
   const formData = new FormData();
   formData.append('title', 'Complete React Course');
   formData.append('platform', 'Udemy');
   // ... other fields
   formData.append('certificate', imageFile);
   
   await entriesAPI.create(formData);
   ```

### 3. API Request
   ```
   POST http://localhost:3001/entries
   Authorization: Bearer [token]
   Content-Type: multipart/form-data
   ```

### 4. Backend Processing
   ```typescript
   // backend/src/controllers/entryController.ts
   // 1. Authenticate user (middleware extracts userId from token)
   // 2. Validate input
   // 3. Upload file (multer saves to uploads/certificates/)
   // 4. Save to database
   
   await entryService.createEntry(userId, {
     title: 'Complete React Course',
     platform: 'Udemy',
     // ... other fields
     certificatePath: '/uploads/certificates/filename.jpg'
   });
   ```

### 5. Database Storage
   ```sql
   INSERT INTO learning_entries (
     id, user_id, title, platform, domain, ...
   ) VALUES (
     'uuid', 'user-uuid', 'Complete React Course', 'Udemy', ...
   );
   ```

### 6. Response & Update UI
   - Backend returns created entry
   - Frontend updates state
   - User redirected to dashboard
   - New entry appears in recent activity

## 🗄️ Database Structure

### User Table
```
users
├── id (UUID, Primary Key)
├── first_name
├── last_name
├── email (Unique)
├── password_hash (bcrypt hash)
└── created_at
```

### Learning Entry Table
```
learning_entries
├── id (UUID, Primary Key)
├── user_id (Foreign Key → users.id)
├── title
├── platform
├── domain
├── sub_domain (nullable)
├── start_date
├── completion_date
├── skills (Array)
├── description (nullable)
├── reflection (nullable)
├── certificate_path (nullable)
└── created_at
```

**Relationship**: One User → Many Learning Entries (Cascade Delete)

## 🔄 Complete Request-Response Cycle

### Example: Getting All Entries

1. **User clicks "Timeline"**
   ```typescript
   // Frontend: Timeline page loads
   useEffect(() => {
     loadEntries();
   }, []);
   ```

2. **API Call**
   ```typescript
   // GET /entries
   // Headers: Authorization: Bearer [token]
   ```

3. **Backend Processing**
   ```typescript
   // middleware/auth.ts: Validates token, extracts userId
   // controllers/entryController.ts: Gets userId from request
   // services/entryService.ts: Queries database
   
   prisma.learningEntry.findMany({
     where: { userId: req.userId }, // Only user's entries
     orderBy: { completionDate: 'desc' }
   });
   ```

4. **Response**
   ```json
   [
     {
       "id": "entry-uuid",
       "title": "Complete React Course",
       "platform": "Udemy",
       "domain": "Programming",
       "completionDate": "2024-01-15T00:00:00Z",
       ...
     }
   ]
   ```

5. **Frontend Display**
   - React renders list of entries
   - Each entry is clickable
   - Shows title, platform, domain, date

## 🚀 How to Run the Application

### Prerequisites
- Node.js (v18+)
- PostgreSQL (v14+)
- npm or yarn

### Step 1: Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### Step 2: Set Up Database

```bash
# Start PostgreSQL (if not running)
sudo service postgresql start  # Linux
# or: brew services start postgresql  # macOS

# Create database
sudo -u postgres psql
CREATE DATABASE learntrace;
\q
```

### Step 3: Configure Environment

Create `backend/.env`:
```env
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/learntrace?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
PORT=3001
NODE_ENV=development
FRONTEND_URL="http://localhost:5173"
```

**Important**: Replace `yourpassword` with your PostgreSQL password!

### Step 4: Initialize Database

```bash
cd backend

# Generate Prisma Client
npm run prisma:generate

# Run migrations (creates tables)
npm run prisma:migrate

# Seed default user
npm run prisma:seed
```

### Step 5: Start Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
You should see: `Server running on port 3001`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
You should see: `Local: http://localhost:5173`

### Step 6: Access Application

1. Open browser: `http://localhost:5173`
2. You'll see the Login page
3. Use default credentials:
   - **Email**: `secondarymail251045@gmail.com`
   - **Password**: `pasword@123`
4. Click "Sign In"
5. You'll be redirected to Dashboard

## 🧪 Testing the Login Flow

### Test Scenario 1: Successful Login

1. Go to `http://localhost:5173/login`
2. Enter:
   - Email: `secondarymail251045@gmail.com`
   - Password: `pasword@123`
3. Click "Sign In"
4. ✅ Should redirect to `/dashboard`
5. ✅ Should see your name in header
6. ✅ Should see dashboard statistics

### Test Scenario 2: Invalid Credentials

1. Enter wrong password
2. ✅ Should show error message
3. ✅ Should stay on login page

### Test Scenario 3: Protected Route Access

1. Logout (click logout button)
2. Try to access `http://localhost:5173/dashboard` directly
3. ✅ Should redirect to `/login`

## 🔍 Debugging Tips

### Check Backend Logs
```bash
# Backend terminal should show:
Server running on port 3001
# When login happens:
POST /auth/login 200
```

### Check Frontend Console
- Open browser DevTools (F12)
- Check Console tab for errors
- Check Network tab for API calls

### Check Database
```bash
cd backend
npm run prisma:studio
# Opens Prisma Studio at http://localhost:5555
# View users and learning_entries tables
```

### Common Issues

**1. Database Connection Error**
```
Error: Can't reach database server
```
**Solution**: Check PostgreSQL is running and DATABASE_URL is correct

**2. Token Invalid**
```
401 Unauthorized
```
**Solution**: Clear localStorage and login again

**3. CORS Error**
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solution**: Check FRONTEND_URL in backend/.env matches frontend URL

## 📝 Default User Credentials

After running `npm run prisma:seed`, you can login with:

- **Email**: `secondarymail251045@gmail.com`
- **Password**: `pasword@123`

This user is created automatically in the database with:
- First Name: "Demo"
- Last Name: "User"
- Password: Hashed with bcrypt

## 🎯 Key Files to Understand

### Authentication Flow
- `frontend/src/pages/Login.tsx` - Login UI
- `frontend/src/contexts/AuthContext.tsx` - Auth state management
- `frontend/src/utils/api.ts` - API calls
- `backend/src/controllers/authController.ts` - Login endpoint
- `backend/src/services/authService.ts` - Auth business logic
- `backend/src/middleware/auth.ts` - JWT validation

### Entry Management
- `frontend/src/pages/AddEntry.tsx` - Add/edit form
- `backend/src/controllers/entryController.ts` - CRUD endpoints
- `backend/src/services/entryService.ts` - Database operations

### Database
- `backend/prisma/schema.prisma` - Database schema
- `backend/src/lib/prisma.ts` - Database client

---

**Ready to demo!** The application is fully functional and ready for academic evaluation.
