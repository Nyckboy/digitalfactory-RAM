import { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { supervisorService } from '../../lib/supervisorApi';
import type { ProjectDTO } from '../../types/api';
import { CreateTaskModal } from './CreateTaskModal';

export const SupervisorDashboard = () => {
  const { user, logout } = useAuthStore();
  
  const [projects, setProjects] = useState<ProjectDTO[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [selectedProject, setSelectedProject] = useState<ProjectDTO | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  const fetchProjects = useCallback(async (pageNum: number) => {
    setIsLoading(true);
    try {
      const response = await supervisorService.getAssignedProjects(pageNum, 6); // Fetch 6 projects per page
      setProjects(response.content);
      
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to fetch supervisor projects:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);
  console.log(projects);
  
  useEffect(() => {
    fetchProjects(page);
  }, [page, fetchProjects]);

  const handleOpenTaskModal = (project: ProjectDTO) => {
    setSelectedProject(project);
    setIsTaskModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      
      <CreateTaskModal 
        isOpen={isTaskModalOpen} 
        onClose={() => setIsTaskModalOpen(false)} 
        project={selectedProject} 
      />

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.firstName}</h1>
          <p className="text-gray-500 mt-1">Manage your assigned projects and tasks.</p>
        </div>
        <button 
          onClick={logout}
          className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
        >
          Sign Out
        </button>
      </div>

      {/* Projects Grid */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Projects</h2>
        
        {isLoading ? (
          <div className="py-10 text-center text-gray-500">Loading projects...</div>
        ) : projects.length === 0 ? (
          <div className="py-10 text-center text-gray-500 bg-white rounded-xl border border-gray-100">
            No projects assigned to you yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div key={project.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-gray-900">{project.title}</h3>
                  <span className="px-2 py-1 text-xs font-semibold bg-blue-50 text-blue-700 rounded-full">
                    {project.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-4 grow line-clamp-3">
                  {project.description}
                </p>
                
                <div className="mb-4">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Interns</span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {project.interns.map(intern => (
                      <span key={intern.id} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                        {intern.firstName} {intern.lastName}
                      </span>
                    ))}
                    {project.interns.length === 0 && <span className="text-xs text-gray-400">None</span>}
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t border-gray-50">
                  <button 
                    onClick={() => handleOpenTaskModal(project)}
                    className="w-full px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
                  >
                    + Create Task
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 text-sm text-gray-600 mt-8">
          <button 
            disabled={page === 0 || isLoading}
            onClick={() => setPage(prev => Math.max(0, prev - 1))}
            className="px-4 py-2 border rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50 transition"
          >
            Previous
          </button>
          <span className="font-medium">Page {page + 1} of {totalPages}</span>
          <button 
            disabled={page >= totalPages - 1 || isLoading}
            onClick={() => setPage(prev => prev + 1)}
            className="px-4 py-2 border rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50 transition"
          >
            Next
          </button>
        </div>
      )}

    </div>
  );
};