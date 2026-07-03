import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';

// Placeholder Pages
// const Login = () => <div className="p-10 text-2xl">Login Page</div>;
const AdminDashboard = () => <div className="p-10">Super Admin View: Manage Users & Projects</div>;
const SupervisorBoard = () => <div className="p-10">Supervisor View: Review Tasks</div>;
const InternWorkspace = () => <div className="p-10">Intern View: Submit Deliverables</div>;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />

        {/* Protected Routes (To be wrapped in Auth Guard later) */}
        <Route path="/admin/*" element={<AdminDashboard />} />
        <Route path="/supervisor/*" element={<SupervisorBoard />} />
        <Route path="/intern/*" element={<InternWorkspace />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;