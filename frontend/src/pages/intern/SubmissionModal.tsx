import { useState, useEffect } from 'react';
import type { TaskDTO } from '../../types/api';

interface SubmissionModalProps {
  isOpen: boolean;
  task: TaskDTO | null;
  onClose: () => void;
  onSubmit: (taskId: string, url: string) => Promise<void>;
}

export const SubmissionModal = ({ isOpen, task, onClose, onSubmit }: SubmissionModalProps) => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Pre-fill the input if the task already has a URL
  useEffect(() => {
    if (task) setUrl(task.submissionUrl || '');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-md p-6 bg-white rounded-xl shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Attach Deliverable Link</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Task: <span className="font-semibold">{task.title}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Project / File URL</label>
            <input
              type="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://figma.com/... or https://github.com/..."
              className="w-full px-3 py-2 mt-1 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
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
              disabled={isLoading || !url.trim()}
              className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition ${
                isLoading || !url.trim() ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isLoading ? 'Saving...' : 'Save Link'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};