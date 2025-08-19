import React, { useContext } from 'react';
import { assets } from '../../assets/assets';
import { Link } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';

const Navbar = ({ bgColor }) => {
  const { isEducator, user, isAuthenticated, logout } = useContext(AppContext);

  if (!isEducator || !isAuthenticated) return null;

  return (
    <div
      className={`flex items-center justify-between px-4 md:px-8 border-b border-gray-500 py-3 ${bgColor}`}
    >
      <Link to="/">
        {/* <img src={assets.logo} alt="Logo" className="w-28 lg:w-32" /> */}
        <h1 className="text-blue-600 text-xl font-bold px-5 py-2 rounded-full"
          >
           AAUA LMS
          </h1>
      
      </Link>
      <div className="flex items-center gap-5 text-gray-500 relative">
        <p>Hi! {user.name}</p>
        <img
          src={user.picture}
          alt={user.name}
          className="w-8 h-8 rounded-full"
        />
        <button
          onClick={() => logout({ returnTo: window.location.origin })}
          className="text-red-500"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Navbar;
