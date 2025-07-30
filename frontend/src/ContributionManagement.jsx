import { useEffect, useState } from 'react';
import API_BASE from './api';

function ContributionManagement() {
  const [contributions, setContributions] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ member: '', amount: '', month: '', year: '', status: 'paid' });
  const [editingId, setEditingId] = useState(null);
  const [success, setSuccess] = useState('');

  const fetchContributions = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/contributions`);
      const data = await res.json();
      setContributions(data);
    } catch (err) {
      setError('Failed to fetch contributions');
    }
    setLoading(false);
  };

  const fetchMembers = async () => {
    try {
      const res = await fetch(`${API_BASE}/users`);
      const data = await res.json();
      setMembers(data);
    } catch (err) {
      setError('Failed to fetch users');
    }
  };

  useEffect(() => {
    fetchMembers();
    fetchContributions();
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `${API_BASE}/contributions/${editingId}` : `${API_BASE}/contributions`;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error('Failed to save contribution');
      setForm({ member: '', amount: '', month: '', year: '', status: 'paid' });
      setEditingId(null);
      setSuccess(editingId ? 'Contribution updated!' : 'Contribution added!');
      fetchContributions();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = c => {
    setForm({
      member: c.member._id || c.member,
      amount: c.amount,
      month: c.month,
      year: c.year,
      status: c.status
    });
    setEditingId(c._id);
    setSuccess('');
    setError('');
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this contribution?')) return;
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`${API_BASE}/contributions/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete contribution');
      setSuccess('Contribution deleted!');
      fetchContributions();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ margin: '2rem 0', color: '#222' }}>
      <h3 style={{ color: '#111' }}>Contribution Management</h3>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        <select name="member" value={form.member} onChange={handleChange} required style={{ flex: 1, minWidth: 120, color: '#222', background: '#f9f9f9', border: '1px solid #bbb' }}>
          <option value="">Select Member</option>
          {members.map(m => <option key={m._id} value={m._id}>{m.username}</option>)}
        </select>
        <input name="amount" value={form.amount} onChange={handleChange} placeholder="Amount" required type="number" style={{ flex: 1, minWidth: 100, color: '#222', background: '#f9f9f9', border: '1px solid #bbb' }} />
        <input name="month" value={form.month} onChange={handleChange} placeholder="Month (1-12)" required type="number" min="1" max="12" style={{ flex: 1, minWidth: 80, color: '#222', background: '#f9f9f9', border: '1px solid #bbb' }} />
        <input name="year" value={form.year} onChange={handleChange} placeholder="Year" required type="number" style={{ flex: 1, minWidth: 80, color: '#222', background: '#f9f9f9', border: '1px solid #bbb' }} />
        <select name="status" value={form.status} onChange={handleChange} style={{ flex: 1, minWidth: 100, color: '#222', background: '#f9f9f9', border: '1px solid #bbb' }}>
          <option value="paid">Paid</option>
          <option value="unpaid">Unpaid</option>
        </select>
        <button type="submit" style={{ minWidth: 100 }}>{editingId ? 'Update' : 'Add'}</button>
        {editingId && <button type="button" onClick={() => { setEditingId(null); setForm({ member: '', amount: '', month: '', year: '', status: 'paid' }); }}>Cancel</button>}
      </form>
      {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
      {success && <div style={{ color: 'green', marginBottom: 8 }}>{success}</div>}
      {loading ? <div>Loading...</div> : (
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', color: '#222' }}>
          <thead>
            <tr style={{ background: '#e6eaf3', color: '#111' }}>
              <th style={{ border: '1px solid #b0b0b0', padding: 8 }}>Member</th>
              <th style={{ border: '1px solid #b0b0b0', padding: 8 }}>Amount</th>
              <th style={{ border: '1px solid #b0b0b0', padding: 8 }}>Month</th>
              <th style={{ border: '1px solid #b0b0b0', padding: 8 }}>Year</th>
              <th style={{ border: '1px solid #b0b0b0', padding: 8 }}>Status</th>
              <th style={{ border: '1px solid #b0b0b0', padding: 8 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {contributions.map(c => (
              <tr key={c._id} style={{ background: '#f9f9f9', color: '#222' }}>
                <td style={{ border: '1px solid #e0e0e0', padding: 8 }}>{c.member?.username || ''}</td>
                <td style={{ border: '1px solid #e0e0e0', padding: 8 }}>{c.amount}</td>
                <td style={{ border: '1px solid #e0e0e0', padding: 8 }}>{c.month}</td>
                <td style={{ border: '1px solid #e0e0e0', padding: 8 }}>{c.year}</td>
                <td style={{ border: '1px solid #e0e0e0', padding: 8 }}>{c.status}</td>
                <td style={{ border: '1px solid #e0e0e0', padding: 8 }}>
                  <button onClick={() => handleEdit(c)} style={{ marginRight: 6 }}>Edit</button>
                  <button onClick={() => handleDelete(c._id)} style={{ color: 'red' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ContributionManagement; 