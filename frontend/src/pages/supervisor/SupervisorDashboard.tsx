import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import { supervisorService } from "../../lib/supervisorApi";
import type { DashboardOverview, OngoingTask } from "../../types/api";

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

  // Normalize dates to midnight for accurate day comparison
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

export const SupervisorDashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [ongoingTasks, setOngoingTasks] = useState<OngoingTask[]>([]);
  const [isLoadingOverview, setIsLoadingOverview] = useState(true);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const data = await supervisorService.getDashboardOverview();
        setOverview(data);
      } catch (error) {
        console.error("Failed to fetch supervisor overview:", error);
      } finally {
        setIsLoadingOverview(false);
      }
    };

    const fetchOngoingTasks = async () => {
      try {
        const data = await supervisorService.getOngoingTasks();
        setOngoingTasks(data);
      } catch (error) {
        console.error("Failed to fetch ongoing tasks:", error);
      } finally {
        setIsLoadingTasks(false);
      }
    };

    fetchOverview();
    fetchOngoingTasks();
  }, []);

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
          <button className="px-4 py-2 bg-surface-container-lowest border border-surface-variant rounded-lg text-sm font-medium text-on-surface shadow-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">sort</span>{" "}
            Sort
          </button>
        </div>
      </div>

      {/* Bento Grid - Active */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Featured Project Card */}
        <div className="md:col-span-8 bg-surface-container-lowest rounded-xl p-6 shadow-[0px_30px_40px_rgba(0,0,0,0.04)] border border-surface-container-highest relative overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-md">
          <div className="absolute inset-0 bg-linear-to-br from-surface-container-lowest to-surface-container-low opacity-50 z-0"></div>

          <div className="relative z-10 flex-1 flex flex-col">
            {isLoadingOverview ? (
              <div className="flex-1 flex items-center justify-center text-secondary py-10">
                Loading project data...
              </div>
            ) : !overview?.featuredProject ? (
              <div className="flex-1 flex flex-col items-center justify-center text-secondary py-10 text-center">
                <span className="material-symbols-outlined text-4xl mb-2 opacity-50">
                  inventory_2
                </span>
                <p className="font-medium text-on-surface mb-1">
                  No Active Projects
                </p>
                <p className="text-sm">
                  You currently have no projects assigned to you.
                </p>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h3 className="text-xl font-bold text-on-surface mb-1">
                      {overview.featuredProject.title}
                    </h3>
                    <p className="text-sm text-secondary">
                      {overview.featuredProject.description}
                    </p>
                  </div>
                  <div className="px-3 py-1 bg-error-container text-on-error-container rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-error"></span>
                    Featured
                  </div>
                </div>

                <div className="mb-8">
                  <div className="flex justify-between text-sm font-semibold text-secondary mb-2">
                    <span>Progress</span>
                    <span className="text-on-surface">
                      {overview.featuredProject.progressPercentage}%
                    </span>
                  </div>
                  <div className="w-full bg-surface-container-highest rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-primary-container h-full rounded-full transition-all duration-1000 ease-out"
                      style={{
                        width: `${overview.featuredProject.progressPercentage}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-auto pt-4 border-t border-surface-variant/40">
                  {/* Team Avatar Stack */}
                  <div className="flex -space-x-2">
                    {overview.featuredProject.teamMembers
                      .slice(0, 3)
                      .map((member, idx) => (
                        <div
                          key={member.id}
                          className="w-8 h-8 rounded-full border-2 border-surface-container-lowest bg-surface-container-high flex items-center justify-center text-xs font-bold text-on-surface-variant"
                          style={{ zIndex: 30 - idx }}
                          title={`${member.firstName} ${member.lastName}`}
                        >
                          {member.firstName[0]}
                          {member.lastName[0]}
                        </div>
                      ))}
                    {overview.featuredProject.teamMembers.length > 3 && (
                      <div className="w-8 h-8 rounded-full border-2 border-surface-container-lowest bg-surface-container flex items-center justify-center text-xs font-bold text-secondary z-0">
                        +{overview.featuredProject.teamMembers.length - 3}
                      </div>
                    )}
                    {overview.featuredProject.teamMembers.length === 0 && (
                      <span className="text-xs text-secondary italic">
                        No team assigned
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() =>
                      navigate(
                        `/supervisor/projects/${overview.featuredProject?.id}/board`,
                      )
                    }
                    className="text-primary-container font-semibold text-sm hover:underline flex items-center gap-1"
                  >
                    View Details
                    <span className="material-symbols-outlined text-[16px]">
                      arrow_forward
                    </span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Active Issues Card */}
        <div className="md:col-span-4 bg-surface-container-lowest rounded-xl p-6 shadow-[0px_30px_40px_rgba(0,0,0,0.04)] border border-surface-container-highest flex flex-col justify-between transition-all duration-300 hover:shadow-md">
          <div>
            <div className="w-12 h-12 rounded-lg bg-tertiary-fixed flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-tertiary">
                pending_actions
              </span>
            </div>
            <h3 className="text-lg text-secondary mb-1">
              Tasks Pending Review
            </h3>
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold text-on-surface">
                {isLoadingOverview ? "..." : overview?.actionRequiredTasks || 0}
              </span>
            </div>
          </div>

          <button
            onClick={() => navigate("/supervisor/projects")}
            className="w-full mt-6 py-2.5 border border-outline-variant rounded-lg text-sm font-semibold text-on-surface hover:bg-surface-container-low transition-colors"
          >
            Projects
          </button>
        </div>
      </div>

      {/* Ongoing Tasks (Now Active!) */}
      <div className="mt-12">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-on-surface">Ongoing Tasks</h3>
          <button className="text-secondary hover:text-on-surface transition-colors">
            <span className="material-symbols-outlined">more_horiz</span>
          </button>
        </div>

        {isLoadingTasks ? (
          <div className="text-center text-secondary py-10">
            Loading ongoing tasks...
          </div>
        ) : ongoingTasks.length === 0 ? (
          <div className="text-center text-secondary py-10 bg-surface-container-lowest rounded-xl border border-surface-container-highest">
            No ongoing tasks found.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ongoingTasks.map((task) => {
              const deadlineInfo = formatDeadline(task.deadline);
              return (
                <div
                  key={task.id}
                  className="bg-surface-container-lowest rounded-xl p-5 shadow-[0px_30px_40px_rgba(0,0,0,0.04)] border border-surface-variant/30 flex flex-col hover:-translate-y-1 hover:shadow-[0px_40px_50px_rgba(0,0,0,0.06)] transition-all duration-300"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="px-2 py-1 bg-surface-container-low text-secondary rounded text-xs font-semibold uppercase tracking-wider">
                      {formatStatus(task.status)}
                    </div>
                    <span className="material-symbols-outlined text-secondary text-[20px]">
                      bookmark_border
                    </span>
                  </div>

                  <h4 className="text-lg font-bold text-on-surface mb-2">
                    {task.title}
                  </h4>
                  <p className="text-sm text-secondary mb-6 line-clamp-2 grow">
                    {task.description}
                  </p>

                  <div className="flex justify-between items-center mt-auto">
                    <span
                      className={`text-xs font-semibold flex items-center gap-1.5 ${deadlineInfo.colorClass}`}
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {deadlineInfo.icon}
                      </span>
                      {deadlineInfo.text}
                    </span>
                    <div
                      className="w-6 h-6 rounded-full bg-surface-container-highest border border-surface-variant flex items-center justify-center text-[10px] font-bold text-on-surface-variant cursor-help"
                      title={`${task.assignedTo.firstName} ${task.assignedTo.lastName}`}
                    >
                      {task.assignedTo.firstName[0].toUpperCase()}
                      {task.assignedTo.lastName[0].toUpperCase()}
                    </div>
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
