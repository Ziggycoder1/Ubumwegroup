import { useEffect, useState } from 'react';
import API_BASE from './api';
import ResponsiveTable from './components/ResponsiveTable';
import './MemberManagement.css';

function MemberManagement() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ username: '', email: '', phone: '', role: 'Member', status: 'active', password: '' });
  const [editingId, setEditingId] = useState(null);
  const [success, setSuccess] = useState('');

  const fetchMembers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/users`);
      const data = await res.json();
      setMembers(data);
    } catch (err) {
      setError('Failed to fetch users');
    }
    setLoading(false);
  };

  useEffect(() => { fetchMembers(); }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `${API_BASE}/users/${editingId}` : `${API_BASE}/users`;
      const payload = { ...form };
      if (editingId) delete payload.password; // Don't send password on edit
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Failed to save user');
      setForm({ username: '', email: '', phone: '', role: 'Member', status: 'active', password: '' });
      setEditingId(null);
      setSuccess(editingId ? 'User updated!' : 'User added!');
      fetchMembers();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = member => {
    setForm({
      username: member.username || '',
      email: member.email || '',
      phone: member.phone || '',
      role: member.role,
      status: member.status,
      password: ''
    });
    setEditingId(member._id);
    setSuccess('');
    setError('');
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this user?')) return;
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`${API_BASE}/users/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete user');
      setSuccess('User deleted!');
      fetchMembers();
    } catch (err) {
      setError(err.message);
    }
  };

  const columns = [
    { key: 'username', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'role', label: 'Role' },
    { 
      key: 'status', 
      label: 'Status',
      render: (item) => (
        <span style={{ 
          color: item.status === 'active' ? '#38a169' : '#e53e3e',
          fontWeight: 500
        }}>
          {item.status}
        </span>
      )
    }
  ];

  return (
    <div className="member-management">
      <div className="page-header">
        <h1>Member Management</h1>
        <p className="page-description">Manage system users and their permissions</p>
      </div>
      
      <div className="card">
        <div className="card-header">
          <h2>{editingId ? 'Edit Member' : 'Add New Member'}</h2>
        </div>
        <form onSubmit={handleSubmit} className="member-form">
        <div className="form-grid">
          <div className="form-group">
            <label>Name</label>
            <input 
              name="username" 
              value={form.username} 
              onChange={handleChange} 
              placeholder="Name" 
              required 
            />
          </div>
          
          <div className="form-group">
            <label>Email</label>
            <input 
              name="email" 
              value={form.email} 
              onChange={handleChange} 
              placeholder="Email" 
              required 
              type="email"
            />
          </div>
          
          <div className="form-group">
            <label>Phone</label>
            <input 
              name="phone" 
              value={form.phone} 
              onChange={handleChange} 
              placeholder="Phone" 
              type="tel"
            />
          </div>
          
          <div className="form-group">
            <label>Role</label>
            <select 
              name="role" 
              value={form.role} 
              onChange={handleChange}
            >
              <option value="Member">Member</option>
              <option value="Admin">Admin</option>
              <option value="Finance">Finance</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Status</label>
            <select 
              name="status" 
              value={form.status} 
              onChange={handleChange}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          
          {!editingId && (
            <div className="form-group">
              <label>Password</label>
              <input 
                name="password" 
                value={form.password} 
                onChange={handleChange} 
                placeholder="Password" 
                required 
                type="password" 
              />
            </div>
          )}
          
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              {editingId ? 'Update' : 'Add'} Member
            </button>
            
            {editingId && (
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => { 
                  setEditingId(null); 
                  setForm({ 
                    username: '', 
                    email: '', 
                    phone: '', 
                    role: 'Member', 
                    status: 'active', 
                    password: '' 
                  }); 
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </div>
        </form>
      </div>
      
      {(error || success) && (
        <div className="alerts-container">
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}
        </div>
      )}
      
      <div className="table-container">
        <ResponsiveTable 
          columns={columns}
          data={members}
          loading={loading}
          error={error}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}

export default MemberManagement;