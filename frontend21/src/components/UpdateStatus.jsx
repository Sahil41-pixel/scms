import React, { useState } from "react";
import toast from "react-hot-toast";
import { employeeUpdateStatus } from "../Services/ComplaintServices";
import { getErrorMessage } from "../Utils/ErrorMessage";

const UpdateStatus = ({ complaint, onSuccess, onClose }) => {
  const [loading, setLoading]   = useState(false);
  const [status,  setStatus]    = useState("On Working");
  const [note,    setNote]      = useState("");
  const [img,     setImg]       = useState(null);
  const [preview, setPreview]   = useState("");

  const handleImg = (e) => { const f=e.target.files[0]; if(f){setImg(f);setPreview(URL.createObjectURL(f));} };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (status==="Resolved" && !img) { toast.error("Proof image required for Resolved status."); return; }
    try {
      setLoading(true);
      const fd = new FormData();
      fd.append("status", status); fd.append("note", note||"");
      if (img) fd.append("resolvedImage", img);
      await employeeUpdateStatus(complaint._id, fd);
      toast.success(`Marked as "${status}"!`);
      onSuccess(); onClose();
    } catch(e) { toast.error(getErrorMessage(e)); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay-premium" onClick={onClose}>
      <div className="modal-box-premium" onClick={e=>e.stopPropagation()}>
        <div className="modal-header-premium">
          <h5><i className="fa-solid fa-pen-to-square me-2"></i>Update Status</h5>
          <button className="modal-close-btn" onClick={onClose}><i className="fa-solid fa-xmark"></i></button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body-premium">
          <div className="info-block-premium mb-3">
            <p style={{fontWeight:600,marginBottom:2,fontSize:"0.9rem"}}>{complaint.title}</p>
            <p style={{color:"var(--text-muted)",margin:0,fontSize:"0.82rem"}}>{complaint.description}</p>
          </div>
          <div className="mb-3">
            <label className="form-label-premium">Set Status</label>
            <div className="status-toggle-premium">
              <button type="button" className={`status-toggle-btn ${status==="On Working"?"active-working":""}`}
                onClick={()=>{setStatus("On Working");setImg(null);setPreview("");}}>
                <i className="fa-solid fa-screwdriver-wrench me-2"></i>On Working
              </button>
              <button type="button" className={`status-toggle-btn ${status==="Resolved"?"active-resolved":""}`}
                onClick={()=>setStatus("Resolved")}>
                <i className="fa-solid fa-circle-check me-2"></i>Resolved
              </button>
            </div>
          </div>
          {status==="Resolved" && (
            <div className="mb-3">
              <label className="form-label-premium">Proof Image <span style={{color:"#ef4444"}}>*</span></label>
              <input type="file" className="form-control-premium" accept="image/*" onChange={handleImg} style={{cursor:"pointer"}}/>
              {preview && <img src={preview} alt="Preview" className="img-preview-premium"/>}
            </div>
          )}
          <div className="mb-3">
            <label className="form-label-premium">Note (optional)</label>
            <textarea className="form-control-premium" rows="2" placeholder={status==="On Working"?"e.g. Inspected, parts ordered...":"e.g. Fixed and tested..."} value={note} onChange={e=>setNote(e.target.value)} style={{resize:"none"}}/>
          </div>
          <div style={{display:"flex",gap:"0.75rem"}}>
            <button type="submit"
              className="btn-premium"
              style={{flex:1,justifyContent:"center",padding:"0.7rem", background: status==="Resolved"?"linear-gradient(135deg,#10b981,#059669)":"var(--grad-primary)"}}
              disabled={loading}>
              {loading?<><span className="spinner-border spinner-border-sm me-2"></span>Updating...</>:
                <><i className={`fa-solid ${status==="Resolved"?"fa-check":"fa-screwdriver-wrench"}`}></i>Mark as {status}</>}
            </button>
            <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default UpdateStatus;
