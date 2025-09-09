import { useEffect, useState } from 'react';
import API_BASE from './api';
import ResponsiveTable from './components/ResponsiveTable';
import './ContributionManagement.css';

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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const contributionColumns = [
    { 
      key: 'member', 
      label: 'Member',
      render: (c) => c.member?.username || 'N/A'
    },
    { 
      key: 'amount', 
      label: 'Amount',
      render: (c) => formatCurrency(c.amount)
    },
    { 
      key: 'date', 
      label: 'Date',
      render: (c) => `${c.month}/${c.year}`
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (c) => (
        <span className={`status-badge status-${c.status}`}>
          {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (c) => (
        <div className="actions">
          <button 
            onClick={() => handleEdit(c)}
            className="btn btn-edit"
          >
            Edit
          </button>
          <button 
            onClick={() => handleDelete(c._id)}
            className="btn btn-delete"
          >
            Delete
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="contribution-management">
      <div className="page-header">
        <h1>Contribution Management</h1>
        <p className="page-description">Manage member contributions and track payment status</p>
      </div>

      {(error || success) && (
        <div className="alerts-container">
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h2>{editingId ? 'Edit Contribution' : 'Add New Contribution'}</h2>
        </div>
        <form onSubmit={handleSubmit} className="contribution-form">
          <div className="form-grid">
            <div className="form-group">
              <label>Member</label>
              <select 
                name="member" 
                value={form.member} 
                onChange={handleChange} 
                required
              >
                <option value="">Select Member</option>
                {members.map(m => (
                  <option key={m._id} value={m._id}>
                    {m.username}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Amount (RWF)</label>
              <input 
                name="amount" 
                type="number" 
                value={form.amount} 
                onChange={handleChange} 
                placeholder="Amount" 
                required 
                min="0"
              />
            </div>

            <div className="form-group">
              <label>Month</label>
              <select 
                name="month" 
                value={form.month} 
                onChange={handleChange} 
                required
              >
                <option value="">Select Month</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                  <option key={m} value={m}>
                    {new Date(2000, m - 1).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Year</label>
              <select 
                name="year" 
                value={form.year} 
                onChange={handleChange} 
                required
              >
                <option value="">Select Year</option>
                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(y => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Status</label>
              <select 
                name="status" 
                value={form.status} 
                onChange={handleChange}
              >
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingId ? 'Update' : 'Add'} Contribution
              </button>
              {editingId && (
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => { 
                    setEditingId(null); 
                    setForm({ member: '', amount: '', month: '', year: '', status: 'paid' }); 
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>Contribution Records</h2>
        </div>
        <div className="table-container">
          <ResponsiveTable 
            columns={contributionColumns}
            data={contributions}
            loading={loading}
            error={error}
          />
        </div>
      </div>
    </div>
  );
}

export default ContributionManagement;