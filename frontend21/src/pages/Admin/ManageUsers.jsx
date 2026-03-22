import React, { useEffect, useState } from "react";
import { getAllUsers, getAllEmployees, promoteToEmployee, demoteToUser } from "../../Services/ComplaintServices";
import { getErrorMessage } from "../../Utils/ErrorMessage";
import Spinner from "../../components/Spinner";
import toast from "react-hot-toast";
import "./ManageUsers.css";

const ManageUsers = () => {
  const [users,     setUsers]     = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [tab,       setTab]       = useState("users");

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try { setLoading(true); const [u,e] = await Promise.all([getAllUsers(),getAllEmployees()]); setUsers(u.users); setEmployees(e.employees); }
    catch(e) { toast.error(getErrorMessage(e)); } finally { setLoading(false); }
  };

  const handlePromote = async (id, name) => {
    if (!window.confirm(`Promote ${name} to employee?`)) return;
    try { await promoteToEmployee(id); toast.success(`${name} is now an employee!`); fetchAll(); }
    catch(e) { toast.error(getErrorMessage(e)); }
  };

  const handleDemote = async (id, name) => {
    if (!window.confirm(`Demote ${name} back to user?`)) return;
    try { await demoteToUser(id); toast.success(`${name} demoted to user.`); fetchAll(); }
    catch(e) { toast.error(getErrorMessage(e)); }
  };

  const tableData = tab==="users" ? users : employees;
  const gradUser  = "linear-gradient(135deg,#6366f1,#8b5cf6)";
  const gradEmp   = "linear-gradient(135deg,#10b981,#059669)";

  return (
    <div className="manage-page">
      <div style={{ maxWidth:1100, margin:"0 auto", padding:"2rem 1.5rem" }}>
        <div style={{ marginBottom:"1.5rem" }}>
          <h3 style={{ fontWeight:900, marginBottom:4 }}>Manage <span className="glow-text">Users</span></h3>
          <p style={{ color:"var(--text-muted)", margin:0, fontSize:"0.85rem" }}>Promote users to employees or demote employees back</p>
        </div>

        {/* Tab bar */}
        <div className="tab-bar-premium" style={{ marginBottom:"1.5rem", maxWidth:300 }}>
          <button className={`tab-btn-premium ${tab==="users"?"active":""}`} onClick={()=>setTab("users")}>
            <i className="fa-solid fa-user me-1"></i>Users ({users.length})
          </button>
          <button className={`tab-btn-premium ${tab==="employees"?"active":""}`} onClick={()=>setTab("employees")}>
            <i className="fa-solid fa-user-tie me-1"></i>Employees ({employees.length})
          </button>
        </div>

        {loading ? <Spinner/> : tableData.length===0 ? (
          <div style={{ textAlign:"center", padding:"4rem 1rem", color:"var(--text-muted)" }}>
            <i className={`fa-solid ${tab==="users"?"fa-users":"fa-user-tie"} fa-3x`} style={{ marginBottom:"1rem", display:"block" }}></i>
            <p>No {tab} found.</p>
          </div>
        ) : (
          <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid var(--border)", borderRadius:16, overflow:"hidden" }}>
            <table className="prem-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Joined</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((u,i) => (
                  <tr key={u._id}>
                    <td style={{ color:"var(--text-muted)", width:40 }}>{i+1}</td>
                    <td>
                      <div className="av-cell">
                        <div className="av-circle" style={{ background: tab==="users"?gradUser:gradEmp }}>
                          {u.username[0].toUpperCase()}
                        </div>
                        <span style={{ fontWeight:600, color:"var(--text-primary)" }}>{u.username}</span>
                      </div>
                    </td>
                    <td style={{ color:"var(--text-muted)", fontSize:"0.85rem" }}>{u.email}</td>
                    <td style={{ color:"var(--text-muted)", fontSize:"0.82rem" }}>
                      {new Date(u.createdAt).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}
                    </td>
                    <td>
                      {tab==="users" ? (
                        <button
                          style={{ background:"rgba(16,185,129,0.1)", border:"1px solid rgba(16,185,129,0.25)", color:"#10b981", borderRadius:99, padding:"0.3rem 0.85rem", fontSize:"0.78rem", fontWeight:600, cursor:"pointer", transition:"all 0.2s", display:"inline-flex", alignItems:"center", gap:4 }}
                          onClick={()=>handlePromote(u._id, u.username)}
                        >
                          <i className="fa-solid fa-arrow-up"></i>Promote
                        </button>
                      ) : (
                        <button
                          style={{ background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.25)", color:"#ef4444", borderRadius:99, padding:"0.3rem 0.85rem", fontSize:"0.78rem", fontWeight:600, cursor:"pointer", transition:"all 0.2s", display:"inline-flex", alignItems:"center", gap:4 }}
                          onClick={()=>handleDemote(u._id, u.username)}
                        >
                          <i className="fa-solid fa-arrow-down"></i>Demote
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
export default ManageUsers;
