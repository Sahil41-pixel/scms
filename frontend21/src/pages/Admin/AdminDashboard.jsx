import React, { useEffect, useState, useRef } from "react";
import * as THREE from "three";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, BarChart, Bar, RadialBarChart, RadialBar
} from "recharts";
import { getDashboardStats, getAllEmployees } from "../../Services/ComplaintServices";
import { getErrorMessage } from "../../Utils/ErrorMessage";
import toast from "react-hot-toast";
import "./AdminDashboard.css";

const GRADIENTS = [
  { id:"gPurple", c1:"#6366f1", c2:"#8b5cf6" },
  { id:"gCyan",   c1:"#06b6d4", c2:"#0284c7" },
  { id:"gGreen",  c1:"#10b981", c2:"#059669" },
  { id:"gRed",    c1:"#ef4444", c2:"#dc2626" },
  { id:"gOrange", c1:"#f59e0b", c2:"#d97706" },
];

const PIE_COLORS = ["#f59e0b","#06b6d4","#6366f1","#10b981","#ef4444"];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:"#1e293b", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, padding:"8px 14px" }}>
      <p style={{ margin:0, fontWeight:700, color: payload[0].payload.fill || "#fff" }}>{payload[0].name}</p>
      <p style={{ margin:0, color:"#94a3b8", fontSize:"0.85rem" }}>{payload[0].value} complaints</p>
    </div>
  );
};

