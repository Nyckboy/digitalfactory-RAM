import { useAuthStore } from "../../store/useAuthStore";
import { useNavigate } from "react-router-dom";

export const InternDashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  return (
    <>
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-on-background mb-1 tracking-tight">
            Dashboard Overview
          </h2>
          <p className="text-lg text-secondary">Welcome, {user?.firstName}.</p>
        </div>
        <button
          onClick={() => navigate("/intern/tasks")}
          className="bg-primary-container text-on-primary py-2 px-4 rounded-lg text-sm font-medium hover:bg-primary transition-colors shadow-sm"
        >
          Go to Sprint Board
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 opacity-40 pointer-events-none select-none">
        <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-surface-container-highest">
          <h3 className="text-sm text-secondary mb-1">Assigned Tasks</h3>
          <p className="text-3xl font-bold text-on-surface">--</p>
        </div>
        <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-surface-container-highest">
          <h3 className="text-sm text-secondary mb-1">
            Completed Deliverables
          </h3>
          <p className="text-3xl font-bold text-on-surface">--</p>
        </div>
        <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-surface-container-highest">
          <h3 className="text-sm text-secondary mb-1">Upcoming Deadlines</h3>
          <p className="text-3xl font-bold text-on-surface">--</p>
        </div>
      </div>

      <div className="mt-12 text-center text-secondary opacity-60">
        <span className="material-symbols-outlined text-4xl mb-2">
          construction
        </span>
        <p>Dashboard widgets are currently under construction.</p>
        <p className="text-sm">
          Please navigate to the{" "}
          <span className="font-bold text-primary-container">Tasks</span> tab to
          view your work.
        </p>
      </div>
    </>
  );
};
