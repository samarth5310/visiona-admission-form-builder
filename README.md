# Visiona Admin System

A secure React-based admin dashboard for student management with authentication, fees tracking, homework management, and attendance monitoring.

## 🔐 Security Features

- **Bcrypt Password Hashing**: All passwords are securely hashed using bcrypt
- **Row Level Security (RLS)**: Database access controlled via Supabase RLS policies
- **Secure Authentication**: Server-side password verification using secure functions
- **Session Management**: Secure session handling with automatic cleanup

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm 8+
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd visiona-admin
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Copy environment file
   cp .env.example .env
   
   # Edit .env with your Supabase credentials
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:5173
   ```

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # shadcn/ui components
│   ├── Navigation.tsx   # Main navigation
│   └── ProtectedRoute.tsx
├── contexts/            # React contexts
│   └── AuthContext.tsx  # Authentication context
├── pages/               # Page components
│   ├── Login.tsx
│   ├── Students.tsx
│   ├── Fees.tsx
│   ├── Homework.tsx
│   └── Attendance.tsx
├── integrations/        # External service integrations
│   └── supabase/        # Supabase client and types
└── lib/                 # Utility functions
```

## 🛠️ Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run preview          # Preview production build

# Code Quality
npm run lint             # Run ESLint
npm run type-check       # TypeScript type checking
```

## 📊 Features

### 🔑 Authentication
- Secure login with mobile number and password
- Bcrypt password hashing
- Session persistence
- Automatic logout on invalid sessions

### 👥 Student Management
- Student registration and profiles
- Student search and filtering
- Student status tracking

### 💰 Fees Management
- Fee structure setup
- Payment tracking
- Receipt generation
- Payment history

### 📚 Homework Management
- Assignment creation and distribution
- Google Drive integration
- Homework tracking by class/student

### 📅 Attendance Management
- Daily attendance marking
- Attendance history
- WhatsApp integration for absent notifications

## 🔧 Technology Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **React Router** - Navigation

### Backend
- **Supabase** - Backend as a Service
- **PostgreSQL** - Database
- **Row Level Security** - Access control

### Security
- **bcrypt** - Password hashing
- **RLS Policies** - Database security
- **HTTPS** - Secure communication

## 🔒 Security Implementation

### Database Security
```sql
-- Example: Secure authentication function
CREATE OR REPLACE FUNCTION public.authenticate_user(
  input_mobile_number TEXT,
  input_password TEXT
)
RETURNS TABLE(user_id UUID, user_name TEXT, mobile_number TEXT, user_role TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
```

### RLS Policies
- All tables protected with appropriate RLS policies
- User-specific data access controls
- Admin-only operations secured

## 📱 Mobile Responsive

The application is fully responsive and works seamlessly on:
- 📱 Mobile devices (320px+)
- 📱 Tablets (768px+)
- 💻 Desktop (1024px+)

## 🚀 Deployment

### Supabase Setup
1. Create a new Supabase project
2. Run the database migrations
3. Configure authentication settings
4. Set up RLS policies

### Frontend Deployment
```bash
# Build for production
npm run build

# Deploy to your preferred hosting service
# (Vercel, Netlify, etc.)
```

## 📄 Environment Variables

```bash
# Required
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key

# Optional (for development)
VITE_APP_ENV=development
```

## 🐛 Troubleshooting

### Common Issues

1. **Login fails**: Check Supabase credentials and RLS policies
2. **Build errors**: Ensure all dependencies are installed
3. **Database errors**: Verify migration status

### Getting Help
- Check the console for error messages
- Verify environment variables
- Review the Security.md file for security-related issues

## 📝 License

This project is proprietary software. All rights reserved.

## 🤝 Contributing

This is a private project. For internal development only.

---

**Version**: 1.0.0  
**Last Updated**: December 2024