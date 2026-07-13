import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supervisorService } from "../../lib/supervisorApi";
import type { TaskDTO, TaskStatus } from "../../types/api";
import { TaskCommentsModal } from "../../components/shared/TaskCommentsModal";

export const ProjectTaskBoard = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState<TaskDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [chatTask, setChatTask] = useState<TaskDTO | null>(null);

  const openChat = (task: TaskDTO) => {
    setChatTask(task);
    setChatModalOpen(true);
  };

  const fetchTasks = useCallback(async () => {
    if (!projectId) return;
    setIsLoading(true);
    try {
      const response = await supervisorService.getProjectTasks(
        projectId,
        0,
        100,
      );
      setTasks(response.content);
    } catch (err) {
      setError("Failed to load project tasks.");
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)),
    );
    try {
      await supervisorService.updateTask(taskId, { status: newStatus });
    } catch (err) {
      fetchTasks();
    }
  };

  const handleDelete = async (taskId: string) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    try {
      await supervisorService.deleteTask(taskId);
    } catch (err) {
      fetchTasks();
    }
  };

  const getTasksByStatus = (status: TaskStatus) =>
    tasks.filter((t) => t.status === status);

  const columns: { title: string; status: TaskStatus; headerBg: string }[] = [
    {
      title: "To Do",
      status: "TODO",
      headerBg: "bg-surface-container-highest text-on-surface-variant",
    },
    {
      title: "In Progress",
      status: "IN_PROGRESS",
      headerBg: "bg-tertiary-fixed text-tertiary",
    },
    {
      title: "In Review",
      status: "IN_REVIEW",
      headerBg: "bg-primary-fixed text-primary-container",
    },
    {
      title: "Completed",
      status: "COMPLETED",
      headerBg: "bg-surface-container-low text-secondary",
    },
  ];

  if (isLoading)
    return (
      <div className="py-10 text-center text-secondary">Loading board...</div>
    );
  if (error) return <div className="py-10 text-center text-error">{error}</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <TaskCommentsModal
        isOpen={chatModalOpen}
        task={chatTask}
        onClose={() => setChatModalOpen(false)}
        fetchComments={supervisorService.getTaskComments}
        postComment={supervisorService.addTaskComment}
      />

      <div className="flex items-center mb-6 gap-4 shrink-0">
        <button
          onClick={() => navigate("/supervisor/projects")}
          className="px-4 py-2 text-sm font-medium text-secondary bg-surface-container-lowest border border-surface-container-highest rounded-lg hover:bg-surface-container-low transition flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">
            arrow_back
          </span>{" "}
          Back
        </button>
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Project Board</h1>
        </div>
      </div>

      {/* The Fix: Wrapper with full width, auto scroll, and an inner container forcing w-max */}
      <div className="flex-1 w-full min-w-0 overflow-x-auto pb-4 custom-scrollbar">
        <div className="flex gap-6 h-full items-start w-max px-1">
          {columns.map((col) => (
            <div
              key={col.status}
              className="shrink-0 w-80 bg-[#F1F3F5] rounded-xl p-3 flex flex-col max-h-full border border-surface-container-highest"
            >
              <div
                className={`font-semibold mb-4 flex justify-between items-center px-3 py-2 rounded-lg ${col.headerBg}`}
              >
                <span className="text-sm uppercase tracking-wider">
                  {col.title}
                </span>
                <span className="text-xs bg-surface-container-lowest/50 px-2 py-0.5 rounded-full font-bold">
                  {getTasksByStatus(col.status).length}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
                {getTasksByStatus(col.status).map((task) => (
                  <div
                    key={task.id}
                    className="bg-surface-container-lowest p-4 rounded-lg shadow-sm border border-outline-variant/30 group hover:shadow-[0px_10px_20px_rgba(0,0,0,0.03)] transition-all"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-on-surface text-sm">
                        {task.title}
                      </h3>
                      <button
                        onClick={() => handleDelete(task.id)}
                        className="text-secondary hover:text-error opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          close
                        </span>
                      </button>
                    </div>
                    <p className="text-xs text-secondary mb-4 line-clamp-2">
                      {task.description}
                    </p>

                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-surface-variant/40">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-7 h-7 rounded-full bg-tertiary-fixed flex items-center justify-center text-[10px] font-bold text-tertiary border border-surface-container-lowest"
                          title={task.assignedTo?.firstName}
                        >
                          {task.assignedTo?.firstName?.[0]?.toUpperCase()}
                        </div>
                        <button
                          onClick={() => openChat(task)}
                          className="text-secondary hover:text-primary-container transition-colors flex items-center"
                          title="Open Chat"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            chat_bubble
                          </span>
                        </button>
                      </div>

                      <select
                        value={task.status}
                        onChange={(e) =>
                          handleStatusChange(
                            task.id,
                            e.target.value as TaskStatus,
                          )
                        }
                        className="text-[11px] font-semibold border border-outline-variant/50 rounded-md px-2 py-1 focus:ring-1 focus:ring-primary outline-none bg-surface-container-low hover:bg-surface-variant cursor-pointer text-on-surface uppercase"
                      >
                        <option value="TODO">To Do</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="IN_REVIEW">In Review</option>
                        <option value="COMPLETED">Completed</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
