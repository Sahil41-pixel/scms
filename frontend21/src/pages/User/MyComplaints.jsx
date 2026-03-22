import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyComplaints, deleteComplaint } from "../../Services/ComplaintServices";
import { getErrorMessage } from "../../Utils/ErrorMessage";
import ComplaintCard from "../../components/ComplaintCard/ComplaintCard";
import SubmitComplaint from "../../components/SubmitComplaint";
import EditComplaint from "../../components/EditComplaint";
import Spinner from "../../components/Spinner";
import toast from "react-hot-toast";
import "./MyComplaints.css";

const FILTERS = ["All","Pending","In Progress","On Working","Resolved","Rejected"];

const MyComplaints = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [filter,     setFilter]     = useState("All");
  const [showSubmit, setShowSubmit] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  useEffect(() => { fetchComplaints(); }, []);

  const fetchComplaints = async () => {
    try { setLoading(true); const d = await getMyComplaints(); setComplaints(d.complaints); }
    catch(e) { toast.error(getErrorMessage(e)); } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this complaint?")) return;
    try { await deleteComplaint(id); toast.success("Deleted."); fetchComplaints(); }
    catch(e) { toast.error(getErrorMessage(e)); }
  };

  const filtered = filter==="All" ? complaints : complaints.filter(c=>c.status===filter);
  

  return (
    <div className="my-cp-page">
      <div style={{ maxWidth:1300, margin:"0 auto", padding:"2rem 1.5rem" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:"1rem", marginBottom:"1.5rem" }}>
          <div>
            <h3 style={{ fontWeight:900, marginBottom:2 }}>My <span className="glow-text">Complaints</span></h3>
            <p style={{ color:"var(--text-muted)", margin:0, fontSize:"0.85rem" }}>{complaints.length} total</p>
          </div>
          <button className="btn-premium" onClick={()=>setShowSubmit(true)}>
            <i className="fa-solid fa-plus"></i>New Complaint
          </button>
        </div>


        <div className="filter-strip">
          {FILTERS.map(f=>(
            <button key={f} className={`filter-chip ${filter===f?"active":""}`} onClick={()=>setFilter(f)}>
              {f}
              {f!=="All" && (
                <span className="filter-count">{complaints.filter(c=>c.status===f).length}</span>
              )}
            </button>
          ))}
        </div>

        {loading ? <Spinner/> : filtered.length===0 ? (
          <div className="empty-prem">
            <div style={{ fontSize:"3rem", marginBottom:"1rem" }}>📋</div>
            <h5 style={{ color:"var(--text-secondary)" }}>{filter==="All"?"No complaints yet":`No ${filter} complaints`}</h5>
            {filter==="All" && <button className="btn-premium" style={{ marginTop:"0.75rem" }} onClick={()=>setShowSubmit(true)}><i className="fa-solid fa-plus"></i>Submit First Complaint</button>}
          </div>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:"1rem" }}>
            {filtered.map(c=>(
              <ComplaintCard key={c._id} complaint={c}
                onViewTimeline={id=>navigate(`/complaint/${id}`)}
                onEdit={c=>setEditTarget(c)}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
      {showSubmit && <SubmitComplaint onSuccess={fetchComplaints} onClose={()=>setShowSubmit(false)}/>}
      {editTarget  && <EditComplaint complaint={editTarget} onSuccess={fetchComplaints} onClose={()=>setEditTarget(null)}/>}
    </div>
  );
};
export default MyComplaints;
