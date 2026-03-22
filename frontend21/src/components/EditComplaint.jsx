import React, { useState } from "react";
import toast from "react-hot-toast";
import { updateComplaint } from "../Services/ComplaintServices";
import { getErrorMessage } from "../Utils/ErrorMessage";

const CATEGORIES = ["Infrastructure","Hostel","Food","Transport","Cleanliness","Other"];
const PRIORITIES  = ["Low","Medium","High"];

const EditComplaint = ({ complaint, onSuccess, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(complaint.imageUrl || "");
  const [form, setForm] = useState({ title:complaint.title, description:complaint.description, category:complaint.category, priority:complaint.priority });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleImage  = (e) => { const f=e.target.files[0]; if(f){setImageFile(f);setPreview(URL.createObjectURL(f));} };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const fd = new FormData();
      Object.entries(form).forEach(([k,v])=>fd.append(k,v));
      if (imageFile) fd.append("image", imageFile);
      await updateComplaint(complaint._id, fd);
      toast.success("Complaint updated!");
      onSuccess(); onClose();
    } catch(e) { toast.error(getErrorMessage(e)); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay-premium" onClick={onClose}>
      <div className="modal-box-premium" onClick={e=>e.stopPropagation()}>
        <div className="modal-header-premium">
          <h5><i className="fa-solid fa-pen-to-square me-2"></i>Edit Complaint</h5>
          <button className="modal-close-btn" onClick={onClose}><i className="fa-solid fa-xmark"></i></button>
        </div>
        <div className="modal-body-premium">
          <div className="info-block-premium mb-3" style={{fontSize:"0.82rem",color:"#818cf8"}}>
            <i className="fa-solid fa-circle-info me-2"></i>Only <strong>Pending</strong> complaints can be edited.
          </div>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label-premium">Title</label>
              <input type="text" name="title" className="form-control-premium" value={form.title} onChange={handleChange} required/>
            </div>
            <div className="mb-3">
              <label className="form-label-premium">Description</label>
              <textarea name="description" className="form-control-premium" rows="3" value={form.description} onChange={handleChange} required style={{resize:"none"}}/>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.75rem"}} className="mb-3">
              <div>
                <label className="form-label-premium">Category</label>
                <select name="category" className="form-control-premium" value={form.category} onChange={handleChange}>
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
              <label className="form-label-premium">Replace Image (optional)</label>
              <input type="file" className="form-control-premium" accept="image/*" onChange={handleImage} style={{cursor:"pointer"}}/>
              {preview && <img src={preview} alt="Preview" className="img-preview-premium"/>}
            </div>
            <div style={{display:"flex",gap:"0.75rem"}}>
              <button type="submit" className="btn-premium" style={{flex:1,justifyContent:"center",padding:"0.7rem"}} disabled={loading}>
                {loading?<><span className="spinner-border spinner-border-sm me-2"></span>Saving...</>:<><i className="fa-solid fa-floppy-disk"></i>Save Changes</>}
              </button>
              <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
export default EditComplaint;
