import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { api } from "../../lib/api";
import { useAuthStore } from "../../store/useAuthStore";
import type { UserRole } from "../../types/auth";

interface JwtPayload {
  sub: string;
  role: UserRole;
  userId: string;
  firstName?: string;
  lastName?: string;
}

export const Login = () => {
  const navigate = useNavigate();
  const loginToStore = useAuthStore((state) => state.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await api.post("/auth/login", { email, password });
      const { token } = response.data;
      const decoded = jwtDecode<JwtPayload>(token);

      const user = {
        id: decoded.userId || "unknown-id",
        email: decoded.sub,
        role: decoded.role,
        firstName: decoded.firstName || "User",
        lastName: decoded.lastName || "",
      };

      loginToStore(token, user);

      switch (user.role) {
        case "SUPER_ADMIN":
          navigate("/admin", { replace: true });
          break;
        case "SUPERVISOR":
          navigate("/supervisor", { replace: true });
          break;
        case "INTERN":
          navigate("/intern", { replace: true });
          break;
        default:
          setError("Invalid user role detected.");
      }
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError("Invalid email or password.");
      } else {
        setError("Unable to connect to the server. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-dvh w-full overflow-hidden bg-background text-on-surface antialiased flex font-sans">
      {/* Left Split: Branding & Imagery */}
      <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-between bg-surface-container-low p-16 relative overflow-hidden">
        {/* Abstract Tech Background */}
        <div className="absolute inset-0 z-0">
          <div
            className="bg-cover bg-center w-full h-full opacity-80 mix-blend-multiply"
            style={{
              backgroundImage:
                "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBFlKNHrutPZ-5g9JqQAOhLPfqZ1iCVAwuSh8GnN0q3pJGewRvMCCLc_iassVAsGjyHeWO7yaBSe60kXqyg_1ntqzaFCLt6vt9ZaqfKoIAeMUUeD3Kz_0yKYPL1rhia3IxQBeAXyaoYbllehZOWEunW_uRYEG7resZGg54lqXP6kB1CQrgxu8SETmMGhknkH1yFdfBpE-w-s0BYcwiCr4HullGduuyvPOxb-jFAwwlDbjxxCe1HXk4wC2zh3DMwtiDQlHH97Ta7DccI')",
            }}
          ></div>
        </div>
        {/* Gradient Overlay */}
        <div className="absolute inset-0 z-10 bg-linear-to-br from-surface-container-lowest/40 to-surface-container/10 backdrop-blur-[2px]"></div>

        <div className="relative z-20 flex flex-col h-full justify-between">
          {/* Brand Mark */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-container rounded flex items-center justify-center">
              <span
                className="material-symbols-outlined text-on-primary"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                precision_manufacturing
              </span>
            </div>
            <span className="text-2xl font-bold tracking-tight text-on-surface">
              Digital Factory
            </span>
          </div>

          {/* Value Proposition */}
          <div className="max-w-md mt-auto mb-16">
            <h1 className="text-5xl font-bold text-on-surface mb-6 leading-tight">
              Precision engineering, connected.
            </h1>
            <p className="text-lg text-secondary">
              Internship Project Management environment. Streamline workflows,
              monitor progress, and optimize production with precision.
            </p>
          </div>

          <div className="flex gap-6 items-center mt-auto text-secondary text-xs font-semibold">
            <span>© 2024 Digital Factory</span>
            <a className="hover:text-primary transition-colors" href="#">
              Privacy Policy
            </a>
            <a className="hover:text-primary transition-colors" href="#">
              Terms of Service
            </a>
          </div>
        </div>
      </div>

      {/* Right Split: Login Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-16 sm:px-16 bg-surface-container-lowest">
        {/* Mobile Brand */}
        <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
          <div className="w-8 h-8 bg-primary-container rounded flex items-center justify-center">
            <span
              className="material-symbols-outlined text-on-primary text-sm"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              precision_manufacturing
            </span>
          </div>
          <span className="text-2xl font-bold tracking-tight text-on-surface">
            Digital Factory
          </span>
        </div>

        <div className="mx-auto w-full max-w-md">
          <div className="bg-surface-container-lowest rounded-xl p-6 sm:p-8 shadow-[0px_30px_40px_rgba(0,0,0,0.04)] border border-surface-container-highest">
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Dynamic Error Message */}
              {error && (
                <div className="p-3 text-sm text-error bg-error-container rounded-md border border-outline-variant">
                  {error}
                </div>
              )}

              <div>
                <label
                  className="block text-xs font-semibold text-on-surface mb-1"
                  htmlFor="email"
                >
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span
                      className="material-symbols-outlined text-secondary"
                      style={{ fontSize: "20px" }}
                    >
                      mail
                    </span>
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-outline-variant rounded-lg bg-[#F1F3F5] text-on-surface focus:ring-1 focus:ring-primary focus:border-primary focus:bg-surface-container-lowest transition-colors text-sm placeholder-secondary outline-none"
                    placeholder="admin@royalairmaroc.com"
                  />
                </div>
              </div>

              <div>
                <label
                  className="block text-xs font-semibold text-on-surface mb-1"
                  htmlFor="password"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span
                      className="material-symbols-outlined text-secondary"
                      style={{ fontSize: "20px" }}
                    >
                      lock
                    </span>
                  </div>
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-outline-variant rounded-lg bg-[#F1F3F5] text-on-surface focus:ring-1 focus:ring-primary focus:border-primary focus:bg-surface-container-lowest transition-colors text-sm placeholder-secondary outline-none"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* GREYED OUT: Remember Me & Forgot Password */}
              <div className="flex items-center justify-between opacity-40 pointer-events-none select-none">
                <div className="flex items-center">
                  <input
                    className="h-4 w-4 text-primary focus:ring-primary border-outline-variant rounded bg-[#F1F3F5]"
                    id="remember-me"
                    type="checkbox"
                  />
                  <label
                    className="ml-3 block text-sm text-secondary"
                    htmlFor="remember-me"
                  >
                    Remember me (WIP)
                  </label>
                </div>
                <div className="text-sm">
                  <span className="font-medium text-primary">
                    Forgot password?
                  </span>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-on-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors ${
                    isLoading
                      ? "bg-primary-container/70 cursor-not-allowed"
                      : "bg-primary-container hover:bg-primary"
                  }`}
                >
                  {isLoading ? "Signing in..." : "Sign in"}
                </button>
              </div>

              {/* GREYED OUT: SSO & Badge Login */}
              <div className="mt-6 opacity-40 pointer-events-none select-none">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-surface-variant"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-3 bg-surface-container-lowest text-secondary">
                      Or continue with (WIP)
                    </span>
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <button
                    className="flex items-center justify-center w-full px-3 py-3 border border-outline-variant rounded-lg shadow-sm bg-surface-container-lowest text-sm font-medium text-on-surface"
                    type="button"
                    disabled
                  >
                    <span
                      className="material-symbols-outlined mr-3 text-secondary"
                      style={{ fontSize: "20px" }}
                    >
                      corporate_fare
                    </span>
                    SSO
                  </button>
                  <button
                    className="flex items-center justify-center w-full px-3 py-3 border border-outline-variant rounded-lg shadow-sm bg-surface-container-lowest text-sm font-medium text-on-surface"
                    type="button"
                    disabled
                  >
                    <span
                      className="material-symbols-outlined mr-3 text-secondary"
                      style={{ fontSize: "20px" }}
                    >
                      badge
                    </span>
                    Badge ID
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* GREYED OUT: IT Support Link */}
          <p className="mt-4 text-center text-sm text-secondary opacity-40 pointer-events-none select-none">
            Need access?{" "}
            <span className="font-medium text-primary">Contact IT Support</span>
          </p>
        </div>
      </div>
    </div>
  );
};
