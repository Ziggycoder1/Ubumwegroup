import { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import API_BASE from './api';
import './ProfileForm.css';

export default function ProfileForm({ role }) {
  const { user, token, login } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: role,
    ...(role === 'member' && { idNumber: '', address: '' })
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        name: user.name || user.username || '',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || role,
        ...(role === 'member' && {
          idNumber: user.idNumber || '',
          address: user.address || ''
        })
      }));
    }
  }, [user, role]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      const res = await fetch(`${API_BASE}/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(form)
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update profile');
      }
      
      const updated = await res.json();
      login({ ...user, ...updated }, token);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.message || 'An error occurred while updating the profile');
    } finally {
      setLoading(false);
    }
  };

  // Role-specific styles
  const roleStyles = {
    admin: { headerBg: '#4a6cf7', buttonBg: '#4a6cf7' },
    finance: { headerBg: '#8b5cf6', buttonBg: '#8b5cf6' },
    member: { headerBg: '#10b981', buttonBg: '#10b981' }
  };

  const { headerBg, buttonBg } = roleStyles[role] || roleStyles.member;

  return (
    <div className="profile-form-container">
      <form onSubmit={handleSubmit} className="profile-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input 
              id="name"
              type="text" 
              name="name" 
              value={form.name} 
              onChange={handleChange} 
              className="form-control"
              required 
              placeholder="Enter your full name"
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input 
              id="email"
              type="email" 
              name="email" 
              value={form.email} 
              onChange={handleChange} 
              className="form-control"
              required 
              placeholder="Enter your email address"
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input 
              id="phone"
              type="tel" 
              name="phone" 
              value={form.phone || ''} 
              onChange={handleChange} 
              className="form-control"
              placeholder="Enter your phone number"
            />
          </div>
        </div>

        {role === 'member' && (
          <>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="idNumber">ID Number</label>
                <input 
                  id="idNumber"
                  type="text" 
                  name="idNumber" 
                  value={form.idNumber || ''} 
                  onChange={handleChange} 
                  className="form-control"
                  disabled={!user?.idNumber}
                  placeholder="Enter your ID number"
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="address">Address</label>
                <textarea 
                  id="address"
                  name="address" 
                  value={form.address || ''} 
                  onChange={handleChange} 
                  className="form-control"
                  rows="3"
                  placeholder="Enter your address"
                />
              </div>
            </div>
          </>
        )}
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="role">Role</label>
            <input 
              id="role"
              type="text" 
              value={form.role} 
              className="form-control" 
              disabled 
              readOnly
            />
          </div>
        </div>
        
        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        
        <div className="form-actions">
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? (
              <span className="btn-loading">
                <span className="spinner"></span>
                Saving...
              </span>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
