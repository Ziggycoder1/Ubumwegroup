import { useState } from 'react';
import API_BASE from './api';
import './Login.css';
import { useAuth } from './context/AuthContext';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include', // Important for cookies/sessions
        body: JSON.stringify({ email, password }),
      });
      
     
      
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || `HTTP error! status: ${res.status}`);
      }
      
      if (!data.user || !data.token) {
        throw new Error('Invalid response from server');
      }
      
      login(data.user, data.token);
      
      // Redirect based on role
      if (data.user.role === 'Admin') {
        navigate('/admindashboard');
      } else if (data.user.role === 'Finance') {
        navigate('/financedashboard');
      } else {
        navigate('/memberdashboard');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2>Welcome Back To UBUMWE GROUP</h2>
          <p>Please enter your credentials to login</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
              className="form-input"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              className="form-input"
            />
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? (
              <span className="button-loader"></span>
            ) : (
              'Login'
            )}
          </button>
        </form>
        
        <div className="login-footer">
          <p>Don't have an account? <a href="/signup">Sign up</a></p>
          <a href="/forgot-password" className="forgot-password">Forgot password?</a>
        </div>
      </div>
    </div>
  );
}

export default Login;