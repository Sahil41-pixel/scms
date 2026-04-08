import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getComplaintById } from "../../Services/ComplaintServices";
import { getErrorMessage } from "../../Utils/ErrorMessage";
import Spinner from "../../components/Spinner";
import toast from "react-hot-toast";

const statusColors = {
  "Pending":     { bg:"#f59e0b", icon:"fa-clock" },
  "In Progress": { bg:"#06b6d4", icon:"fa-spinner" },
  "On Working":  { bg:"#6366f1", icon:"fa-screwdriver-wrench" },
  "Resolved":    { bg:"#10b981", icon:"fa-circle-check" },
  "Rejected":    { bg:"#ef4444", icon:"fa-circle-xmark" },
};

const AdminTimeline = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    (async () => {
      try { const d = await getComplaintById(id); setComplaint(d.complaint); }
      catch(e) { toast.error(getErrorMessage(e)); } finally { setLoading(false); }
    })();
  }, [id]);

  if (loading) return <div style={{background:"var(--bg-primary)",minHeight:"100vh",paddingTop:"var(--navbar-height)"}}><Spinner/></div>;
  if (!complaint) return null;

  const cfg = statusColors[complaint.status] || { bg:"#6c757d", icon:"fa-circle" };

  return (
    <div style={{ background:"var(--bg-primary)", minHeight:"100vh", paddingTop:"var(--navbar-height)" }}>
      <div style={{ maxWidth:700, margin:"0 auto", padding:"2rem 1.5rem" }}>
        <button className="btn-ghost" style={{ marginBottom:"1.5rem", fontSize:"0.85rem" }} onClick={()=>navigate("/admin/complaints")}>
          <i className="fa-solid fa-arrow-left"></i>Back to All Complaints
        </button>

        <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid var(--border)", borderRadius:20, padding:"1.75rem", marginBottom:"1.5rem" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"0.75rem" }}>
            <h4 style={{ fontWeight:800, margin:0 }}>{complaint.title}</h4>
            <span style={{ background:cfg.bg+"22", border:`1px solid ${cfg.bg}44`, color:cfg.bg, padding:"4px 12px", borderRadius:99, fontSize:"0.75rem", fontWeight:700, whiteSpace:"nowrap" }}>
              {complaint.status}
            </span>
          </div>
          <p style={{ color:"var(--text-secondary)", fontSize:"0.88rem", marginBottom:"0.75rem" }}>{complaint.description}</p>
          <div style={{ display:"flex", flexWrap:"wrap", gap:"0.75rem", fontSize:"0.8rem", color:"var(--text-muted)" }}>
            <span><i className="fa-solid fa-tag me-1" style={{color:"#818cf8"}}></i>{complaint.category}</span>
            <span><i className="fa-solid fa-flag me-1" style={{color:"#f59e0b"}}></i>{complaint.priority}</span>
            {complaint.assignedTo && <span><i className="fa-solid fa-user-tie me-1" style={{color:"#10b981"}}></i>{complaint.assignedTo.username}</span>}
          </div>
          {complaint.status==="Rejected" && complaint.adminRemark && (
            <div style={{ background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.2)", borderLeft:"3px solid #ef4444", borderRadius:10, padding:"0.75rem 1rem", marginTop:"1rem", fontSize:"0.83rem", color:"#fca5a5" }}>
              <strong>Rejection Reason: </strong>{complaint.adminRemark}
            </div>
          )}
        </div>

        {complaint.status==="Resolved" && complaint.resolvedImageUrl && (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem", marginBottom:"1.5rem" }}>
            {[{label:"Complaint Photo",src:complaint.imageUrl,col:"var(--text-muted)"},{label:"Resolution Proof",src:complaint.resolvedImageUrl,col:"#10b981"}].map(img=>(
              <div key={img.label}>
                <p style={{ fontSize:"0.75rem", color:img.col, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:6 }}>{img.label}</p>
                <img src={img.src} alt={img.label} style={{ width:"100%", height:150, objectFit:"cover", borderRadius:12, border:"1px solid var(--border)" }}/>
              </div>
            ))}
          </div>
        )}

        <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid var(--border)", borderRadius:20, padding:"1.75rem" }}>
          <h6 style={{ fontWeight:800, marginBottom:"1.5rem", fontSize:"0.95rem" }}>
            <i className="fa-solid fa-timeline me-2" style={{color:"#818cf8"}}></i>Full Timeline
          </h6>
          <div style={{ position:"relative", paddingLeft:"2rem" }}>
            <div style={{ position:"absolute", left:9, top:0, bottom:0, width:2, background:"linear-gradient(180deg,rgba(99,102,241,0.5),rgba(99,102,241,0.05))" }}></div>
            {complaint.timeline.map((e,i) => {
              const isLast = i===complaint.timeline.length-1;
              return (
                <div key={i} style={{ position:"relative", marginBottom: isLast?0:"1.75rem" }}>
                  <div style={{ position:"absolute", left:"-2.05rem", top:2, width:22, height:22, borderRadius:"50%", background:isLast?cfg.bg:"rgba(255,255,255,0.08)", border:`2px solid ${isLast?cfg.bg:"rgba(255,255,255,0.12)"}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.55rem", color:"#fff", boxShadow:isLast?`0 0 12px ${cfg.bg}88`:"none" }}>
                    {isLast && <i className={`fa-solid ${cfg.icon}`}></i>}
                  </div>
                  <div style={{ fontWeight:700, fontSize:"0.88rem", color:isLast?cfg.bg:"var(--text-primary)", marginBottom:2 }}>{e.stage}</div>
                  {e.note && <div style={{ fontSize:"0.82rem", color:"var(--text-secondary)", marginBottom:2 }}>{e.note}</div>}
                  <div style={{ fontSize:"0.74rem", color:"var(--text-muted)" }}>
                    {new Date(e.timestamp).toLocaleString("en-IN",{day:"numeric",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"})}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
export default AdminTimeline;
