import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { getAllEmployees, assignComplaint, rejectComplaint } from "../Services/ComplaintServices";
import { getErrorMessage } from "../Utils/ErrorMessage";

const statusMap = { "Pending":"badge-pending","In Progress":"badge-progress","On Working":"badge-onworking","Resolved":"badge-resolved","Rejected":"badge-rejected" };

const AdminComplaintModal = ({ complaint, onSuccess, onClose }) => {
  const [employees,  setEmployees]  = useState([]);
  const [selectedEmp,setSelectedEmp]= useState(complaint.assignedTo?._id || "");
  const [remark,     setRemark]     = useState("");
  const [tab,        setTab]        = useState("assign");
  const [loading,    setLoading]    = useState(false);

  useEffect(()=>{
    getAllEmployees().then(d=>setEmployees(d.employees)).catch(()=>{});
  },[]);

  const handleAssign = async () => {
    if(!selectedEmp){ toast.error("Select an employee first."); return; }
    try { setLoading(true); await assignComplaint(complaint._id, selectedEmp); toast.success("Assigned!"); onSuccess(); onClose(); }
    catch(e){ toast.error(getErrorMessage(e)); } finally{ setLoading(false); }
  };

  const handleReject = async () => {
    if(!remark.trim()){ toast.error("Rejection reason is required."); return; }
    try { setLoading(true); await rejectComplaint(complaint._id, remark.trim()); toast.success("Complaint rejected."); onSuccess(); onClose(); }
    catch(e){ toast.error(getErrorMessage(e)); } finally{ setLoading(false); }
  };

  const canAct = complaint.status!=="Resolved" && complaint.status!=="Rejected";

  return (
    <div className="modal-overlay-premium" onClick={onClose}>
      <div className="modal-box-premium modal-box-wide" onClick={e=>e.stopPropagation()}>
        <div className="modal-header-premium">
          <h5><i className="fa-solid fa-clipboard-list me-2"></i>Complaint Details</h5>
          <button className="modal-close-btn" onClick={onClose}><i className="fa-solid fa-xmark"></i></button>
        </div>
        <div className="modal-body-premium">
          {/* Info block */}
          <div className="info-block-premium mb-3">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
              <h6 style={{fontWeight:700,margin:0}}>{complaint.title}</h6>
              <span className={`badge-premium ${statusMap[complaint.status]||""}`}>{complaint.status}</span>
            </div>
            <p style={{color:"var(--text-secondary)",fontSize:"0.85rem",margin:"0 0 8px"}}>{complaint.description}</p>
            <div style={{display:"flex",gap:"0.75rem",flexWrap:"wrap",fontSize:"0.78rem",color:"var(--text-muted)"}}>
              <span><i className="fa-solid fa-tag me-1"></i>{complaint.category}</span>
              <span><i className="fa-solid fa-flag me-1"></i>{complaint.priority}</span>
              <span><i className="fa-solid fa-user me-1"></i>{complaint.submittedBy?.username}</span>
              {complaint.assignedTo && <span><i className="fa-solid fa-user-tie me-1 text-success"></i>{complaint.assignedTo.username}</span>}
            </div>
            {complaint.imageUrl && <img src={complaint.imageUrl} alt="" className="img-preview-premium"/>}
          </div>

          {complaint.status==="Rejected" && complaint.adminRemark && (
            <div className="rejection-block-premium mb-3">
              <strong>Rejection Reason: </strong>{complaint.adminRemark}
            </div>
          )}
          {complaint.status==="Resolved" && (
            <div style={{background:"rgba(16,185,129,0.08)",border:"1px solid rgba(16,185,129,0.2)",borderRadius:12,padding:"0.75rem",marginBottom:"1rem",fontSize:"0.85rem",color:"#10b981"}}>
              <i className="fa-solid fa-circle-check me-2"></i>This complaint has been resolved.
            </div>
          )}

          {canAct && (
            <>
              <div className="tab-bar-premium mb-3">
                <button className={`tab-btn-premium ${tab==="assign"?"active":""}`} onClick={()=>setTab("assign")}>
                  <i className="fa-solid fa-user-plus me-1"></i>{complaint.assignedTo?"Re-Assign":"Assign"}
                </button>
                <button className={`tab-btn-premium ${tab==="reject"?"active-danger":""}`} onClick={()=>setTab("reject")}>
                  <i className="fa-solid fa-ban me-1"></i>Reject
                </button>
              </div>

              {tab==="assign" && (
                <div>
                  <label className="form-label-premium">Select Employee</label>
                  {employees.length===0 ? (
                    <p style={{color:"var(--text-muted)",fontSize:"0.85rem"}}>No employees. Promote a user first.</p>
                  ) : (
                    <>
                      <select className="form-control-premium mb-3" value={selectedEmp} onChange={e=>setSelectedEmp(e.target.value)}>
                        <option value="">-- Select employee --</option>
                        {employees.map(e=><option key={e._id} value={e._id}>{e.username} ({e.email})</option>)}
                      </select>
                      <button className="btn-premium" style={{width:"100%",justifyContent:"center",padding:"0.7rem"}} onClick={handleAssign} disabled={loading}>
                        {loading?<><span className="spinner-border spinner-border-sm me-2"></span>Assigning...</>:<><i className="fa-solid fa-user-plus"></i>{complaint.assignedTo?"Re-Assign":"Assign"} Complaint</>}
                      </button>
                    </>
                  )}
                </div>
              )}

              {tab==="reject" && (
                <div>
                  <label className="form-label-premium">Rejection Reason <span style={{color:"#ef4444"}}>*</span></label>
                  <p style={{fontSize:"0.78rem",color:"var(--text-muted)",marginBottom:8}}>This will be shown to the user. Be specific and clear.</p>
                  <textarea className="form-control-premium mb-3" rows="3" placeholder="e.g. Duplicate complaint, out of scope, insufficient information..." value={remark} onChange={e=>setRemark(e.target.value)} style={{resize:"none"}}/>
                  <button
                    className="btn-premium"
                    style={{width:"100%",justifyContent:"center",padding:"0.7rem",background:"linear-gradient(135deg,#ef4444,#dc2626)"}}
                    onClick={handleReject}
                    disabled={loading||!remark.trim()}
                  >
                    {loading?<><span className="spinner-border spinner-border-sm me-2"></span>Rejecting...</>:<><i className="fa-solid fa-ban"></i>Reject Complaint</>}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
export default AdminComplaintModal;
