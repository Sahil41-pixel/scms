import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import * as THREE from "three";
import "./Landing.css";

const Landing = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // THREE.JS SETUP
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    const scene    = new THREE.Scene();
    const camera   = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    camera.position.set(0, 0, 5);

    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // === FLOATING PARTICLES ===
    const particleGeo  = new THREE.BufferGeometry();
    const particleCount = 1800;
    const positions = new Float32Array(particleCount * 3);
    const colors    = new Float32Array(particleCount * 3);
    const colPalette = [
      new THREE.Color("#6366f1"),
      new THREE.Color("#8b5cf6"),
      new THREE.Color("#a855f7"),
      new THREE.Color("#06b6d4"),
      new THREE.Color("#10b981"),
    ];
    for (let i = 0; i < particleCount; i++) {
      positions[i*3]   = (Math.random()-0.5)*20;
      positions[i*3+1] = (Math.random()-0.5)*20;
      positions[i*3+2] = (Math.random()-0.5)*20;
      const c = colPalette[Math.floor(Math.random()*colPalette.length)];
      colors[i*3]   = c.r; colors[i*3+1] = c.g; colors[i*3+2] = c.b;
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute("color",    new THREE.BufferAttribute(colors, 3));
    const particleMat = new THREE.PointsMaterial({ size:0.04, vertexColors:true, transparent:true, opacity:0.8, sizeAttenuation:true });
    const particles   = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // === TORUS RINGS ===
    const rings = [];
    const ringData = [
      { r:2.5, tube:0.008, color:"#6366f1", rx:0.5, ry:0,   speed:0.004 },
      { r:2.0, tube:0.006, color:"#8b5cf6", rx:1.2, ry:0.8, speed:-0.003 },
      { r:3.2, tube:0.005, color:"#06b6d4", rx:0.2, ry:1.5, speed:0.002 },
    ];
    ringData.forEach(d => {
      const geo  = new THREE.TorusGeometry(d.r, d.tube, 16, 100);
      const mat  = new THREE.MeshBasicMaterial({ color: d.color, transparent:true, opacity:0.5 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.rotation.x = d.rx;
      mesh.rotation.y = d.ry;
      mesh.userData  = { speed: d.speed };
      scene.add(mesh);
      rings.push(mesh);
    });

    // === FLOATING ICOSAHEDRON (center) ===
    const icoGeo = new THREE.IcosahedronGeometry(0.9, 1);
    const icoMat = new THREE.MeshPhongMaterial({
      color: "#6366f1", emissive:"#3730a3", wireframe:false,
      transparent:true, opacity:0.15, shininess:80
    });
    const ico = new THREE.Mesh(icoGeo, icoMat);
    scene.add(ico);

    const icoWire = new THREE.Mesh(icoGeo, new THREE.MeshBasicMaterial({ color:"#818cf8", wireframe:true, transparent:true, opacity:0.3 }));
    scene.add(icoWire);

    // Lighting
    const ambLight = new THREE.AmbientLight(0xffffff, 0.5);
    const dirLight = new THREE.DirectionalLight(0x6366f1, 2);
    dirLight.position.set(5,5,5);
    scene.add(ambLight, dirLight);

    // Mouse parallax
    let mouseX = 0, mouseY = 0;
    const onMouse = (e) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", onMouse);

    // Resize
    const onResize = () => {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);

    // Animate
    let raf;
    let t = 0;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      t += 0.01;

      particles.rotation.y += 0.0005;
      particles.rotation.x += 0.0002;

      rings.forEach(r => { r.rotation.z += r.userData.speed; r.rotation.x += r.userData.speed * 0.5; });

      ico.rotation.x = t * 0.3;
      ico.rotation.y = t * 0.5;
      icoWire.rotation.x = ico.rotation.x;
      icoWire.rotation.y = ico.rotation.y;
      ico.position.y = Math.sin(t * 0.8) * 0.15;
      icoWire.position.y = ico.position.y;

      camera.position.x += (mouseX * 0.5 - camera.position.x) * 0.03;
      camera.position.y += (-mouseY * 0.5 - camera.position.y) * 0.03;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
    };
  }, []);

  const features = [
    { icon:"fa-file-circle-plus",  grad:"var(--grad-primary)", title:"Submit",  desc:"File a complaint with details and optional photo in under 60 seconds." },
    { icon:"fa-user-gear",         grad:"var(--grad-info)",    title:"Assign",  desc:"Admin reviews and assigns to the right employee for fast resolution." },
    { icon:"fa-screwdriver-wrench",grad:"var(--grad-warning)", title:"Resolve", desc:"Employee works on it and submits visual proof of completion." },
    { icon:"fa-timeline",          grad:"var(--grad-forest)",  title:"Track",   desc:"Real-time timeline shows every status change with timestamps." },
  ];

  const stats = [
    { value:"3", label:"Roles", icon:"fa-users" },
    { value:"∞", label:"Complaints Tracked", icon:"fa-infinity" },
    { value:"100%", label:"Transparent", icon:"fa-eye" },
    { value:"24/7", label:"Available", icon:"fa-clock" },
  ];

  return (
    <div className="landing-page">
      {/* THREE.JS CANVAS */}
      <canvas ref={canvasRef} className="three-canvas" />

      {/* HERO */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            <i className="fa-solid fa-sparkles me-2"></i>Premium Complaint Management
          </div>
          <h1 className="hero-title">
            Manage Complaints
            <br />
            <span className="glow-text">at Scale</span>
          </h1>
          <p className="hero-subtitle">
            A powerful, role-based system for submitting, assigning, tracking
            and resolving complaints — with complete transparency at every step.
          </p>
          <div className="hero-actions">
            <Link to="/register" className="btn-premium hero-cta">
              <i className="fa-solid fa-rocket"></i>Get Started Free
            </Link>
            <Link to="/login" className="btn-ghost hero-cta-ghost">
              <i className="fa-solid fa-arrow-right-to-bracket"></i>Sign In
            </Link>
          </div>

          {/* Stat Pills */}
          <div className="hero-stats">
            {stats.map((s) => (
              <div key={s.label} className="stat-pill">
                <i className={`fa-solid ${s.icon}`}></i>
                <span className="stat-pill-value">{s.value}</span>
                <span className="stat-pill-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Floating 3D Cards */}
        <div className="hero-cards-orbit">
          <div className="orbit-ring">
            {["Submitted","Assigned","On Working","Resolved"].map((stage,i) => (
              <div key={i} className="orbit-card" style={{ "--i": i }}>
                <i className={`fa-solid ${
                  i===0?"fa-file-circle-check":i===1?"fa-user-tie":i===2?"fa-screwdriver-wrench":"fa-circle-check"
                }`}></i>
                <span>{stage}</span>
              </div>
            ))}
          </div>
          <div className="orbit-center">
            <i className="fa-solid fa-shield-halved"></i>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="features-section">
        <div className="section-header">
          <div className="section-badge">How It Works</div>
          <h2>Four simple steps to resolution</h2>
          <p>Designed for transparency, speed, and accountability</p>
        </div>
        <div className="features-grid">
          {features.map((f, i) => (
            <div key={f.title} className="feature-card-premium" style={{ animationDelay: `${i*0.1}s` }}>
              <div className="feature-num">{String(i+1).padStart(2,"0")}</div>
              <div className="feature-icon-wrap" style={{ background: f.grad }}>
                <i className={`fa-solid ${f.icon}`}></i>
              </div>
              <h4>{f.title}</h4>
              <p>{f.desc}</p>
              <div className="feature-line" style={{ background: f.grad }}></div>
            </div>
          ))}
        </div>
      </section>

      {/* ROLES */}
      <section className="roles-section">
        <div className="section-header">
          <div className="section-badge">Roles</div>
          <h2>Three Roles. One System.</h2>
        </div>
        <div className="roles-grid">
          {[
            { role:"User",     grad:"var(--grad-primary)", icon:"fa-user",       items:["Submit complaints instantly","Edit while still pending","Track real-time timeline","View rejection reasons"] },
            { role:"Admin",    grad:"var(--grad-danger)",  icon:"fa-user-shield",items:["View all complaints","Assign to employees","Reject with mandatory reason","Manage user promotions"] },
            { role:"Employee", grad:"var(--grad-forest)",  icon:"fa-user-tie",   items:["See assigned complaints","Mark as On Working","Resolve with proof image","View resolved history"] },
          ].map((r) => (
            <div key={r.role} className="role-card-premium">
              <div className="role-card-glow" style={{ background: r.grad }}></div>
              <div className="role-icon-premium" style={{ background: r.grad }}>
                <i className={`fa-solid ${r.icon}`}></i>
              </div>
              <h4>{r.role}</h4>
              <ul>
                {r.items.map((item) => (
                  <li key={item}>
                    <i className="fa-solid fa-circle-check text-success me-2"></i>{item}
                  </li>
                ))}
              </ul>
              <Link
                to="/register"
                className="role-cta"
                style={{ background: r.grad }}
              >
                Join as {r.role} <i className="fa-solid fa-arrow-right ms-1"></i>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="cta-banner">
        <div className="cta-glow"></div>
        <h2>Ready to bring order to chaos?</h2>
        <p>Start managing complaints efficiently today.</p>
        <Link to="/register" className="btn-premium" style={{ fontSize:"1rem", padding:"0.75rem 2.5rem" }}>
          <i className="fa-solid fa-bolt me-2"></i>Get Started — It's Free
        </Link>
      </section>

      <footer className="landing-footer-premium">
        <div className="brand-icon" style={{ margin:"0 auto 0.5rem" }}>
          <i className="fa-solid fa-shield-halved"></i>
        </div>
        <p className="glow-text" style={{ fontSize:"1.1rem", fontWeight:800 }}>SCMS</p>
        <p style={{ color:"var(--text-muted)", fontSize:"0.82rem" }}>Smart Complaint Management System</p>
      </footer>
    </div>
  );
};

export default Landing;
