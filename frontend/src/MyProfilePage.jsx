import { useState } from 'react';
import DashboardLayout from './DashboardLayout';
import { useAuth } from './context/AuthContext';
import API_BASE from './api';

export default function MyProfilePage() {
  const { user, token, login } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || user?.username || '',
    email: user?.email || '',
    phone: user?.phone || '',
    role: user?.role || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      // Try to update member profile
      const res = await fetch(`${API_BASE}/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error('Failed to update profile');
      const updated = await res.json();
      login({ ...user, ...updated }, token); // update AuthContext
      setSuccess('Profile updated!');
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <DashboardLayout role={user?.role || ''}>
      <div className="card" style={{ maxWidth: 500, margin: '2rem auto' }}>
        <div className="card-header">
          <h3 className="card-title">My Profile</h3>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <label>
              Name:
              <input name="name" value={form.name} onChange={handleChange} required style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #bbb' }} />
            </label>
            <label>
              Email:
              <input name="email" value={form.email} onChange={handleChange} required style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #bbb' }} />
            </label>
            <label>
              Phone:
              <input name="phone" value={form.phone} onChange={handleChange} style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #bbb' }} />
            </label>
            <label>
              Role:
              <input value={form.role} readOnly style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #eee', background: '#f7f7f7' }} />
            </label>
            {error && <div style={{ color: 'red' }}>{error}</div>}
            {success && <div style={{ color: 'green' }}>{success}</div>}
            <button type="submit" disabled={loading} style={{ padding: 10, borderRadius: 4, background: '#007bff', color: '#fff', border: 'none', fontWeight: 'bold', fontSize: 16 }}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
} 