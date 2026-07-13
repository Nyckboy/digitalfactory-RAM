import { useAuthStore } from "../../store/useAuthStore";

export const SupervisorDashboard = () => {
  const { user } = useAuthStore();

  return (
    <>
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-on-background mb-1 tracking-tight">
            Overview
          </h2>
          <p className="text-lg text-secondary">
            Welcome back, {user?.firstName}.
          </p>
        </div>
        <div className="hidden md:flex gap-3 opacity-40 pointer-events-none select-none">
          <button className="px-4 py-2 bg-surface-container-lowest border border-surface-variant rounded-lg text-sm font-medium text-on-surface shadow-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">
              filter_list
            </span>{" "}
            Filter
          </button>
        </div>
      </div>

      {/* Bento Grid (WIP) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 opacity-40 pointer-events-none select-none">
        <div className="md:col-span-8 bg-surface-container-lowest rounded-xl p-6 shadow-[0px_30px_40px_rgba(0,0,0,0.04)] border border-surface-container-highest relative overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-br from-surface-container-lowest to-surface-container-low opacity-50 z-0"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-xl font-bold text-on-surface mb-1">
                  Overall Progress (WIP)
                </h3>
                <p className="text-sm text-secondary">
                  Aggregated platform statistics.
                </p>
              </div>
            </div>
            <div className="mb-6">
              <div className="w-full bg-surface-container-highest rounded-full h-2 overflow-hidden">
                <div
                  className="bg-primary-container h-full rounded-full"
                  style={{ width: "68%" }}
                ></div>
              </div>
            </div>
          </div>
        </div>
        <div className="md:col-span-4 bg-surface-container-lowest rounded-xl p-6 shadow-[0px_30px_40px_rgba(0,0,0,0.04)] border border-surface-container-highest flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-lg bg-tertiary-fixed flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-tertiary">
                bug_report
              </span>
            </div>
            <h3 className="text-lg text-secondary mb-1">Active Issues (WIP)</h3>
            <span className="text-4xl font-bold text-on-surface">--</span>
          </div>
        </div>
      </div>
    </>
  );
};
