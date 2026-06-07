import React, { useState } from 'react';
import { Plus, Edit2, Trash, X, Shield } from 'lucide-react';

const Users = () => {
  const [users, setUsers] = useState([
    { id: 1, name: 'Jane Cooper', email: 'jane.c@example.com', role: 'Admin', status: 'Active' },
    { id: 2, name: 'Robert Fox', email: 'robert.f@example.com', role: 'Editor', status: 'Inactive' },
    { id: 3, name: 'Esther Howard', email: 'esther.h@example.com', role: 'Viewer', status: 'Active' },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', role: 'Viewer', status: 'Active' });

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({ name: user.name, email: user.email, role: user.role, status: user.status });
    } else {
      setEditingUser(null);
      setFormData({ name: '', email: '', role: 'Viewer', status: 'Active' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingUser) {
      setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...formData } : u));
    } else {
      setUsers([...users, { id: Date.now(), ...formData }]);
    }
    handleCloseModal();
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(u => u.id !== id));
    }
  };

  return (
    <div className="crud-page">
      <div className="page-header">
        <div className="header-text">
          <h1>Users</h1>
          <p className="text-secondary">Manage administrative access and permissions.</p>
        </div>
        <button className="primary" onClick={() => handleOpenModal()}>
          <Plus size={20} /> Add User
        </button>
      </div>

      <div className="glass-card table-section">
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
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
                <td>
                  <span className="role-badge"><Shield size={12} /> {user.role}</span>
                </td>
                <td>
                  <span className={`status-dot ${user.status.toLowerCase()}`}></span>
                  {user.status}
                </td>
                <td>
                  <div className="action-btns">
                    <button className="icon-btn-small" onClick={() => handleOpenModal(user)}><Edit2 size={16} /></button>
                    <button className="delete-btn" onClick={() => handleDelete(user.id)}><Trash size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content modal-sm">
            <div className="modal-header">
              <h2>{editingUser ? 'Edit User' : 'Add New User'}</h2>
              <button className="close-btn" onClick={handleCloseModal}><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit} className="crud-form">
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. John Doe" required />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="john@example.com" required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Role</label>
                  <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
                    <option value="Admin">Admin</option>
                    <option value="Editor">Editor</option>
                    <option value="Viewer">Viewer</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="secondary" onClick={handleCloseModal}>Cancel</button>
                <button type="submit" className="primary">Save User</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
