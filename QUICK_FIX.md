# Quick Fix for Login Issues

## Immediate Steps

### 1. Check if Backend is Running
Open terminal and check:
```bash
cd backend
npm run dev
```
Should see: "Server running on port 3001"

### 2. Check if Frontend is Running  
Open another terminal:
```bash
cd frontend
npm run dev
```
Should see: "Local: http://localhost:5173"

### 3. Create Default User
```bash
cd backend
npm run prisma:seed
```

### 4. Test Login in Browser
1. Open: http://localhost:5173
2. Email: secondarymail251045@gmail.com
3. Password: pasword@123

### 5. Check Browser Console (F12)
- Open DevTools
- Check Console for errors
- Check Network tab for failed requests

## If Still Not Working

### Test Backend Directly
```bash
cd backend
node test-login.js
```

### Check Database
```bash
cd backend
npm run prisma:studio
```
Look for user with email: secondarymail251045@gmail.com

### Reset Everything
```bash
# Stop all servers (Ctrl+C)

# Backend
cd backend
rm -rf node_modules
npm install
npm run prisma:generate
npm run prisma:migrate reset  # This will reset database
npm run prisma:seed
npm run dev

# Frontend (new terminal)
cd frontend
rm -rf node_modules
npm install
npm run dev
```

## Common Error Messages

**"Cannot connect to server"**
→ Backend not running. Start with: `cd backend && npm run dev`

**"Invalid email or password"**
→ User doesn't exist. Run: `cd backend && npm run prisma:seed`

**"CORS error"**
→ Check backend/.env has: `FRONTEND_URL="http://localhost:5173"`

**"Network Error"**
→ Backend not accessible. Check it's running on port 3001
