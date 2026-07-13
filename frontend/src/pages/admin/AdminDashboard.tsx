export const AdminDashboard = () => {
  return (
    <>
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-on-surface mb-2">Dashboard Overview</h1>
          <p className="text-base text-secondary">High-level metrics and platform status.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* KPI Cards (WIP) */}
        <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6 opacity-40 pointer-events-none select-none">
          <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-surface-container-highest">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-primary-fixed rounded-lg text-primary-container">
                <span className="material-symbols-outlined">folder_managed</span>
              </div>
              <span className="text-xs font-semibold text-primary-container bg-primary-fixed px-2 py-1 rounded-full">WIP</span>
            </div>
            <h3 className="text-sm text-secondary mb-1">Active Projects</h3>
            <p className="text-3xl font-bold text-on-surface">--</p>
          </div>
          <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-surface-container-highest">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-tertiary-fixed rounded-lg text-tertiary">
                <span className="material-symbols-outlined">groups</span>
              </div>
            </div>
            <h3 className="text-sm text-secondary mb-1">Team Members</h3>
            <p className="text-3xl font-bold text-on-surface">--</p>
          </div>
          <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-surface-container-highest">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-surface-container-highest rounded-lg text-on-surface-variant">
                <span className="material-symbols-outlined">checklist</span>
              </div>
            </div>
            <h3 className="text-sm text-secondary mb-1">Tasks Completed</h3>
            <p className="text-3xl font-bold text-on-surface">--</p>
          </div>
        </div>

        {/* Recent Activity (WIP) */}
        <div className="lg:col-span-6 bg-surface-container-lowest rounded-xl shadow-[0px_30px_40px_rgba(0,0,0,0.04)] flex flex-col overflow-hidden border border-surface-container-highest opacity-40 pointer-events-none select-none">
          <div className="p-6 border-b border-surface-container-highest flex justify-between items-center">
            <h2 className="text-xl font-bold text-on-surface">Recent Activity (WIP)</h2>
          </div>
          <div className="p-6 flex-1 flex flex-col gap-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 bg-surface-container-highest"></div>
              <div className="flex-1">
                <p className="text-sm text-on-surface"><span className="font-medium">Sarah Jenkins</span> pushed code to <span className="font-medium text-primary-container">Apollo Migration</span></p>
                <p className="text-xs font-semibold text-secondary mt-1">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 bg-surface-container-highest"></div>
              <div className="flex-1">
                <p className="text-sm text-on-surface"><span className="font-medium">David Chen</span> opened a pull request in <span className="font-medium text-primary-container">Zeus Core Update</span></p>
                <p className="text-xs font-semibold text-secondary mt-1">4 hours ago</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 bg-tertiary-fixed flex items-center justify-center text-tertiary">
                <span className="material-symbols-outlined">build</span>
              </div>
              <div className="flex-1">
                <p className="text-sm text-on-surface">System deployed <span className="font-medium">v2.4.1</span> successfully.</p>
                <p className="text-xs font-semibold text-secondary mt-1">Yesterday</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};