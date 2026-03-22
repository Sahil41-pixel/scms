import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as THREE from "three";
import { loginUser } from "../../Services/AuthServices";
import { getErrorMessage } from "../../Utils/ErrorMessage";
import toast from "react-hot-toast";
import "./AuthStyles.css";

const Login = () => {
  const navigate = useNavigate();
  const bgRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  useEffect(() => {
    const canvas = bgRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    });
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      100,
    );
    camera.position.z = 5;

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const geo = new THREE.TorusKnotGeometry(1.2, 0.3, 100, 16);
    const mat = new THREE.MeshBasicMaterial({
      color: "#6366f1",
      wireframe: true,
      transparent: true,
      opacity: 0.15,
    });
    const mesh = new THREE.Mesh(geo, mat);
    scene.add(mesh);

    const onResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);

    let raf;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      mesh.rotation.x += 0.004;
      mesh.rotation.y += 0.006;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
    };
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const data = await loginUser(form);
      localStorage.setItem(
        "scms",
        JSON.stringify({
          token: data.token,
          user: {
            id: data.user.id,
            username: data.user.username,
            email: data.user.email,
            role: data.user.role,
          },
        }),
      );
      toast.success(data.message);
      if (data.user.role === "admin") navigate("/admin");
      else if (data.user.role === "employee") navigate("/employee");
      else navigate("/home");
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <canvas ref={bgRef} className="auth-canvas" />
      <div className="auth-card-premium">
        <div className="auth-brand">
          <div className="auth-brand-icon">
            <i className="fa-solid fa-shield-halved"></i>
          </div>
          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-subtitle">Sign in to your SCMS account</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div className="auth-field">
            <label className="auth-label">Email Address</label>
            <div className="auth-input-box">
              <span className="auth-icon">
                <i className="fa-solid fa-envelope"></i>
              </span>
              <input
                type="email"
                name="email"
                className="auth-input"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password */}
          <div className="auth-field">
            <label className="auth-label">Password</label>
            <div className="auth-input-box">
              <span className="auth-icon">
                <i className="fa-solid fa-lock"></i>
              </span>
              <input
                type={showPass ? "text" : "password"}
                name="password"
                className="auth-input"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="auth-eye"
                onClick={() => setShowPass(!showPass)}
              >
                <i
                  className={`fa-solid ${showPass ? "fa-eye-slash" : "fa-eye"}`}
                ></i>
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn-premium auth-submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Signing in...
              </>
            ) : (
              <>
                <i className="fa-solid fa-arrow-right-to-bracket me-2"></i>Sign
                In
              </>
            )}
          </button>
        </form>

        <p className="auth-footer-text">
          No account?{" "}
          <Link to="/register" className="auth-link">
            Create one here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
