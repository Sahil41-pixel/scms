# SCMS — Smart Complaint Management System

> Stack: Node.js · Express · MongoDB · JWT · Cloudinary · React (Vite) · Bootstrap 5

---

## What's Different in This Version

| Feature | How it works |
|---|---|
| **User can edit complaints** | Only while status is "Pending". Opens a pre-filled modal. |
| **Admin assigns only** | Admin's primary action is to assign a complaint to an employee. |
| **Admin rejects with remark** | Admin can reject with a mandatory written reason. No reason = blocked. |
| **User sees rejected complaints** | Rejection reason shown clearly on the card and timeline. |
| **Employee resolves only** | Employee can only mark as Resolved (requires proof image). |
| **Delete blocked if not Pending** | User can only delete complaints still in Pending status. |

---

## Project Structure

```
scms/
├── backend/
│   ├── config/
│   │   ├── db.js               — MongoDB connection
│   │   └── cloudinary.js       — Cloudinary + Multer setup
│   ├── controllers/
│   │   ├── userController.js   — register, adminRegister, login
│   │   ├── complaintController.js — submit, getAll, getById, update, delete
│   │   ├── adminController.js  — stats, assign, reject, promote, demote
│   │   └── employeeController.js — assigned, resolve, resolved list
│   ├── middlewares/
│   │   ├── authMiddleware.js   — JWT verification
│   │   ├── adminMiddleware.js  — Admin role check
│   │   └── employeeMiddleware.js — Employee role check
│   ├── models/
│   │   ├── userModel.js        — User schema (role: user/admin/employee)
│   │   └── complaintModel.js   — Complaint schema with timeline array
│   ├── routes/
│   │   ├── userRoute.js
│   │   ├── complaintRoute.js
│   │   ├── adminRoute.js
│   │   └── employeeRoute.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── Landing/          — Home landing page
    │   │   ├── Auth/             — Login + Register
    │   │   ├── User/             — Dashboard, MyComplaints, Timeline
    │   │   ├── Admin/            — Dashboard, AllComplaints, ManageUsers, Timeline
    │   │   └── Employee/         — Dashboard, ResolvedComplaints
    │   ├── components/
    │   │   ├── Layout/Navbar.jsx
    │   │   ├── ComplaintCard/    — Universal card used by all roles
    │   │   ├── SubmitComplaint.jsx  — Submit modal (user)
    │   │   ├── EditComplaint.jsx    — Edit modal (user, Pending only)
    │   │   ├── AdminComplaintModal.jsx — Assign/Reject modal (admin)
    │   │   ├── UpdateStatus.jsx     — Resolve modal (employee)
    │   │   ├── ProtectedRoute.jsx
    │   │   └── Spinner.jsx
    │   ├── Services/
    │   │   ├── AuthServices.js
    │   │   └── ComplaintServices.js
    │   └── Utils/
    │       └── ErrorMessage.js
    ├── index.html
    ├── .env
    └── package.json
```

---

## Quick Setup

### 1. Backend

```bash
cd scms/backend
npm install
```

Copy `.env.example` to `.env` and fill in your values:

```env
PORT=8080
MONGO_URL=your_mongodb_atlas_url
JWT_SECRET=scms_super_secret_key_2024
ADMIN_SECRET_KEY=scms_admin_key_123
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

```bash
npm run dev
# → Server running on port 8080
# → MongoDB Connected
```

### 2. Frontend

```bash
cd scms/frontend
npm install
npm run dev
# → http://localhost:5173
```

---

## API Endpoints

### Auth
| Method | URL | Auth | Description |
|---|---|---|---|
| POST | /api/v1/user/register | No | Register as user |
| POST | /api/v1/user/admin/register | No | Register as admin (needs secretKey) |
| POST | /api/v1/user/login | No | Login (all roles) |

### Complaints (User)
| Method | URL | Auth | Description |
|---|---|---|---|
| POST | /api/v1/complaint/submit | User | Submit with optional image |
| GET | /api/v1/complaint/my | User | Get my complaints (all statuses) |
| GET | /api/v1/complaint/:id | User | Get single complaint + timeline |
| PUT | /api/v1/complaint/update/:id | User | Edit complaint (Pending only) |
| DELETE | /api/v1/complaint/delete/:id | User | Delete (Pending only) |

### Admin
| Method | URL | Auth | Description |
|---|---|---|---|
| GET | /api/v1/admin/stats | Admin | Dashboard statistics |
| GET | /api/v1/admin/complaints | Admin | All complaints (with filters) |
| GET | /api/v1/admin/users | Admin | All users |
| GET | /api/v1/admin/employees | Admin | All employees |
| PATCH | /api/v1/admin/assign/:id | Admin | Assign to employee |
| PATCH | /api/v1/admin/reject/:id | Admin | Reject with remark (mandatory) |
| PATCH | /api/v1/admin/promote/:id | Admin | Promote user → employee |
| PATCH | /api/v1/admin/demote/:id | Admin | Demote employee → user |

### Employee
| Method | URL | Auth | Description |
|---|---|---|---|
| GET | /api/v1/employee/my-complaints | Employee | Assigned complaints |
| GET | /api/v1/employee/resolved | Employee | My resolved complaints |
| PATCH | /api/v1/employee/update/:id | Employee | Mark Resolved + proof image |

---

## Role-Based Flow

```
User         → Submit complaint
                ↓ (status: Pending)
User         → Can Edit (title/desc/category/priority/image) while Pending
User         → Can Delete while Pending
                ↓
Admin        → Reviews complaint
              Option A: Assign to Employee
                ↓ (status: In Progress, timeline updated)
              Option B: Reject with mandatory reason
                ↓ (status: Rejected, user sees reason on card + timeline)
                ↓
Employee     → Sees assigned complaint
             → Marks Resolved + uploads proof image
                ↓ (status: Resolved, timeline updated)
                ↓
User         → Can see full timeline
             → Can see rejection reason if rejected
             → Can see both photos if resolved
```

---

## localStorage Format

```js
localStorage.key = "scms"
localStorage.value = {
  token: "jwt_token_here",
  user: {
    id: "mongo_id",
    username: "John",
    email: "john@email.com",
    role: "user" // or "admin" or "employee"
  }
}
```

---

## Test Flow

```
1. Register user at /register
2. Login → redirected to /home
3. Submit a complaint with image
4. Edit the complaint (still Pending) → changes saved
5. Logout

6. Register admin at /register (toggle Admin, enter secret key)
7. Login as admin → /admin dashboard shows stats
8. Go to All Complaints → see the complaint
9. Click Assign → select an employee → complaint goes In Progress
   OR click Reject → enter a reason → complaint is Rejected
10. Logout

11. Login as user → My Complaints shows Rejected with reason
    OR complaint shows In Progress

12. (If assigned) Login as employee → see complaint in dashboard
13. Click Mark Resolved → attach proof image → submit
14. Go to Resolved page → see both images

15. Login as user → View Progress → full timeline with all stages
```
