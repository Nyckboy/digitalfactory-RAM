import { useState, useEffect } from "react";
import type { TaskDTO } from "../../types/api";

interface SubmissionModalProps {
  isOpen: boolean;
  task: TaskDTO | null;
  onClose: () => void;
  onSubmit: (taskId: string, url: string) => Promise<void>;
}

export const SubmissionModal = ({
  isOpen,
  task,
  onClose,
  onSubmit,
}: SubmissionModalProps) => {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (task) setUrl(task.submissionUrl || "");
  }, [task]);

  if (!isOpen || !task) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onSubmit(task.id, url);
      onClose();
    } catch (error) {
      console.error("Failed to submit work", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md p-6 bg-surface-container-lowest border border-surface-container-highest rounded-xl shadow-2xl font-sans">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-on-surface">
            Attach Deliverable
          </h2>
          <button
            onClick={onClose}
            className="text-secondary hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <p className="text-sm text-secondary mb-6">
          Task: <span className="font-bold text-on-surface">{task.title}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1">
              Project / File URL
            </label>
            <input
              type="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://figma.com/... or https://github.com/..."
              className="w-full px-3 py-3 border border-outline-variant rounded-lg bg-[#F1F3F5] text-on-surface focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-colors text-sm"
            />
          </div>

          <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-surface-container-highest">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-secondary hover:text-on-surface transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !url.trim()}
              className={`px-6 py-2 text-sm font-medium text-on-primary rounded-lg shadow-sm transition-colors ${
                isLoading || !url.trim()
                  ? "bg-primary-container/70 cursor-not-allowed"
                  : "bg-primary-container hover:bg-primary"
              }`}
            >
              {isLoading ? "Saving..." : "Save Link"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
