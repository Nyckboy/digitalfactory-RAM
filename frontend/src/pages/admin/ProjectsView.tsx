import { useEffect, useState, useCallback } from "react";
import { adminService } from "../../lib/adminApi";
import type { ProjectDTO } from "../../types/api";
import { CreateProjectModal } from "./CreateProjectModal";
import { EditProjectModal } from "./EditProjectModal";

export const ProjectsView = () => {
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [projects, setProjects] = useState<ProjectDTO[]>([]);
  const [projectPage, setProjectPage] = useState(0);
  const [projectTotalPages, setProjectTotalPages] = useState(1);
  const [isProjectsLoading, setIsProjectsLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<ProjectDTO | null>(
    null,
  );
  const [isEditProjectModalOpen, setIsEditProjectModalOpen] = useState(false);

  const PAGE_SIZE = 10; // Increased since it has its own page

  const fetchProjects = useCallback(async (page: number) => {
    setIsProjectsLoading(true);
    try {
      const response = await adminService.getProjects(page, PAGE_SIZE);
      setProjects(response.content);
      setProjectTotalPages(response.totalPages);
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    } finally {
      setIsProjectsLoading(false);
    }
  }, []);

  const handleDeleteProject = async (project: ProjectDTO) => {
    if (!window.confirm(`Are you sure you want to delete "${project.title}"?`))
      return;
    try {
      await adminService.deleteProject(project.id);
      fetchProjects(projectPage);
    } catch (err: any) {
      if (err.response?.status === 409) {
        alert(
          `Cannot delete "${project.title}". You must delete all associated tasks first.`,
        );
      } else {
        alert("Failed to delete project.");
      }
    }
  };

  useEffect(() => {
    fetchProjects(projectPage);
  }, [projectPage, fetchProjects]);

  return (
    <>
      <CreateProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onSuccess={() => fetchProjects(0)}
      />
      <EditProjectModal
        isOpen={isEditProjectModalOpen}
        project={selectedProject}
        onClose={() => setIsEditProjectModalOpen(false)}
        onSuccess={() => fetchProjects(projectPage)}
      />

      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-on-surface mb-2">
            Projects Management
          </h1>
          <p className="text-base text-secondary">
            Oversee and manage active platform projects.
          </p>
        </div>
        <button
          onClick={() => setIsProjectModalOpen(true)}
          className="bg-primary-container text-on-primary py-2 px-4 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-primary transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">add</span> New
          Project
        </button>
      </div>

      <div className="bg-surface-container-lowest rounded-xl shadow-sm flex flex-col overflow-hidden border border-surface-container-highest">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-background text-xs font-semibold text-secondary uppercase tracking-wider">
                <th className="px-6 py-4 font-medium">Project Title</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Supervisor</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-surface-container-highest">
              {isProjectsLoading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-8 text-center text-secondary"
                  >
                    Loading...
                  </td>
                </tr>
              ) : projects.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-8 text-center text-secondary"
                  >
                    No projects found.
                  </td>
                </tr>
              ) : (
                projects.map((project) => (
                  <tr
                    key={project.id}
                    className="hover:bg-surface-container-low transition-colors group"
                  >
                    <td className="px-6 py-4 font-medium text-on-surface">
                      {project.title}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-surface-container-highest text-on-surface-variant">
                        {project.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-secondary">
                      {project.supervisor?.firstName}{" "}
                      {project.supervisor?.lastName}
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-3">
                      <button
                        onClick={() => {
                          setSelectedProject(project);
                          setIsEditProjectModalOpen(true);
                        }}
                        className="text-primary hover:text-primary-container font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteProject(project)}
                        className="text-error hover:text-on-error-container font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-surface-container-highest flex items-center justify-between text-sm text-secondary bg-surface-container-low">
          <button
            disabled={projectPage === 0 || isProjectsLoading}
            onClick={() => setProjectPage((prev) => Math.max(0, prev - 1))}
            className="px-4 py-2 border border-outline-variant rounded bg-surface-container-lowest hover:bg-surface-variant disabled:opacity-50 transition"
          >
            Previous
          </button>
          <span>
            Page {projectPage + 1} of {Math.max(1, projectTotalPages)}
          </span>
          <button
            disabled={projectPage >= projectTotalPages - 1 || isProjectsLoading}
            onClick={() => setProjectPage((prev) => prev + 1)}
            className="px-4 py-2 border border-outline-variant rounded bg-surface-container-lowest hover:bg-surface-variant disabled:opacity-50 transition"
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
};
