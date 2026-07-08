import { useEffect, useState, useCallback } from "react";
import { adminService } from "../../lib/adminApi";
import type { UserDTO, ProjectDTO } from "../../types/api";
import { useAuthStore } from "../../store/useAuthStore";
import { RegisterUserModal } from "./RegisterUserModal";
import { CreateProjectModal } from "./CreateProjectModal";
import { EditUserModal } from "./EditUserModal";
import { EditProjectModal } from "./EditProjectModal";

export const AdminDashboard = () => {
  const { logout } = useAuthStore();

  // Modals state
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  // Users state & pagination
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [userPage, setUserPage] = useState(0);
  const [userTotalPages, setUserTotalPages] = useState(1);
  const [isUsersLoading, setIsUsersLoading] = useState(true);

  // Projects state & pagination
  const [projects, setProjects] = useState<ProjectDTO[]>([]);
  const [projectPage, setProjectPage] = useState(0);
  const [projectTotalPages, setProjectTotalPages] = useState(1);
  const [isProjectsLoading, setIsProjectsLoading] = useState(true);

  const [selectedUser, setSelectedUser] = useState<UserDTO | null>(null);
  const [selectedProject, setSelectedProject] = useState<ProjectDTO | null>(
    null,
  );
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [isEditProjectModalOpen, setIsEditProjectModalOpen] = useState(false);

  const PAGE_SIZE = 5;

  // Independent fetch functions
  const fetchUsers = useCallback(async (page: number) => {
    setIsUsersLoading(true);
    try {
      const response = await adminService.getUsers(page, PAGE_SIZE);
      setUsers(response.content);
      setUserTotalPages(response.totalPages);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setIsUsersLoading(false);
    }
  }, []);

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

  const handleDeleteUser = async (user: UserDTO) => {
    if (!window.confirm(`Are you sure you want to delete ${user.firstName}?`))
      return;
    try {
      await adminService.deleteUser(user.id);
      fetchUsers(userPage); // Refresh on success
    } catch (err: any) {
      if (err.response?.status === 409) {
        alert(
          `${user.firstName} could not be hard-deleted because they have assigned tasks/projects. Their account has been set to Inactive instead.`,
        );
        fetchUsers(userPage); // Refresh to show the inactive status
      } else {
        alert("Failed to delete user.");
      }
    }
  };

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

  // Effect to load Users when userPage changes
  useEffect(() => {
    fetchUsers(userPage);
  }, [userPage, fetchUsers]);

  // Effect to load Projects when projectPage changes
  useEffect(() => {
    fetchProjects(projectPage);
  }, [projectPage, fetchProjects]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <RegisterUserModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        onSuccess={() => fetchUsers(0)} // Reset to page 0 on new user
      />

      <CreateProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onSuccess={() => fetchProjects(0)} // Reset to page 0 on new project
      />

      <EditUserModal
        isOpen={isEditUserModalOpen}
        user={selectedUser}
        onClose={() => setIsEditUserModalOpen(false)}
        onSuccess={() => fetchUsers(userPage)}
      />
      <EditProjectModal
        isOpen={isEditProjectModalOpen}
        project={selectedProject}
        onClose={() => setIsEditProjectModalOpen(false)}
        onSuccess={() => fetchProjects(projectPage)}
      />

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Manage platform users and projects.
          </p>
        </div>
        <button
          onClick={logout}
          className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
        >
          Sign Out
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* USERS SECTION */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <div className="p-6 border-b border-gray-50 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">
              Recent Users
            </h2>
            <button
              onClick={() => setIsUserModalOpen(true)}
              className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              + Add User
            </button>
          </div>

          <div className="overflow-x-auto grow">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="px-6 py-3 font-medium">Name</th>
                  <th className="px-6 py-3 font-medium">Role</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isUsersLoading ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      Loading...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-gray-50 last:border-0"
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {user.email}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            user.role === "SUPERVISOR"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {user.isActive ? "Active" : "Inactive"}
                      </td>
                      <td className="px-6 py-4 flex gap-3 text-sm">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setIsEditUserModalOpen(true);
                          }}
                          className="text-blue-600 hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user)}
                          className="text-red-600 hover:underline"
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

          {/* User Pagination Controls */}
          <div className="p-4 border-t border-gray-50 flex items-center justify-between text-sm text-gray-600 bg-gray-50/50 rounded-b-xl">
            <button
              disabled={userPage === 0 || isUsersLoading}
              onClick={() => setUserPage((prev) => Math.max(0, prev - 1))}
              className="px-3 py-1 border rounded bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Previous
            </button>
            <span>
              Page {userPage + 1} of {Math.max(1, userTotalPages)}
            </span>
            <button
              disabled={userPage >= userTotalPages - 1 || isUsersLoading}
              onClick={() => setUserPage((prev) => prev + 1)}
              className="px-3 py-1 border rounded bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Next
            </button>
          </div>
        </div>

        {/* PROJECTS SECTION */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <div className="p-6 border-b border-gray-50 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">
              Recent Projects
            </h2>
            <button
              onClick={() => setIsProjectModalOpen(true)}
              className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              + New Project
            </button>
          </div>

          <div className="overflow-x-auto grow">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="px-6 py-3 font-medium">Project Title</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Supervisor</th>
                  <th className="px-6 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {isProjectsLoading ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      Loading...
                    </td>
                  </tr>
                ) : projects.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      No projects found.
                    </td>
                  </tr>
                ) : (
                  projects.map((project) => (
                    <tr
                      key={project.id}
                      className="border-b border-gray-50 last:border-0"
                    >
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {project.title}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-700 rounded-full">
                          {project.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {project.supervisor?.firstName}{" "}
                        {project.supervisor?.lastName}
                      </td>
                      <td className="px-6 py-4 flex gap-3 text-sm">
                        <button
                          onClick={() => {
                            setSelectedProject(project);
                            setIsEditProjectModalOpen(true);
                          }}
                          className="text-blue-600 hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProject(project)}
                          className="text-red-600 hover:underline"
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

          {/* Project Pagination Controls */}
          <div className="p-4 border-t border-gray-50 flex items-center justify-between text-sm text-gray-600 bg-gray-50/50 rounded-b-xl">
            <button
              disabled={projectPage === 0 || isProjectsLoading}
              onClick={() => setProjectPage((prev) => Math.max(0, prev - 1))}
              className="px-3 py-1 border rounded bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Previous
            </button>
            <span>
              Page {projectPage + 1} of {Math.max(1, projectTotalPages)}
            </span>
            <button
              disabled={
                projectPage >= projectTotalPages - 1 || isProjectsLoading
              }
              onClick={() => setProjectPage((prev) => prev + 1)}
              className="px-3 py-1 border rounded bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
