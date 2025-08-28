// context/AppContext.js
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [backendUrl] = useState(import.meta.env.VITE_BACKEND_URL);
  const [currency] = useState('₦');
  const [allCourses, setAllCourses] = useState([]);

  // Function to get token from localStorage
  const getToken = () => {
    return localStorage.getItem('token');
  };

  // Function to check if user is logged in
  const isLoggedIn = () => {
    return !!getToken();
  };

  // Function to logout user
  const logout = () => {
    localStorage.removeItem('token');
    setUserData(null);
    setEnrolledCourses([]);
    toast.success('Logged out successfully');
  };

  // Function to fetch user data
  const fetchUserData = async () => {
    try {
      const token = getToken();
      if (!token) return;

      const res = await axios.get(`${backendUrl}/api/user/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        setUserData(res.data.user);
        
        // If user is a student, fetch enrolled courses
        if (res.data.user.role === 'student') {
          fetchEnrolledCourses();
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      logout();
    }
  };

  // Function to fetch enrolled courses
  const fetchEnrolledCourses = async () => {
    try {
      const token = getToken();
      if (!token) return;

      const res = await axios.get(`${backendUrl}/api/user/enrolled-courses`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        setEnrolledCourses(res.data.courses);
      }
    } catch (error) {
      console.error('Error fetching enrolled courses:', error);
    }
  };
   const fetchAllCourses = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/course/all`);
      if (data.success) setAllCourses(data.courses);
      else {
        console.log(data);
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error.message);
      toast.error(error.message);
    }
  };

  // Calculate course duration
  const calculateCourseDuration = (course) => {
    let totalMinutes = 0;
    course.courseContent.forEach(chapter => {
      chapter.chapterContent.forEach(lecture => {
        totalMinutes += lecture.lectureDuration;
      });
    });
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  // Calculate chapter time
  const calculateChapterTime = (chapter) => {
    let totalMinutes = 0;
    chapter.chapterContent.forEach(lecture => {
      totalMinutes += lecture.lectureDuration;
    });
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  // Calculate rating
  const calculateRating = (course) => {
    if (!course.courseRatings || course.courseRatings.length === 0) return 0;
    
    const total = course.courseRatings.reduce((sum, rating) => sum + rating.rating, 0);
    return (total / course.courseRatings.length).toFixed(1);
  };

  // Calculate number of lectures
  const calculateNoOfLectures = (course) => {
    let count = 0;
    course.courseContent.forEach(chapter => {
      count += chapter.chapterContent.length;
    });
    return count;
  };

  // Check if user has enrolled in a course
  const isEnrolled = (courseId) => {
    return enrolledCourses.some(course => course._id === courseId);
  };
  useEffect(() => {
    fetchUserData();
  }, []);

  return (
    <AppContext.Provider value={{
      userData,
      setUserData,
      enrolledCourses,
      setEnrolledCourses,
      backendUrl,
      currency,
      getToken,
      isLoggedIn,
      logout,
      fetchUserData,
      fetchEnrolledCourses,
      calculateCourseDuration,
      calculateChapterTime,
      calculateRating,
      calculateNoOfLectures,
      isEnrolled,allCourses,fetchAllCourses
    }}>
      {children}
    </AppContext.Provider>
  );
};