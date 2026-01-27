# LearnTrace - Academic Project Documentation

## Project Overview

**LearnTrace** is a full-stack web application designed for tracking personal learning history and analyzing educational progress. The system allows users to log learning activities, visualize their learning timeline, analyze skill patterns, and maintain a digital portfolio of certificates.

**Domain**: Education Technology (EdTech)  
**Problem Statement**: Students and professionals need a centralized system to track their learning journey, analyze progress, and maintain evidence of their educational achievements.

## Technical Architecture

### Backend Architecture

#### Technology Stack
- **Runtime**: Node.js with Express.js framework
- **Database**: PostgreSQL (relational database)
- **ORM**: Prisma (type-safe database access)
- **Authentication**: JWT (JSON Web Tokens) with bcrypt password hashing
- **File Storage**: Local file system for certificate images

#### Folder Structure
```
backend/
├── src/
│   ├── controllers/     # Request handlers (route logic)
│   ├── services/        # Business logic layer
│   ├── middleware/       # Authentication & error handling
│   ├── utils/           # Utility functions (file upload)
│   ├── lib/             # Shared libraries (Prisma client)
│   ├── types/           # TypeScript type definitions
│   └── index.ts         # Application entry point
├── prisma/
│   └── schema.prisma    # Database schema definition
└── uploads/             # Certificate storage directory
```

#### Key Components

**1. Authentication System**
- **Registration**: Validates user input, checks for duplicate emails, hashes passwords using bcrypt (10 salt rounds)
- **Login**: Verifies credentials, generates JWT token (7-day expiration)
- **Route Protection**: Middleware validates JWT token on protected routes

**2. Learning Entry Management**
- **Create**: Validates input, handles file uploads, stores entry with user association
- **Read**: Retrieves entries with filtering (domain, platform, date range, search)
- **Update**: Allows modification of existing entries
- **Delete**: Removes entries with proper authorization checks

**3. Data Persistence**
- **Prisma Schema**: Defines User and LearningEntry models with proper relationships
- **Migrations**: Database schema versioning and updates
- **Relations**: One-to-many relationship (User → LearningEntry) with cascade delete

**4. Error Handling**
- **Centralized Middleware**: Catches all unhandled errors
- **Validation**: Input validation using express-validator
- **Error Responses**: Consistent error format for frontend consumption

### Frontend Architecture

#### Technology Stack
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite (fast development and build)
- **Routing**: React Router v6
- **Styling**: Tailwind CSS (utility-first CSS framework)
- **Forms**: React Hook Form (form state management)
- **HTTP Client**: Axios with interceptors for authentication

#### Folder Structure
```
frontend/
├── src/
│   ├── components/      # Reusable UI components
│   ├── pages/           # Page-level components
│   ├── contexts/        # React Context (Auth state)
│   ├── utils/           # API utilities and helpers
│   ├── types/           # TypeScript type definitions
│   └── App.tsx          # Main application component
```

#### Key Features

**1. Authentication Flow**
- Login/Signup pages with form validation
- Protected routes redirect unauthenticated users
- Token storage in localStorage
- Automatic token refresh validation

**2. Dashboard**
- Statistics overview (total entries, hours, streak, skills)
- Recent activity feed
- Quick access to add new entries

**3. Entry Management**
- Form with validation for adding/editing entries
- Tag-based skills input
- Image preview before upload
- Certificate display

**4. Data Visualization**
- Timeline view with filtering
- Analytics charts (domain distribution, trends)
- Heatmap calendar visualization

## Database Schema

### User Model
```prisma
model User {
  id           String          @id @default(uuid())
  firstName    String
  lastName     String
  email        String          @unique
  passwordHash String          @map("password_hash")
  createdAt    DateTime        @default(now())
  entries      LearningEntry[]
}
```

**Purpose**: Stores user account information with secure password hashing.

