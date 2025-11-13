import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { useAdminUsers } from '../hooks/useAdminUsers';
import { Shield, Coins, X, Save } from 'lucide-react';

type ModalType = 'role' | 'coins' | null;

interface ModalState {
  type: ModalType;
  userId: string;
  userName: string;
  currentRole?: string;
  currentCoins?: number;
}

export const AdminUserManagementPage = () => {
  const { role } = useAuth();
  const navigate = useNavigate();
  const { users, loading, error, changeUserRole, adjustUserCoins } = useAdminUsers();

  const [modalState, setModalState] = useState<ModalState | null>(null);
  const [selectedRole, setSelectedRole] = useState<'student' | 'teacher' | 'admin'>('student');
  const [coinAmount, setCoinAmount] = useState<number>(0);
  const [coinReason, setCoinReason] = useState<string>('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Security check
  if (role !== 'admin') {
    navigate('/');
    return null;
  }

  const openRoleModal = (userId: string, userName: string, currentRole: string) => {
    setModalState({ type: 'role', userId, userName, currentRole });
    setSelectedRole(currentRole as any);
    setActionError(null);
  };

  const openCoinsModal = (userId: string, userName: string, currentCoins: number) => {
    setModalState({ type: 'coins', userId, userName, currentCoins });
    setCoinAmount(0);
    setCoinReason('');
    setActionError(null);
  };

  const closeModal = () => {
    setModalState(null);
    setActionError(null);
  };

  const handleChangeRole = async () => {
    if (!modalState) return;

    try {
      setActionLoading(true);
      setActionError(null);

      const result = await changeUserRole(modalState.userId, selectedRole);

      if (result.success) {
        setSuccessMessage(`Role changed to ${selectedRole} for ${modalState.userName}`);
        setTimeout(() => setSuccessMessage(null), 3000);
        closeModal();
      } else {
        setActionError(result.error || 'Failed to change role');
      }
    } catch (err: any) {
      setActionError(err.message || 'An error occurred');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAdjustCoins = async () => {
    if (!modalState) return;

    if (!coinReason.trim()) {
      setActionError('Please provide a reason for the adjustment');
      return;
    }

    if (coinAmount === 0) {
      setActionError('Amount cannot be zero');
      return;
    }

    try {
      setActionLoading(true);
      setActionError(null);

      const result = await adjustUserCoins(modalState.userId, coinAmount, coinReason);

      if (result.success) {
        setSuccessMessage(
          `${coinAmount > 0 ? 'Added' : 'Removed'} ${Math.abs(coinAmount)} coins ${
            coinAmount > 0 ? 'to' : 'from'
          } ${modalState.userName}`
        );
        setTimeout(() => setSuccessMessage(null), 3000);
        closeModal();
      } else {
        setActionError(result.error || 'Failed to adjust coins');
      }
    } catch (err: any) {
      setActionError(err.message || 'An error occurred');
    } finally {
      setActionLoading(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-500/20 text-red-300 border-red-500/50';
      case 'teacher':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/50';
      case 'student':
        return 'bg-green-500/20 text-green-300 border-green-500/50';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/50';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return '👑';
      case 'teacher':
        return '👨‍🏫';
      case 'student':
        return '🎓';
      default:
        return '👤';
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-text-primary-dark mb-2">
              👥 User Management
            </h1>
            <p className="text-text-secondary-dark">
              Manage user roles and coin balances across your platform
            </p>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 bg-green-500/20 border border-green-500/50 rounded-lg p-4">
              <p className="text-green-300">{successMessage}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-500/20 border border-red-500/50 rounded-lg p-4">
              <p className="text-red-300">{error}</p>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-component-dark border border-border-dark rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary-dark text-sm">Total Users</p>
                  <p className="text-3xl font-bold text-text-primary-dark mt-1">
                    {loading ? '...' : users.length}
                  </p>
                </div>
                <div className="text-4xl">👥</div>
              </div>
            </div>

            <div className="bg-component-dark border border-border-dark rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary-dark text-sm">Students</p>
                  <p className="text-3xl font-bold text-text-primary-dark mt-1">
                    {loading ? '...' : users.filter((u) => u.role === 'student').length}
                  </p>
                </div>
                <div className="text-4xl">🎓</div>
              </div>
            </div>

            <div className="bg-component-dark border border-border-dark rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary-dark text-sm">Teachers</p>
                  <p className="text-3xl font-bold text-text-primary-dark mt-1">
                    {loading ? '...' : users.filter((u) => u.role === 'teacher').length}
                  </p>
                </div>
                <div className="text-4xl">👨‍🏫</div>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-component-dark border border-border-dark rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              {loading ? (
                <div className="p-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-4 text-text-secondary-dark">Loading users...</p>
                </div>
              ) : users.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="text-6xl mb-4">👥</div>
                  <h3 className="text-xl font-semibold text-text-primary-dark mb-2">
                    No Users Found
                  </h3>
                  <p className="text-text-secondary-dark">
                    There are no users in the system yet.
                  </p>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-border-dark">
                  <thead className="bg-background-dark">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary-dark uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary-dark uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary-dark uppercase tracking-wider">
                        Coins
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary-dark uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-dark">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-background-dark/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="text-2xl mr-3">{getRoleIcon(user.role)}</div>
                            <div>
                              <div className="text-sm font-medium text-text-primary-dark">
                                {user.full_name}
                              </div>
                              <div className="text-xs text-text-secondary-dark">
                                {user.id.substring(0, 8)}...
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 text-xs font-medium rounded-full border ${getRoleBadgeColor(
                              user.role
                            )}`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-yellow-500">
                            🪙 {user.total_coins.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openRoleModal(user.id, user.full_name, user.role)}
                              className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 px-3 py-1 rounded border border-blue-500/50 hover:bg-blue-500/10"
                              title="Change Role"
                            >
                              <Shield className="w-4 h-4" />
                              <span>Role</span>
                            </button>
                            <button
                              onClick={() =>
                                openCoinsModal(user.id, user.full_name, user.total_coins)
                              }
                              className="text-yellow-400 hover:text-yellow-300 transition-colors flex items-center gap-1 px-3 py-1 rounded border border-yellow-500/50 hover:bg-yellow-500/10"
                              title="Adjust Coins"
                            >
                              <Coins className="w-4 h-4" />
                              <span>Coins</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* User Count */}
          {!loading && users.length > 0 && (
            <div className="mt-4 text-sm text-text-secondary-dark">
              Total Users: {users.length}
            </div>
          )}
        </div>
      </div>

      {/* Modal Overlay */}
      {modalState && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-component-dark border border-border-dark rounded-lg max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-text-primary-dark">
                {modalState.type === 'role' ? '👑 Change User Role' : '🪙 Adjust Coins'}
              </h2>
              <button
                onClick={closeModal}
                className="text-text-secondary-dark hover:text-text-primary-dark"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* User Info */}
            <div className="mb-6 p-4 bg-background-dark rounded-lg border border-border-dark">
              <p className="text-sm text-text-secondary-dark mb-1">User:</p>
              <p className="text-lg font-semibold text-text-primary-dark">
                {modalState.userName}
              </p>
              {modalState.currentRole && (
                <p className="text-sm text-text-secondary-dark mt-1">
                  Current Role: <span className="text-primary">{modalState.currentRole}</span>
                </p>
              )}
              {modalState.currentCoins !== undefined && (
                <p className="text-sm text-text-secondary-dark mt-1">
                  Current Balance:{' '}
                  <span className="text-yellow-500">🪙 {modalState.currentCoins}</span>
                </p>
              )}
            </div>

            {/* Modal Content */}
            {modalState.type === 'role' ? (
              <div className="mb-6">
                <label className="block text-sm font-medium text-text-secondary-dark mb-2">
                  Select New Role
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as any)}
                  className="w-full px-4 py-2 bg-background-dark border border-border-dark rounded-lg text-text-primary-dark focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="student">🎓 Student</option>
                  <option value="teacher">👨‍🏫 Teacher</option>
                  <option value="admin">👑 Admin</option>
                </select>
              </div>
            ) : (
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-text-secondary-dark mb-2">
                    Amount
                  </label>
                  <input
                    type="number"
                    value={coinAmount === 0 ? '' : coinAmount}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCoinAmount(val === '' ? 0 : parseInt(val));
                    }}
                    placeholder="Type amount (e.g., 100 or -50)"
                    className="w-full px-4 py-2 bg-background-dark border border-border-dark rounded-lg text-text-primary-dark focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-text-secondary-dark">
                      💡 Tip: Type <span className="text-primary font-mono">-50</span> to subtract, or <span className="text-primary font-mono">100</span> to add
                    </p>
                  </div>
                  <p className="text-sm text-text-secondary-dark mt-2">
                    Current: <span className="text-yellow-500">🪙 {modalState.currentCoins}</span>
                    {' → '}
                    New: <span className={`font-bold ${modalState.currentCoins! + coinAmount < 0 ? 'text-red-400' : 'text-yellow-500'}`}>
                      🪙 {modalState.currentCoins! + coinAmount}
                    </span>
                    {coinAmount !== 0 && (
                      <span className={`ml-2 text-xs ${coinAmount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        ({coinAmount > 0 ? '+' : ''}{coinAmount})
                      </span>
                    )}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary-dark mb-2">
                    Reason (required)
                  </label>
                  <input
                    type="text"
                    value={coinReason}
                    onChange={(e) => setCoinReason(e.target.value)}
                    placeholder="e.g., Bonus for excellent work"
                    className="w-full px-4 py-2 bg-background-dark border border-border-dark rounded-lg text-text-primary-dark focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {/* Error Message */}
            {actionError && (
              <div className="mb-4 bg-red-500/20 border border-red-500/50 rounded-lg p-3">
                <p className="text-red-300 text-sm">{actionError}</p>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex gap-3">
              <button
                onClick={modalState.type === 'role' ? handleChangeRole : handleAdjustCoins}
                disabled={actionLoading}
                className="flex-1 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Confirm</span>
                  </>
                )}
              </button>
              <button
                onClick={closeModal}
                disabled={actionLoading}
                className="flex-1 bg-background-dark text-text-secondary-dark px-4 py-2 rounded-lg border border-border-dark hover:bg-component-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};
