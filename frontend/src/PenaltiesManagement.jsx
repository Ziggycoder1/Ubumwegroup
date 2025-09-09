import { useEffect, useState } from 'react';
import API_BASE from './api';
import ResponsiveTable from './components/ResponsiveTable';
import './PenaltiesManagement.css';

function PenaltiesManagement() {
  const [penalties, setPenalties] = useState([]);
  const [members, setMembers] = useState([]);
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({ member: '', reason: '', amount: '', rule: '' });
  const [ruleForm, setRuleForm] = useState({ name: '', description: '', amount: '' });

  const fetchAll = async () => {
    setLoading(true);
    setError('');
    try {
      const [penRes, memRes, ruleRes] = await Promise.all([
        fetch(`${API_BASE}/penalties`),
        fetch(`${API_BASE}/users`),
        fetch(`${API_BASE}/penalties/rules`)
      ]);
      setPenalties(await penRes.json());
      setMembers(await memRes.json());
      setRules(await ruleRes.json());
    } catch (err) {
      setError('Failed to fetch data');
    }
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const handleFormChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (e.target.name === 'rule') {
      const selected = rules.find(r => r._id === e.target.value);
      if (selected) setForm(f => ({ ...f, reason: selected.name, amount: selected.amount }));
    }
  };

  const handleAssign = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`${API_BASE}/penalties`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error('Failed to assign penalty');
      setForm({ member: '', reason: '', amount: '', rule: '' });
      setSuccess('Penalty assigned!');
      fetchAll();
    } catch (err) {
      setError(err.message);
    }
  };

  const handlePay = async id => {
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`${API_BASE}/penalties/pay/${id}`, { method: 'PUT' });
      if (!res.ok) throw new Error('Failed to mark as paid');
      setSuccess('Penalty marked as paid!');
      fetchAll();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRuleChange = e => {
    setRuleForm({ ...ruleForm, [e.target.name]: e.target.value });
  };

  const handleAddRule = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`${API_BASE}/penalties/rules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ruleForm)
      });
      if (!res.ok) throw new Error('Failed to add rule');
      setRuleForm({ name: '', description: '', amount: '' });
      setSuccess('Rule added!');
      fetchAll();
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

  const penaltyColumns = [
    { 
      key: 'member', 
      label: 'Member',
      render: (p) => p.member?.username || 'N/A'
    },
    { 
      key: 'reason', 
      label: 'Reason',
    },
    { 
      key: 'amount', 
      label: 'Amount',
      render: (p) => formatCurrency(p.amount)
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (p) => (
        <span className={`status-badge status-${p.paid ? 'paid' : 'pending'}`}>
          {p.paid ? 'Paid' : 'Pending'}
        </span>
      )
    },
    { 
      key: 'date', 
      label: 'Date',
      render: (p) => new Date(p.createdAt).toLocaleDateString()
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (p) => (
        !p.paid ? (
          <button 
            onClick={() => handlePay(p._id)}
            className="btn btn-pay"
          >
            Mark as Paid
          </button>
        ) : (
          <span className="text-muted">Paid</span>
        )
      )
    }
  ];

  return (
    <div className="penalties-management">
      <div className="page-header">
        <h1>Penalties Management</h1>
        <p className="page-description">Manage penalties and penalty rules</p>
      </div>

      {(error || success) && (
        <div className="alerts-container">
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h2>Assign New Penalty</h2>
        </div>
        <form onSubmit={handleAssign} className="penalty-form">
          <div className="form-grid">
            <div className="form-group">
              <label>Member</label>
              <select 
                name="member" 
                value={form.member} 
                onChange={handleFormChange} 
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
              <label>Rule (Optional)</label>
              <select 
                name="rule" 
                value={form.rule} 
                onChange={handleFormChange}
              >
                <option value="">Select Rule</option>
                {rules.map(r => (
                  <option key={r._id} value={r._id}>
                    {r.name} ({formatCurrency(r.amount)})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Reason</label>
              <input 
                name="reason" 
                value={form.reason} 
                onChange={handleFormChange} 
                placeholder="Reason for penalty" 
                required 
              />
            </div>

            <div className="form-group">
              <label>Amount (RWF)</label>
              <input 
                name="amount" 
                type="number" 
                value={form.amount} 
                onChange={handleFormChange} 
                placeholder="Amount" 
                required 
                min="0"
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                Assign Penalty
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>Penalty Rules</h2>
        </div>
        <form onSubmit={handleAddRule} className="rule-form">
          <div className="form-grid">
            <div className="form-group">
              <label>Rule Name</label>
              <input 
                name="name" 
                value={ruleForm.name} 
                onChange={handleRuleChange} 
                placeholder="e.g., Late Payment" 
                required 
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <input 
                name="description" 
                value={ruleForm.description} 
                onChange={handleRuleChange} 
                placeholder="Rule description" 
              />
            </div>

            <div className="form-group">
              <label>Amount (RWF)</label>
              <input 
                name="amount" 
                type="number" 
                value={ruleForm.amount} 
                onChange={handleRuleChange} 
                placeholder="Amount" 
                required 
                min="0"
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-secondary">
                Add Rule
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>Penalty Records</h2>
        </div>
        <div className="table-container">
          <ResponsiveTable 
            columns={penaltyColumns}
            data={penalties}
            loading={loading}
            error={error}
          />
        </div>
      </div>
    </div>
  );
}

export default PenaltiesManagement;