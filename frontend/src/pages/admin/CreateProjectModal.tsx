import { useState, useEffect } from "react";
import { adminService } from "../../lib/adminApi";
import type { UserDTO } from "../../types/api";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateProjectModal = ({
  isOpen,
  onClose,
  onSuccess,
}: CreateProjectModalProps) => {
  // Mode toggle
  const [isAiMode, setIsAiMode] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    supervisorId: "",
    internIds: [] as string[],
  });

  const [supervisors, setSupervisors] = useState<UserDTO[]>([]);
  const [interns, setInterns] = useState<UserDTO[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingUsers, setIsFetchingUsers] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchAvailableUsers = async () => {
        setIsFetchingUsers(true);
        try {
          const response = await adminService.getUsers(0, 100);
          const allUsers = response.content;
          setSupervisors(
            allUsers.filter((u) => u.role === "SUPERVISOR" && u.isActive),
          );
          setInterns(allUsers.filter((u) => u.role === "INTERN" && u.isActive));
        } catch (err) {
          setError("Could not load users. Please close and try again.");
        } finally {
          setIsFetchingUsers(false);
        }
      };
      fetchAvailableUsers();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleInternToggle = (internId: string) => {
    setFormData((prev) => ({
      ...prev,
      internIds: prev.internIds.includes(internId)
        ? prev.internIds.filter((id) => id !== internId)
        : [...prev.internIds, internId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.supervisorId || formData.internIds.length === 0) {
      setError("Please select a supervisor and at least one intern.");
      return;
    }

    if (isAiMode && !aiPrompt.trim()) {
      setError("Please provide a prompt for the AI to generate the project.");
      return;
    }

    setIsLoading(true);
    try {
      if (isAiMode) {
        // AI Generation Call
        await adminService.generateProject({
          prompt: aiPrompt,
          supervisorId: formData.supervisorId,
          internIds: formData.internIds,
        });
      } else {
        // Standard Manual Call
        await adminService.createProject(formData);
      }

      onSuccess();
      onClose();
      // Reset state on success
      setFormData({
        title: "",
        description: "",
        supervisorId: "",
        internIds: [],
      });
      setAiPrompt("");
      setIsAiMode(false);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to process project request.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg p-6 bg-surface-container-lowest border border-surface-container-highest rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto font-sans relative">
        {/* Loading Overlay for AI Generation */}
        {isLoading && isAiMode && (
          <div className="absolute inset-0 z-10 bg-surface-container-lowest/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-xl">
            <span
              className="material-symbols-outlined text-primary-container text-4xl animate-pulse mb-3"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              auto_awesome
            </span>
            <p className="text-on-surface font-bold text-lg animate-pulse">
              Structuring your project...
            </p>
            <p className="text-secondary text-sm mt-1">
              Generating tasks and deadlines.
            </p>
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-on-surface">New Project</h2>
          <button
            onClick={onClose}
            className="text-secondary hover:text-on-surface transition-colors disabled:opacity-50"
            disabled={isLoading}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Mode Toggle Tabs */}
        <div className="flex gap-6 mb-6 border-b border-surface-container-highest pb-0">
          <button
            type="button"
            onClick={() => setIsAiMode(false)}
            className={`pb-2 text-sm font-semibold transition-colors ${!isAiMode ? "text-primary-container border-b-2 border-primary-container" : "text-secondary hover:text-on-surface"}`}
          >
            Manual Creation
          </button>
          <button
            type="button"
            onClick={() => setIsAiMode(true)}
            className={`pb-2 text-sm font-semibold transition-colors flex items-center gap-1.5 ${isAiMode ? "text-tertiary border-b-2 border-tertiary" : "text-secondary hover:text-on-surface"}`}
          >
            <span className="material-symbols-outlined text-[16px]">
              auto_awesome
            </span>
            AI Generate
          </button>
        </div>

        {isFetchingUsers ? (
          <div className="py-10 text-center text-sm text-secondary">
            Loading available users...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 relative">
            {error && (
              <div className="p-3 text-sm text-error bg-error-container rounded-md border border-outline-variant">
                {error}
              </div>
            )}

            {/* Conditional Input Rendering based on Mode */}
            {isAiMode ? (
              <div className="bg-tertiary-fixed/30 p-4 rounded-lg border border-tertiary-fixed/50">
                <label className="text-xs font-bold text-tertiary mb-2 flex items-center gap-1">
                  Project Prompt
                </label>
                <textarea
                  required={isAiMode}
                  rows={4}
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  className="w-full px-3 py-3 border border-tertiary-fixed rounded-lg bg-surface-container-lowest text-on-surface focus:ring-1 focus:ring-tertiary focus:border-tertiary outline-none resize-none transition-colors text-sm shadow-inner"
                  placeholder="e.g., We need a SaaS dashboard for a gym. It should include member management, subscription billing via Stripe, and a daily class schedule view."
                />
                <p className="text-[10px] text-tertiary/80 mt-2 italic flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">
                    info
                  </span>
                  AI will automatically break this down into a full task board.
                </p>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Project Title
                  </label>
                  <input
                    type="text"
                    required={!isAiMode}
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full px-3 py-3 border border-outline-variant rounded-lg bg-[#F1F3F5] text-on-surface focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-colors text-sm"
                    placeholder="e.g., Spring Boot API Migration"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Description
                  </label>
                  <textarea
                    required={!isAiMode}
                    rows={3}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-3 py-3 border border-outline-variant rounded-lg bg-[#F1F3F5] text-on-surface focus:ring-1 focus:ring-primary focus:border-primary outline-none resize-none transition-colors text-sm"
                    placeholder="Briefly describe the project goals..."
                  />
                </div>
              </>
            )}

            {/* Shared Fields (Supervisor & Interns) */}
            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">
                Assign Supervisor
              </label>
              <select
                required
                value={formData.supervisorId}
                onChange={(e) =>
                  setFormData({ ...formData, supervisorId: e.target.value })
                }
                className="w-full px-3 py-3 border border-outline-variant rounded-lg bg-[#F1F3F5] text-on-surface focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-colors text-sm"
              >
                <option value="" disabled>
                  Select a supervisor
                </option>
                {supervisors.map((sup) => (
                  <option key={sup.id} value={sup.id}>
                    {sup.firstName} {sup.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface mb-2">
                Assign Interns
              </label>
              <div className="max-h-40 overflow-y-auto border border-outline-variant rounded-lg p-2 space-y-1 bg-[#F1F3F5]">
                {interns.length === 0 ? (
                  <p className="text-sm text-secondary p-2">
                    No active interns found.
                  </p>
                ) : (
                  interns.map((intern) => (
                    <label
                      key={intern.id}
                      className="flex items-center space-x-3 p-2 hover:bg-surface-container-highest rounded cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={formData.internIds.includes(intern.id)}
                        onChange={() => handleInternToggle(intern.id)}
                        className={`w-4 h-4 rounded ${isAiMode ? "text-tertiary focus:ring-tertiary" : "text-primary focus:ring-primary"} bg-surface-container-lowest border-outline-variant`}
                      />
                      <span className="text-sm text-on-surface font-medium">
                        {intern.firstName} {intern.lastName}
                      </span>
                    </label>
                  ))
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-surface-container-highest">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-secondary hover:text-on-surface transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={
                  isLoading || supervisors.length === 0 || interns.length === 0
                }
                className={`px-6 py-2 text-sm font-medium text-on-primary rounded-lg shadow-sm transition-colors flex items-center gap-2 ${
                  isLoading || supervisors.length === 0 || interns.length === 0
                    ? isAiMode
                      ? "bg-tertiary/70 cursor-not-allowed"
                      : "bg-primary-container/70 cursor-not-allowed"
                    : isAiMode
                      ? "bg-tertiary hover:bg-tertiary-container hover:text-on-tertiary-container"
                      : "bg-primary-container hover:bg-primary"
                }`}
              >
                {isLoading ? (
                  isAiMode ? (
                    "Generating..."
                  ) : (
                    "Creating..."
                  )
                ) : (
                  <>
                    {isAiMode && (
                      <span className="material-symbols-outlined text-[16px]">
                        auto_awesome
                      </span>
                    )}
                    {isAiMode ? "Generate Project" : "Create Project"}
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
