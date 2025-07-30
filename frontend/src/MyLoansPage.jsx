import DashboardLayout from './DashboardLayout';
import MemberLoanManagement from './MemberLoanManagement';

export default function MyLoansPage() {
  return (
    <DashboardLayout role="member">
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">My Loans</h3>
        </div>
        <div className="card-body">
          <MemberLoanManagement />
        </div>
      </div>
    </DashboardLayout>
  );
} 