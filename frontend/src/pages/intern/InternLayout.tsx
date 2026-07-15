import { Outlet, NavLink } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";

export const InternLayout = () => {
  const { logout } = useAuthStore();

  const navItemClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-4 px-3 py-3 rounded-lg font-medium transition-all duration-200 ${
      isActive
        ? "text-primary-container bg-surface-container-low border-l-4 border-primary-container font-bold"
        : "text-secondary hover:bg-surface-container-low"
    }`;

  return (
    <div className="bg-background text-on-surface font-sans min-h-screen flex">
      {/* Mobile Top Nav */}
      <nav className="md:hidden flex justify-between items-center px-6 w-full sticky top-0 z-50 h-16 bg-surface-container-lowest shadow-sm border-b border-surface-container-highest">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-on-primary font-bold text-xs">
            DF
          </div>
          <h1 className="text-lg font-bold text-primary-container">
            Digital Factory
          </h1>
        </div>
        <button onClick={logout} className="text-error font-medium text-sm">
          Sign Out
        </button>
      </nav>

      {/* SideNavBar (Desktop) */}
      <aside className="hidden md:flex fixed left-0 top-0 h-screen flex-col py-8 px-4 border-r border-surface-container-highest bg-surface-container-lowest w-64 z-40">
        <div className="mb-8 px-3">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary font-bold">
              DF
            </div>
            <div>
              <h1 className="text-xl font-bold text-primary-container tracking-tight">
                Digital Factory
              </h1>
              <p className="text-xs font-semibold text-secondary">
                Intern Portal
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1.5">
          {/* Active Sprint Board Link */}
          <NavLink to="/intern" end className={navItemClass}>
            <span className="material-symbols-outlined">dashboard</span>
            <span className="text-sm">Dashboard</span>
          </NavLink>
          <NavLink to="/intern/tasks" className={navItemClass}>
            <span
              className="material-symbols-outlined"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              checklist
            </span>
            <span className="text-sm">Tasks (Sprint Board)</span>
          </NavLink>

          {/* GREYED OUT LINKS (WIP) */}
          <div className="opacity-40 pointer-events-none select-none mt-4 space-y-1.5 pt-4 border-t border-surface-container-highest">
            <div className="px-3 pb-2 text-xs font-bold text-secondary uppercase tracking-wider">
              Coming Soon
            </div>
            <a
              className="flex items-center gap-4 px-3 py-3 rounded-lg text-secondary font-medium"
              href="#"
            >
              <span className="material-symbols-outlined">folder_managed</span>
              <span className="text-sm">Projects</span>
            </a>
            <a
              className="flex items-center gap-4 px-3 py-3 rounded-lg text-secondary font-medium"
              href="#"
            >
              <span className="material-symbols-outlined">groups</span>
              <span className="text-sm">Team</span>
            </a>
          </div>
        </nav>

        <div className="mt-auto space-y-1.5 pt-8 border-t border-surface-container-highest">
          <button
            onClick={logout}
            className="flex items-center gap-4 px-3 py-3 w-full rounded-lg text-error hover:bg-error-container transition-all duration-200"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="text-sm font-semibold">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area - with min-w-0 to protect flexbox from blowing out on scroll */}
      <main className="flex-1 md:ml-64 flex flex-col min-h-screen min-w-0 max-w-full">
        {/* TopNavBar (Desktop) */}
        <header className="hidden md:flex justify-between items-center px-6 w-full sticky top-0 z-30 h-16 bg-surface-container-lowest/80 backdrop-blur-md border-b border-surface-container-highest">
          <div className="flex items-center gap-4 flex-1 opacity-40 pointer-events-none select-none">
            <div className="relative w-64">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-[20px]">
                search
              </span>
              <input
                className="w-full pl-10 pr-3 py-2 bg-surface-container-low border border-transparent rounded-lg text-sm transition-colors outline-none h-10"
                placeholder="Search tasks (WIP)..."
                type="text"
                disabled
              />
            </div>
          </div>
        </header>

        {/* Dynamic Outlet */}
        <div className="flex-1 p-6 md:p-12 overflow-x-hidden">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
