import DashboardLayout from './DashboardLayout';
import LoanManagement from './LoanManagement';

export default function LoansPage() {
  return (
    <DashboardLayout role="admin">
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Loan Management</h3>
        </div>
        <div className="card-body">
          <LoanManagement />
        </div>
      </div>
    </DashboardLayout>
  );
} 