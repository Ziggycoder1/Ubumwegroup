import { useEffect, useState } from 'react';
import API_BASE from './api';

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

  return (
    <div style={{ margin: '2rem 0', color: '#222' }}>
      <h3>Member Management</h3>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        <input name="username" value={form.username} onChange={handleChange} placeholder="Name" required style={{ flex: 1, minWidth: 120 }} />
        <input name="email" value={form.email} onChange={handleChange} placeholder="Email" required style={{ flex: 1, minWidth: 120 }} />
        <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" style={{ flex: 1, minWidth: 100 }} />
        <select name="role" value={form.role} onChange={handleChange} style={{ flex: 1, minWidth: 100 }}>
          <option value="Member">Member</option>
          <option value="Admin">Admin</option>
          <option value="Finance">Finance</option>
        </select>
        <select name="status" value={form.status} onChange={handleChange} style={{ flex: 1, minWidth: 100 }}>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        {!editingId && (
          <input name="password" value={form.password} onChange={handleChange} placeholder="Password" required type="password" style={{ flex: 1, minWidth: 120 }} />
        )}
        <button type="submit" style={{ minWidth: 100 }}>{editingId ? 'Update' : 'Add'}</button>
        {editingId && <button type="button" onClick={() => { setEditingId(null); setForm({ username: '', email: '', phone: '', role: 'Member', status: 'active', password: '' }); }}>Cancel</button>}
      </form>
      {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
      {success && <div style={{ color: 'green', marginBottom: 8 }}>{success}</div>}
      {loading ? <div>Loading...</div> : (
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
          <thead>
            <tr style={{ background: '#e6eaf3' }}>
              <th style={{ border: '1px solid #e0e0e0', padding: 8 }}>Name</th>
              <th style={{ border: '1px solid #e0e0e0', padding: 8 }}>Email</th>
              <th style={{ border: '1px solid #e0e0e0', padding: 8 }}>Phone</th>
              <th style={{ border: '1px solid #e0e0e0', padding: 8 }}>Role</th>
              <th style={{ border: '1px solid #e0e0e0', padding: 8 }}>Status</th>
              <th style={{ border: '1px solid #e0e0e0', padding: 8 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map(m => (
              <tr key={m._id} style={{ background: '#f9f9f9' }}>
                <td style={{ border: '1px solid #e0e0e0', padding: 8 }}>{m.username}</td>
                <td style={{ border: '1px solid #e0e0e0', padding: 8 }}>{m.email}</td>
                <td style={{ border: '1px solid #e0e0e0', padding: 8 }}>{m.phone}</td>
                <td style={{ border: '1px solid #e0e0e0', padding: 8 }}>{m.role}</td>
                <td style={{ border: '1px solid #e0e0e0', padding: 8 }}>{m.status}</td>
                <td style={{ border: '1px solid #e0e0e0', padding: 8 }}>
                  <button onClick={() => handleEdit(m)} style={{ marginRight: 6 }}>Edit</button>
                  <button onClick={() => handleDelete(m._id)} style={{ color: 'red' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default MemberManagement; 