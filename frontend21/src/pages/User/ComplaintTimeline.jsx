import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import * as THREE from "three";
import { getComplaintById } from "../../Services/ComplaintServices";
import { getErrorMessage } from "../../Utils/ErrorMessage";
import Spinner from "../../components/Spinner";
import toast from "react-hot-toast";
import "./ComplaintTimeline.css";

const statusColors = {
  "Pending":     { bg:"#f59e0b", icon:"fa-clock" },
  "In Progress": { bg:"#06b6d4", icon:"fa-spinner" },
  "On Working":  { bg:"#6366f1", icon:"fa-screwdriver-wrench" },
  "Resolved":    { bg:"#10b981", icon:"fa-circle-check" },
  "Rejected":    { bg:"#ef4444", icon:"fa-circle-xmark" },
};

const ComplaintTimeline = () => {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const bgRef     = useRef(null);
  const [complaint, setComplaint] = useState(null);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    const canvas = bgRef.current; if (!canvas) return;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
    const scene    = new THREE.Scene();
    const camera   = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
    camera.position.z = 5;
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    const geo  = new THREE.TorusGeometry(1.8, 0.01, 16, 100);
    const mat  = new THREE.MeshBasicMaterial({ color:"#6366f1", transparent:true, opacity:0.15 });
    const ring = new THREE.Mesh(geo, mat);
    ring.rotation.x = 0.5;
    scene.add(ring);
    const geo2  = new THREE.TorusGeometry(2.6, 0.008, 16, 100);
    const mat2  = new THREE.MeshBasicMaterial({ color:"#8b5cf6", transparent:true, opacity:0.1 });
    const ring2 = new THREE.Mesh(geo2, mat2);
    ring2.rotation.x = 1.2;
    scene.add(ring2);
    let raf;
    const animate = () => { raf = requestAnimationFrame(animate); ring.rotation.z += 0.003; ring2.rotation.z -= 0.002; renderer.render(scene, camera); };
    animate();
    return () => { cancelAnimationFrame(raf); renderer.dispose(); };
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const data = await getComplaintById(id);
        setComplaint(data.complaint);
      } catch (e) { toast.error(getErrorMessage(e)); }
      finally { setLoading(false); }
    })();
  }, [id]);

  if (loading) return <div className="tl-page"><canvas ref={bgRef} className="tl-page" style={{position:"fixed",inset:0,width:"100%",height:"100%",pointerEvents:"none",opacity:0.4}}/><Spinner /></div>;
  if (!complaint) return null;

  const cfg        = statusColors[complaint.status] || { bg:"#6c757d", icon:"fa-circle" };
  const isRejected = complaint.status === "Rejected";
  const isResolved = complaint.status === "Resolved";

  return (
    <div className="tl-page">
      <canvas ref={bgRef} style={{ position:"fixed", inset:0, width:"100%", height:"100%", pointerEvents:"none", opacity:0.3, zIndex:0 }} />

      <div className="tl-container" style={{ position:"relative", zIndex:1 }}>
        <button className="btn-ghost" style={{ marginBottom:"1.5rem", fontSize:"0.85rem" }} onClick={() => navigate("/my-complaints")}>
          <i className="fa-solid fa-arrow-left"></i>Back to My Complaints
        </button>

        {/* Header card */}
        <div className="tl-header-card">
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"1rem" }}>
            <h4 style={{ fontWeight:800, margin:0, flex:1, marginRight:"1rem" }}>{complaint.title}</h4>
            <span style={{
              display:"inline-flex", alignItems:"center", gap:5,
              background: cfg.bg + "22", border:`1px solid ${cfg.bg}44`,
              color: cfg.bg, padding:"4px 12px", borderRadius:99,
              fontSize:"0.78rem", fontWeight:700, textTransform:"uppercase", whiteSpace:"nowrap",
              boxShadow:`0 0 12px ${cfg.bg}33`
            }}>
              <i className={`fa-solid ${cfg.icon}`}></i>{complaint.status}
            </span>
          </div>
          <p style={{ color:"var(--text-secondary)", fontSize:"0.9rem", marginBottom:"1rem" }}>{complaint.description}</p>
          <div style={{ display:"flex", flexWrap:"wrap", gap:"1rem", fontSize:"0.82rem", color:"var(--text-muted)" }}>
            <span><i className="fa-solid fa-tag me-1" style={{color:"#818cf8"}}></i>{complaint.category}</span>
            <span><i className="fa-solid fa-flag me-1" style={{color:"#f59e0b"}}></i>{complaint.priority}</span>
            {complaint.assignedTo && <span><i className="fa-solid fa-user-tie me-1" style={{color:"#10b981"}}></i>Assigned to: {complaint.assignedTo.username}</span>}
            <span><i className="fa-solid fa-calendar me-1"></i>{new Date(complaint.createdAt).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}</span>
          </div>

          {/* Rejection box */}
          {isRejected && complaint.adminRemark && (
            <div className="rejection-block-premium" style={{ marginTop:"1rem" }}>
              <p style={{ fontWeight:700, margin:"0 0 4px", fontSize:"0.85rem" }}>
                <i className="fa-solid fa-circle-exclamation me-2"></i>Reason for Rejection
              </p>
              <p style={{ margin:0, fontSize:"0.85rem" }}>{complaint.adminRemark}</p>
            </div>
          )}

          {/* Complaint image */}
          {complaint.imageUrl && !isResolved && (
            <div style={{ marginTop:"1rem" }}>
              <p style={{ fontSize:"0.78rem", color:"var(--text-muted)", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:6 }}>Complaint Photo</p>
              <img src={complaint.imageUrl} alt="Complaint" style={{ width:"100%", maxHeight:200, objectFit:"cover", borderRadius:12, border:"1px solid var(--border)" }} />
            </div>
          )}
        </div>

        {/* Resolved — side by side images */}
        {isResolved && complaint.resolvedImageUrl && (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem", marginBottom:"1.5rem" }}>
            {[
              { label:"Complaint Photo",   src: complaint.imageUrl,        icon:"fa-image",        color:"var(--text-muted)" },
              { label:"Resolution Proof",  src: complaint.resolvedImageUrl, icon:"fa-circle-check", color:"#10b981" },
            ].map(img => (
              <div key={img.label}>
                <p style={{ fontSize:"0.78rem", color:img.color, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:6 }}>
                  <i className={`fa-solid ${img.icon} me-1`}></i>{img.label}
                </p>
                <img src={img.src} alt={img.label} style={{ width:"100%", height:160, objectFit:"cover", borderRadius:12, border:"1px solid var(--border)" }} />
              </div>
            ))}
          </div>
        )}

        {/* Timeline */}
        <div className="tl-section">
          <h6 style={{ fontWeight:800, marginBottom:"1.5rem", fontSize:"0.95rem" }}>
            <i className="fa-solid fa-timeline me-2" style={{ color:"#818cf8" }}></i>Progress Timeline
          </h6>
          <div className="tl-timeline">
            {complaint.timeline.map((entry, i) => {
              const isLast = i === complaint.timeline.length - 1;
              return (
                <div key={i} className="tl-entry">
                  <div className="tl-dot" style={{
                    background: isLast ? cfg.bg : "rgba(255,255,255,0.1)",
                    boxShadow: isLast ? `0 0 12px ${cfg.bg}88` : "none",
                    border: `2px solid ${isLast ? cfg.bg : "rgba(255,255,255,0.15)"}`,
                  }}>
                    {isLast && <i className={`fa-solid ${cfg.icon}`} style={{ fontSize:"0.55rem" }}></i>}
                  </div>
                  <div className="tl-stage" style={{ color: isLast ? cfg.bg : "var(--text-primary)" }}>{entry.stage}</div>
                  {entry.note && <div className="tl-note">{entry.note}</div>}
                  <div className="tl-time">
                    {new Date(entry.timestamp).toLocaleString("en-IN",{ day:"numeric", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit" })}
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
export default ComplaintTimeline;
