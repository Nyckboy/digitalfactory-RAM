import { useState } from "react";
import { useNavigate } from "react-router-dom";

// MOCK DATA: Replace this with your actual API fetch later
const mockProjectTeams = [
  {
    projectId: "1",
    projectName: "Spring Boot API Migration",
    status: "IN PROGRESS",
    interns: [
      {
        id: "i1",
        firstName: "Amine",
        lastName: "El Fassi",
        email: "amine.fassi@example.com",
        status: "Online",
      },
      {
        id: "i2",
        firstName: "Sarah",
        lastName: "Jenkins",
        email: "s.jenkins@example.com",
        status: "In a meeting",
      },
    ],
  },
  {
    projectId: "2",
    projectName: "React Native Mobile App",
    status: "TODO",
    interns: [
      {
        id: "i3",
        firstName: "David",
        lastName: "Chen",
        email: "david.c@example.com",
        status: "Offline",
      },
      {
        id: "i4",
        firstName: "Youssef",
        lastName: "Alaoui",
        email: "y.alaoui@example.com",
        status: "Online",
      },
      {
        id: "i5",
        firstName: "Maria",
        lastName: "Garcia",
        email: "m.garcia@example.com",
        status: "Online",
      },
    ],
  },
  {
    projectId: "3",
    projectName: "Legacy Database Cleanup",
    status: "COMPLETED",
    interns: [
      {
        id: "i6",
        firstName: "Omar",
        lastName: "Bennis",
        email: "omar.b@example.com",
        status: "Offline",
      },
    ],
  },
];

export const SupervisorTeamView = () => {
  const navigate = useNavigate();
  // Later, use state here: const [projectTeams, setProjectTeams] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Simple local filter for the mock data
  const filteredTeams = mockProjectTeams
    .map((project) => ({
      ...project,
      interns: project.interns.filter((intern) =>
        `${intern.firstName} ${intern.lastName}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase()),
      ),
    }))
    .filter(
      (project) =>
        project.interns.length > 0 ||
        project.projectName.toLowerCase().includes(searchQuery.toLowerCase()),
    );

  // Helper for status dot colors
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Online":
        return "bg-green-500";
      case "Offline":
        return "bg-gray-400";
      case "In a meeting":
        return "bg-yellow-500";
      default:
        return "bg-gray-400";
    }
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
        {filteredTeams.length === 0 ? (
          <div className="py-10 text-center text-secondary bg-surface-container-lowest rounded-xl border border-surface-container-highest">
            No interns found matching your search.
          </div>
        ) : (
          filteredTeams.map((project) => (
            <div
              key={project.projectId}
              className="bg-surface-container-lowest rounded-xl shadow-[0px_30px_40px_rgba(0,0,0,0.04)] border border-surface-container-highest overflow-hidden"
            >
              {/* Project Header */}
              <div className="bg-surface-container-low px-6 py-4 border-b border-surface-container-highest flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-on-surface">
                    {project.projectName}
                  </h3>
                  <p className="text-xs font-semibold text-secondary mt-1">
                    {project.interns.length} assigned intern
                    {project.interns.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <button
                  onClick={() =>
                    navigate(`/supervisor/projects/${project.projectId}/board`)
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {project.interns.map((intern) => (
                    <div
                      key={intern.id}
                      className="p-4 rounded-lg border border-outline-variant/50 hover:border-primary-container/30 hover:shadow-sm transition-all flex items-center gap-4"
                    >
                      {/* Avatar */}
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-surface-container-highest border border-surface-variant flex items-center justify-center text-primary-container font-bold text-lg">
                          {intern.firstName[0]}
                          {intern.lastName[0]}
                        </div>
                        {/* Status Dot */}
                        <div
                          className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-surface-container-lowest ${getStatusColor(intern.status)}`}
                          title={intern.status}
                        ></div>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-on-surface truncate">
                          {intern.firstName} {intern.lastName}
                        </p>
                        <p className="text-xs text-secondary truncate mt-0.5">
                          {intern.email}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
};
