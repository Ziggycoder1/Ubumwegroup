import { useEffect, useState } from 'react';
import API_BASE from './api';

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

  return (
    <div style={{ margin: '2rem 0', color: '#222' }}>
      <h3 style={{ color: '#111' }}>Penalties Management</h3>
      <form onSubmit={handleAssign} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        <select name="member" value={form.member} onChange={handleFormChange} required style={{ flex: 1, minWidth: 120 }}>
          <option value="">Select Member</option>
          {members.map(m => <option key={m._id} value={m._id}>{m.username}</option>)}
        </select>
        <select name="rule" value={form.rule} onChange={handleFormChange} style={{ flex: 1, minWidth: 120 }}>
          <option value="">Select Preset Rule (optional)</option>
          {rules.map(r => <option key={r._id} value={r._id}>{r.name} ({r.amount} RWF)</option>)}
        </select>
        <input name="reason" value={form.reason} onChange={handleFormChange} placeholder="Reason" required style={{ flex: 1, minWidth: 120 }} />
        <input name="amount" value={form.amount} onChange={handleFormChange} placeholder="Amount" required type="number" style={{ flex: 1, minWidth: 100 }} />
        <button type="submit" style={{ minWidth: 100 }}>Assign</button>
      </form>
      <form onSubmit={handleAddRule} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16, background: '#f7f7f7', padding: 8, borderRadius: 6 }}>
        <input name="name" value={ruleForm.name} onChange={handleRuleChange} placeholder="Rule Name" required style={{ flex: 1, minWidth: 120 }} />
        <input name="description" value={ruleForm.description} onChange={handleRuleChange} placeholder="Description" style={{ flex: 2, minWidth: 120 }} />
        <input name="amount" value={ruleForm.amount} onChange={handleRuleChange} placeholder="Amount" required type="number" style={{ flex: 1, minWidth: 100 }} />
        <button type="submit" style={{ minWidth: 100 }}>Add Rule</button>
      </form>
      {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
      {success && <div style={{ color: 'green', marginBottom: 8 }}>{success}</div>}
      {loading ? <div>Loading...</div> : (
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', color: '#222' }}>
          <thead>
            <tr style={{ background: '#e6eaf3', color: '#111' }}>
              <th style={{ border: '1px solid #b0b0b0', padding: 8 }}>Member</th>
              <th style={{ border: '1px solid #b0b0b0', padding: 8 }}>Reason</th>
              <th style={{ border: '1px solid #b0b0b0', padding: 8 }}>Amount</th>
              <th style={{ border: '1px solid #b0b0b0', padding: 8 }}>Status</th>
              <th style={{ border: '1px solid #b0b0b0', padding: 8 }}>Assigned</th>
              <th style={{ border: '1px solid #b0b0b0', padding: 8 }}>Paid</th>
              <th style={{ border: '1px solid #b0b0b0', padding: 8 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {penalties.map(p => (
              <tr key={p._id} style={{ background: '#f9f9f9', color: '#222' }}>
                <td style={{ border: '1px solid #e0e0e0', padding: 8 }}>{p.member?.username || ''}</td>
                <td style={{ border: '1px solid #e0e0e0', padding: 8 }}>{p.reason}</td>
                <td style={{ border: '1px solid #e0e0e0', padding: 8 }}>{p.amount}</td>
                <td style={{ border: '1px solid #e0e0e0', padding: 8 }}>{p.status}</td>
                <td style={{ border: '1px solid #e0e0e0', padding: 8 }}>{p.assignedAt ? new Date(p.assignedAt).toLocaleDateString() : '-'}</td>
                <td style={{ border: '1px solid #e0e0e0', padding: 8 }}>{p.paidAt ? new Date(p.paidAt).toLocaleDateString() : '-'}</td>
                <td style={{ border: '1px solid #e0e0e0', padding: 8 }}>
                  {p.status === 'unpaid' && <button onClick={() => handlePay(p._id)} style={{ color: 'green' }}>Mark as Paid</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default PenaltiesManagement; 