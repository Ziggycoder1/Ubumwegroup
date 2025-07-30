import { useState, useEffect } from "react";
import API_BASE from "./api";
import DashboardLayout from "./DashboardLayout";

const AuditTrail = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch(`${API_BASE}/audit`);
        const data = await res.json();
        setLogs(data);
      } catch (err) {
        setLogs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  return (
    <DashboardLayout role="finance">
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Audit Trail</h3>
        </div>
        <div className="card-body">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>User</th>
                <th>Action</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4}>Loading...</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={4}>No logs found.</td></tr>
              ) : (
                logs.map((log, idx) => (
                  <tr key={idx}>
                    <td>{log.date}</td>
                    <td>{log.user}</td>
                    <td>{log.action}</td>
                    <td>{log.details}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AuditTrail;
