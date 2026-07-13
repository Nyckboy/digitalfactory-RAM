import { useEffect, useState, useCallback } from "react";
import { adminService } from "../../lib/adminApi";
import type { UserDTO } from "../../types/api";
import { RegisterUserModal } from "./RegisterUserModal";
import { EditUserModal } from "./EditUserModal";

export const TeamView = () => {
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [userPage, setUserPage] = useState(0);
  const [userTotalPages, setUserTotalPages] = useState(1);
  const [isUsersLoading, setIsUsersLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserDTO | null>(null);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);

  const PAGE_SIZE = 10;

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

  const handleDeleteUser = async (user: UserDTO) => {
    if (!window.confirm(`Are you sure you want to delete ${user.firstName}?`))
      return;
    try {
      await adminService.deleteUser(user.id);
      fetchUsers(userPage);
    } catch (err: any) {
      if (err.response?.status === 409) {
        alert(
          `${user.firstName} could not be hard-deleted. Account set to Inactive instead.`,
        );
        fetchUsers(userPage);
      } else {
        alert("Failed to delete user.");
      }
    }
  };

  useEffect(() => {
    fetchUsers(userPage);
  }, [userPage, fetchUsers]);

  return (
    <>
      <RegisterUserModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        onSuccess={() => fetchUsers(0)}
      />
      <EditUserModal
        isOpen={isEditUserModalOpen}
        user={selectedUser}
        onClose={() => setIsEditUserModalOpen(false)}
        onSuccess={() => fetchUsers(userPage)}
      />

      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-on-surface mb-2">
            Team Management
          </h1>
          <p className="text-base text-secondary">
            Manage platform access, roles, and user accounts.
          </p>
        </div>
        <button
          onClick={() => setIsUserModalOpen(true)}
          className="bg-primary-container text-on-primary py-2 px-4 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-primary transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">
            person_add
          </span>{" "}
          Register User
        </button>
      </div>

      <div className="bg-surface-container-lowest rounded-xl shadow-sm flex flex-col overflow-hidden border border-surface-container-highest">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-background text-xs font-semibold text-secondary uppercase tracking-wider">
                <th className="px-6 py-4 font-medium">Name & Email</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-surface-container-highest">
              {isUsersLoading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-8 text-center text-secondary"
                  >
                    Loading...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-8 text-center text-secondary"
                  >
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-surface-container-low transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-on-surface">
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="text-xs text-secondary mt-0.5">
                        {user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          user.role === "SUPERVISOR"
                            ? "bg-tertiary-fixed text-tertiary"
                            : "bg-primary-fixed text-primary-container"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-secondary">
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-3">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setIsEditUserModalOpen(true);
                        }}
                        className="text-primary hover:text-primary-container font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user)}
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
            disabled={userPage === 0 || isUsersLoading}
            onClick={() => setUserPage((prev) => Math.max(0, prev - 1))}
            className="px-4 py-2 border border-outline-variant rounded bg-surface-container-lowest hover:bg-surface-variant disabled:opacity-50 transition"
          >
            Previous
          </button>
          <span>
            Page {userPage + 1} of {Math.max(1, userTotalPages)}
          </span>
          <button
            disabled={userPage >= userTotalPages - 1 || isUsersLoading}
            onClick={() => setUserPage((prev) => prev + 1)}
            className="px-4 py-2 border border-outline-variant rounded bg-surface-container-lowest hover:bg-surface-variant disabled:opacity-50 transition"
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
};
