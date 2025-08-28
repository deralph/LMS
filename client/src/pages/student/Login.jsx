// src/pages/Login.js
import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AppContext } from '../../context/AppContext';
import { toast } from 'react-toastify';

const Login = () => {
  const [userType, setUserType] = useState('student');
  const [formData, setFormData] = useState({
    matricNumber: '',
    staffId: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  
  const { setUserData, backendUrl } = useContext(AppContext);
  const navigate = useNavigate();

  const { matricNumber, staffId, password } = formData;

  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    
    try {
      let endpoint, credentials;
      
      if (userType === 'student') {
        endpoint = '/api/auth/login/student';
        credentials = { matricNumber, password };
      } else {
        endpoint = '/api/auth/login/educator';
        credentials = { staffId, password };
      }

      const res = await axios.post(`${backendUrl}${endpoint}`, credentials);
      
      // Save token to localStorage
      localStorage.setItem('token', res.data.token);
      
      // Set user data in context
      setUserData(res.data.user);
      
      // Redirect based on role
      if (res.data.user.role === 'student') {
        navigate('/');
      } else {
        navigate('/educator/dashboard');
      }
      
      toast.success('Login successful');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-blue-900">Log in to your account</h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="flex justify-center mb-6">
            <div className="flex space-x-4">
              <button
                type="button"
                className={`px-4 py-2 rounded-md ${userType === 'student' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                onClick={() => setUserType('student')}
              >
                Student
              </button>
              <button
                type="button"
                className={`px-4 py-2 rounded-md ${userType === 'educator' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                onClick={() => setUserType('educator')}
              >
                Educator
              </button>
            </div>
          </div>

          <form className="space-y-6" onSubmit={onSubmit}>
            {userType === 'student' ? (
              <div>
                <label htmlFor="matricNumber" className="block text-sm font-medium text-gray-700">
                  Matric Number
                </label>
                <div className="mt-1">
                  <input
                    id="matricNumber"
                    name="matricNumber"
                    type="text"
                    required
                    value={matricNumber}
                    onChange={onChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label htmlFor="staffId" className="block text-sm font-medium text-gray-700">
                  Staff ID
                </label>
                <div className="mt-1">
                  <input
                    id="staffId"
                    name="staffId"
                    type="text"
                    required
                    value={staffId}
                    onChange={onChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={onChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Logging in...' : 'Log in'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Don't have an account?</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Link
                to="/register/student"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Student Sign up
              </Link>
              <Link
                to="/register/educator"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Educator Sign up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;