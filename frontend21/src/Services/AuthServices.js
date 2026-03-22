import axios from "axios";

const API = import.meta.env.VITE_API_URL;

// ─── Register a new user ────────────────────────────────────
export const registerUser = async (userData) => {
  const { data } = await axios.post(`${API}/user/register`, userData);
  return data;
};

// ─── Register a new admin (requires secret key) ─────────────
export const registerAdmin = async (userData) => {
  const { data } = await axios.post(`${API}/user/admin/register`, userData);
  return data;
};

// ─── Login (works for all roles) ────────────────────────────
export const loginUser = async (userData) => {
  const { data } = await axios.post(`${API}/user/login`, userData);
  return data;
};
