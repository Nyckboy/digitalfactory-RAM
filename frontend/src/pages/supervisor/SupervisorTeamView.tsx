import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supervisorService } from "../../lib/supervisorApi";
import type { TeamDirectoryProject } from "../../types/api";

export const SupervisorTeamView = () => {
  const navigate = useNavigate();

  const [projectTeams, setProjectTeams] = useState<TeamDirectoryProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce the search input so we don't spam the backend
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300); // Wait 300ms after user stops typing

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  // Fetch the data whenever the debounced search term changes
  useEffect(() => {
    const fetchTeamDirectory = async () => {
      setIsLoading(true);
      try {
        const data = await supervisorService.getTeamDirectory(debouncedSearch);
        setProjectTeams(data);
      } catch (error) {
        console.error("Failed to fetch team directory:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeamDirectory();
  }, [debouncedSearch]);

  // Helper for status dot colors based on isActive boolean
  const getStatusColor = (isActive: boolean) => {
    return isActive ? "bg-green-500" : "bg-gray-400";
  };

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-on-surface mb-2">
            Team Directory
          </h2>
          <p className="text-base text-secondary">
            Manage interns across your assigned projects.
          </p>
        </div>

        <div className="relative w-full md:w-72">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-[20px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-outline-variant rounded-lg bg-surface-container-lowest text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-colors"
            placeholder="Search interns or projects..."
          />
        </div>
      </div>

      <div className="space-y-8">
        {isLoading ? (
          <div className="py-10 text-center text-secondary bg-surface-container-lowest rounded-xl border border-surface-container-highest">
            Loading team directory...
          </div>
        ) : projectTeams.length === 0 ? (
          <div className="py-10 text-center text-secondary bg-surface-container-lowest rounded-xl border border-surface-container-highest">
            No projects or interns found matching your criteria.
          </div>
        ) : (
          projectTeams.map((project) => (
            <div
              key={project.id}
              className="bg-surface-container-lowest rounded-xl shadow-[0px_30px_40px_rgba(0,0,0,0.04)] border border-surface-container-highest overflow-hidden"
            >
              {/* Project Header */}
              <div className="bg-surface-container-low px-6 py-4 border-b border-surface-container-highest flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-on-surface">
                    {project.title}
                  </h3>
                  <p className="text-xs font-semibold text-secondary mt-1">
                    {project.internCount} assigned intern
                    {project.internCount !== 1 ? "s" : ""}
                  </p>
                </div>
                <button
                  onClick={() =>
                    navigate(`/supervisor/projects/${project.id}/board`)
                  }
                  className="px-4 py-2 text-sm font-medium text-primary-container bg-primary-fixed rounded-lg hover:bg-primary-container hover:text-on-primary transition-colors flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    dashboard
                  </span>
                  Board
                </button>
              </div>

              {/* Interns Grid */}
              <div className="p-6">
                {project.interns.length === 0 ? (
                  <p className="text-sm text-secondary italic">
                    No interns assigned to this project.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {project.interns.map((intern) => (
                      <div
                        key={intern.id}
                        className="p-4 rounded-lg border border-outline-variant/50 hover:border-primary-container/30 hover:shadow-sm transition-all flex items-center gap-4"
                      >
                        {/* Avatar */}
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full bg-surface-container-highest border border-surface-variant flex items-center justify-center text-primary-container font-bold text-lg uppercase">
                            {intern.firstName[0]}
                            {intern.lastName[0]}
                          </div>
                          {/* Status Dot */}
                          <div
                            className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-surface-container-lowest ${getStatusColor(intern.isActive)}`}
                            title={intern.isActive ? "Active" : "Inactive"}
                          ></div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-on-surface truncate">
                            {intern.firstName} {intern.lastName}
                          </p>
                          <p
                            className="text-xs text-secondary truncate mt-0.5"
                            title={intern.email}
                          >
                            {intern.email}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
};
