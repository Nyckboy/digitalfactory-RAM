import { useState, useEffect } from 'react';
import { adminService } from '../../lib/adminApi';
import type { UserDTO } from '../../types/api';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateProjectModal = ({ isOpen, onClose, onSuccess }: CreateProjectModalProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    supervisorId: '',
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
          setSupervisors(allUsers.filter(u => u.role === 'SUPERVISOR' && u.isActive));
          setInterns(allUsers.filter(u => u.role === 'INTERN' && u.isActive));
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
    setFormData(prev => ({
      ...prev,
      internIds: prev.internIds.includes(internId)
        ? prev.internIds.filter(id => id !== internId)
        : [...prev.internIds, internId]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.supervisorId || formData.internIds.length === 0) {
      setError("Please select a supervisor and at least one intern.");
      return;
    }

    setIsLoading(true);
    try {
      await adminService.createProject(formData);
      onSuccess();
      onClose();
      setFormData({ title: '', description: '', supervisorId: '', internIds: [] });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create project.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg p-6 bg-surface-container-lowest border border-surface-container-highest rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto font-sans">
        
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-on-surface">Create New Project</h2>
          <button onClick={onClose} className="text-secondary hover:text-on-surface transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {isFetchingUsers ? (
          <div className="py-10 text-center text-sm text-secondary">Loading available users...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 text-sm text-error bg-error-container rounded-md border border-outline-variant">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">Project Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-3 border border-outline-variant rounded-lg bg-[#F1F3F5] text-on-surface focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-colors text-sm"
                placeholder="e.g., Spring Boot API Migration"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">Description</label>
              <textarea
                required
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-3 border border-outline-variant rounded-lg bg-[#F1F3F5] text-on-surface focus:ring-1 focus:ring-primary focus:border-primary outline-none resize-none transition-colors text-sm"
                placeholder="Briefly describe the project goals..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">Assign Supervisor</label>
              <select
                required
                value={formData.supervisorId}
                onChange={(e) => setFormData({ ...formData, supervisorId: e.target.value })}
                className="w-full px-3 py-3 border border-outline-variant rounded-lg bg-[#F1F3F5] text-on-surface focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-colors text-sm"
              >
                <option value="" disabled>Select a supervisor</option>
                {supervisors.map(sup => (
                  <option key={sup.id} value={sup.id}>{sup.firstName} {sup.lastName}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface mb-2">Assign Interns</label>
              <div className="max-h-40 overflow-y-auto border border-outline-variant rounded-lg p-2 space-y-1 bg-[#F1F3F5]">
                {interns.length === 0 ? (
                  <p className="text-sm text-secondary p-2">No active interns found.</p>
                ) : (
                  interns.map(intern => (
                    <label key={intern.id} className="flex items-center space-x-3 p-2 hover:bg-surface-container-highest rounded cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={formData.internIds.includes(intern.id)}
                        onChange={() => handleInternToggle(intern.id)}
                        className="w-4 h-4 text-primary bg-surface-container-lowest border-outline-variant rounded"
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
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-secondary hover:text-on-surface transition">
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || supervisors.length === 0 || interns.length === 0}
                className={`px-6 py-2 text-sm font-medium text-on-primary rounded-lg shadow-sm transition-colors ${
                  (isLoading || supervisors.length === 0 || interns.length === 0) 
                    ? 'bg-primary-container/70 cursor-not-allowed' 
                    : 'bg-primary-container hover:bg-primary'
                }`}
              >
                {isLoading ? 'Creating...' : 'Create Project'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};