import { Outlet, NavLink } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";

export const AdminLayout = () => {
  const { logout } = useAuthStore();

  const navItemClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-4 px-3 py-3 rounded-lg font-medium transition-all duration-200 ${
      isActive
        ? "text-primary-container bg-surface-container-low border-l-4 border-primary-container font-bold"
        : "text-secondary hover:bg-surface-container-low"
    }`;

  return (
    <div className="bg-background text-on-surface font-sans min-h-screen flex">
      {/* SideNavBar */}
      <nav className="hidden md:flex flex-col h-screen w-64 bg-surface-container-lowest py-8 px-4 border-r border-surface-container-highest fixed left-0 top-0 z-40">
        <div className="flex items-center gap-4 mb-8 px-3">
          <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary font-bold">
            DF
          </div>
          <div>
            <h2 className="text-xl font-bold text-primary-container tracking-tight">
              Digital Factory
            </h2>
            <p className="text-xs font-semibold text-secondary">Admin Portal</p>
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-1.5">
          <NavLink to="/admin" end className={navItemClass}>
            <span className="material-symbols-outlined">dashboard</span>
            <span className="text-sm">Dashboard</span>
          </NavLink>
          <NavLink to="/admin/projects" className={navItemClass}>
            <span className="material-symbols-outlined">folder_managed</span>
            <span className="text-sm">Projects</span>
          </NavLink>
          <NavLink to="/admin/team" className={navItemClass}>
            <span className="material-symbols-outlined">groups</span>
            <span className="text-sm">Team</span>
          </NavLink>

          <div className="opacity-40 pointer-events-none select-none mt-2">
            <a
              className="flex items-center gap-4 px-3 py-3 rounded-lg text-secondary font-medium"
              href="#"
            >
              <span className="material-symbols-outlined">checklist</span>
              <span className="text-sm">Tasks (WIP)</span>
            </a>
            <a
              className="flex items-center gap-4 px-3 py-3 rounded-lg text-secondary font-medium"
              href="#"
            >
              <span className="material-symbols-outlined">leaderboard</span>
              <span className="text-sm">Analytics (WIP)</span>
            </a>
          </div>
        </div>

        <div className="mt-auto flex flex-col gap-1.5 pt-8 border-t border-surface-container-highest">
          <button
            onClick={logout}
            className="flex items-center gap-4 px-3 py-3 rounded-lg text-error hover:bg-error-container transition-all duration-200"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="text-sm font-semibold">Sign Out</span>
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Mobile TopNav */}
        <header className="md:hidden flex justify-between items-center px-6 w-full h-16 bg-surface-container-lowest border-b border-surface-container-highest sticky top-0 z-50">
          <h1 className="text-xl font-bold text-primary-container">
            Digital Factory
          </h1>
          <button onClick={logout} className="text-error font-medium text-sm">
            Sign Out
          </button>
        </header>

        {/* Dynamic Page Content injected here */}
        <div className="flex-1 p-6 md:p-12 max-w-7xl mx-auto w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
