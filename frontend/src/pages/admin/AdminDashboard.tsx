import { useEffect, useState } from "react";
import { adminService } from "../../lib/adminApi";
import type { ActivityLog } from "../../types/api";

interface DashboardStats {
  activeProjects: number;
  teamMembers: number;
  tasksCompleted: number;
}

// Helper to convert ISO dates to relative time (e.g., "2h ago", "Just now")
const timeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.round((now.getTime() - date.getTime()) / 1000);
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);

  if (seconds < 60) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "Yesterday";
  return `${days}d ago`;
};

export const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingActivities, setIsLoadingActivities] = useState(true);

  useEffect(() => {
    // Fetch KPI Stats
    const fetchStats = async () => {
      try {
        const data = await adminService.getStats();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
        setStats({ activeProjects: 0, teamMembers: 0, tasksCompleted: 0 });
      } finally {
        setIsLoadingStats(false);
      }
    };

    // Fetch Activity Feed
    const fetchActivities = async () => {
      try {
        const data = await adminService.getRecentActivities(5);
        setActivities(data);
      } catch (error) {
        console.error("Failed to fetch activities", error);
      } finally {
        setIsLoadingActivities(false);
      }
    };

    fetchStats();
    fetchActivities();
  }, []);

  return (
    <>
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-on-surface mb-2">
            Dashboard Overview
          </h1>
          <p className="text-base text-secondary">
            High-level metrics and platform status.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* KPI Cards */}
        <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-surface-container-highest transition-all duration-300 hover:shadow-md">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-primary-fixed rounded-lg text-primary-container">
                <span className="material-symbols-outlined">
                  folder_managed
                </span>
              </div>
              <span className="text-xs font-semibold text-primary-container bg-primary-fixed px-2 py-1 rounded-full">
                Live
              </span>
            </div>
            <h3 className="text-sm text-secondary mb-1">Active Projects</h3>
            <p className="text-3xl font-bold text-on-surface">
              {isLoadingStats ? "..." : stats?.activeProjects}
            </p>
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-surface-container-highest transition-all duration-300 hover:shadow-md">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-tertiary-fixed rounded-lg text-tertiary">
                <span className="material-symbols-outlined">groups</span>
              </div>
              <span className="text-xs font-semibold text-tertiary bg-tertiary-fixed px-2 py-1 rounded-full">
                Total
              </span>
            </div>
            <h3 className="text-sm text-secondary mb-1">Team Members</h3>
            <p className="text-3xl font-bold text-on-surface">
              {isLoadingStats ? "..." : stats?.teamMembers}
            </p>
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-surface-container-highest transition-all duration-300 hover:shadow-md">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-surface-container-highest rounded-lg text-on-surface-variant">
                <span className="material-symbols-outlined">checklist</span>
              </div>
              <span className="text-xs font-semibold text-on-surface-variant bg-surface-container-highest px-2 py-1 rounded-full">
                All Time
              </span>
            </div>
            <h3 className="text-sm text-secondary mb-1">Tasks Completed</h3>
            <p className="text-3xl font-bold text-on-surface">
              {isLoadingStats ? "..." : stats?.tasksCompleted}
            </p>
          </div>
        </div>

        {/* Recent Activity (Now taking full width!) */}
        <div className="lg:col-span-12 bg-surface-container-lowest rounded-xl shadow-[0px_30px_40px_rgba(0,0,0,0.04)] flex flex-col overflow-hidden border border-surface-container-highest mt-6">
          <div className="p-6 border-b border-surface-container-highest flex justify-between items-center bg-surface-container-low/30">
            <h2 className="text-xl font-bold text-on-surface">
              Recent Activity
            </h2>
          </div>
          <div className="p-6 flex-1 flex flex-col gap-6 overflow-y-auto">
            {isLoadingActivities ? (
              <div className="text-center text-secondary py-4 text-sm">
                Loading activity feed...
              </div>
            ) : activities.length === 0 ? (
              <div className="text-center text-secondary py-4 text-sm">
                No recent activity found.
              </div>
            ) : (
              activities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4">
                  {/* Dynamic Avatar based on initial */}
                  <div className="w-10 h-10 rounded-full shrink-0 bg-surface-container-highest border border-outline-variant/30 flex items-center justify-center text-primary-container font-bold text-sm">
                    {activity.actorName.charAt(0).toUpperCase()}
                  </div>

                  <div className="flex-1">
                    <p className="text-sm text-on-surface leading-snug">
                      <span className="font-bold">{activity.actorName}</span>{" "}
                      <span className="text-secondary">{activity.action}</span>{" "}
                      <span className="font-bold text-primary-container">
                        {activity.target}
                      </span>
                    </p>
                    <p className="text-xs font-semibold text-secondary mt-1.5 tracking-wider">
                      {timeAgo(activity.timestamp)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
};
