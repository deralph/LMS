import React, { useContext, useEffect, useState } from 'react';
import { assets } from '../../assets/assets';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { toast } from 'react-toastify';
import axios from 'axios';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isCoursesListPage = location.pathname.includes('/course-list');
  
  const {
    backendUrl,
    userData,
    isLoggedIn,
    logout,
    getToken
  } = useContext(AppContext);
  
  const [isEducator, setIsEducator] = useState(userData?.role === 'educator');

  useEffect(() => {
    // Update educator status when userData changes
    setIsEducator(userData?.role === 'educator');
  }, [userData]);

  const becomeEducator = async () => {
    try {
      if (isEducator) {
        navigate('/educator/dashboard');
        return;
      }

      if (!userData) {
        toast.error('Please log in first');
        navigate('/login');
        return;
      }

      const token = await getToken();
      const { data } = await axios.post(
        `${backendUrl}/api/educator/update-role`,
        { email: userData.email },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success(data.message);
        setIsEducator(true);
        // Refresh user data to get updated role
        window.location.reload();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div
      className={`flex items-center justify-between px-4 sm:px-10 md:px-14 lg:px-36 border-b border-gray-500 py-4 ${
        isCoursesListPage ? 'bg-white' : 'bg-cyan-100/70'
      }`}
    >
      <h1 
        className="text-blue-600 text-xl font-bold px-5 py-2 rounded-full cursor-pointer" 
        onClick={() => navigate('/')}
      >
        AAUA LMS
      </h1>
      
      {/* Desktop Menu */}
      <div className="md:flex hidden items-center gap-5 text-gray-500">
        <div className="flex items-center gap-5">
          {isLoggedIn() && (
            <>
              <button 
                onClick={becomeEducator}
                className="hover:text-blue-600 transition-colors"
              >
                {isEducator ? 'Educator Dashboard' : ''}
              </button>
               <Link to="/my-enrollments" className="hover:text-blue-600 transition-colors">My Enrollments</Link>
            </>
          )}
        </div>

        {isLoggedIn() ? (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
              {userData?.fullName?.charAt(0) || 'U'}
            </div>
            <span>{userData?.fullName}</span>
            <button
              onClick={handleLogout}
              className="ml-2 text-red-500 hover:text-red-700"
            >
              Logout
            </button>
          </div>
        ) : (
          <button
            onClick={() => navigate('/login')}
            className="bg-blue-600 text-white px-5 py-2 rounded-full hover:bg-blue-700 transition-colors"
          >
            Sign In
          </button>
        )}
      </div>

      {/* Mobile Menu */}
      <div className="md:hidden flex items-center gap-2 sm:gap-5 text-gray-500">
        <div className="flex items-center gap-1 sm:gap-2 max-sm:text-xs">
          {isLoggedIn() && (
            <>
              <button 
                onClick={becomeEducator}
                className="hover:text-blue-600 transition-colors"
              >
                {isEducator ? 'Dashboard' : 'Become Educator'}
              </button>
              | <Link to="/my-enrollments" className="hover:text-blue-600 transition-colors">My Courses</Link>
            </>
          )}
        </div>

        {isLoggedIn() ? (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
              {userData?.fullName?.charAt(0) || 'U'}
            </div>
            <button
              onClick={handleLogout}
              className="text-red-500 hover:text-red-700"
            >
              Logout
            </button>
          </div>
        ) : (
          <button onClick={() => navigate('/login')}>
            <img src={assets.user_icon} alt="User Icon" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Navbar;