# 🛡️ SCMS — Smart Complaint Management System

A full-stack complaint management platform with role-based access control, 
real-time status tracking, and a premium dark UI powered by Three.js and Recharts.

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Three.js, Recharts |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Auth | JWT (JSON Web Tokens) |
| File Upload | Cloudinary, Multer |
| Styling | Bootstrap 5, Custom CSS (Dark Theme) |

---

## ✨ Features

### 👤 User
- Submit complaints with image attachment
- Edit complaints while still Pending
- Delete complaints while still Pending
- View real-time timeline of every status change
- See rejection reason directly on the card

### 🛡️ Admin
- View all complaints with filters (status, category, priority)
- Assign complaints to employees
- Reject complaints with a mandatory reason
- Promote users to employees or demote them back
- Dashboard with Recharts pie chart, bar chart and progress bars

### 👷 Employee
- View complaints assigned to them
- Mark complaint as On Working
- Mark complaint as Resolved with proof image
- View all resolved complaints history

---

## 🎨 UI Highlights

- **Three.js** 3D animated backgrounds on Login, Register, Landing, Dashboards
- **Recharts** Donut chart, Bar chart, Radial bar chart on Admin Dashboard
- **3D Card Carousel** on User Dashboard
- **Glassmorphism** dark theme throughout
- **Gradient** buttons, badges, stat cards
- Fully **responsive** on all screen sizes

---

## 🔄 Complaint Flow
```
User Submits → Pending
      ↓
Admin Reviews
      ├── Assign to Employee → In Progress
      │         ↓
      │   Employee → On Working
      │         ↓
      │   Employee → Resolved (with proof image)
      │
      └── Reject (with mandatory reason)
                ↓
          User sees rejection reason on card
```

---

## ⚙️ Setup

### Backend
```bash
cd backend
npm install
# copy .env.example to .env and fill in your values
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Environment Variables
```env
# backend/.env
PORT=8080
MONGO_URL=your_mongodb_url
JWT_SECRET=your_jwt_secret
ADMIN_SECRET_KEY=your_admin_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```
```env
# frontend/.env
VITE_API_URL=http://localhost:8080/api/v1
```

---

## 📁 Project Structure
```
scms/
├── backend/
│   ├── config/          # DB and Cloudinary setup
│   ├── controllers/     # Business logic
│   ├── middlewares/     # Auth, Admin, Employee guards
│   ├── models/          # User and Complaint schemas
│   ├── routes/          # API endpoints
│   └── server.js
│
└── frontend/
    └── src/
        ├── components/  # Navbar, Cards, Modals
        ├── pages/       # Landing, Auth, User, Admin, Employee
        ├── Services/    # All API calls
        └── Utils/       # Error handler
```

---

## 📡 API Endpoints

### Auth
```
POST /api/v1/user/register
POST /api/v1/user/admin/register
POST /api/v1/user/login
```

### User
```
POST   /api/v1/complaint/submit
GET    /api/v1/complaint/my
GET    /api/v1/complaint/:id
PUT    /api/v1/complaint/update/:id
DELETE /api/v1/complaint/delete/:id
```

### Admin
```
GET    /api/v1/admin/stats
GET    /api/v1/admin/complaints
PATCH  /api/v1/admin/assign/:id
PATCH  /api/v1/admin/reject/:id
PATCH  /api/v1/admin/promote/:id
PATCH  /api/v1/admin/demote/:id
```

### Employee
```
GET    /api/v1/employee/my-complaints
GET    /api/v1/employee/resolved
PATCH  /api/v1/employee/update/:id
```

---

## 👨‍💻 Author

Built with ❤️ using the MERN stack