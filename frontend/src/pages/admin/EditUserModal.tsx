import { useState, useEffect } from 'react';
import { adminService } from '../../lib/adminApi';
import type { UserDTO } from '../../types/api';
import type { UserRole } from '../../types/auth';

interface EditUserModalProps {
  isOpen: boolean;
  user: UserDTO | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const EditUserModal = ({ isOpen, user, onClose, onSuccess }: EditUserModalProps) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    role: 'SUPERVISOR' as UserRole,
    isActive: true,
  });
  
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user && isOpen) {
      setFormData({ firstName: user.firstName, lastName: user.lastName, role: user.role, isActive: user.isActive });
    }
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await adminService.updateUser(user.id, formData);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update user.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md p-6 bg-surface-container-lowest border border-surface-container-highest rounded-xl shadow-2xl font-sans">
        
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-on-surface">Edit User</h2>
          <button onClick={onClose} className="text-secondary hover:text-on-surface transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <div className="p-3 text-sm text-error bg-error-container rounded-md border border-outline-variant">{error}</div>}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">First Name</label>
              <input type="text" required value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} className="w-full px-3 py-3 border border-outline-variant rounded-lg bg-[#F1F3F5] text-on-surface focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-colors text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">Last Name</label>
              <input type="text" required value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} className="w-full px-3 py-3 border border-outline-variant rounded-lg bg-[#F1F3F5] text-on-surface focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-colors text-sm" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1">Role</label>
            <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value as UserRole })} className="w-full px-3 py-3 border border-outline-variant rounded-lg bg-[#F1F3F5] text-on-surface focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-colors text-sm">
              <option value="SUPERVISOR">Supervisor</option>
              <option value="INTERN">Intern</option>
            </select>
          </div>

          <div className="flex items-center gap-3 mt-4">
            <input type="checkbox" id="isActive" checked={formData.isActive} onChange={e => setFormData({ ...formData, isActive: e.target.checked })} className="w-4 h-4 text-primary bg-surface-container-lowest border-outline-variant rounded focus:ring-primary" />
            <label htmlFor="isActive" className="text-sm font-medium text-on-surface">Account is Active</label>
          </div>

          <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-surface-container-highest">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-secondary hover:text-on-surface transition">Cancel</button>
            <button type="submit" disabled={isLoading} className={`px-6 py-2 text-sm font-medium text-on-primary rounded-lg shadow-sm transition-colors ${isLoading ? 'bg-primary-container/70 cursor-not-allowed' : 'bg-primary-container hover:bg-primary'}`}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};