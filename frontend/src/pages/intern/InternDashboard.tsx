import { useEffect, useState } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { useNavigate } from "react-router-dom";
import { internService } from "../../lib/internApi";
import type { InternDashboardOverview } from "../../types/api";

// Helper to format the task status
const formatStatus = (status: string) => {
  if (status === "IN_PROGRESS") return "In Progress";
  if (status === "TODO") return "To Do";
  return status.replace("_", " ");
};

// Helper to calculate deadline display and colors
const formatDeadline = (deadlineString: string) => {
  const date = new Date(deadlineString);
  const now = new Date();

  const dateDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const nowDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffDays = Math.round(
    (dateDay.getTime() - nowDay.getTime()) / (1000 * 3600 * 24),
  );

  if (date < now) {
    return { text: "Overdue", colorClass: "text-error", icon: "warning" };
  }
  if (diffDays === 1) {
    return {
      text: "Due Tomorrow",
      colorClass: "text-secondary",
      icon: "calendar_today",
    };
  }
  if (diffDays === 0) {
    return {
      text: "Due Today",
      colorClass: "text-secondary",
      icon: "calendar_today",
    };
  }

  const formattedDate = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  return {
    text: formattedDate,
    colorClass: "text-secondary",
    icon: "calendar_today",
  };
};

export const InternDashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [overview, setOverview] = useState<InternDashboardOverview | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const data = await internService.getDashboardOverview();
        setOverview(data);
      } catch (error) {
        console.error("Failed to fetch intern dashboard overview:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOverview();
  }, []);

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

      {/* KPI Cards (Now Active) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-surface-container-highest transition-all duration-300 hover:shadow-md">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 bg-primary-fixed rounded-lg text-primary-container">
              <span className="material-symbols-outlined text-[20px]">
                checklist
              </span>
            </div>
          </div>
          <h3 className="text-sm text-secondary mb-1">Assigned Tasks</h3>
          <p className="text-3xl font-bold text-on-surface">
            {isLoading ? "..." : overview?.assignedTasks || 0}
          </p>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-surface-container-highest transition-all duration-300 hover:shadow-md">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 bg-tertiary-fixed rounded-lg text-tertiary">
              <span className="material-symbols-outlined text-[20px]">
                task_alt
              </span>
            </div>
          </div>
          <h3 className="text-sm text-secondary mb-1">
            Completed Deliverables
          </h3>
          <p className="text-3xl font-bold text-on-surface">
            {isLoading ? "..." : overview?.completedDeliverables || 0}
          </p>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-surface-container-highest transition-all duration-300 hover:shadow-md">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 bg-error-container/50 rounded-lg text-error">
              <span className="material-symbols-outlined text-[20px]">
                schedule
              </span>
            </div>
          </div>
          <h3 className="text-sm text-secondary mb-1">Upcoming Deadlines</h3>
          <p className="text-3xl font-bold text-on-surface">
            {isLoading ? "..." : overview?.upcomingDeadlines || 0}
          </p>
        </div>
      </div>

      {/* Urgent Tasks Section */}
      <div className="mt-12">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-2xl font-bold text-on-surface">Urgent Tasks</h3>
            <p className="text-sm text-secondary mt-1">
              Tasks requiring your immediate attention.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-secondary bg-surface-container-lowest rounded-xl border border-surface-container-highest">
            Loading urgent tasks...
          </div>
        ) : !overview?.urgentTasks || overview.urgentTasks.length === 0 ? (
          <div className="py-12 text-center text-secondary bg-surface-container-lowest rounded-xl border border-surface-container-highest flex flex-col items-center">
            <span className="material-symbols-outlined text-4xl mb-3 text-tertiary opacity-80">
              celebration
            </span>
            <p className="text-on-surface font-semibold mb-1">
              You're all caught up!
            </p>
            <p className="text-sm">
              No urgent tasks currently assigned to you.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {overview.urgentTasks.map((task) => {
              const deadlineInfo = formatDeadline(task.deadline);
              return (
                <div
                  key={task.id}
                  className="bg-surface-container-lowest rounded-xl p-5 shadow-[0px_30px_40px_rgba(0,0,0,0.04)] border border-error/20 flex flex-col hover:-translate-y-1 hover:shadow-md transition-all duration-300"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="px-2 py-1 bg-surface-container-low text-secondary rounded text-xs font-semibold uppercase tracking-wider">
                      {formatStatus(task.status)}
                    </div>
                    <span className="material-symbols-outlined text-error text-[20px]">
                      priority_high
                    </span>
                  </div>

                  <h4 className="text-lg font-bold text-on-surface mb-2 leading-snug">
                    {task.title}
                  </h4>
                  <p className="text-sm text-secondary mb-6 line-clamp-2 grow">
                    {task.description}
                  </p>

                  <div className="flex justify-between items-center mt-auto pt-4 border-t border-surface-variant/40">
                    <span
                      className={`text-xs font-bold flex items-center gap-1.5 ${deadlineInfo.colorClass}`}
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {deadlineInfo.icon}
                      </span>
                      {deadlineInfo.text}
                    </span>

                    <button
                      onClick={() => navigate("/intern/tasks")}
                      className="text-primary-container font-semibold text-xs hover:underline flex items-center gap-1"
                    >
                      View in Board
                      <span className="material-symbols-outlined text-[14px]">
                        arrow_forward
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};
