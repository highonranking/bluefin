import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/LoadingSpinner';

const API_URL = process.env.REACT_APP_API_URL || 'https://bluefin-6dzk.onrender.com/api';

const UsageGraph = () => {
  const [usageData, setUsageData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30'); // days

  useEffect(() => {
    fetchUsageData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRange]);

  const fetchUsageData = async () => {
    try {
      const response = await axios.get(`${API_URL}/usage/history`);
      const days = parseInt(timeRange);
      const filtered = response.data
        .filter((item) => {
          const itemDate = new Date(item.date);
          const cutoffDate = new Date();
          cutoffDate.setDate(cutoffDate.getDate() - days);
          return itemDate >= cutoffDate;
        })
        .sort((a, b) => new Date(a.date) - new Date(b.date));

      setUsageData(filtered);
    } catch (error) {
      console.error('Error fetching usage data:', error);
    } finally {
      setLoading(false);
    }
  };

  const maxSpeed = Math.max(
    ...usageData.map((d) => Math.max(d.downloadSpeed || 0, d.uploadSpeed || 0)),
    100
  );

  const getBarHeight = (speed) => {
    return (speed / maxSpeed) * 100;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 flex flex-col">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh] flex-1">
          <LoadingSpinner size="lg" text="Loading usage data..." />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 flex flex-col">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1">
        <div className="mb-8 animate-fadeIn">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-5xl font-bold gradient-text mb-2">Usage Analytics</h1>
              <p className="text-gray-600 text-lg">Track your internet speed over time</p>
            </div>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="input-field w-auto"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </select>
          </div>
        </div>

        {usageData.length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-5xl mb-4">📊</div>
            <p className="text-gray-600 text-lg">No usage data available</p>
            <p className="text-gray-500 mt-2">Run speed tests to see your usage analytics</p>
          </div>
        ) : (
          <div className="card animate-fadeIn">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Speed History</h2>
            <div className="h-96 flex items-end justify-between gap-2">
              {usageData.map((data, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center group">
                  <div className="w-full flex flex-col items-center justify-end h-full">
                    <div className="w-full flex gap-1 justify-center mb-2">
                      <div
                        className="bg-primary-500 rounded-t transition-all duration-300 hover:bg-primary-600 group-hover:opacity-90"
                        style={{
                          height: `${getBarHeight(data.downloadSpeed || 0)}%`,
                          width: '45%',
                        }}
                        title={`Download: ${data.downloadSpeed?.toFixed(2) || 0} Mbps`}
                      ></div>
                      <div
                        className="bg-green-500 rounded-t transition-all duration-300 hover:bg-green-600 group-hover:opacity-90"
                        style={{
                          height: `${getBarHeight(data.uploadSpeed || 0)}%`,
                          width: '45%',
                        }}
                        title={`Upload: ${data.uploadSpeed?.toFixed(2) || 0} Mbps`}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 transform -rotate-45 origin-top-left whitespace-nowrap">
                      {new Date(data.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-6 mt-6">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-primary-500 rounded"></div>
                <span className="text-sm text-gray-600">Download</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-sm text-gray-600">Upload</span>
              </div>
            </div>
          </div>
        )}

        {/* Statistics Summary */}
        {usageData.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Average Download</h3>
              <p className="text-3xl font-bold text-primary-600">
                {(
                  usageData.reduce((sum, d) => sum + (d.downloadSpeed || 0), 0) / usageData.length
                ).toFixed(2)}{' '}
                Mbps
              </p>
            </div>
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Average Upload</h3>
              <p className="text-3xl font-bold text-green-600">
                {(
                  usageData.reduce((sum, d) => sum + (d.uploadSpeed || 0), 0) / usageData.length
                ).toFixed(2)}{' '}
                Mbps
              </p>
            </div>
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Average Ping</h3>
              <p className="text-3xl font-bold text-gray-600">
                {(
                  usageData.reduce((sum, d) => sum + (d.ping || 0), 0) / usageData.length
                ).toFixed(0)}{' '}
                ms
              </p>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default UsageGraph;





