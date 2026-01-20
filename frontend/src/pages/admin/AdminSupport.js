import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import Toast from '../../components/Toast';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatCard from '../../components/StatCard';

const API_URL = process.env.REACT_APP_API_URL || 'https://bluefin-6dzk.onrender.com/api';

const AdminSupport = () => {
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replying, setReplying] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    category: 'all',
    search: '',
  });
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchData = async () => {
    try {
      // Build params object, excluding 'all' values
      const params = {};
      if (filters.status !== 'all') params.status = filters.status;
      if (filters.priority !== 'all') params.priority = filters.priority;
      if (filters.category !== 'all') params.category = filters.category;
      if (filters.search.trim()) params.search = filters.search;

      const [ticketsResponse, statsResponse] = await Promise.all([
        axios.get(`${API_URL}/support/admin/tickets`, { params }),
        axios.get(`${API_URL}/support/admin/stats`),
      ]);
      console.log('Tickets fetched:', ticketsResponse.data.length, ticketsResponse.data);
      setTickets(ticketsResponse.data);
      setStats(statsResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      setToast({ message: 'Failed to load tickets', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchTicketDetails = async (ticketId) => {
    try {
      const response = await axios.get(`${API_URL}/support/tickets/${ticketId}`);
      setSelectedTicket(response.data);
    } catch (error) {
      console.error('Error fetching ticket details:', error);
      setToast({ message: 'Failed to load ticket details', type: 'error' });
    }
  };

  const handleReply = async () => {
    if (!replyMessage.trim()) {
      setToast({ message: 'Please enter a reply message', type: 'warning' });
      return;
    }

    setReplying(true);
    try {
      await axios.post(`${API_URL}/support/admin/tickets/${selectedTicket._id}/reply`, {
        message: replyMessage,
      });
      setToast({ message: 'Reply sent successfully!', type: 'success' });
      setReplyMessage('');
      fetchTicketDetails(selectedTicket._id);
      fetchData();
    } catch (error) {
      setToast({ message: 'Failed to send reply', type: 'error' });
    } finally {
      setReplying(false);
    }
  };

  const handleStatusChange = async (status) => {
    try {
      await axios.put(`${API_URL}/support/admin/tickets/${selectedTicket._id}/status`, {
        status,
      });
      setToast({ message: `Ticket marked as ${status}`, type: 'success' });
      fetchTicketDetails(selectedTicket._id);
      fetchData();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update status';
      setToast({ message, type: 'error' });
    }
  };

  const handlePriorityChange = async (priority) => {
    try {
      await axios.put(`${API_URL}/support/admin/tickets/${selectedTicket._id}/priority`, {
        priority,
      });
      setToast({ message: 'Priority updated', type: 'success' });
      fetchTicketDetails(selectedTicket._id);
      fetchData();
    } catch (error) {
      setToast({ message: 'Failed to update priority', type: 'error' });
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      open: 'badge-info',
      'in-progress': 'badge-warning',
      resolved: 'badge-success',
      closed: 'badge-danger',
    };
    return colors[status] || 'badge-info';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'text-gray-600 bg-gray-100',
      medium: 'text-yellow-700 bg-yellow-100',
      high: 'text-orange-700 bg-orange-100',
      urgent: 'text-red-700 bg-red-100',
    };
    return colors[priority] || 'text-gray-600 bg-gray-100';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50">
        <Navbar isAdmin={true} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="lg" text="Loading support tickets..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50">
      <Navbar isAdmin={true} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}

        <div className="mb-8 animate-fadeIn">
          <h1 className="text-5xl font-bold gradient-text mb-2">Support Management</h1>
          <p className="text-gray-600 text-lg">Manage and respond to customer support tickets</p>
        </div>

        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8 animate-fadeIn">
            <StatCard title="Total" value={stats.total} icon="📋" color="primary" />
            <StatCard title="Open" value={stats.open} icon="🔓" color="primary" />
            <StatCard title="In Progress" value={stats.inProgress} icon="⚙️" color="warning" />
            <StatCard title="Resolved" value={stats.resolved} icon="✅" color="success" />
            <StatCard title="Closed" value={stats.closed} icon="🔒" color="danger" />
            <StatCard title="Urgent" value={stats.urgent} icon="🚨" color="danger" />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tickets List */}
          <div className="lg:col-span-2">
            <div className="card mb-6">
              <div className="flex flex-wrap gap-4 mb-6">
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="input-field flex-1 min-w-[150px]"
                >
                  <option value="all">All Status</option>
                  <option value="open">Open</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
                <select
                  value={filters.priority}
                  onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                  className="input-field flex-1 min-w-[150px]"
                >
                  <option value="all">All Priorities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="input-field flex-1 min-w-[150px]"
                >
                  <option value="all">All Categories</option>
                  <option value="technical">Technical</option>
                  <option value="billing">Billing</option>
                  <option value="general">General</option>
                  <option value="complaint">Complaint</option>
                </select>
                <input
                  type="text"
                  placeholder="Search tickets..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="input-field flex-1 min-w-[200px]"
                />
              </div>

              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {tickets.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-5xl mb-4">📭</div>
                    <p className="text-gray-600">No tickets found</p>
                  </div>
                ) : (
                  tickets.map((ticket) => (
                    <div
                      key={ticket._id}
                      onClick={() => fetchTicketDetails(ticket._id)}
                      className={`border-2 rounded-xl p-4 cursor-pointer transition-all duration-300 ${
                        selectedTicket?._id === ticket._id
                          ? 'border-primary-500 bg-primary-50 shadow-lg'
                          : 'border-gray-200 hover:border-primary-300 hover:shadow-md'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-gray-800 text-lg">{ticket.subject}</h3>
                        <span className={`badge ${getStatusColor(ticket.status)}`}>
                          {ticket.status.replace('-', ' ').toUpperCase()}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{ticket.message}</p>
                      <div className="flex justify-between items-center">
                        <div className="flex gap-4 text-xs text-gray-500">
                          <span className={`px-2 py-1 rounded-full font-semibold ${getPriorityColor(ticket.priority)}`}>
                            {ticket.priority.toUpperCase()}
                          </span>
                          <span className="capitalize">{ticket.category}</span>
                          <span>{ticket.userId?.name || 'Unknown'}</span>
                        </div>
                        <span className="text-xs text-gray-400">
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {ticket.replies && ticket.replies.length > 0 && (
                        <div className="mt-2 text-xs text-primary-600 font-medium">
                          {ticket.replies.length} {ticket.replies.length === 1 ? 'reply' : 'replies'}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Ticket Details & Reply Panel */}
          {selectedTicket && (
            <div className="lg:col-span-1">
              <div className="card sticky top-4 animate-slideIn">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold text-gray-800">Ticket Details</h2>
                  <button
                    onClick={() => setSelectedTicket(null)}
                    className="text-gray-500 hover:text-gray-700 text-xl"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Subject</label>
                    <p className="text-gray-800 font-medium">{selectedTicket.subject}</p>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-600">User</label>
                    <p className="text-gray-800">{selectedTicket.userId?.name}</p>
                    <p className="text-sm text-gray-600">{selectedTicket.userId?.email}</p>
                    <p className="text-sm text-gray-600">{selectedTicket.userId?.phone}</p>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-600">Message</label>
                    <p className="text-gray-800 bg-gray-50 p-3 rounded-lg">{selectedTicket.message}</p>
                  </div>

                  <div className="flex gap-2">
                    <span className={`badge ${getStatusColor(selectedTicket.status)}`}>
                      {selectedTicket.status.replace('-', ' ').toUpperCase()}
                    </span>
                    <span className={`badge ${getPriorityColor(selectedTicket.priority)}`}>
                      {selectedTicket.priority.toUpperCase()}
                    </span>
                    <span className="badge badge-info capitalize">{selectedTicket.category}</span>
                  </div>

                  {/* Replies Section */}
                  {selectedTicket.replies && selectedTicket.replies.length > 0 && (
                    <div>
                      <label className="text-sm font-semibold text-gray-600 mb-2 block">Conversation</label>
                      <div className="space-y-3 max-h-[200px] overflow-y-auto">
                        {selectedTicket.replies.map((reply, idx) => (
                          <div
                            key={idx}
                            className={`p-3 rounded-lg ${
                              reply.isAdmin
                                ? 'bg-primary-50 border-l-4 border-primary-500'
                                : 'bg-gray-50 border-l-4 border-gray-300'
                            }`}
                          >
                            <div className="flex justify-between items-start mb-1">
                              <span className="font-semibold text-sm">
                                {reply.isAdmin ? 'Admin' : reply.repliedBy?.name || 'User'}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(reply.repliedAt).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700">{reply.message}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Priority Change */}
                  <div>
                    <label className="text-sm font-semibold text-gray-600 mb-2 block">Priority</label>
                    <select
                      value={selectedTicket.priority}
                      onChange={(e) => handlePriorityChange(e.target.value)}
                      className="input-field"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>

                  {/* Status Change */}
                  <div>
                    <label className="text-sm font-semibold text-gray-600 mb-2 block">Status</label>
                    <select
                      value={selectedTicket.status}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      className="input-field"
                    >
                      <option value="open">Open</option>
                      <option value="in-progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                    {selectedTicket.status !== 'resolved' && selectedTicket.status !== 'closed' && (
                      <p className="text-xs text-gray-500 mt-1">
                        Note: You must reply before marking as resolved/closed
                      </p>
                    )}
                  </div>
                </div>

                {/* Reply Section */}
                <div className="border-t pt-4">
                  <label className="text-sm font-semibold text-gray-600 mb-2 block">Reply to Ticket</label>
                  <textarea
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Type your reply here..."
                    rows="4"
                    className="input-field mb-3"
                  />
                  <button
                    onClick={handleReply}
                    disabled={replying || !replyMessage.trim()}
                    className="btn-primary w-full"
                  >
                    {replying ? 'Sending...' : 'Send Reply'}
                  </button>
                  <p className="text-xs text-gray-500 mt-2">
                    Replying will automatically set status to "In Progress"
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSupport;