### LearningEntry Model
```prisma
model LearningEntry {
  id              String   @id @default(uuid())
  userId          String
  title           String
  platform        String
  domain          String
  subDomain       String?
  startDate       DateTime
  completionDate  DateTime
  skills          String[]
  description     String?
  reflection      String?
  certificatePath String?
  createdAt       DateTime  @default(now())
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

**Purpose**: Stores learning activity records with optional certificate attachments.

**Relations**: Each entry belongs to one user (foreign key relationship with cascade delete).

## Security Implementation

### Password Security
- **Hashing**: bcrypt with 10 salt rounds
- **Storage**: Only hashed passwords stored in database
- **Validation**: Minimum 6 characters enforced

### Authentication Security
- **JWT Tokens**: Signed tokens with expiration (7 days)
- **Token Storage**: localStorage (client-side)
- **Route Protection**: Middleware validates token on every protected request
- **Token Refresh**: Automatic validation on app load

### Data Security
- **User Isolation**: All queries filtered by userId
- **Authorization**: Users can only access their own entries
- **Input Validation**: Server-side validation for all inputs
- **File Upload**: Type and size restrictions (images only, 5MB max)

## API Endpoints

### Authentication
- `POST /auth/signup` - User registration
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user (protected)

### Learning Entries
- `POST /entries` - Create entry (protected)
- `GET /entries` - List entries with filters (protected)
- `GET /entries/:id` - Get entry details (protected)
- `PUT /entries/:id` - Update entry (protected)
- `DELETE /entries/:id` - Delete entry (protected)

### Analytics
- `GET /analytics/summary` - Dashboard statistics (protected)
- `GET /analytics/domain-distribution` - Domain breakdown (protected)
- `GET /analytics/yearly-trend` - Year-over-year trends (protected)
- `GET /analytics/platform-usage` - Platform statistics (protected)
- `GET /analytics/skills-frequency` - Skills analysis (protected)
- `GET /analytics/heatmap` - Calendar heatmap data (protected)

## Code Quality Features

### Backend
- **Separation of Concerns**: Controllers → Services → Database
- **Error Handling**: Centralized error middleware
- **Input Validation**: express-validator for all inputs
- **Type Safety**: TypeScript throughout
- **Code Comments**: Clear documentation of key functions

### Frontend
- **Component Structure**: Reusable, composable components
- **State Management**: React Context for authentication
- **Form Handling**: React Hook Form for validation
- **Error Handling**: User-friendly error messages
- **Loading States**: Proper loading indicators

## Academic Alignment

### Education Domain Reflection
- **Problem**: Students need to track learning progress and maintain portfolios
- **Solution**: Centralized learning history with analytics
- **Impact**: Helps users understand their learning patterns and skills development

### Technical Requirements Met
✅ **Database Persistence**: PostgreSQL with Prisma ORM  
✅ **User Authentication**: JWT-based secure authentication  
✅ **CRUD Operations**: Complete Create, Read, Update, Delete functionality  
✅ **Data Security**: Password hashing, route protection, user isolation  
✅ **Error Handling**: Comprehensive error handling at all layers  
✅ **Code Organization**: Clear folder structure and separation of concerns  

### Demonstration Readiness
- **User Registration**: Create account and login
- **Add Learning Entry**: Log a learning activity with certificate
- **View Dashboard**: See statistics and recent activity
- **Timeline View**: Browse all entries with filters
- **Analytics**: View learning patterns and trends
- **Data Export**: Export entries as JSON/CSV

## Setup Instructions

See `README.md` and `RUN.md` for detailed setup instructions.

**Quick Start**:
1. Install dependencies: `npm install` in both backend and frontend
2. Set up PostgreSQL database
3. Configure `.env` file in backend
4. Run migrations: `npm run prisma:migrate`
5. Start backend: `npm run dev`
6. Start frontend: `npm run dev`
7. Access at `http://localhost:5173`

## Future Enhancements (Not Implemented)

- Email verification
- Password reset functionality
- Social authentication (OAuth)
- Cloud storage for certificates
- Mobile application
- Advanced analytics and insights
- Learning goals and milestones

---

**Project Status**: ✅ Complete and Functional  
**Ready for**: Academic Evaluation, Live Demo, Viva Voce
