import { RouterProvider, createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { Login } from './pages/auth/Login';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { SupervisorDashboard } from './pages/supervisor/SupervisorDashboard';
import { ProjectTaskBoard } from './pages/supervisor/ProjectTaskBoard';
import { InternDashboard } from './pages/intern/InternDashboard';

// Placeholder components (we will build these out later)

const router = createBrowserRouter([
  // Public Route
  {
    path: '/login',
    element: <Login />,
  },
  
  // Protected Routes
  {
    element: <ProtectedRoute />, // Base protection: Must be logged in
    children: [
      // Base path redirects to role-specific dashboard
      {
        path: '/',
        element: <Navigate to="/login" replace />, 
      },
      // Super Admin Routes
      {
        element: <ProtectedRoute allowedRoles={['SUPER_ADMIN']} />,
        children: [
          { path: '/admin', element: <AdminDashboard /> },
        ],
      },
      // Supervisor Routes
      {
        element: <ProtectedRoute allowedRoles={['SUPERVISOR']} />,
        children: [
          { path: '/supervisor', element: <SupervisorDashboard /> },
          { path: '/supervisor/projects/:projectId/board', element: <ProjectTaskBoard /> },
        ],
      },
      // Intern Routes
      {
        element: <ProtectedRoute allowedRoles={['INTERN']} />,
        children: [
          { path: '/intern', element: <InternDashboard /> },
        ],
      },
    ],
  },
  
  // Catch-all route for 404s
  {
    path: '*',
    element: <div className="p-10 text-center text-red-500">404 - Page Not Found</div>,
  }
]);

export default function App() {
  return <RouterProvider router={router} />;
}