import { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { internService } from '../../lib/internApi';
import type { TaskDTO, TaskStatus } from '../../types/api';
import { SubmissionModal } from './SubmissionModal';

export const InternDashboard = () => {
  const { user, logout } = useAuthStore();
  const [tasks, setTasks] = useState<TaskDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskDTO | null>(null);

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await internService.getMyTasks(0, 50);
      setTasks(response.content);
    } catch (error) {
      console.error('Failed to fetch intern tasks:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // 1. Independent Status Change Handler
  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    // Optimistic UI update for snappy UX
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    try {
      await internService.updateTask(taskId, { status: newStatus });
    } catch (error) {
      console.error('Failed to update task status:', error);
      fetchTasks(); // Revert on failure (e.g., if CORS blocks it)
    }
  };

  // 2. Independent URL Submission Handler
  const handleUrlSubmit = async (taskId: string, url: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, submissionUrl: url } : t));
    try {
      await internService.updateTask(taskId, { submissionUrl: url });
    } catch (error) {
      console.error('Failed to update task URL:', error);
      fetchTasks();
    }
  };

  const openUrlModal = (task: TaskDTO) => {
    setSelectedTask(task);
    setModalOpen(true);
  };

  const getTasksByStatus = (status: TaskStatus) => tasks.filter(t => t.status === status);

  const columns: { title: string; status: TaskStatus; bgColor: string }[] = [
    { title: 'To Do', status: 'TODO', bgColor: 'bg-gray-100' },
    { title: 'In Progress', status: 'IN_PROGRESS', bgColor: 'bg-blue-50' },
    { title: 'In Review', status: 'IN_REVIEW', bgColor: 'bg-yellow-50' },
    { title: 'Done', status: 'DONE', bgColor: 'bg-green-50' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      
      <SubmissionModal 
        isOpen={modalOpen}
        task={selectedTask}
        onClose={() => setModalOpen(false)}
        onSubmit={handleUrlSubmit}
      />

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.firstName}</h1>
          <p className="text-gray-500 mt-1">Track your tasks and submit your deliverables.</p>
        </div>
        <button onClick={logout} className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
          Sign Out
        </button>
      </div>

      {isLoading ? (
        <div className="py-10 text-center text-gray-500">Loading your tasks...</div>
      ) : (
        <div className="flex gap-6 overflow-x-auto pb-4 h-[calc(100vh-160px)]">
          {columns.map(col => (
            <div key={col.status} className={`shrink-0 w-80 rounded-xl p-4 flex flex-col ${col.bgColor}`}>
              <h2 className="font-semibold text-gray-700 mb-4 flex justify-between items-center">
                {col.title}
                <span className="text-xs bg-white px-2 py-1 rounded-full shadow-sm">
                  {getTasksByStatus(col.status).length}
                </span>
              </h2>
              
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {getTasksByStatus(col.status).map(task => (
                  <div key={task.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                    <h3 className="font-medium text-gray-900 text-sm mb-2">{task.title}</h3>
                    
                    {/* The new distinct "Attach Link" button */}
                    <div className="mb-3">
                      {task.submissionUrl ? (
                        <div className="flex items-center justify-between text-xs">
                          <a href={task.submissionUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate max-w-37.5">
                            View Link ↗
                          </a>
                          <button onClick={() => openUrlModal(task)} className="text-gray-400 hover:text-gray-700">Edit</button>
                        </div>
                      ) : (
                        <button onClick={() => openUrlModal(task)} className="text-xs text-blue-600 hover:text-blue-800 font-medium bg-blue-50 px-2 py-1 rounded">
                          + Attach Link
                        </button>
                      )}
                    </div>
                    
                    <div className="mt-auto pt-3 border-t border-gray-50">
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task.id, e.target.value as TaskStatus)}
                        className="w-full text-xs border-gray-200 rounded px-2 py-1.5 focus:ring-blue-500 outline-none bg-gray-50 hover:bg-gray-100 cursor-pointer"
                      >
                        <option value="TODO">To Do</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="IN_REVIEW">In Review</option>
                        <option value="DONE">Done</option>
                      </select>
                    </div>
                  </div>
                ))}
                {getTasksByStatus(col.status).length === 0 && (
                  <div className="text-center text-xs text-gray-400 py-4">No tasks</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};