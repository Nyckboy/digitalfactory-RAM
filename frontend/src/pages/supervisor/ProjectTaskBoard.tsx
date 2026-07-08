import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supervisorService } from '../../lib/supervisorApi';
import type { TaskDTO, TaskStatus } from '../../types/api';
import { TaskCommentsModal } from '../../components/shared/TaskCommentsModal';

export const ProjectTaskBoard = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  
  const [tasks, setTasks] = useState<TaskDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add Chat Modal State
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
      const response = await supervisorService.getProjectTasks(projectId, 0, 100);
      setTasks(response.content);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
      setError('Failed to load project tasks.');
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    // Optimistic UI update
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    try {
      await supervisorService.updateTask(taskId, { status: newStatus });
    } catch (err) {
      console.error('Failed to update task:', err);
      // Revert on failure
      fetchTasks();
    }
  };

  const handleDelete = async (taskId: string) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
    // Optimistic UI update
    setTasks(prev => prev.filter(t => t.id !== taskId));
    try {
      await supervisorService.deleteTask(taskId);
    } catch (err) {
      console.error('Failed to delete task:', err);
      fetchTasks(); // Revert on failure
    }
  };

  // Helper to group tasks by status
  const getTasksByStatus = (status: TaskStatus) => tasks.filter(t => t.status === status);

  const columns: { title: string; status: TaskStatus; bgColor: string }[] = [
    { title: 'To Do', status: 'TODO', bgColor: 'bg-gray-100' },
    { title: 'In Progress', status: 'IN_PROGRESS', bgColor: 'bg-blue-50' },
    { title: 'In Review', status: 'IN_REVIEW', bgColor: 'bg-yellow-50' },
    { title: 'COMPLETED', status: 'COMPLETED', bgColor: 'bg-green-50' },
  ];

  if (isLoading) return <div className="p-10 text-center text-gray-500">Loading board...</div>;
  if (error) return <div className="p-10 text-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-white p-8">

      <TaskCommentsModal
        isOpen={chatModalOpen}
        task={chatTask}
        onClose={() => setChatModalOpen(false)}
        fetchComments={supervisorService.getTaskComments}
        postComment={supervisorService.addTaskComment}
      />
    
      <div className="flex items-center mb-8 gap-4">
        <button 
          onClick={() => navigate('/supervisor')}
          className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
        >
          ← Back to Dashboard
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Project Task Board</h1>
        </div>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-4 h-[calc(100vh-140px)]">
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
                <div key={task.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 group">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-gray-900 text-sm">{task.title}</h3>
                    <button 
                      onClick={() => handleDelete(task.id)}
                      className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete Task"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="text-xs text-gray-600 mb-3 line-clamp-2">{task.description}</p>
                  
                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-50">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-700" title={task.assignedTo?.firstName}>
                        {task.assignedTo?.firstName?.[0]?.toUpperCase()}
                      </div>
                      <button 
                        onClick={() => openChat(task)}
                        className="text-xs text-gray-500 hover:text-blue-600"
                        title="Open Chat"
                      >
                        💬
                      </button>
                    </div>
                    
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusChange(task.id, e.target.value as TaskStatus)}
                      className="text-xs border-gray-200 rounded px-1 py-1 focus:ring-blue-500 outline-none bg-gray-50 hover:bg-gray-100 cursor-pointer"
                    >
                      <option value="TODO">To Do</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="IN_REVIEW">In Review</option>
                      <option value="COMPLETED">COMPLETED</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};