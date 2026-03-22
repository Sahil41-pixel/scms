import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as THREE from "three";
import { registerUser, registerAdmin } from "../../Services/AuthServices";
import { getErrorMessage } from "../../Utils/ErrorMessage";
import toast from "react-hot-toast";
import "./AuthStyles.css";

const Register = () => {
  const navigate = useNavigate();
  const bgRef = useRef(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    secretKey: "",
  });

  useEffect(() => {
    const container = bgRef.current;
    if (!container) return;

    // Create a fresh canvas every time
    const canvas = document.createElement("canvas");
    canvas.style.position = "fixed";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.zIndex = "0";
    canvas.style.pointerEvents = "none";
    canvas.style.opacity = "0.5";
    container.appendChild(canvas);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      100,
    );
    camera.position.z = 5;
    // Particles
    const particleGeo = new THREE.BufferGeometry();
    const count = 800;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 20;
    }
    particleGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3),
    );
    const particleMat = new THREE.PointsMaterial({
      color: isAdmin ? "#ef4444" : "#6366f1",
      size: 0.05,
      transparent: true,
      opacity: 0.6,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);
    // Main shape
    const geo = new THREE.IcosahedronGeometry(1.5, 1);
    const mat = new THREE.MeshBasicMaterial({
      color: isAdmin ? "#ef4444" : "#6366f1",
      wireframe: true,
      transparent: true,
      opacity: 0.15,
    });
    const mesh = new THREE.Mesh(geo, mat);
    scene.add(mesh);

    // Torus ring
    const torusGeo = new THREE.TorusGeometry(2.2, 0.008, 16, 100);
    const torusMat = new THREE.MeshBasicMaterial({
      color: isAdmin ? "#f87171" : "#818cf8",
      transparent: true,
      opacity: 0.2,
    });
    const torus = new THREE.Mesh(torusGeo, torusMat);
    torus.rotation.x = 0.5;
    scene.add(torus);
    const onResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);

    let raf;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      mesh.rotation.x += 0.003;
      mesh.rotation.y += 0.005;
      torus.rotation.z += 0.004;
      particles.rotation.y += 0.001;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      geo.dispose();
      mat.dispose();
      torusGeo.dispose();
      torusMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      // Remove canvas from DOM
      if (container.contains(canvas)) {
        container.removeChild(canvas);
      }
    };
  }, [isAdmin]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (isAdmin) await registerAdmin(form);
      else await registerUser(form);
      toast.success("Account created! Please login.");
      navigate("/login");
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    {
      name: "username",
      type: "text",
      icon: "fa-user",
      placeholder: "Full name",
      autoComplete: "name",
    },
    {
      name: "email",
      type: "email",
      icon: "fa-envelope",
      placeholder: "Email address",
      autoComplete: "email",
    },
    {
      name: "password",
      type: "password",
      icon: "fa-lock",
      placeholder: "Password (min 6 chars)",
      autoComplete: "new-password",
    },
  ];

  return (
    <div className="auth-page">
      <canvas ref={bgRef} className="auth-canvas" />
      <div className="auth-card-premium">
        <div className="auth-brand">
          <div
            className="auth-brand-icon"
            style={{
              background: isAdmin
                ? "linear-gradient(135deg,#ef4444,#dc2626)"
                : "linear-gradient(135deg,#6366f1,#8b5cf6)",
            }}
          >
            <i
              className={`fa-solid ${isAdmin ? "fa-user-shield" : "fa-user-plus"}`}
            ></i>
          </div>
          <h2 className="auth-title">Create Account</h2>
          <p className="auth-subtitle">Join SCMS to manage complaints</p>
        </div>

        {/* Role toggle */}
        <div className="role-toggle">
          <button
            type="button"
            className={`role-toggle-btn ${!isAdmin ? "active" : ""}`}
            onClick={() => setIsAdmin(false)}
          >
            <i className="fa-solid fa-user me-2"></i>User
          </button>
          <button
            type="button"
            className={`role-toggle-btn ${isAdmin ? "active-admin" : ""}`}
            onClick={() => setIsAdmin(true)}
          >
            <i className="fa-solid fa-user-shield me-2"></i>Admin
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {fields.map((f) => (
            <div key={f.name} className="auth-field">
              <label className="auth-label">
                {f.name.charAt(0).toUpperCase() + f.name.slice(1)}
              </label>
              <div className="auth-input-box">
                <span className="auth-icon">
                  <i className={`fa-solid ${f.icon}`}></i>
                </span>
                <input
                  type={f.type}
                  name={f.name}
                  className="auth-input"
                  placeholder={f.placeholder}
                  value={form[f.name]}
                  onChange={handleChange}
                  required
                  autoComplete={f.autoComplete}
                />
              </div>
            </div>
          ))}

          {/* Admin secret key */}
          {isAdmin && (
            <div className="auth-field">
              <label className="auth-label">Admin Secret Key</label>
              <div className="auth-input-box">
                <span className="auth-icon" style={{ color: "#ef4444" }}>
                  <i className="fa-solid fa-key"></i>
                </span>
                <input
                  type="password"
                  name="secretKey"
                  className="auth-input"
                  placeholder="Enter admin secret key"
                  value={form.secretKey}
                  onChange={handleChange}
                  required
                  autoComplete="off"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="btn-premium auth-submit"
            style={{
              background: isAdmin
                ? "linear-gradient(135deg,#ef4444,#dc2626)"
                : undefined,
            }}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Creating...
              </>
            ) : (
              <>
                <i className="fa-solid fa-rocket me-2"></i>Create Account
              </>
            )}
          </button>
        </form>

        <p className="auth-footer-text">
          Already have an account?{" "}
          <Link to="/login" className="auth-link">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
