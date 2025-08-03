# Employee Task Management System

A comprehensive cross-platform employee task management system built with the MERN stack (MongoDB, Express.js, React, Node.js) that enables managers to assign and track daily tasks for employees, with an intelligent review system based on performance.

## 🚀 Features

### Core Functionality
- **Secure Authentication**: JWT-based login/logout system
- **Role-Based Access**: Separate dashboards for Managers and Employees
- **Task Management**: Create, assign, track, and submit tasks
- **Review System**: Performance-driven review tasks with rotation logic
- **Real-time Updates**: Live dashboard updates for task submissions
- **Employee Management**: Add/remove team members
- **Performance Analytics**: Module-wise performance tracking

### Advanced Features
- **Smart Review Logic**: Tasks appear more frequently based on weak performance (rotation pattern: 1, 1, 2, 1, 3...)
- **Module System**: 10 predefined training modules for comprehensive skill assessment
- **Auto-suggestions**: Intelligent review task recommendations based on employee performance
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **CORS** enabled for cross-origin requests

### Frontend
- **React** with Vite
- **Tailwind CSS** for styling
- **shadcn/ui** components
- **React Query** for API state management
- **React Router** for navigation
- **Axios** for HTTP requests

## 📁 Project Structure

```
employee-task-management-backend/
├── models/
│   ├── User.js          # User schema with module scores
│   ├── Task.js          # Task schema
│   └── Review.js        # Review schema
├── routes/
│   ├── auth.js          # Authentication routes
│   ├── users.js         # User management routes
│   ├── tasks.js         # Task management routes
│   └── reviews.js       # Review system routes
├── middleware/
│   └── auth.js          # JWT authentication middleware
├── static/              # Built React frontend files
├── server.js            # Main server file
├── .env                 # Environment variables
└── package.json         # Dependencies
└── controllers/
     ├── userController.js
     ├── taskController.js
     ├── reviewController.js
     └── authController.js


employee-task-management-frontend/
├── src/
│   ├── components/
│   │   ├── Login.jsx           # Authentication component
│   │   ├── Dashboard.jsx       # Main dashboard router
│   │   ├── ManagerDashboard.jsx # Manager interface
│   │   ├── EmployeeDashboard.jsx # Employee interface
│   │   └── Layout.jsx          # Common layout
│   ├── contexts/
│   │   └── AuthContext.jsx     # Authentication context
│   ├── services/
│   │   └── api.js              # API service layer
│   └── App.jsx                 # Main app component
├── dist/                       # Built files for production
└── package.json                # Dependencies
```

## 🚦 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or pnpm package manager

### Installation

1. **Clone or extract the project files**

2. **Backend Setup**
   ```bash
   cd employee-task-management-backend
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the backend directory:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/employee_task_management
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   JWT_EXPIRE=1d
   ```

4. **Start MongoDB**
   ```bash
   # If using local MongoDB
   sudo systemctl start mongod
   
   # Or use MongoDB Atlas cloud service
   ```

5. **Start the Backend Server**
   ```bash
   cd employee-task-management-backend
   npm start
   ```
   Server will run on http://localhost:5000

6. **Frontend Setup** (for development)
   ```bash
   cd employee-task-management-frontend
   pnpm install
   pnpm run dev
   ```
   Frontend will run on http://localhost:5173

### Production Deployment

The application is configured for full-stack deployment:

1. **Build the Frontend**
   ```bash
   cd employee-task-management-frontend
   pnpm run build
   ```

2. **Copy Built Files to Backend**
   ```bash
   cp -r dist/* ../employee-task-management-backend/static/
   ```

3. **Deploy Backend** (serves both API and frontend)
   ```bash
   cd employee-task-management-backend
   npm start
   ```

