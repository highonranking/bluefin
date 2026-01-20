import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const API_URL = process.env.REACT_APP_API_URL || 'https://bluefin-6dzk.onrender.com/api';

const Payment = () => {
  const { planId } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [screenshot, setScreenshot] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchPlan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planId]);

  const fetchPlan = async () => {
    try {
      const response = await axios.get(`${API_URL}/plans/${planId}`);
      setPlan(response.data);
    } catch (error) {
      console.error('Error fetching plan:', error);
      navigate('/plans');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setScreenshot(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!screenshot) {
      setError('Please upload payment screenshot');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('screenshot', screenshot);
    formData.append('planId', planId);

    try {
      await axios.post(`${API_URL}/payments/submit`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.message || 'Payment submission failed');
    } finally {
      setLoading(false);
    }
  };

  if (!plan) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex flex-col">
      <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex flex-col">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Complete Your Payment
        </h1>

        <div className="card mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Plan Details</h2>
          <div className="space-y-2">
            <p><span className="font-medium">Plan:</span> {plan.name}</p>
            <p><span className="font-medium">Speed:</span> {plan.speed}</p>
            <p><span className="font-medium">Validity:</span> {plan.validity} days</p>
            <p><span className="font-medium">Amount:</span> ₹{plan.price}</p>
          </div>
        </div>

        <div className="card mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Payment Instructions</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Scan the QR code below using your UPI app</li>
            <li>Pay the amount: ₹{plan.price}</li>
            <li>Take a screenshot of the payment confirmation</li>
            <li>Upload the screenshot below</li>
          </ol>

          <div className="mt-6 p-6 bg-gray-50 rounded-lg text-center">
            <div className="inline-block p-4 bg-white rounded-lg">
              {/* Static UPI QR Code - Replace with actual QR code image */}
              <div className="w-64 h-64 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-4">
                <div className="text-center text-gray-500">
                  <svg className="w-32 h-32 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a2 2 0 012-2h4a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm">UPI QR Code</p>
                  <p className="text-xs mt-1">bluefin@paytm</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">Scan to Pay ₹{plan.price}</p>
            </div>
          </div>
        </div>

        {success ? (
          <div className="card bg-green-50 border border-green-200">
            <div className="text-center">
              <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <h3 className="text-xl font-semibold text-green-800 mb-2">Payment Submitted!</h3>
              <p className="text-green-700">Your payment is under review. Redirecting to dashboard...</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="card">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Upload Payment Screenshot</h2>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Screenshot
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="input-field"
                required
              />
              {preview && (
                <div className="mt-4">
                  <img
                    src={preview}
                    alt="Preview"
                    className="max-w-full h-auto rounded-lg border border-gray-300"
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !screenshot}
              className="btn-primary w-full"
            >
              {loading ? 'Submitting...' : 'Submit Payment'}
            </button>
          </form>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Payment;

