// User.jsx
import React, { useState, useEffect } from "react";
import api from "../api/client";
import { useRole } from "../hooks/Userole";

export default function User({ userinfo }) {
  // use userinfo prop or fallback to persisted user
  const persistedUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch (e) {
      return null;
    }
  })();
  const effectiveUser = userinfo || persistedUser;

  const currentUserId = effectiveUser?._id || effectiveUser?.id;

  const { isAdmin } = useRole(effectiveUser?.role);

  // States
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Invite modal states
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");

  // Accept invite states
  const [inviteToken, setInviteToken] = useState("");
  const [acceptPassword, setAcceptPassword] = useState("");

  // Fetch all users (admin only)
  const fetchUsers = async () => {
    if (!isAdmin) return;

    setLoading(true);
    setError("");
    try {
      const res = await api.get("/user");
      if (res.status === 200) {
        setUsers(res.data.users || res.data);
      }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  // Invite user (admin only)
  const handleInviteUser = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAdmin) {
      setError("Only admins can invite users");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await api.post("/user/invite", {
        email: inviteEmail,
      });
      if (res.status === 200 || res.status === 201) {
        setSuccess(
          `Invitation sent successfully! ${res.data.token ? "Token: " + res.data.token : ""}`,
        );
        setInviteEmail("");
        setShowInviteModal(false);
        fetchUsers();
      }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to send invitation");
    } finally {
      setLoading(false);
    }
  };

  // Toggle user active status (admin only)
  const handleToggleUserActive = async (userId, currentIsActive) => {
    if (!isAdmin) {
      setError("Only admins can update user status");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await api.patch(`/user/${userId}/status`, {
        isActive: !currentIsActive,
      });
      if (res.status === 200) {
        setSuccess("User status updated successfully!");
        fetchUsers();
      }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update user status");
    } finally {
      setLoading(false);
    }
  };

  // Soft delete user (admin only)
  const handleDeleteUser = async (userId) => {
    if (!isAdmin) {
      setError("Only admins can delete users");
      return;
    }

    // Confirm before deleting
    if (
      !window.confirm(
        "Are you sure you want to delete this user? This action will deactivate the user.",
      )
    ) {
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await api.patch(`/user/${userId}/status`, {
        isDeleted: true,
      });
      if (res.status === 200) {
        setSuccess("User deleted successfully!");
        fetchUsers();
      }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to delete user");
    } finally {
      setLoading(false);
    }
  };

  // Accept invitation (public - no login required)
  const handleAcceptInvite = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await api.post("/user/accept-invite", {
        token: inviteToken,
        password: acceptPassword,
      });
      if (res.status === 200 || res.status === 201) {
        setSuccess(
          "Invitation accepted successfully! You can now login with your credentials.",
        );
        setInviteToken("");
        setAcceptPassword("");

        // Optionally store the token and redirect to login
        if (res.data.token) {
          localStorage.setItem("token", res.data.token);
          // You might want to update the parent component state or redirect
        }
      }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to accept invitation");
    } finally {
      setLoading(false);
    }
  };

  // Load users on component mount (if admin)
  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  // If not authenticated, show message
  if (!effectiveUser) {
    return (
      <div className="user-container">
        <div className="not-authenticated">
          <h2>Authentication Required</h2>
          <p>Please login to access user management features.</p>
          
          {/* Accept Invitation Section for non-authenticated users */}
          <div className="accept-invite-section">
            <h3>Accept Invitation</h3>
            <p>
              If you received an invitation link, complete your registration below:
            </p>
            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">{success}</p>}
            <form onSubmit={handleAcceptInvite}>
              <div className="form-group">
                <label>Invitation Token:</label>
                <input
                  type="text"
                  value={inviteToken}
                  onChange={(e) => setInviteToken(e.target.value)}
                  required
                  placeholder="Enter your invitation token"
                />
              </div>

              <div className="form-group">
                <label>Password:</label>
                <input
                  type="password"
                  value={acceptPassword}
                  onChange={(e) => setAcceptPassword(e.target.value)}
                  required
                  placeholder="Create a password"
                />
              </div>

              <button type="submit" disabled={loading}>
                {loading ? "Processing..." : "Accept Invitation"}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="user-container">
      <h1>User Management</h1>

      {/* Error/Success messages */}
      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}

      {/* Admin only section */}
      {isAdmin ? (
        <>
          {/* Invite user button */}
          <div className="invite-section">
            <button
              type="button"
              onClick={() => setShowInviteModal(true)}
              className="invite-button"
            >
              Invite User
            </button>
          </div>

          {/* Users list */}
          <div className="users-list">
            <h2>All Users</h2>
            {loading ? (
              <p>Loading users...</p>
            ) : users.length > 0 ? (
              <table className="users-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Active</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => {
                    const userId = user._id || user.id;
                    const isSelf = String(userId) === String(currentUserId);
                    const cantModifySelf = isSelf && isAdmin;

                    return (
                      <tr key={userId}>
                        <td>{userId}</td>
                        <td>{user.email}</td>
                        <td>{user.role}</td>
                        <td>{user.isActive ? "Yes" : "No"}</td>
                        <td className="action-buttons">
                          <button
                            type="button"
                            onClick={() =>
                              handleToggleUserActive(userId, user.isActive)
                            }
                            disabled={
                              loading || user.isDeleted || cantModifySelf
                            }
                            className="status-button"
                          >
                            {cantModifySelf
                              ? "Cannot modify self"
                              : user.isActive
                                ? "Deactivate"
                                : "Activate"}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(userId)}
                            disabled={
                              loading || user.isDeleted || cantModifySelf
                            }
                            className="delete-button"
                          >
                            {cantModifySelf
                              ? "Cannot delete self"
                              : user.isDeleted
                                ? "Deleted"
                                : "Delete"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <p>No users found</p>
            )}
          </div>

          {/* Invite Modal */}
          {showInviteModal && (
            <div className="invite-modal">
              <div className="modal-content">
                <button
                  type="button"
                  className="close-button"
                  onClick={() => setShowInviteModal(false)}
                >
                  ×
                </button>

                <h2>Invite User</h2>
                <form onSubmit={handleInviteUser}>
                  <div className="form-group">
                    <label>Email:</label>
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      required
                      placeholder="user@example.com"
                    />
                  </div>

                  <button type="submit" disabled={loading}>
                    {loading ? "Sending..." : "Send Invite"}
                  </button>
                </form>
              </div>
            </div>
          )}
        </>
      ) : (
        /* Regular user view */
        <div className="user-view">
          <h2>Your Profile</h2>
          <div className="profile-info">
            <p>User ID: {effectiveUser?.id || effectiveUser?._id}</p>
            <p>Email: {effectiveUser?.email}</p>
            <p>Role: {effectiveUser?.role}</p>
          </div>

          {/* Accept Invitation Section */}
          <div className="accept-invite-section">
            <h3>Accept Invitation</h3>
            <p>
              If you received an invitation link, complete your registration below:
            </p>
            <form onSubmit={handleAcceptInvite}>
              <div className="form-group">
                <label>Invitation Token:</label>
                <input
                  type="text"
                  value={inviteToken}
                  onChange={(e) => setInviteToken(e.target.value)}
                  required
                  placeholder="Enter your invitation token"
                />
              </div>

              <div className="form-group">
                <label>Password:</label>
                <input
                  type="password"
                  value={acceptPassword}
                  onChange={(e) => setAcceptPassword(e.target.value)}
                  required
                  placeholder="Create a password"
                />
              </div>

              <button type="submit" disabled={loading}>
                {loading ? "Processing..." : "Accept Invitation"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}