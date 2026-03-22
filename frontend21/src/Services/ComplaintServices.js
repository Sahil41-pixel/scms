import axios from "axios";

const API = import.meta.env.VITE_API_URL;

// ─── Helper: get token from localStorage ───────────────────
const getToken = () => JSON.parse(localStorage.getItem("scms"))?.token;

// ─── Helper: set auth header before every request ──────────
const authHeader = () => {
  axios.defaults.headers.common["Authorization"] = getToken();
};

// ════════════════════════════════════════════════
//  USER SERVICES
// ════════════════════════════════════════════════

// Submit new complaint (with optional image)
export const submitComplaint = async (formData) => {
  authHeader();
  const { data } = await axios.post(`${API}/complaint/submit`, formData);
  return data;
};

// Get all my complaints (includes Rejected ones)
export const getMyComplaints = async () => {
  authHeader();
  const { data } = await axios.get(`${API}/complaint/my`);
  return data;
};

// Get single complaint with full timeline
export const getComplaintById = async (id) => {
  authHeader();
  const { data } = await axios.get(`${API}/complaint/${id}`);
  return data;
};

// Update my complaint (only while Pending)
export const updateComplaint = async (id, formData) => {
  authHeader();
  const { data } = await axios.put(`${API}/complaint/update/${id}`, formData);
  return data;
};

// Delete my complaint (only while Pending)
export const deleteComplaint = async (id) => {
  authHeader();
  const { data } = await axios.delete(`${API}/complaint/delete/${id}`);
  return data;
};

// ════════════════════════════════════════════════
//  ADMIN SERVICES
// ════════════════════════════════════════════════

// Get all complaints with optional filters
export const getAllComplaints = async (filters = {}) => {
  authHeader();
  const { data } = await axios.get(`${API}/admin/complaints`, { params: filters });
  return data;
};

// Get dashboard stats
export const getDashboardStats = async () => {
  authHeader();
  const { data } = await axios.get(`${API}/admin/stats`);
  return data;
};

// Get all users (role: user)
export const getAllUsers = async () => {
  authHeader();
  const { data } = await axios.get(`${API}/admin/users`);
  return data;
};

// Get all employees
export const getAllEmployees = async () => {
  authHeader();
  const { data } = await axios.get(`${API}/admin/employees`);
  return data;
};

// Promote user to employee
export const promoteToEmployee = async (userId) => {
  authHeader();
  const { data } = await axios.patch(`${API}/admin/promote/${userId}`);
  return data;
};

// Demote employee back to user
export const demoteToUser = async (userId) => {
  authHeader();
  const { data } = await axios.patch(`${API}/admin/demote/${userId}`);
  return data;
};

// Assign complaint to an employee
export const assignComplaint = async (complaintId, employeeId) => {
  authHeader();
  const { data } = await axios.patch(`${API}/admin/assign/${complaintId}`, { employeeId });
  return data;
};

// Reject a complaint with a mandatory remark
export const rejectComplaint = async (complaintId, adminRemark) => {
  authHeader();
  const { data } = await axios.patch(`${API}/admin/reject/${complaintId}`, { adminRemark });
  return data;
};

// ════════════════════════════════════════════════
//  EMPLOYEE SERVICES
// ════════════════════════════════════════════════

// Get complaints assigned to me (In Progress)
export const getAssignedComplaints = async () => {
  authHeader();
  const { data } = await axios.get(`${API}/employee/my-complaints`);
  return data;
};

// Get my resolved complaints
export const getResolvedComplaints = async () => {
  authHeader();
  const { data } = await axios.get(`${API}/employee/resolved`);
  return data;
};

// Mark complaint as Resolved (requires proof image)
export const employeeUpdateStatus = async (complaintId, formData) => {
  authHeader();
  const { data } = await axios.patch(`${API}/employee/update/${complaintId}`, formData);
  return data;
};
