import React, { useState, useEffect } from 'react';
import { Edit2, Trash, X, Shield, RefreshCw } from 'lucide-react';
import { getAllUsersApi, updateUserApi, deleteUserApi } from '../../API/api';
import { useAuth } from '../../context/AuthContext';

const Users = () => {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ name: '', role: 'user' });
  const [saving, setSaving] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await getAllUsersApi();
      // Only show verified users in admin dashboard
      setUsers(data.filter((u) => u.isVerified === true));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenModal = (user) => {
    setEditingUser(user);
    setFormData({ name: user.name, role: user.role });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    setSaving(true);

    try {
      const { data } = await updateUserApi(editingUser._id, formData);
      setUsers(users.map((u) => (u._id === data._id ? data : u)));
      handleCloseModal();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      await deleteUserApi(id);
      setUsers(users.filter((u) => u._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const formatDate = (date) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  return (
    <div className="crud-page">
      <div className="page-header">
        <div className="header-text">
          <h1>Users</h1>
          <p className="text-secondary">Verified users who have confirmed their email and signed up.</p>
        </div>
        <button className="secondary" onClick={fetchUsers} disabled={loading}>
          <RefreshCw size={18} /> Refresh
        </button>
      </div>

      {error && (
        <div className="error-msg" style={{ marginBottom: '1rem' }}>{error}</div>
      )}

      <div className="glass-card table-section">
        {loading ? (
          <p style={{ padding: '2rem', textAlign: 'center' }}>Loading users...</p>
        ) : users.length === 0 ? (
          <p style={{ padding: '2rem', textAlign: 'center' }}>No users registered yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Verified</th>
                <th>Joined</th>
                {isAdmin && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>
                    <div className="user-td">
                      <div className="avatar-small">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} alt="" />
                      </div>
                      <div className="user-details">
                        <span className="user-name-cell">{user.name}</span>
                        <span className="user-email-cell">{user.email}</span>
                      </div>
                    </div>
                  </td>
                  <td>{user.phone || '—'}</td>
                  <td>
                    <span className="role-badge">
                      <Shield size={12} /> {user.role === 'admin' ? 'Admin' : 'User'}
                    </span>
                  </td>
                  <td>
                    <span className={`status-dot ${user.isVerified ? 'active' : 'inactive'}`}></span>
                    {user.isVerified ? 'Verified' : 'Pending'}
                  </td>
                  <td>{formatDate(user.createdAt)}</td>
                  {isAdmin && (
                    <td>
                      <div className="action-btns">
                        <button className="icon-btn-small" onClick={() => handleOpenModal(user)}>
                          <Edit2 size={16} />
                        </button>
                        <button className="delete-btn" onClick={() => handleDelete(user._id)}>
                          <Trash size={16} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && editingUser && (
        <div className="modal-overlay">
          <div className="modal-content modal-sm">
            <div className="modal-header">
              <h2>Edit User</h2>
              <button className="close-btn" onClick={handleCloseModal}><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit} className="crud-form">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email (read-only)</label>
                <input type="email" value={editingUser.email} disabled readOnly style={{ opacity: 0.6 }} />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="modal-footer">
                <button type="button" className="secondary" onClick={handleCloseModal}>Cancel</button>
                <button type="submit" className="primary" disabled={saving}>
                  {saving ? 'Saving...' : 'Save User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
