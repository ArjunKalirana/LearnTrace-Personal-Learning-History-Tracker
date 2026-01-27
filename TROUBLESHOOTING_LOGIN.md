# Login Troubleshooting Guide

## Quick Diagnosis Steps

### Step 1: Check Backend is Running

```bash
# In backend terminal, you should see:
Server running on port 3001
```

**If not running:**
```bash
cd backend
npm run dev
```

### Step 2: Check Frontend is Running

```bash
# In frontend terminal, you should see:
Local: http://localhost:5173
```

**If not running:**
```bash
cd frontend
npm run dev
```

### Step 3: Check Database Connection

```bash
cd backend
npm run prisma:studio
```

This opens Prisma Studio. Check if:
- `users` table exists
- Default user exists with email: `secondarymail251045@gmail.com`

### Step 4: Verify Default User Exists

```bash
cd backend
npm run prisma:seed
```

This will create the default user if it doesn't exist.

### Step 5: Check Browser Console

1. Open browser DevTools (F12)
2. Go to Console tab
3. Try to login
4. Check for any error messages

### Step 6: Check Network Tab

1. Open browser DevTools (F12)
2. Go to Network tab
3. Try to login
4. Look for `POST /auth/login` request
5. Check:
   - Status code (should be 200)
   - Response body
   - Request payload

## Common Issues & Solutions

### Issue 1: "Failed to login" Error

**Possible Causes:**
- Backend not running
- Database connection issue
- User doesn't exist
- Wrong password

**Solution:**
```bash
# 1. Make sure backend is running
cd backend && npm run dev

# 2. Create/verify user exists
npm run prisma:seed

# 3. Check database connection in .env file
```

### Issue 2: CORS Error

**Error:** `Access to XMLHttpRequest blocked by CORS policy`

**Solution:**
Check `backend/.env` has:
```env
FRONTEND_URL="http://localhost:5173"
```

### Issue 3: Network Error / Connection Refused

**Error:** `Network Error` or `ERR_CONNECTION_REFUSED`

**Solution:**
- Backend is not running
- Wrong API URL in frontend
- Check `frontend/src/utils/api.ts` - should use `http://localhost:3001`

### Issue 4: Database Connection Error

**Error:** `Can't reach database server`

**Solution:**
```bash
# Check PostgreSQL is running
sudo service postgresql status  # Linux
# or
brew services list  # macOS

# Start PostgreSQL if not running
sudo service postgresql start  # Linux
# or
brew services start postgresql  # macOS

# Check .env DATABASE_URL is correct
```

### Issue 5: User Not Found

**Error:** `Invalid email or password`

**Solution:**
```bash
# Create the default user
cd backend
npm run prisma:seed
```

### Issue 6: Token Issues

**Error:** `Invalid or expired token`

**Solution:**
```bash
# Clear browser localStorage
# In browser console:
localStorage.clear()
# Then try login again
```

## Testing Login Manually

### Test 1: Check Backend API Directly

```bash
# Test login endpoint
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "secondarymail251045@gmail.com",
    "password": "pasword@123"
  }'
```

**Expected Response:**
```json
{
  "user": {
    "id": "...",
    "firstName": "Demo",
    "lastName": "User",
    "email": "secondarymail251045@gmail.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Test 2: Check Database

```bash
cd backend
npm run prisma:studio
```

In Prisma Studio:
1. Open `users` table
2. Check if user with email `secondarymail251045@gmail.com` exists
3. If not, run `npm run prisma:seed`

## Debug Mode

Add this to see detailed errors:

1. Open browser console (F12)
2. Check Network tab when logging in
3. Look at the request/response

## Still Not Working?

Run this complete setup:

```bash
# 1. Stop all servers (Ctrl+C)

# 2. Backend setup
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed

# 3. Start backend
npm run dev

# 4. Frontend setup (new terminal)
cd frontend
npm install

# 5. Start frontend
npm run dev

# 6. Open browser
# Go to: http://localhost:5173
# Login with:
# Email: secondarymail251045@gmail.com
# Password: pasword@123
```
