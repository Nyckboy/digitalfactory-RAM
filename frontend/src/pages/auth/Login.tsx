import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { api } from '../../lib/api';
import { useAuthStore } from '../../store/useAuthStore';
import type { UserRole } from '../../types/auth';

// Interface for what we expect inside the JWT payload from Spring Boot
interface JwtPayload {
  sub: string; // usually the email
  role: UserRole;
  userId: string;
  firstName?: string;
  lastName?: string;
}

export const Login = () => {
  const navigate = useNavigate();
  const loginToStore = useAuthStore((state) => state.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // 1. Hit the Spring Boot endpoint
      const response = await api.post('/auth/login', { email, password });
      const { token } = response.data;

      // 2. Decode the JWT to extract user details and role
      const decoded = jwtDecode<JwtPayload>(token);

      // 3. Construct the user object (fallback to defaults if backend doesn't send names in JWT)
      const user = {
        id: decoded.userId || 'unknown-id',
        email: decoded.sub,
        role: decoded.role,
        firstName: decoded.firstName || 'User',
        lastName: decoded.lastName || '',
      };

      // 4. Save to Zustand global state (which also saves to localStorage)
      loginToStore(token, user);

      // 5. Redirect based on their strict role
      switch (user.role) {
        case 'SUPER_ADMIN':
          navigate('/admin', { replace: true });
          break;
        case 'SUPERVISOR':
          navigate('/supervisor', { replace: true });
          break;
        case 'INTERN':
          navigate('/intern', { replace: true });
          break;
        default:
          setError('Invalid user role detected.');
      }
    } catch (err: any) {
      // Handle 401s or network errors
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Invalid email or password.');
      } else {
        setError('Unable to connect to the server. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg border border-gray-100">
        
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Digital Factory</h1>
          <p className="mt-2 text-sm text-gray-600">Internship Project Management</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 mt-8">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-200">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 mt-1 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              placeholder="admin@royalairmaroc.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 mt-1 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full px-4 py-2 text-white font-semibold rounded-lg transition-colors ${
              isLoading 
                ? 'bg-blue-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
            }`}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

      </div>
    </div>
  );
};