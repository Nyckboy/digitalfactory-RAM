import { useState, useEffect } from 'react';
import { adminService } from '../../lib/adminApi';
import type { ProjectDTO, UserDTO } from '../../types/api';

interface EditProjectModalProps {
  isOpen: boolean;
  project: ProjectDTO | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const EditProjectModal = ({ isOpen, project, onClose, onSuccess }: EditProjectModalProps) => {
  const [formData, setFormData] = useState({
    title: '',
    status: 'DRAFT',
    supervisorId: '',
    internIds: [] as string[],
  });

  const [supervisors, setSupervisors] = useState<UserDTO[]>([]);
  const [interns, setInterns] = useState<UserDTO[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      adminService.getUsers(0, 100).then(res => {
        setSupervisors(res.content.filter(u => u.role === 'SUPERVISOR'));
        setInterns(res.content.filter(u => u.role === 'INTERN'));
      }).catch(console.error);
    }
  }, [isOpen]);

  useEffect(() => {
    if (project && isOpen) {
      setFormData({
        title: project.title,
        status: project.status,
        supervisorId: project.supervisor.id,
        internIds: project.interns.map(i => i.id),
      });
    }
  }, [project, isOpen]);

  if (!isOpen || !project) return null;

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
    setIsLoading(true);

    try {
      await adminService.updateProject(project.id, formData);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update project.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-lg p-6 bg-white rounded-xl shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Edit Project</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-gray-700">Project Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 mt-1 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              value={formData.status}
              onChange={e => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 mt-1 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            >
              <option value="DRAFT">Draft</option>
              <option value="ACTIVE">Active</option>
              <option value="ON_HOLD">On Hold</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Supervisor</label>
            <select
              value={formData.supervisorId}
              onChange={e => setFormData({ ...formData, supervisorId: e.target.value })}
              className="w-full px-3 py-2 mt-1 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            >
              <option value="" disabled>Select Supervisor</option>
              {supervisors.map(sup => (
                <option key={sup.id} value={sup.id}>{sup.firstName} {sup.lastName}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Assign Interns</label>
            <div className="max-h-40 overflow-y-auto border rounded-lg p-2 space-y-2 bg-gray-50">
              {interns.map(intern => (
                <label key={intern.id} className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.internIds.includes(intern.id)}
                    onChange={() => handleInternToggle(intern.id)}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">{intern.firstName} {intern.lastName}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
            <button type="submit" disabled={isLoading} className={`px-4 py-2 text-sm font-medium text-white rounded-lg ${isLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}>
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};