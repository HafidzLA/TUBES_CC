import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { KeyRound, Mail, LogIn, AlertCircle } from 'lucide-react';
import './Auth.css';

const Login = () => {
  const { login } = useAuth();
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!emailOrUsername || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await login(emailOrUsername, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Invalid username/email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-background-radial"></div>
      <div className="auth-container container">
        <div className="auth-card glass-card animate-fade-in">
          <div className="auth-header">
            <span className="auth-logo-icon">🎬</span>
            <h2>Welcome Back</h2>
            <p>SignIn to your ShutterScore account to continue logging cinema</p>
          </div>

          {error && (
            <div className="auth-error-box">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="identity">Email or Username</label>
              <div className="auth-input-wrapper">
                <Mail className="auth-input-icon" size={16} />
                <input
                  type="text"
                  id="identity"
                  className="form-control auth-control"
                  placeholder="Enter email or username"
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="auth-input-wrapper">
                <KeyRound className="auth-input-icon" size={16} />
                <input
                  type="password"
                  id="password"
                  className="form-control auth-control"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-full-width btn-auth" 
              disabled={loading}
            >
              {loading ? (
                'Signing In...'
              ) : (
                <>
                  <LogIn size={18} />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p>Don't have an account? <Link to="/register" className="auth-link-alt">Create one</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