const AdminDashboard = () => {
  const user      = JSON.parse(localStorage.getItem("scms"))?.user;
  const bgRef     = useRef(null);
  const [stats,     setStats]     = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [activeIndex, setActiveIndex] = useState(null);

  // Three.js subtle background
  useEffect(() => {
    const canvas = bgRef.current;
    if (!canvas) return;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
    const scene    = new THREE.Scene();
    const camera   = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    camera.position.z = 5;
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    const geo = new THREE.BufferGeometry();
    const n = 600;
    const pos = new Float32Array(n * 3);
    const col = new Float32Array(n * 3);
    const palette = [new THREE.Color("#6366f1"), new THREE.Color("#06b6d4"), new THREE.Color("#10b981")];
    for (let i = 0; i < n; i++) {
      pos[i*3] = (Math.random()-0.5)*18; pos[i*3+1] = (Math.random()-0.5)*18; pos[i*3+2] = (Math.random()-0.5)*18;
      const c = palette[i%3]; col[i*3]=c.r; col[i*3+1]=c.g; col[i*3+2]=c.b;
    }
    geo.setAttribute("position", new THREE.BufferAttribute(pos,3));
    geo.setAttribute("color",    new THREE.BufferAttribute(col,3));
    const pts = new THREE.Points(geo, new THREE.PointsMaterial({ size:0.05, vertexColors:true, transparent:true, opacity:0.5 }));
    scene.add(pts);
    let raf;
    const animate = () => { raf=requestAnimationFrame(animate); pts.rotation.y+=0.0003; pts.rotation.x+=0.0001; renderer.render(scene,camera); };
    animate();
    return () => { cancelAnimationFrame(raf); renderer.dispose(); };
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const [s, e] = await Promise.all([getDashboardStats(), getAllEmployees()]);
        setStats(s.stats);
        setEmployees(e.employees);
      } catch(err) { toast.error(getErrorMessage(err)); }
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) return (
    <div className="admin-db-page">
      <canvas ref={bgRef} className="dashboard-bg-canvas" />
      <div className="loading-screen">
        <div className="loading-orb"></div>
        <p>Loading Dashboard...</p>
      </div>
    </div>
  );

  const total = stats?.totalComplaints || 1;
  const pieData = [
    { name:"Pending",     value: stats?.pendingCount    || 0, fill:"#f59e0b" },
    { name:"In Progress", value: stats?.inProgressCount || 0, fill:"#06b6d4" },
    { name:"On Working",  value: stats?.onWorkingCount  || 0, fill:"#6366f1" },
    { name:"Resolved",    value: stats?.resolvedCount   || 0, fill:"#10b981" },
    { name:"Rejected",    value: stats?.rejectedCount   || 0, fill:"#ef4444" },
  ];

  const barData = pieData.map(d => ({ name: d.name, count: d.value }));

  const statCards = [
    { label:"Total Users",      value: stats?.totalUsers,      icon:"fa-users",             grad:"linear-gradient(135deg,#6366f1,#8b5cf6)", glow:"rgba(99,102,241,0.3)" },
    { label:"Total Complaints", value: stats?.totalComplaints, icon:"fa-inbox",             grad:"linear-gradient(135deg,#7209b7,#a855f7)", glow:"rgba(168,85,247,0.3)" },
    { label:"Pending",          value: stats?.pendingCount,    icon:"fa-clock",             grad:"linear-gradient(135deg,#f59e0b,#d97706)", glow:"rgba(245,158,11,0.3)" },
    { label:"In Progress",      value: stats?.inProgressCount, icon:"fa-spinner",           grad:"linear-gradient(135deg,#06b6d4,#0284c7)", glow:"rgba(6,182,212,0.3)"  },
    { label:"On Working",       value: stats?.onWorkingCount,  icon:"fa-screwdriver-wrench",grad:"linear-gradient(135deg,#6366f1,#4f46e5)", glow:"rgba(99,102,241,0.3)" },
    { label:"Resolved",         value: stats?.resolvedCount,   icon:"fa-circle-check",      grad:"linear-gradient(135deg,#10b981,#059669)", glow:"rgba(16,185,129,0.3)" },
    { label:"Rejected",         value: stats?.rejectedCount,   icon:"fa-circle-xmark",      grad:"linear-gradient(135deg,#ef4444,#dc2626)", glow:"rgba(239,68,68,0.3)"  },
    { label:"Employees",        value: stats?.employeeCount,   icon:"fa-user-tie",          grad:"linear-gradient(135deg,#8b5cf6,#7c3aed)", glow:"rgba(139,92,246,0.3)" },
  ];

  const resolution = total > 0 ? Math.round(((stats?.resolvedCount||0)/total)*100) : 0;

  return (
    <div className="admin-db-page">
      <canvas ref={bgRef} className="dashboard-bg-canvas" />

      <div className="db-container">
        {/* Header */}
        <div className="db-header animate-fade-up">
          <div>
            <h2 style={{ fontWeight:900, marginBottom:4 }}>
              Admin <span className="glow-text">Command Centre</span>
            </h2>
            <p style={{ color:"var(--text-muted)", margin:0, fontSize:"0.9rem" }}>
              Welcome back, <strong style={{ color:"#818cf8" }}>{user?.username}</strong> — here's your live overview
            </p>
          </div>
          <div className="resolution-ring">
            <svg viewBox="0 0 80 80" style={{ width:80, height:80 }}>
              <defs>
                <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981"/>
                  <stop offset="100%" stopColor="#059669"/>
                </linearGradient>
              </defs>
              <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="6"/>
              <circle cx="40" cy="40" r="34" fill="none" stroke="url(#ringGrad)" strokeWidth="6"
                strokeDasharray={`${2*Math.PI*34}`}
                strokeDashoffset={`${2*Math.PI*34*(1-resolution/100)}`}
                strokeLinecap="round"
                transform="rotate(-90 40 40)"
                style={{ transition:"stroke-dashoffset 1s ease" }}
              />
              <text x="40" y="38" textAnchor="middle" fill="#10b981" fontSize="14" fontWeight="800" fontFamily="Space Grotesk">{resolution}%</text>
              <text x="40" y="52" textAnchor="middle" fill="#64748b" fontSize="8" fontFamily="Inter">Resolved</text>
            </svg>
          </div>
        </div>

        {/* STAT CARDS */}
        <div className="stat-cards-grid">
          {statCards.map((s, i) => (
            <div key={s.label} className="stat-card-premium animate-fade-up" style={{ animationDelay:`${i*0.05}s` }}>
              <div className="stat-card-glow" style={{ background: s.glow }}></div>
              <div className="stat-icon-premium" style={{ background: s.grad }}>
                <i className={`fa-solid ${s.icon}`}></i>
              </div>
              <div className="stat-body">
                <span className="stat-val">{s.value ?? 0}</span>
                <span className="stat-lbl">{s.label}</span>
              </div>
              <div className="stat-bar" style={{ background: s.grad }}></div>
            </div>
          ))}
        </div>

        {/* CHARTS ROW */}
        <div className="charts-row animate-fade-up" style={{ animationDelay:"0.3s" }}>

          {/* PIE CHART */}
          <div className="chart-card">
            <div className="chart-card-header">
              <h5>Status Distribution</h5>
              <span className="chart-badge">{total} total</span>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <defs>
                  {GRADIENTS.map(g => (
                    <linearGradient key={g.id} id={g.id} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={g.c1}/>
                      <stop offset="100%" stopColor={g.c2}/>
                    </linearGradient>
                  ))}
                </defs>
                <Pie
                  data={pieData}
                  cx="50%" cy="50%"
                  innerRadius={70} outerRadius={110}
                  paddingAngle={4}
                  dataKey="value"
                  onMouseEnter={(_,i) => setActiveIndex(i)}
                  onMouseLeave={() => setActiveIndex(null)}
                >
                  {pieData.map((d, i) => (
                    <Cell key={i} fill={d.fill}
                      stroke="transparent"
                      opacity={activeIndex === null || activeIndex === i ? 1 : 0.4}
                      style={{ cursor:"pointer", filter: activeIndex===i ? `drop-shadow(0 0 8px ${d.fill})` : "none", transition:"all 0.2s" }}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(val) => <span style={{ color:"#94a3b8", fontSize:"0.8rem" }}>{val}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* BAR CHART */}
          <div className="chart-card">
            <div className="chart-card-header">
              <h5>Complaint Breakdown</h5>
              <span className="chart-badge">By Status</span>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={barData} margin={{ top:10, right:10, left:-20, bottom:0 }}>
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1"/>
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false}/>
                <XAxis dataKey="name" tick={{ fill:"#64748b", fontSize:11 }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fill:"#64748b", fontSize:11 }} axisLine={false} tickLine={false}/>
                <Tooltip
                  contentStyle={{ background:"#1e293b", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, color:"#f1f5f9" }}
                  cursor={{ fill:"rgba(255,255,255,0.04)" }}
                />
                <Bar dataKey="count" fill="url(#barGrad)" radius={[6,6,0,0]}>
                  {barData.map((d, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* BOTTOM ROW: Progress bars + employees */}
        <div className="bottom-row animate-fade-up" style={{ animationDelay:"0.4s" }}>

          {/* Progress section */}
          <div className="chart-card">
            <div className="chart-card-header">
              <h5>Resolution Progress</h5>
            </div>
            <div style={{ padding:"0.5rem 0" }}>
              {pieData.map((d) => {
                const pct = total > 0 ? Math.round((d.value/total)*100) : 0;
                return (
                  <div key={d.name} style={{ marginBottom:"1.2rem" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", fontSize:"0.82rem", marginBottom:6 }}>
                      <span style={{ color:"var(--text-secondary)", fontWeight:500 }}>{d.name}</span>
                      <span style={{ color:d.fill, fontWeight:700 }}>{d.value} <span style={{ color:"var(--text-muted)" }}>({pct}%)</span></span>
                    </div>
                    <div style={{ background:"rgba(255,255,255,0.06)", borderRadius:99, height:8, overflow:"hidden" }}>
                      <div style={{
                        height:"100%", width:`${pct}%`,
                        background: d.fill,
                        borderRadius:99,
                        boxShadow:`0 0 10px ${d.fill}`,
                        transition:"width 1s ease",
                      }}/>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Employees */}
          <div className="chart-card">
            <div className="chart-card-header">
              <h5>Employees</h5>
              <span className="chart-badge">{employees.length} active</span>
            </div>
            <div className="employees-list-premium">
              {employees.length === 0 ? (
                <div style={{ textAlign:"center", padding:"2rem", color:"var(--text-muted)" }}>
                  <i className="fa-solid fa-user-tie fa-2x mb-2"></i>
                  <p>No employees yet</p>
                </div>
              ) : employees.map((emp, i) => (
                <div key={emp._id} className="emp-row-premium" style={{ animationDelay:`${i*0.06}s` }}>
                  <div className="emp-av-premium">
                    {emp.username[0].toUpperCase()}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:600, fontSize:"0.87rem" }}>{emp.username}</div>
                    <div style={{ fontSize:"0.74rem", color:"var(--text-muted)" }}>{emp.email}</div>
                  </div>
                  <div style={{ width:8, height:8, borderRadius:"50%", background:"#10b981", boxShadow:"0 0 8px #10b981" }}></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
