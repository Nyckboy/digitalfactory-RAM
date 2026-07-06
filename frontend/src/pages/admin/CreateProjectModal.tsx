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

  // State for populating the dropdowns
  const [supervisors, setSupervisors] = useState<UserDTO[]>([]);
  const [interns, setInterns] = useState<UserDTO[]>([]);
  
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingUsers, setIsFetchingUsers] = useState(false);

  // Fetch users when the modal opens so we can assign them to the project
  useEffect(() => {
    if (isOpen) {
      const fetchAvailableUsers = async () => {
        setIsFetchingUsers(true);
        try {
          // Fetching a larger page size (e.g., 100) to get all users for the dropdowns
          const response = await adminService.getUsers(0, 100);
          const allUsers = response.content;
          
          setSupervisors(allUsers.filter(u => u.role === 'SUPERVISOR' && u.isActive));
          setInterns(allUsers.filter(u => u.role === 'INTERN' && u.isActive));
        } catch (err) {
          console.error("Failed to load users for assignment", err);
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
    setFormData(prev => {
      const isSelected = prev.internIds.includes(internId);
      if (isSelected) {
        return { ...prev, internIds: prev.internIds.filter(id => id !== internId) };
      } else {
        return { ...prev, internIds: [...prev.internIds, internId] };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.supervisorId) {
      setError("Please select a supervisor.");
      return;
    }
    if (formData.internIds.length === 0) {
      setError("Please assign at least one intern.");
      return;
    }

    setIsLoading(true);

    try {
      await adminService.createProject(formData);
      onSuccess();
      onClose();
      
      // Reset form
      setFormData({ title: '', description: '', supervisorId: '', internIds: [] });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create project.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-lg p-6 bg-white rounded-xl shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Create New Project</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        {isFetchingUsers ? (
          <div className="py-10 text-center text-sm text-gray-500">Loading available users...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-200">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">Project Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 mt-1 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="e.g., React Native Weather App"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                required
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 mt-1 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                placeholder="Briefly describe the project goals..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Assign Supervisor</label>
              <select
                required
                value={formData.supervisorId}
                onChange={(e) => setFormData({ ...formData, supervisorId: e.target.value })}
                className="w-full px-3 py-2 mt-1 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              >
                <option value="" disabled>Select a supervisor</option>
                {supervisors.map(sup => (
                  <option key={sup.id} value={sup.id}>
                    {sup.firstName} {sup.lastName} ({sup.email})
                  </option>
                ))}
              </select>
              {supervisors.length === 0 && (
                <p className="text-xs text-red-500 mt-1">No active supervisors found. Please register one first.</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Assign Interns</label>
              <div className="max-h-40 overflow-y-auto border rounded-lg p-2 space-y-2 bg-gray-50">
                {interns.length === 0 ? (
                  <p className="text-sm text-gray-500 p-2">No active interns found.</p>
                ) : (
                  interns.map(intern => (
                    <label key={intern.id} className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.internIds.includes(intern.id)}
                        onChange={() => handleInternToggle(intern.id)}
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">
                        {intern.firstName} {intern.lastName} <span className="text-gray-400">({intern.email})</span>
                      </span>
                    </label>
                  ))
                )}
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
                disabled={isLoading || supervisors.length === 0 || interns.length === 0}
                className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition ${
                  (isLoading || supervisors.length === 0 || interns.length === 0) 
                    ? 'bg-blue-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
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