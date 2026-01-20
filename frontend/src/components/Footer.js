import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://bluefin-6dzk.onrender.com/api';

const Footer = () => {
  const { isAuthenticated } = useAuth();
  const [contactInfo, setContactInfo] = useState(null);

  useEffect(() => {
    fetchContactInfo();
  }, []);

  const fetchContactInfo = async () => {
    try {
      const response = await axios.get(`${API_URL}/contact`);
      setContactInfo(response.data);
    } catch (error) {
      console.error('Error fetching contact info:', error);
    }
  };

  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-2xl font-bold mb-4">BlueFin ISP</h3>
            <p className="text-gray-400 text-sm">
              High-speed internet services for your home and business. Fast, reliable, and affordable.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/plans" className="text-gray-400 hover:text-white transition-colors">
                  Plans & Pricing
                </Link>
              </li>
              {isAuthenticated && (
                <>
                  <li>
                    <Link to="/dashboard" className="text-gray-400 hover:text-white transition-colors">
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link to="/speed-test" className="text-gray-400 hover:text-white transition-colors">
                      Speed Test
                    </Link>
                  </li>
                  <li>
                    <Link to="/support" className="text-gray-400 hover:text-white transition-colors">
                      Support
                    </Link>
                  </li>
                </>
              )}
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>24/7 Customer Support</li>
              <li>Technical Assistance</li>
              <li>Billing Help</li>
              <li>FAQ</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>📞 {contactInfo?.phone || '+1 (555) 123-4567'}</li>
              <li>✉️ {contactInfo?.email || 'support@bluefinisp.com'}</li>
              <li>📍 {contactInfo?.address || '123 Internet Street'}</li>
              <li>🌐 {contactInfo?.website || 'www.bluefinisp.com'}</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} {contactInfo?.companyName || 'BlueFin ISP'}. All rights reserved.
          </p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <button type="button" className="text-gray-400 hover:text-white transition-colors text-sm">
              Privacy Policy
            </button>
            <button type="button" className="text-gray-400 hover:text-white transition-colors text-sm">
              Terms of Service
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