The backend server will serve both the API routes (`/api/*`) and the React frontend for all other routes.

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### User Management
- `GET /api/users` - Get all users (Manager only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (Manager only)
- `GET /api/users/employees` - Get employees only (Manager only)

### Task Management
- `POST /api/tasks` - Create task (Manager only)
- `GET /api/tasks` - Get tasks (filtered by role)
- `GET /api/tasks/:id` - Get task by ID
- `PUT /api/tasks/:id` - Update task (Manager only)
- `DELETE /api/tasks/:id` - Delete task (Manager only)
- `POST /api/tasks/:id/submit` - Submit task (Employee only)

### Review System
- `POST /api/reviews` - Create review task (Manager only)
- `GET /api/reviews` - Get review tasks (filtered by role)
- `GET /api/reviews/:id` - Get review by ID
- `POST /api/reviews/:id/submit` - Submit review (Employee only)
- `GET /api/reviews/suggestions/:employeeId` - Get review suggestions (Manager only)

## 👥 User Roles

### Manager Capabilities
- Create and assign tasks to employees
- View all tasks and their status
- Create review tasks based on employee performance
- View employee performance analytics
- Manage team members (add/remove employees)
- Access performance insights and suggestions

### Employee Capabilities
- View assigned tasks
- Submit completed tasks with notes
- View and complete review tasks
- Submit review tasks with feedback and self-scoring
- Track personal task history and performance

## 🔄 Review Logic System

The system implements an intelligent review rotation algorithm:

1. **Module Scoring**: Each employee has scores for 10 training modules (0-100)
2. **Weakness Detection**: Modules with lower scores are prioritized
3. **Rotation Pattern**: Weaker modules appear more frequently in review assignments
4. **Dynamic Adjustment**: Review frequency adjusts based on ongoing performance
5. **Auto-suggestions**: System suggests next review modules for managers

## 🎨 UI/UX Features

- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Modern Interface**: Clean, professional design using Tailwind CSS
- **Interactive Components**: Rich UI components from shadcn/ui
- **Real-time Updates**: Live dashboard updates using React Query
- **Intuitive Navigation**: Role-based navigation and protected routes
- **Accessibility**: Keyboard navigation and screen reader support

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt encryption for password storage
- **Role-based Access Control**: Protected routes and API endpoints
- **Input Validation**: Server-side validation for all inputs
- **CORS Configuration**: Proper cross-origin request handling

## 🚀 Deployment Options

### Option 1: Traditional Server Deployment
- Deploy to VPS, AWS EC2, or similar
- Use PM2 for process management
- Set up reverse proxy with Nginx
- Configure SSL certificates

### Option 2: Cloud Platform Deployment
- **Heroku**: Easy deployment with MongoDB Atlas
- **Vercel**: Frontend with serverless functions
- **Railway**: Full-stack deployment
- **DigitalOcean App Platform**: Managed deployment

### Option 3: Containerized Deployment
- Docker containers for both frontend and backend
- Docker Compose for local development
- Kubernetes for production scaling

## 📊 Performance Considerations

- **Database Indexing**: Optimized MongoDB queries
- **API Caching**: Efficient data fetching with React Query
- **Code Splitting**: Lazy loading for better performance
- **Asset Optimization**: Minified CSS and JavaScript
- **Responsive Images**: Optimized for different screen sizes

## 🔧 Development

### Running in Development Mode
```bash
# Terminal 1 - Backend
cd employee-task-management-backend
npm run dev

# Terminal 2 - Frontend
cd employee-task-management-frontend
pnpm run dev
```

### Testing
- Backend API can be tested using Postman or similar tools
- Frontend components can be tested in the browser
- MongoDB data can be viewed using MongoDB Compass

## 📝 License

This project is created for educational and assessment purposes.

## 🤝 Contributing

This is an assessment project. For production use, consider:
- Adding comprehensive unit and integration tests
- Implementing proper logging and monitoring
- Adding data backup and recovery procedures
- Implementing advanced security measures
- Adding performance monitoring and analytics

---

**Note**: This application successfully implements all requirements from the SRS document including secure authentication, task management, review logic with rotation, real-time updates, and responsive cross-platform design.

