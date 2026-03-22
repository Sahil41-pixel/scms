import React, { useEffect, useState } from "react";
import { getResolvedComplaints } from "../../Services/ComplaintServices";
import { getErrorMessage } from "../../Utils/ErrorMessage";
import Spinner from "../../components/Spinner";
import toast from "react-hot-toast";
import "./ResolvedComplaints.css";

const ResolvedComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    (async () => {
      try { const d = await getResolvedComplaints(); setComplaints(d.complaints); }
      catch(e) { toast.error(getErrorMessage(e)); } finally { setLoading(false); }
    })();
  }, []);

  return (
    <div className="resolved-page">
      <div className="resolved-container">
        <div style={{ marginBottom:"1.75rem" }}>
          <h3 style={{ fontWeight:900, marginBottom:4 }}>Resolved <span className="glow-text">Complaints</span></h3>
          <p style={{ color:"var(--text-muted)", margin:0, fontSize:"0.85rem" }}>Complaints you have successfully resolved</p>
        </div>

        {loading ? <Spinner/> : complaints.length===0 ? (
          <div style={{ textAlign:"center", padding:"5rem 1rem", background:"rgba(255,255,255,0.02)", border:"1px solid rgba(16,185,129,0.15)", borderRadius:16, color:"var(--text-muted)" }}>
            <i className="fa-solid fa-circle-check fa-3x" style={{ marginBottom:"1rem", display:"block", color:"#10b981" }}></i>
            <h5 style={{ color:"var(--text-secondary)" }}>No resolved complaints yet</h5>
            <p style={{ fontSize:"0.85rem" }}>Complaints you resolve will appear here.</p>
          </div>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))", gap:"1.25rem" }}>
            {complaints.map(c=>(
              <div key={c._id} className="resolved-card">
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"0.5rem" }}>
                  <h6 style={{ fontWeight:700, margin:0, color:"var(--text-primary)", fontSize:"0.95rem" }}>{c.title}</h6>
                  <span style={{ background:"rgba(16,185,129,0.15)", border:"1px solid rgba(16,185,129,0.3)", color:"#10b981", padding:"2px 10px", borderRadius:99, fontSize:"0.72rem", fontWeight:700, whiteSpace:"nowrap", marginLeft:"0.5rem" }}>
                    Resolved
                  </span>
                </div>
                <p style={{ fontSize:"0.83rem", color:"var(--text-secondary)", marginBottom:"0.6rem", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>
                  {c.description}
                </p>
                <div style={{ display:"flex", flexWrap:"wrap", gap:"0.5rem", fontSize:"0.75rem", color:"var(--text-muted)", marginBottom:"0.85rem" }}>
                  <span><i className="fa-solid fa-tag me-1" style={{color:"#818cf8"}}></i>{c.category}</span>
                  <span><i className="fa-solid fa-user me-1"></i>{c.submittedBy?.username}</span>
                  <span><i className="fa-solid fa-calendar me-1"></i>{new Date(c.updatedAt).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}</span>
                </div>
                {/* Both images */}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.6rem" }}>
                  {c.imageUrl && (
                    <div>
                      <p style={{ fontSize:"0.7rem", color:"var(--text-muted)", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.4px", marginBottom:4 }}>
                        <i className="fa-solid fa-image me-1"></i>Original
                      </p>
                      <img src={c.imageUrl} alt="Complaint" className="resolved-img"/>
                    </div>
                  )}
                  {c.resolvedImageUrl && (
                    <div>
                      <p style={{ fontSize:"0.7rem", color:"#10b981", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.4px", marginBottom:4 }}>
                        <i className="fa-solid fa-circle-check me-1"></i>Resolution
                      </p>
                      <img src={c.resolvedImageUrl} alt="Resolved" className="resolved-img"/>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default ResolvedComplaints;
