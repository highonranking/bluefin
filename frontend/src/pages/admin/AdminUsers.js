import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../../components/Navbar';

const API_URL = process.env.REACT_APP_API_URL || 'https://bluefin-6dzk.onrender.com/api';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userPayments, setUserPayments] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/users`);
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetails = async (userId) => {
    try {
      const response = await axios.get(`${API_URL}/admin/users/${userId}`);
      setSelectedUser(response.data.user);
      setUserPayments(response.data.payments);
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
        <Navbar isAdmin={true} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      <Navbar isAdmin={true} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Manage Users</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Users List */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Plan Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {user.name}
                          </div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{user.phone}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {user.activePlan?.planId ? (
                            <span
                              className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                                user.activePlan.status
                              )}`}
                            >
                              {user.activePlan.status.toUpperCase()}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-500">No plan</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => fetchUserDetails(user._id)}
                            className="text-primary-600 hover:text-primary-800"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* User Details Sidebar */}
          {selectedUser && (
            <div className="lg:col-span-1">
              <div className="card sticky top-4">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-bold text-gray-800">User Details</h2>
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-700">Name</h3>
                    <p className="text-gray-900">{selectedUser.name}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700">Email</h3>
                    <p className="text-gray-900">{selectedUser.email}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700">Phone</h3>
                    <p className="text-gray-900">{selectedUser.phone}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700">Address</h3>
                    <p className="text-gray-900">{selectedUser.address}</p>
                  </div>
                  {selectedUser.activePlan?.planId && (
                    <div>
                      <h3 className="font-semibold text-gray-700">Active Plan</h3>
                      <p className="text-gray-900">{selectedUser.activePlan.planId.name}</p>
                      <p className="text-sm text-gray-600">
                        {selectedUser.activePlan.startDate &&
                          `Started: ${new Date(selectedUser.activePlan.startDate).toLocaleDateString()}`}
                      </p>
                      <p className="text-sm text-gray-600">
                        {selectedUser.activePlan.endDate &&
                          `Expires: ${new Date(selectedUser.activePlan.endDate).toLocaleDateString()}`}
                      </p>
                    </div>
                  )}
                  {userPayments.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-700 mb-2">Payment History</h3>
                      <div className="space-y-2">
                        {userPayments.map((payment) => (
                          <div
                            key={payment._id}
                            className="bg-gray-50 p-2 rounded text-sm"
                          >
                            <div className="flex justify-between">
                              <span>{payment.planId?.name}</span>
                              <span className={`px-2 py-1 rounded text-xs ${getStatusColor(payment.status)}`}>
                                {payment.status}
                              </span>
                            </div>
                            <div className="text-gray-600">₹{payment.amount}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;

