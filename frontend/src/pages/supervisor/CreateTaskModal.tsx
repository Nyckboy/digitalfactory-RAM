import { useState } from "react";
import {
  supervisorService,
  type CreateTaskPayload,
} from "../../lib/supervisorApi";
import type { ProjectDTO } from "../../types/api";

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectDTO | null;
}

export const CreateTaskModal = ({
  isOpen,
  onClose,
  project,
}: CreateTaskModalProps) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assignedToId: "",
    deadline: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen || !project) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!formData.assignedToId) {
      setError("Please assign this task to an intern.");
      return;
    }

    setIsLoading(true);

    try {
      // Format deadline to match backend expectation (e.g., adding T00:00:00 if just a date)
      // If using datetime-local input, it already formats close to ISO 8601
      const payload: CreateTaskPayload = {
        ...formData,
        projectId: project.id,
        // Ensure standard ISO format if needed, though datetime-local gives YYYY-MM-DDTHH:mm
        deadline: new Date(formData.deadline).toISOString(),
      };

      await supervisorService.createTask(payload);
      setSuccessMsg("Task created successfully!");

      // Reset form and close after a short delay
      setTimeout(() => {
        setFormData({
          title: "",
          description: "",
          assignedToId: "",
          deadline: "",
        });
        setSuccessMsg(null);
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create task.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-lg p-6 bg-white rounded-xl shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Create Task</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-6">
          Project:{" "}
          <span className="font-semibold text-gray-900">{project.title}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
              {error}
            </div>
          )}
          {successMsg && (
            <div className="p-3 text-sm text-green-700 bg-green-50 rounded-md">
              {successMsg}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Task Title
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-3 py-2 mt-1 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="e.g., Design Login Screen"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-3 py-2 mt-1 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              placeholder="What needs to be done?"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Assign To
              </label>
              <select
                required
                value={formData.assignedToId}
                onChange={(e) =>
                  setFormData({ ...formData, assignedToId: e.target.value })
                }
                className="w-full px-3 py-2 mt-1 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              >
                <option value="" disabled>
                  Select Intern
                </option>
                {project.interns.map((intern) => (
                  <option key={intern.id} value={intern.id}>
                    {intern.firstName} {intern.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Deadline
              </label>
              <input
                type="datetime-local"
                required
                value={formData.deadline}
                onChange={(e) =>
                  setFormData({ ...formData, deadline: e.target.value })
                }
                className="w-full px-3 py-2 mt-1 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || successMsg !== null}
              className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition ${
                isLoading || successMsg
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isLoading ? "Creating..." : "Assign Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
