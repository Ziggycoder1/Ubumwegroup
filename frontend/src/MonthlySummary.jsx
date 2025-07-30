import { useState, useEffect } from "react";
import API_BASE from "./api";
import DashboardLayout from "./DashboardLayout";

const MonthlySummary = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await fetch(`${API_BASE}/contributions/report/monthly/${year}/${month}`);
        const data = await res.json();
        setSummary(data);
      } catch (err) {
        setSummary(null);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, [year, month]);

  return (
    <DashboardLayout role="finance">
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Monthly Summary ({month}/{year})</h3>
        </div>
        <div className="card-body">
          {loading ? (
            <p>Loading...</p>
          ) : summary ? (
            <ul>
              <li>Total Contributions: {summary.total}</li>
              <li>Contribution Count: {summary.count}</li>
            </ul>
          ) : (
            <p>No summary found for this month.</p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MonthlySummary;
