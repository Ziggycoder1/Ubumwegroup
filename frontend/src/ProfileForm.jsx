import { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import API_BASE from './api';

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
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="form-group">
          <label>Full Name</label>
          <input 
            type="text" 
            name="name" 
            value={form.name} 
            onChange={handleChange} 
            className="form-control"
            required 
          />
        </div>
        
        <div className="form-group">
          <label>Email</label>
          <input 
            type="email" 
            name="email" 
            value={form.email} 
            onChange={handleChange} 
            className="form-control"
            required 
          />
        </div>
        
        <div className="form-group">
          <label>Phone Number</label>
          <input 
            type="tel" 
            name="phone" 
            value={form.phone || ''} 
            onChange={handleChange} 
            className="form-control"
          />
        </div>

        {role === 'member' && (
          <>
            <div className="form-group">
              <label>ID Number</label>
              <input 
                type="text" 
                name="idNumber" 
                value={form.idNumber || ''} 
                onChange={handleChange} 
                className="form-control"
                disabled={!user?.idNumber}
              />
            </div>
            
            <div className="form-group">
              <label>Address</label>
              <textarea 
                name="address" 
                value={form.address || ''} 
                onChange={handleChange} 
                className="form-control"
                rows="3"
              />
            </div>
          </>
        )}
        
        <div className="form-group">
          <label>Role</label>
          <input 
            type="text" 
            value={form.role} 
            className="form-control" 
            disabled 
          />
        </div>
        
        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        
        <div className="form-group" style={{ marginTop: '1rem' }}>
          <button 
            type="submit" 
            className="btn btn-primary"
            style={{ background: buttonBg, borderColor: buttonBg }}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
