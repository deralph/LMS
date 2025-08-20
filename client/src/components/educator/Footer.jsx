import React from 'react';
import { assets } from '../../assets/assets';

import { AppContext } from '../../context/AppContext';

  const Footer = () => {
  const { navigate } = useContext(AppContext);
  return (
    <footer className="flex md:flex-row flex-col-reverse items-center justify-between text-left w-full px-8 border-t">
      <div className='flex items-center gap-4'>
        {/* <img className='hidden md:block w-20' src={assets.logo} alt="logo" /> */}
        
      <h1 className="text-blue-600 text-xl font-bold px-5 py-2 rounded-full" onClick={() => navigate('/')}
          >
           AAUA LMS
          </h1>
        <div className='hidden md:block h-7 w-px bg-gray-500/60'></div>
        <p className="py-4 text-center text-xs md:text-sm text-gray-500">
          Copyright 2025 © Adekunle Ajasin University. All Right Reserved.
        </p>
      </div>
      <div className='flex items-center gap-3 max-md:mt-4'>
        <a href="#">
          <img src={assets.facebook_icon} alt="facebook_icon" />
        </a>
        <a href="#">
          <img src={assets.twitter_icon} alt="twitter_icon" />
        </a>
        <a href="#">
          <img src={assets.instagram_icon} alt="instagram_icon" />
        </a>
      </div>
    </footer>
  );
};

export default Footer;