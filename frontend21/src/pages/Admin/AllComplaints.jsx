import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllComplaints } from "../../Services/ComplaintServices";
import { getErrorMessage } from "../../Utils/ErrorMessage";
import ComplaintCard from "../../components/ComplaintCard/ComplaintCard";
import AdminComplaintModal from "../../components/AdminComplaintModal";
import Spinner from "../../components/Spinner";
import toast from "react-hot-toast";
import "./AllComplaints.css";

const STATUSES   = ["","Pending","In Progress","On Working","Resolved","Rejected"];
const CATEGORIES = ["","Infrastructure","Hostel","Food","Transport","Cleanliness","Other"];
const PRIORITIES = ["","Low","Medium","High"];

const AllComplaints = () => {
  const navigate = useNavigate();
  const [complaints,  setComplaints]  = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [modalTarget, setModalTarget] = useState(null);
  const [filters, setFilters] = useState({ status:"", category:"", priority:"" });

  useEffect(() => { fetchComplaints(); }, [filters]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const active = Object.fromEntries(Object.entries(filters).filter(([,v])=>v!==""));
      const data   = await getAllComplaints(active);
      setComplaints(data.complaints);
    } catch(e) { toast.error(getErrorMessage(e)); }
    finally { setLoading(false); }
  };

  const clearFilters = () => setFilters({ status:"", category:"", priority:"" });
  const hasActive = Object.values(filters).some(v=>v!=="");

  return (
    <div className="all-cp-page">
      <div style={{ maxWidth:1300, margin:"0 auto", padding:"2rem 1.5rem" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:"1rem", marginBottom:"1.5rem" }}>
          <div>
            <h3 style={{ fontWeight:900, marginBottom:2 }}>All <span className="glow-text">Complaints</span></h3>
            <p style={{ color:"var(--text-muted)", margin:0, fontSize:"0.85rem" }}>{complaints.length} results</p>
          </div>
        </div>

        {/* Filters */}
        <div className="filter-row">
          {[
            { key:"status",   opts:STATUSES,   placeholder:"All Statuses" },
            { key:"category", opts:CATEGORIES, placeholder:"All Categories" },
            { key:"priority", opts:PRIORITIES, placeholder:"All Priorities" },
          ].map(f=>(
            <select key={f.key} className="filter-select-prem"
              value={filters[f.key]}
              onChange={e=>setFilters(prev=>({...prev,[f.key]:e.target.value}))}>
              <option value="">{f.placeholder}</option>
              {f.opts.filter(Boolean).map(o=><option key={o} value={o}>{o}</option>)}
            </select>
          ))}
          {hasActive && (
            <button className="btn-ghost" style={{ padding:"0.4rem 1rem", fontSize:"0.82rem" }} onClick={clearFilters}>
              <i className="fa-solid fa-xmark me-1"></i>Clear
            </button>
          )}
        </div>

        {/* Info note */}
        <div style={{ background:"rgba(99,102,241,0.06)", border:"1px solid rgba(99,102,241,0.15)", borderRadius:10, padding:"0.65rem 1rem", marginBottom:"1.5rem", fontSize:"0.82rem", color:"#818cf8", display:"flex", alignItems:"center", gap:8 }}>
          <i className="fa-solid fa-circle-info"></i>
          Use <strong>Assign</strong> to delegate to an employee, or <strong>Reject</strong> with a required reason. View the <strong>Timeline</strong> for full history.
        </div>

        {loading ? <Spinner/> : complaints.length===0 ? (
          <div style={{ textAlign:"center", padding:"5rem 1rem", color:"var(--text-muted)" }}>
            <i className="fa-solid fa-inbox" style={{ fontSize:"3rem", marginBottom:"1rem", display:"block" }}></i>
            <p>No complaints found{hasActive?" for selected filters":""}.</p>
          </div>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:"1rem" }}>
            {complaints.map(c=>(
              <ComplaintCard key={c._id} complaint={c}
                isAdmin={true}
                onAssign={c=>setModalTarget(c)}
                onReject={c=>setModalTarget(c)}
                onViewTimeline={id=>navigate(`/admin/timeline/${id}`)}
              />
            ))}
          </div>
        )}
      </div>

      {modalTarget && (
        <AdminComplaintModal
          complaint={modalTarget}
          onSuccess={fetchComplaints}
          onClose={()=>setModalTarget(null)}
        />
      )}
    </div>
  );
};
export default AllComplaints;
