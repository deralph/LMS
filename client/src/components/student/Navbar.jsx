import React, { useContext,useEffect } from 'react';
import { assets } from '../../assets/assets';
import { Link, useLocation } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { toast } from 'react-toastify';
import axios from 'axios';

const Navbar = () => {
  const location = useLocation();
  const isCoursesListPage = location.pathname.includes('/course-list');

  const {
    backendUrl,
    isEducator,
    setIsEducator,
    navigate,
    getToken,
    user,
    isAuthenticated,
    loginWithRedirect,
    logout,
  } = useContext(AppContext);
  useEffect(()=>console.log(user))

  const becomeEducator = async () => {
    try {
      if (isEducator) {
        navigate('/educator');
        return;
      }

      const token = await getToken();
      console.log("email to become educator ", user.email)
      const { data } = await axios.post(
        `${backendUrl}/api/educator/update-role`,{email:user.email},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success(data.message);
        setIsEducator(true);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div
      className={`flex items-center justify-between px-4 sm:px-10 md:px-14 lg:px-36 border-b border-gray-500 py-4 ${
        isCoursesListPage ? 'bg-white' : 'bg-cyan-100/70'
      }`}
    >
      {/*<img
        onClick={() => navigate('/')}
        src={assets.logo}
        alt="Logo"
        className="w-28 lg:w-32 cursor-pointer"
      />*/}
      <h1 className="text-blue-600 text-xl font-bold px-5 py-2 rounded-full" onClick={() => navigate('/')}
          >
           AAUA LMS
          </h1>
      {/* Desktop Menu */}
      <div className="md:flex hidden items-center gap-5 text-gray-500">
        <div className="flex items-center gap-5">
          {isAuthenticated && (
            <>
              <button onClick={becomeEducator}>
                {isEducator ? 'Educator Dashboard' : 'Become Educator'}
              </button>
              | <Link to="/my-enrollments">My Enrollments</Link>
            </>
          )}
        </div>

        {isAuthenticated ? (
          <div className="flex items-center gap-2">
            <img
              src={user.picture}
              alt={user.name}
              className="w-8 h-8 rounded-full"
            />
            <span>{user.name}</span>
            <button
              onClick={() => logout({ returnTo: window.location.origin })}
              className="ml-2 text-red-500"
            >
              Logout
            </button>
          </div>
        ) : (
          <button
            onClick={() => loginWithRedirect()}
            className="bg-blue-600 text-white px-5 py-2 rounded-full"
          >
            Create Account
          </button>
        )}
      </div>

      {/* Mobile Menu */}
      <div className="md:hidden flex items-center gap-2 sm:gap-5 text-gray-500">
        <div className="flex items-center gap-1 sm:gap-2 max-sm:text-xs">
          <button onClick={becomeEducator}>
            {isEducator ? 'Educator Dashboard' : 'Become Educator'}
          </button>
          | {isAuthenticated && <Link to="/my-enrollments">My Enrollments</Link>}
        </div>

        {isAuthenticated ? (
          <div className="flex items-center gap-2">
            <img
              src={user.picture}
              alt={user.name}
              className="w-8 h-8 rounded-full"
            />
            <button
              onClick={() => logout({ returnTo: window.location.origin })}
            >
              Logout
            </button>
          </div>
        ) : (
          <button onClick={() => loginWithRedirect()}>
            <img src={assets.user_icon} alt="User Icon" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Navbar;
