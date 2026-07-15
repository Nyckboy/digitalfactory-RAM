import { useEffect, useState, useCallback } from "react";
import { supervisorService } from "../../lib/supervisorApi";
import type { ProjectDTO } from "../../types/api";
import { CreateTaskModal } from "./CreateTaskModal";
import { useNavigate } from "react-router-dom";

export const SupervisorProjectsView = () => {
  const navigate = useNavigate();

  const [projects, setProjects] = useState<ProjectDTO[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedProject, setSelectedProject] = useState<ProjectDTO | null>(
    null,
  );
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  const fetchProjects = useCallback(async (pageNum: number) => {
    setIsLoading(true);
    try {
      const response = await supervisorService.getAssignedProjects(pageNum, 6);
      setProjects(response.content);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects(page);
  }, [page, fetchProjects]);

  return (
    <>
      <CreateTaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        project={selectedProject}
      />

      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-on-surface mb-2">
            Your Projects
          </h2>
          <p className="text-base text-secondary">
            Manage tasks and team assignments.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="py-10 text-center text-secondary">
          Loading projects...
        </div>
      ) : projects.length === 0 ? (
        <div className="py-10 text-center text-secondary bg-surface-container-lowest rounded-xl border border-surface-container-highest">
          No projects assigned to you yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-surface-container-lowest rounded-xl p-5 shadow-[0px_30px_40px_rgba(0,0,0,0.04)] border border-surface-variant/30 flex flex-col hover:-translate-y-1 hover:shadow-[0px_40px_50px_rgba(0,0,0,0.06)] transition-all duration-300"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="px-2 py-1 bg-surface-container-low text-secondary rounded text-xs font-semibold uppercase">
                  {project.status}
                </div>
                <span className="material-symbols-outlined text-secondary text-[20px]">
                  folder
                </span>
              </div>

              <h4 className="text-lg font-bold text-on-surface mb-2">
                {project.title}
              </h4>
              <p className="text-sm text-secondary mb-6 line-clamp-2 grow">
                {project.description}
              </p>

              <div className="mb-4">
                <div className="text-xs font-semibold text-secondary mb-2 uppercase tracking-wider">
                  Assigned Team
                </div>
                <div className="flex flex-wrap gap-2">
                  {project.interns.length === 0 ? (
                    <span className="text-xs text-secondary">None</span>
                  ) : (
                    project.interns.map((intern) => (
                      <span
                        key={intern.id}
                        className="px-2 py-1 text-xs bg-[#F1F3F5] text-on-surface rounded-md font-medium border border-outline-variant/30"
                      >
                        {intern.firstName} {intern.lastName}
                      </span>
                    ))
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center mt-auto pt-4 border-t border-surface-variant/40 gap-3">
                <button
                  onClick={() =>
                    navigate(`/supervisor/projects/${project.id}/board`)
                  }
                  className="flex-1 py-2 bg-surface-container-low border border-surface-variant rounded-lg text-sm font-medium text-on-surface hover:bg-surface-variant transition-colors"
                >
                  View Board
                </button>
                <button
                  onClick={() => {
                    setSelectedProject(project);
                    setIsTaskModalOpen(true);
                  }}
                  className="py-2 px-3 bg-primary-fixed text-primary-container rounded-lg hover:bg-primary-container hover:text-on-primary transition-colors flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    add
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 text-sm text-secondary mt-10">
          <button
            disabled={page === 0 || isLoading}
            onClick={() => setPage((prev) => Math.max(0, prev - 1))}
            className="px-4 py-2 border border-outline-variant rounded-lg bg-surface-container-lowest hover:bg-surface-variant disabled:opacity-50 transition"
          >
            Previous
          </button>
          <span className="font-medium">
            Page {page + 1} of {totalPages}
          </span>
          <button
            disabled={page >= totalPages - 1 || isLoading}
            onClick={() => setPage((prev) => prev + 1)}
            className="px-4 py-2 border border-outline-variant rounded-lg bg-surface-container-lowest hover:bg-surface-variant disabled:opacity-50 transition"
          >
            Next
          </button>
        </div>
      )}
    </>
  );
};
