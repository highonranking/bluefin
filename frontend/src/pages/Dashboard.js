import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';

const API_URL = process.env.REACT_APP_API_URL || 'https://bluefin-6dzk.onrender.com/api';

const Dashboard = () => {
  const [userData, setUserData] = useState(null);
  const [payments, setPayments] = useState([]);
  const [usageStats, setUsageStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (userData) {
      checkPlanExpiry();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData]);

  const fetchDashboardData = async () => {
    try {
      const [userResponse, paymentsResponse, statsResponse] = await Promise.all([
        axios.get(`${API_URL}/auth/me`),
        axios.get(`${API_URL}/payments/history`),
        axios.get(`${API_URL}/usage/stats`).catch(() => ({ data: null })),
      ]);
      setUserData(userResponse.data);
      setPayments(paymentsResponse.data);
      setUsageStats(statsResponse.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkPlanExpiry = () => {
    // Check if plan is expiring soon (within 7 days)
    if (userData?.activePlan?.endDate) {
      const endDate = new Date(userData.activePlan.endDate);
      const today = new Date();
      const daysRemaining = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
      
      if (daysRemaining > 0 && daysRemaining <= 7) {
        setToast({
          message: `Your plan expires in ${daysRemaining} days. Renew now to avoid interruption!`,
          type: 'warning',
          duration: 0, // Don't auto-close
        });
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
      case 'active':
        return 'badge-success';
      case 'pending':
        return 'badge-warning';
      case 'rejected':
      case 'expired':
        return 'badge-danger';
      default:
        return 'badge-info';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 flex flex-col">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh] flex-1">
          <LoadingSpinner size="lg" text="Loading dashboard..." />
        </div>
        <Footer />
      </div>
    );
  }

  const activePlan = userData?.activePlan;
  const daysRemaining = activePlan?.endDate
    ? Math.ceil((new Date(activePlan.endDate) - new Date()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 flex flex-col">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1">
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
            duration={toast.duration}
          />
        )}

        <div className="mb-8 animate-fadeIn">
          <h1 className="text-5xl font-bold gradient-text mb-2">
            Welcome back, {userData?.name}! 👋
          </h1>
          <p className="text-gray-600 text-lg">Here's your account overview</p>
        </div>

        {/* Plan Expiry Alert */}
        {activePlan?.planId && daysRemaining > 0 && daysRemaining <= 7 && (
          <div className="card bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 mb-8 animate-slideIn">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="text-4xl mr-4">⚠️</div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">Plan Expiring Soon!</h3>
                  <p className="text-gray-700">
                    Your plan expires in {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'}. Renew now to avoid service interruption.
                  </p>
                </div>
              </div>
              <Link to="/plans" className="btn-primary whitespace-nowrap">
                Renew Plan
              </Link>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        {usageStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fadeIn">
            <StatCard
              title="Data Used (30 days)"
              value={`${usageStats.totalDataUsed || 0} GB`}
              icon="📊"
              color="primary"
            />
            <StatCard
              title="Avg Download Speed"
              value={`${usageStats.avgDownloadSpeed || 0} Mbps`}
              icon="⬇️"
              color="success"
            />
            <StatCard
              title="Avg Upload Speed"
              value={`${usageStats.avgUploadSpeed || 0} Mbps`}
              icon="⬆️"
              color="warning"
            />
            <StatCard
              title="Speed Tests"
              value={usageStats.testCount || 0}
              icon="🚀"
              color="purple"
            />
          </div>
        )}

        {/* Active Plan Section */}
        <div className="card mb-8 animate-slideIn">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Active Plan</h2>
            {activePlan?.planId && (
              <Link to="/speed-test" className="btn-secondary text-sm">
                Test Speed
              </Link>
            )}
          </div>
          {activePlan?.planId && activePlan.status === 'active' ? (
            <div className="bg-gradient-to-r from-primary-500 to-primary-700 rounded-2xl p-8 text-white">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-3xl font-bold mb-2">{activePlan.planId.name}</h3>
                  <p className="text-white text-opacity-90 mb-1 text-lg">
                    ⚡ {activePlan.planId.speed}
                  </p>
                  <p className="text-white text-opacity-80">
                    {daysRemaining > 0
                      ? `⏰ ${daysRemaining} days remaining`
                      : '⏰ Plan expired'}
                  </p>
                  {daysRemaining > 0 && daysRemaining <= 30 && (
                    <div className="mt-4">
                      <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
                        <div
                          className="bg-white h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(daysRemaining / 30) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="mt-4 md:mt-0 text-right">
                  <span className={`badge badge-success bg-white text-primary-700 text-lg px-4 py-2`}>
                    {activePlan.status.toUpperCase()}
                  </span>
                  <div className="mt-4">
                    <Link to="/plans" className="btn-secondary bg-white text-primary-600 hover:bg-gray-100">
                      Upgrade Plan
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📡</div>
              <p className="text-gray-600 text-lg mb-4">No active plan</p>
              <Link to="/plans" className="btn-primary">
                Browse Plans
              </Link>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fadeIn">
          <Link
            to="/speed-test"
            className="card hover:scale-105 transition-transform duration-300 text-center group"
          >
            <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">🚀</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Speed Test</h3>
            <p className="text-gray-600">Test your internet speed</p>
          </Link>
          <Link
            to="/support"
            className="card hover:scale-105 transition-transform duration-300 text-center group"
          >
            <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">💬</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Support</h3>
            <p className="text-gray-600">Get help & support</p>
          </Link>
          <Link
            to="/plans"
            className="card hover:scale-105 transition-transform duration-300 text-center group"
          >
            <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">📦</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Plans</h3>
            <p className="text-gray-600">View all plans</p>
          </Link>
          <Link
            to="/usage"
            className="card hover:scale-105 transition-transform duration-300 text-center group"
          >
            <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">📊</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Usage Analytics</h3>
            <p className="text-gray-600">View speed history</p>
          </Link>
        </div>

        {/* Payment History */}
        <div className="card animate-slideIn">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Payment History</h2>
          {payments.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">💳</div>
              <p className="text-gray-600 text-lg">No payment history</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Plan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payments.map((payment) => (
                    <tr key={payment._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {payment.planId?.name || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">₹{payment.amount}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`badge ${getStatusColor(payment.status)}`}>
                          {payment.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(payment.submittedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;
