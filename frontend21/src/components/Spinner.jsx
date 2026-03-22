import React from "react";
const Spinner = () => (
  <div style={{ display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:200,gap:"1rem" }}>
    <div style={{ width:44,height:44,borderRadius:"50%",background:"var(--grad-primary)",animation:"pulse-glow 1.5s ease-in-out infinite" }}></div>
    <span style={{ color:"var(--text-muted)",fontSize:"0.85rem" }}>Loading...</span>
    <style>{`@keyframes pulse-glow{0%,100%{box-shadow:0 0 20px rgba(99,102,241,0.4);}50%{box-shadow:0 0 40px rgba(99,102,241,0.8);}}`}</style>
  </div>
);
export default Spinner;
