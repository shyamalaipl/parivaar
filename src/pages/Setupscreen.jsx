import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SetupScreen = () => {
  const [commId, setCommId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const saveCommId = async () => {
    if (!commId || isNaN(commId)) {
      alert('Please enter a valid Community ID');
      return;
    }

    setIsLoading(true);
    try {
      // Store as part of user object to match Gallery component
      const user = {
        Comm_Id: Number(commId)
      };
      localStorage.setItem('user', JSON.stringify(user));
      navigate('/gallery');
    } catch (error) {
      alert(`Error saving Community ID: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1A2B49] to-[#2C3E50] flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="bg-white/10 p-5 rounded-full inline-flex">
          <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-white">Welcome to Gallery</h1>
        <p className="text-white/80">Please enter your Community ID to continue</p>
        
        <div className="bg-white/10 rounded-xl border border-white/20">
          <div className="relative">
            <svg className="w-5 h-5 text-white/70 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
            </svg>
            <input
              type="number"
              value={commId}
              onChange={(e) => setCommId(e.target.value)}
              placeholder="Community ID"
              className="w-full bg-transparent text-white placeholder-white/80 py-4 pl-12 pr-4 rounded-xl focus:outline-none"
            />
          </div>
        </div>

        <button
          onClick={saveCommId}
          disabled={isLoading}
          className="w-full bg-white text-[#1A2B49] py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-colors disabled:opacity-50 flex items-center justify-center"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#1A2B49]"></div>
          ) : (
            'Continue'
          )}
        </button>
      </div>
    </div>
  );
};

export default SetupScreen;