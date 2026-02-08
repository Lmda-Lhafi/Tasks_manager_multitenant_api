// Task.jsx
import React, { useState, useEffect } from "react";
import api from "../api/client";
import { useRole } from "../hooks/Userole";

export default function Task({ userinfo }) {
  const persistedUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch (e) {
      return null;
    }
  })();
  const effectiveUser = userinfo || persistedUser;
  const { isAdmin } = useRole(effectiveUser?.role);

  // States
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showModal, setShowModal] = useState(false);
  // track status-updating state to avoid blocking the whole UI while a status patch is in progress
  const [statusUpdatingIds, setStatusUpdatingIds] = useState([]);
  
  // Form states
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("todo");
  const [selectedUsers, setSelectedUsers] = useState([]);

  // Fetch tasks
  const loadTasks = async () => {
    if (!effectiveUser) return;
    setLoading(true);
    try {
      const endpoint = isAdmin ? "/task" : "/task/me";
      const res = await api.get(endpoint);
      setTasks(res.data.tasks || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  // Fetch users (admin only)
  const loadUsers = async () => {
    if (!effectiveUser || !isAdmin) return;
    try {
      const res = await api.get("/user");
      // keep only active and not deleted users for assignment
      setUsers(
        (res.data.users || []).filter(u => u !== null && u !== undefined && (u.isActive === undefined || u.isActive) && !u.isDeleted)
      );
    } catch (err) {
      console.error("Failed to load users");
    }
  };

  // Create or update task
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const data = { title, description, status, assignedUsers: selectedUsers };
      
      if (editingId) {
        await api.put(`/task/${editingId}`, data);
        setSuccess("Task updated!");
      } else {
        await api.post("/task", data);
        setSuccess("Task created!");
      }
      
      closeModal();
      loadTasks();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save task");
    } finally {
      setLoading(false);
    }
  };

  // Delete task
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this task?")) return;
    
    setLoading(true);
    try {
      await api.delete(`/task/${id}`);
      setSuccess("Task deleted!");
      loadTasks();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete task");
    } finally {
      setLoading(false);
    }
  };

  // Open modal for create
  const openCreate = () => {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setStatus("todo");
    setSelectedUsers([]);
    setShowModal(true);
  };

  // Open modal for edit
  const openEdit = (task) => {
    setEditingId(task._id || task.id);
    setTitle(task.title);
    setDescription(task.description || "");
    setStatus(task.status);
    setSelectedUsers(task.assignedUsers?.map(u => u._id || u.id || u) || []);
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setTitle("");
    setDescription("");
    setStatus("todo");
    setSelectedUsers([]);
  };

  // Toggle user selection
  const toggleUser = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const addStatusUpdating = (id) =>
    setStatusUpdatingIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  const removeStatusUpdating = (id) =>
    setStatusUpdatingIds((prev) => prev.filter((x) => x !== id));
    
  const handleStatusChange = async (taskId, newStatus) => {
    if (!taskId || !newStatus) return;
    addStatusUpdating(taskId);
    setError("");
    setSuccess("");
    try {
      const res = await api.patch(`/task/${taskId}/status`, { status: newStatus });
      if (res.status === 200 && res.data?.task) {
        // update task in-place
        setTasks((prev) => prev.map((t) => ((t._id || t.id) === taskId ? res.data.task : t)));
        setSuccess("Status updated successfully");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update status");
    } finally {
      removeStatusUpdating(taskId);
    }
  };
  
  // Load data on mount - ONLY ONCE
  useEffect(() => {
    loadTasks();
    loadUsers();
  }, []); // Empty dependencies = run once on mount

  if (!effectiveUser) {
    return (
      <div className="task-container">
        <h2>Please login to view tasks</h2>
      </div>
    );
  }

  return (
    <div className="task-container">
      <h1>Tasks</h1>

      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}

      {isAdmin && (
        <button onClick={openCreate} className="create-button">
          Create Task
        </button>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="tasks-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Description</th>
              <th>Status</th>
              <th>Assigned</th>
              <th>Created By</th>
              {isAdmin && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {tasks.map(task => (
              <tr key={task._id || task.id}>
                <td>{task.title}</td>
                <td>{task.description || "—"}</td>
                <td>
                  {isAdmin ? (
                    task.status
                  ) : (
                    <select
                      value={task.status}
                      onChange={(e) =>
                        handleStatusChange(task._id || task.id, e.target.value)
                      }
                      disabled={statusUpdatingIds.includes(task._id || task.id)}
                    >
                      <option value="todo">To Do</option>
                      <option value="in-progress">In Progress</option>
                      <option value="done">Done</option>
                    </select>
                  )}
                </td>
                <td>
                  {(() => {
                    const list = task.assignedUsers || [];
                    const names = list
                      .map(u => {
                        if (!u) return "";
                        if (typeof u === "object") return u.name || u.email || u._id || u.id;
                        return u;
                      })
                      .filter(Boolean);
                    return names.length ? names.join(", ") : "None";
                  })()}
                </td>
                <td>{task.createdBy?.name || task.createdBy?.email || (task.createdBy?._id || task.createdBy?.id) || "N/A"}</td>
                {isAdmin && (
                  <td>
                    <button onClick={() => openEdit(task)}>Edit</button>
                    <button onClick={() => handleDelete(task._id || task.id)}>
                      Delete
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <button className="close" onClick={closeModal}>×</button>
            <h2>{editingId ? "Edit Task" : "Create Task"}</h2>
            
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
              />
              
              <textarea
                placeholder="Description"
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
              
              <select value={status} onChange={e => setStatus(e.target.value)}>
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>

              <div className="user-list">
                <p>Assign to:</p>
                {users
                  .filter(u => (u.isActive === undefined || u.isActive) && !u.isDeleted)
                  .map(user => (
                    <label key={user._id || user.id}>
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user._id || user.id)}
                        onChange={() => toggleUser(user._id || user.id)}
                      />
                      {user.name || user.email}
                    </label>
                  ))}

              </div>

              <button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}