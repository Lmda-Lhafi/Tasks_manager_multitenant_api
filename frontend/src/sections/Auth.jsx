import React, { useState, useEffect } from "react";
import api from "../api/client";

export default function Auth() {
  // states
  const [logged, setLogged] = useState(false);
  const [userinfo, setUserinfo] = useState(null);
  const [tenantinfo, setTenantinfo] = useState(null);
  const [modalopen, setModalopen] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // form states
  const [Loginemail, setLoginemail] = useState("");
  const [Registeremail, setRegisteremail] = useState("");
  const [Loginpassword, setLoginpassword] = useState("");
  const [Registerpassword, setRegisterpassword] = useState("");
  const [name, setname] = useState("");

  // button click
  const handleClick = () => {
    setModalopen(true);
    setShowRegister(false);
    setError("");
  };

  // login function
  const handleLogin = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/auth/login", {
        email: Loginemail,
        password: Loginpassword,
      });
      if (res.status === 200) {
        setLogged(true);
        setUserinfo(res.data.user);
        setTenantinfo(res.data.tenant);
        if (res.data.token) {
          localStorage.setItem('token', res.data.token);
        }
        setModalopen(false);
        setLoginemail("");
        setLoginpassword("");
      }
    } catch (error) {
      console.log("Login error:", error);
      setError(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // register function
  const handleRegister = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/auth/register-tenant", {
        name: name,
        email: Registeremail,
        password: Registerpassword,
      });
      if (res.status === 200 || res.status === 201) {
        setLogged(true);
        setUserinfo(res.data.user);
        setTenantinfo(res.data.tenant);
        if (res.data.token) {
          localStorage.setItem('token', res.data.token);
        }
        setModalopen(false);
        setname("");
        setRegisteremail("");
        setRegisterpassword("");
      }
    } catch (error) {
      console.log("Register error:", error);
      setError(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const handleLogout = () => {
    setLogged(false);
    setUserinfo(null);
    setTenantinfo(null);
    setModalopen(false);
    localStorage.removeItem('token');
  };

  return (
    <div className="auth-container">
      <button 
        className={`auth-button ${logged ? "logged-in" : "logged-out"}`}
        onClick={handleClick}
      >
        Authentication
      </button>

      {modalopen && (
        <div className="auth-modal" onClick={(e) => {
          if (e.target.className === 'auth-modal') {
            setModalopen(false);
          }
        }}>
          <div className="modal-content">
            <button 
              className="close-button" 
              type="button"
              onClick={() => setModalopen(false)}
            >
              ×
            </button>
            
            {logged ? (
              <div className="user-info">
                <h2>User Info</h2>
                <p>User ID: {userinfo?.id}</p>
                {userinfo?.name && <p>Name: {userinfo?.name}</p>}
                <p>Email: {userinfo?.email}</p>
                <p>Role: {userinfo?.role}</p>
                <p>Tenant ID: {tenantinfo?.id}</p>
                <p>Tenant Name: {tenantinfo?.name}</p>
                <button type="button" onClick={handleLogout}>Logout</button>
              </div>
            ) : (
              <>
                {!showRegister ? (
                  <div className="login-form">
                    <h2>Login</h2>
                    <form onSubmit={handleLogin}>
                      <div className="form-group">
                        <label>Email:</label>
                        <input 
                          type="email" 
                          value={Loginemail}
                          onChange={(e) => setLoginemail(e.target.value)}
                          required
                          autoComplete="email"
                        />
                      </div>
                      <div className="form-group">
                        <label>Password:</label>
                        <input 
                          type="password"
                          value={Loginpassword}
                          onChange={(e) => setLoginpassword(e.target.value)}
                          required
                          autoComplete="current-password"
                        />
                      </div>
                      {error && <p className="error-message">{error}</p>}
                      <button type="submit" disabled={loading}>
                        {loading ? "Loading..." : "Login"}
                      </button>
                      <button 
                        type="button" 
                        onClick={(e) => {
                          e.preventDefault();
                          setShowRegister(true);
                          setError("");
                        }}
                      >
                        Create an account
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="register-form">
                    <h2>Register</h2>
                    <form onSubmit={handleRegister}>
                      <div className="form-group">
                        <label>Tenant Name:</label>
                        <input 
                          type="text"
                          value={name}
                          onChange={(e) => setname(e.target.value)}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Email:</label>
                        <input 
                          type="email"
                          value={Registeremail}
                          onChange={(e) => setRegisteremail(e.target.value)}
                          required
                          autoComplete="email"
                        />
                      </div>
                      <div className="form-group">
                        <label>Password:</label>
                        <input 
                          type="password"
                          value={Registerpassword}
                          onChange={(e) => setRegisterpassword(e.target.value)}
                          required
                          autoComplete="new-password"
                        />
                      </div>
                      {error && <p className="error-message">{error}</p>}
                      <button type="submit" disabled={loading}>
                        {loading ? "Loading..." : "Create an account"}
                      </button>
                      <button 
                        type="button" 
                        onClick={(e) => {
                          e.preventDefault();
                          setShowRegister(false);
                          setError("");
                        }}
                      >
                        Login
                      </button>
                    </form>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}