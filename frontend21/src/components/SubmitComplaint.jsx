import React, { useState } from "react";
import toast from "react-hot-toast";
import { submitComplaint } from "../Services/ComplaintServices";
import { getErrorMessage } from "../Utils/ErrorMessage";

const CATEGORIES = ["Infrastructure","Hostel","Food","Transport","Cleanliness","Other"];
const PRIORITIES  = ["Low","Medium","High"];

const SubmitComplaint = ({ onSuccess, onClose }) => {
  const [loading, setLoading]   = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview]   = useState("");
  const [form, setForm] = useState({ title:"", description:"", category:"", priority:"Medium" });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleImage  = (e) => {
    const f = e.target.files[0];
    if (f) { setImageFile(f); setPreview(URL.createObjectURL(f)); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const fd = new FormData();
      fd.append("title", form.title); fd.append("description", form.description);
      fd.append("category", form.category); fd.append("priority", form.priority);
      if (imageFile) fd.append("image", imageFile);
      await submitComplaint(fd);
      toast.success("Complaint submitted!");
      onSuccess(); onClose();
    } catch(e) { toast.error(getErrorMessage(e)); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay-premium" onClick={onClose}>
      <div className="modal-box-premium" onClick={e=>e.stopPropagation()}>
        <div className="modal-header-premium">
          <h5><i className="fa-solid fa-file-circle-plus me-2"></i>Submit New Complaint</h5>
          <button className="modal-close-btn" onClick={onClose}><i className="fa-solid fa-xmark"></i></button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body-premium">
          <div className="mb-3">
            <label className="form-label-premium">Title <span style={{color:"#ef4444"}}>*</span></label>
            <input type="text" name="title" className="form-control-premium" placeholder="Brief title" value={form.title} onChange={handleChange} required/>
          </div>
          <div className="mb-3">
            <label className="form-label-premium">Description <span style={{color:"#ef4444"}}>*</span></label>
            <textarea name="description" className="form-control-premium" rows="3" placeholder="Describe the issue in detail" value={form.description} onChange={handleChange} required style={{resize:"none"}}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.75rem"}} className="mb-3">
            <div>
              <label className="form-label-premium">Category <span style={{color:"#ef4444"}}>*</span></label>
              <select name="category" className="form-control-premium  " value={form.category} onChange={handleChange} required>
                <option value="">Select...</option>
                {CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label-premium">Priority</label>
              <select name="priority" className="form-control-premium" value={form.priority} onChange={handleChange}>
                {PRIORITIES.map(p=><option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div className="mb-3">
            <label className="form-label-premium">Attach Image (optional)</label>
            <input type="file" className="form-control-premium" accept="image/*" onChange={handleImage} style={{cursor:"pointer"}}/>
            {preview && <img src={preview} alt="Preview" className="img-preview-premium"/>}
          </div>
          <div style={{display:"flex",gap:"0.75rem"}}>
            <button type="submit" className="btn-premium" style={{flex:1,justifyContent:"center",padding:"0.7rem"}} disabled={loading}>
              {loading ? <><span className="spinner-border spinner-border-sm me-2"></span>Submitting...</> : <><i className="fa-solid fa-paper-plane"></i>Submit Complaint</>}
            </button>
            <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default SubmitComplaint;
