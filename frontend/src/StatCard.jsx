const StatCard = ({ title, value, icon, trend }) => (
  <div className="stat-card" style={{
    background: '#fff',
    borderRadius: 10,
    boxShadow: '0 2px 8px #eee',
    padding: 20,
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    marginBottom: 12,
    minWidth: 180
  }}>
    <div className="stat-icon" style={{ fontSize: 32 }}>{icon}</div>
    <div className="stat-info">
      <div className="stat-title" style={{ fontWeight: 600, fontSize: 16 }}>{title}</div>
      <div className="stat-value" style={{ fontSize: 20, fontWeight: 700 }}>{value}</div>
      <div className="stat-trend" style={{ fontSize: 14, color: trend === 'up' ? 'green' : trend === 'down' ? 'red' : '#888' }}>
        {trend === 'up' ? '⬆️' : trend === 'down' ? '⬇️' : '⏺️'}
      </div>
    </div>
  </div>
);

export default StatCard; 