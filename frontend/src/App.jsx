import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import AdminDashboard from './AdminDashboard';
import MemberDashboard from './MemberDashboard';
import FinanceDashboard from './FinanceDashboard';
import MembersPage from './MembersPage';
import ContributionsPage from './ContributionsPage';
import LoansPage from './LoansPage';
import LotteryPage from './LotteryPage';
import PenaltiesPage from './PenaltiesPage';
import MyContributionsPage from './MyContributionsPage';
import MyLoansPage from './MyLoansPage';
import MyLotteryPage from './MyLotteryPage';
import MyPenaltiesPage from './MyPenaltiesPage';
import LotteryParticipationPage from './LotteryParticipationPage';
import ProfileWrapper from './components/ProfileWrapper';
import FinancialReports from './FinancialReports';
import AuditTrail from './AuditTrail';
import MonthlySummary from './MonthlySummary';
import ReportsPage from './components/ReportsPage';
import EarningsDashboard from './EarningsDashboard';
import { useAuth } from './context/AuthContext';

function RequireAuth({ children }) {
  const { user, token } = useAuth();
  if (!user || !token) return <Navigate to="/login" replace />;
  return children;
}

function App() {
  const location = useLocation();
  const isAuthRoute = location.pathname === '/login' || location.pathname === '/register';
  const isDashboardRoute = ['/admindashboard', '/memberdashboard', '/financedashboard'].includes(location.pathname);
  return (
    <div style={{ minHeight: '100vh', width: '100vw', background: '#f7f7f7', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: isAuthRoute ? 'center' : 'stretch', justifyContent: isAuthRoute ? 'center' : 'stretch' }}>
      {isAuthRoute && (
        <nav style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', marginTop: '1.5rem', justifyContent: 'center', width: '100%', maxWidth: 400 }}>
          <Link
            to="/login"
            style={{
              flex: 1,
              textAlign: 'center',
              padding: '10px 18px',
              borderRadius: 4,
              background: location.pathname === '/login' ? '#007bff' : '#fff',
              color: location.pathname === '/login' ? '#fff' : '#007bff',
              border: '1px solid #007bff',
              fontWeight: 'bold',
              textDecoration: 'none',
              transition: 'all 0.2s',
              boxShadow: location.pathname === '/login' ? '0 2px 8px #eee' : 'none',
            }}
          >
            Login
          </Link>
          <Link
            to="/register"
            style={{
              flex: 1,
              textAlign: 'center',
              padding: '10px 18px',
              borderRadius: 4,
              background: location.pathname === '/register' ? '#007bff' : '#fff',
              color: location.pathname === '/register' ? '#fff' : '#007bff',
              border: '1px solid #007bff',
              fontWeight: 'bold',
              textDecoration: 'none',
              transition: 'all 0.2s',
              boxShadow: location.pathname === '/register' ? '0 2px 8px #eee' : 'none',
            }}
          >
            Register
          </Link>
        </nav>
      )}
      <div style={{ width: isAuthRoute ? '100%' : '100vw', maxWidth: isAuthRoute ? 400 : 'none', display: 'flex', flexDirection: 'column', alignItems: isAuthRoute ? 'center' : 'stretch', justifyContent: isAuthRoute ? 'center' : 'stretch', flex: 1 }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admindashboard" element={<RequireAuth><AdminDashboard /></RequireAuth>} />
          <Route path="/memberdashboard" element={<RequireAuth><MemberDashboard /></RequireAuth>} />
          <Route path="/financedashboard" element={<RequireAuth><FinanceDashboard /></RequireAuth>} />
          <Route path="/transactions" element={<RequireAuth><FinanceDashboard /></RequireAuth>} />
          <Route path="/members" element={<RequireAuth><MembersPage /></RequireAuth>} />
          <Route path="/contributions" element={<ContributionsPage />} />
          <Route path="/loans" element={<LoansPage />} />
          <Route path="/lottery" element={<LotteryPage />} />
          <Route path="/penalties" element={<PenaltiesPage />} />
          <Route path="/my-contributions" element={<RequireAuth><MyContributionsPage /></RequireAuth>} />
          <Route path="/my-loans" element={<RequireAuth><MyLoansPage /></RequireAuth>} />
          <Route path="/lottery-participation" element={<RequireAuth><LotteryParticipationPage /></RequireAuth>} />
          <Route path="/lottery-status" element={<RequireAuth><MyLotteryPage /></RequireAuth>} />
          <Route path="/my-penalties" element={<RequireAuth><MyPenaltiesPage /></RequireAuth>} />
          <Route path="/profile" element={<RequireAuth><ProfileWrapper /></RequireAuth>} />
          <Route path="/financial-reports" element={<Navigate to="/reports" replace />} />
          <Route path="/reports" element={<RequireAuth><ReportsPage /></RequireAuth>} />
          <Route path="/audit" element={<RequireAuth><AuditTrail /></RequireAuth>} />
          <Route path="/monthly-summary" element={<RequireAuth><MonthlySummary /></RequireAuth>} />
          <Route path="/earnings" element={<RequireAuth><EarningsDashboard /></RequireAuth>} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
      </div>
  );
}

export default App;
