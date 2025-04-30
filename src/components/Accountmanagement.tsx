import React, { useState, useEffect } from 'react';

interface User {
  name: string;
  email: string;
  phone: string;
  address: string;
}

const AccountManagement = () => {
  const [userData, setUserData] = useState<User | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Centralized token retrieval function
  const getToken = () => localStorage.getItem('token');

  // Fetch user data
  useEffect(() => {
    const token = getToken();
    if (!token) {
      setError('Token not found');
      return;
    }

    const fetchUserData = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/userInfo/user`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error('Failed to fetch user data');
        const data: User = await response.json();
        setUserData(data);
        setFormData({ ...formData, name: data.name, email: data.email });
      } catch (error) {
        setError(error instanceof Error ? error.message : 'An error occurred');
      }
    };

    fetchUserData();
  }, []);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission for updating account info
  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.name || !formData.email) {
      setError('Name and email are required.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/userInfo/user/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
        }),
      });
      if (!response.ok) throw new Error('Failed to update user data');
      const data: User = await response.json();
      setUserData(data);
      setEditMode(false);
      setSuccessMessage('Account updated successfully');
      setError(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    if (!formData.currentPassword || !formData.newPassword) {
      setError('Current and new password are required.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/userInfo/user/change-password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });
      if (!response.ok) throw new Error('Failed to change password');
      setFormData({ ...formData, currentPassword: '', newPassword: '', confirmPassword: '' });
      setSuccessMessage('Password updated successfully!');
      setError(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account?')) {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/userInfo/user/delete`, {
          method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete account');
        alert('Account deleted successfully');
        // Optionally, log out or redirect user
      } catch (error) {
        setError(error instanceof Error ? error.message : 'An error occurred');
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-6">
      <h1 className="text-3xl font-semibold text-center text-gray-800 mb-6">Account Management</h1>

      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      {successMessage && <p className="text-green-500 text-center mb-4">{successMessage}</p>}
      {loading && <p className="text-blue-500 text-center mb-4">Loading...</p>}

      {userData ? (
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Account Details</h2>
            {!editMode ? (
              <div className="text-gray-600">
                <p className="mb-2">Name: {userData.name}</p>
                <p className="mb-2">Email: {userData.email}</p>
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-500"
                  onClick={() => setEditMode(true)}
                >
                  Edit Details
                </button>
              </div>
            ) : (
              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name:</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email:</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="flex justify-between">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-500"
                    disabled={loading}
                  >
                    {loading ? 'Updating...' : 'Update Details'}
                  </button>
                  <button
                    type="button"
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200"
                    onClick={() => setEditMode(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Change Password</h2>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Current Password:</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">New Password:</label>
                <input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Confirm New Password:</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-500"
                disabled={loading}
              >
                {loading ? 'Changing Password...' : 'Change Password'}
              </button>
            </form>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Delete Account</h2>
            <button
              onClick={handleDeleteAccount}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-500"
              disabled={loading}
            >
              {loading ? 'Deleting...' : 'Delete Account'}
            </button>
          </div>
        </div>
      ) : (
        <p className="text-center text-gray-600">Loading user data...</p>
      )}
    </div>
  );
};

export default AccountManagement;
