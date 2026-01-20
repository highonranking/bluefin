import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Toast from '../components/Toast';
import LoadingSpinner from '../components/LoadingSpinner';

const API_URL = process.env.REACT_APP_API_URL || 'https://bluefin-6dzk.onrender.com/api';

const Support = () => {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    category: 'general',
    priority: 'medium',
  });
  const [replyMessage, setReplyMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [replying, setReplying] = useState(false);
  const [toast, setToast] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    if (selectedTicket) {
      fetchTicketDetails(selectedTicket._id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTicket?._id]);

  useEffect(() => {
    scrollToBottom();
  }, [selectedTicket?.replies]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchTickets = async () => {
    try {
      const response = await axios.get(`${API_URL}/support/tickets`);
      setTickets(response.data);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      setToast({ message: 'Failed to load tickets', type: 'error' });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/support/tickets`, formData);
      setToast({ message: 'Ticket created successfully!', type: 'success' });
      setFormData({ subject: '', message: '', category: 'general', priority: 'medium' });
      setShowForm(false);
      await fetchTickets();
      setSelectedTicket(response.data);
    } catch (error) {
      setToast({ message: 'Failed to create ticket', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async () => {
    if (!replyMessage.trim()) {
      setToast({ message: 'Please enter a reply message', type: 'warning' });
      return;
    }

    setReplying(true);
    try {
      const response = await axios.post(
        `${API_URL}/support/tickets/${selectedTicket._id}/reply`,
        { message: replyMessage }
      );
      setToast({ message: 'Reply sent successfully!', type: 'success' });
      setReplyMessage('');
      setSelectedTicket(response.data);
      fetchTickets(); // Refresh list to show updated status
    } catch (error) {
      setToast({ message: 'Failed to send reply', type: 'error' });
    } finally {
      setReplying(false);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 flex flex-col">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}

        <div className="flex justify-between items-center mb-8 animate-fadeIn">
          <div>
            <h1 className="text-5xl font-bold gradient-text mb-2">Support Center</h1>
            <p className="text-gray-600 text-lg">Get help with your internet service</p>
          </div>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setSelectedTicket(null);
            }}
            className="btn-primary"
          >
            {showForm ? 'Cancel' : '+ New Ticket'}
          </button>
        </div>

        {/* Create Ticket Form */}
        {showForm && (
          <div className="card mb-8 animate-slideIn">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Create Support Ticket</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                  className="input-field"
                  placeholder="Brief description of your issue"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                  className="input-field"
                  rows="5"
                  placeholder="Describe your issue in detail..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="input-field"
                  >
                    <option value="general">General</option>
                    <option value="technical">Technical</option>
                    <option value="billing">Billing</option>
                    <option value="complaint">Complaint</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="input-field"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? 'Creating...' : 'Submit Ticket'}
              </button>
            </form>
          </div>
        )}

        <div className={`grid grid-cols-1 gap-6 ${selectedTicket ? 'lg:grid-cols-3' : 'lg:grid-cols-1'}`}>
          {/* Tickets List */}
          <div className={selectedTicket ? 'lg:col-span-1' : 'lg:col-span-1'}>
            <div className="card animate-fadeIn">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Tickets</h2>
              {tickets.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📧</div>
                  <p className="text-gray-600 text-lg">No support tickets yet</p>
                  <p className="text-gray-500 mt-2">Create your first ticket to get help</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tickets.map((ticket) => (
                    <div
                      key={ticket._id}
                      onClick={() => {
                        setSelectedTicket(ticket);
                        setShowForm(false);
                      }}
                      className={`border-2 rounded-xl p-4 cursor-pointer transition-all duration-300 ${
                        selectedTicket?._id === ticket._id
                          ? 'border-primary-500 bg-primary-50 shadow-lg'
                          : 'border-gray-200 hover:border-primary-300 hover:shadow-md'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-gray-800 text-lg flex-1">{ticket.subject}</h3>
                        <span className={`badge ${getStatusColor(ticket.status)} ml-2`}>
                          {ticket.status.replace('-', ' ').toUpperCase()}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{ticket.message}</p>
                      <div className="flex justify-between items-center">
                        <div className="flex gap-3 text-xs">
                          <span className={`px-2 py-1 rounded-full font-semibold ${getPriorityColor(ticket.priority)}`}>
                            {ticket.priority.toUpperCase()}
                          </span>
                          <span className="text-gray-500 capitalize">{ticket.category}</span>
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
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Ticket Details & Chat */}
          {selectedTicket && (
            <div className="lg:col-span-2">
              <div className="card animate-slideIn flex flex-col h-[calc(100vh-250px)]">
                {/* Ticket Header */}
                <div className="border-b pb-4 mb-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800 mb-2">{selectedTicket.subject}</h2>
                      <div className="flex gap-2 flex-wrap">
                        <span className={`badge ${getStatusColor(selectedTicket.status)}`}>
                          {selectedTicket.status.replace('-', ' ').toUpperCase()}
                        </span>
                        <span className={`badge ${getPriorityColor(selectedTicket.priority)}`}>
                          {selectedTicket.priority.toUpperCase()}
                        </span>
                        <span className="badge badge-info capitalize">{selectedTicket.category}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedTicket(null)}
                      className="text-gray-500 hover:text-gray-700 text-xl"
                    >
                      ×
                    </button>
                  </div>
                  <div className="text-sm text-gray-600">
                    Created: {new Date(selectedTicket.createdAt).toLocaleString()}
                    {selectedTicket.resolvedAt && (
                      <span className="ml-4">
                        Resolved: {new Date(selectedTicket.resolvedAt).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Conversation Thread */}
                <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2">
                  {/* Original Message */}
                  <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-gray-400">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-semibold text-gray-800">You</div>
                      <span className="text-xs text-gray-500">
                        {new Date(selectedTicket.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-gray-700">{selectedTicket.message}</p>
                  </div>

                  {/* Replies */}
                  {selectedTicket.replies && selectedTicket.replies.length > 0 && (
                    <>
                      {selectedTicket.replies.map((reply, idx) => (
                        <div
                          key={idx}
                          className={`rounded-lg p-4 border-l-4 ${
                            reply.isAdmin
                              ? 'bg-primary-50 border-primary-500 ml-8'
                              : 'bg-gray-50 border-gray-400'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="font-semibold text-gray-800">
                              {reply.isAdmin ? (
                                <span className="text-primary-700">Admin</span>
                              ) : (
                                'You'
                              )}
                            </div>
                            <span className="text-xs text-gray-500">
                              {new Date(reply.repliedAt).toLocaleString()}
                            </span>
                          </div>
                          <p className={`${reply.isAdmin ? 'text-primary-800' : 'text-gray-700'}`}>
                            {reply.message}
                          </p>
                        </div>
                      ))}
                    </>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Reply Input */}
                {selectedTicket.status !== 'closed' && (
                  <div className="border-t pt-4">
                    <div className="flex gap-3">
                      <textarea
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        placeholder="Type your reply here..."
                        rows="3"
                        className="input-field flex-1"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && e.ctrlKey) {
                            handleReply();
                          }
                        }}
                      />
                      <button
                        onClick={handleReply}
                        disabled={replying || !replyMessage.trim()}
                        className="btn-primary self-end"
                      >
                        {replying ? 'Sending...' : 'Send'}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Press Ctrl+Enter to send quickly
                    </p>
                  </div>
                )}

                {selectedTicket.status === 'closed' && (
                  <div className="border-t pt-4">
                    <div className="bg-gray-100 rounded-lg p-4 text-center">
                      <p className="text-gray-600 font-medium">This ticket is closed</p>
                      <p className="text-sm text-gray-500 mt-1">
                        You can create a new ticket if you need further assistance
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Support;
