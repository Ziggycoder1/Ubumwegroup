import { useState, useEffect } from "react";
import API_BASE from "./api";
import DashboardLayout from "./DashboardLayout";

const FinancialReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await fetch(`${API_BASE}/contributions/report/historical`);
        const data = await res.json();
        setReports(data);
      } catch (err) {
        setReports([]);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  return (
    <DashboardLayout role="finance">
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Financial Reports</h3>
        </div>
        <div className="card-body">
          <table className="data-table">
            <thead>
              <tr>
                <th>Year</th>
                <th>Month</th>
                <th>Total Contributions</th>
                <th>Contribution Count</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4}>Loading...</td></tr>
              ) : reports.length === 0 ? (
                <tr><td colSpan={4}>No data found.</td></tr>
              ) : (
                reports.map((r, idx) => (
                  <tr key={idx}>
                    <td>{r._id.year}</td>
                    <td>{r._id.month}</td>
                    <td>{r.total}</td>
                    <td>{r.count}</td>
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

export default FinancialReports;
