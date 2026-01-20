import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const API_URL = process.env.REACT_APP_API_URL || 'https://bluefin-6dzk.onrender.com/api';

const PlanDetails = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchPlan = async () => {
    try {
      const response = await axios.get(`${API_URL}/plans/${id}`);
      setPlan(response.data);
    } catch (error) {
      console.error('Error fetching plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate(`/payment/${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
        <Navbar />
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">Plan not found.</p>
          <Link to="/plans" className="text-primary-600 hover:underline mt-4 inline-block">
            Back to Plans
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex flex-col">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          to="/plans"
          className="text-primary-600 hover:underline mb-6 inline-block"
        >
          ← Back to Plans
        </Link>

        <div className="card">
          <div className="text-center mb-8">
            <div className="inline-block bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              {plan.speed}
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-4">{plan.name}</h1>
            <p className="text-lg text-gray-600 mb-6">{plan.description}</p>
            <div className="mb-6">
              <span className="text-5xl font-bold text-primary-600">₹{plan.price}</span>
              <span className="text-gray-600 text-xl">/{plan.validity} days</span>
            </div>
          </div>

          {plan.features && plan.features.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Features</h2>
              <ul className="space-y-3">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start">
                    <svg className="w-6 h-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700 text-lg">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="border-t pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <button onClick={handleApply} className="btn-primary flex-1 text-lg py-3">
                Apply for This Plan
              </button>
              <Link to="/plans" className="btn-secondary flex-1 text-center text-lg py-3">
                View Other Plans
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PlanDetails;

