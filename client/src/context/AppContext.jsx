import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [backendUrl] = useState(import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000');
  const [currency] = useState('₦');
  const [loading, setLoading] = useState(true);

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
      if (!token) {
        setLoading(false);
        return;
      }

      const res = await axios.get(`${backendUrl}/api/user/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        setUserData(res.data.user);
        console.log("user = ", res.data.user);
        
        // If user is a student, fetch enrolled courses
        if (res.data.user.role === 'student') {
          fetchEnrolledCourses(res.data.user.email);
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch enrolled courses
  const fetchEnrolledCourses = async (email) => {
    try {
      const token = getToken();
      if (!token || !email) return;

      const res = await axios.post(
        `${backendUrl}/api/user/enrolled-courses`,
        { email },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        setEnrolledCourses(res.data.enrolledCourses);
        console.log("enrolled courses = ",res.data.enrolledCourses);
      }
    } catch (error) {
      console.error('Error fetching enrolled courses:', error);
    }
  };

  // Function to fetch all courses
  const fetchAllCourses = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/course/all`);
      
      if (res.data.success) {
        setAllCourses(res.data.courses);
      }
    } catch (error) {
      console.error('Error fetching all courses:', error);
    }
  };

  // Calculate course duration
  const calculateCourseDuration = (course) => {
    if (!course || !course.courseContent) return '0m';
    
    let totalMinutes = 0;
    course.courseContent.forEach(chapter => {
      if (chapter.chapterContent) {
        chapter.chapterContent.forEach(lecture => {
          totalMinutes += lecture.lectureDuration || 0;
        });
      }
    });
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  // Calculate chapter time
  const calculateChapterTime = (chapter) => {
    if (!chapter || !chapter.chapterContent) return '0m';
    
    let totalMinutes = 0;
    chapter.chapterContent.forEach(lecture => {
      totalMinutes += lecture.lectureDuration || 0;
    });
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  // Calculate rating
  const calculateRating = (course) => {
    if (!course || !course.courseRatings || course.courseRatings.length === 0) return 0;
    
    const total = course.courseRatings.reduce((sum, rating) => sum + (rating.rating || 0), 0);
    return (total / course.courseRatings.length).toFixed(1);
  };

  // Calculate number of lectures
  const calculateNoOfLectures = (course) => {
    if (!course || !course.courseContent) return 0;
    
    let count = 0;
    course.courseContent.forEach(chapter => {
      if (chapter.chapterContent) {
        count += chapter.chapterContent.length;
      }
    });
    return count;
  };

  // Check if user has enrolled in a course
  const isEnrolled = (courseId) => {
    return enrolledCourses.some(course => course._id === courseId);
  };

  useEffect(() => {
    fetchUserData();
    fetchAllCourses();
  }, []);

  // Provide a default value for backendUrl if it's undefined
  const contextValue = {
    userData,
    setUserData,
    enrolledCourses,
    setEnrolledCourses,
    allCourses,
    setAllCourses,
    backendUrl: backendUrl || 'http://localhost:5000', // Fallback URL
    currency,
    getToken,
    isLoggedIn,
    logout,
    fetchUserData,
    fetchEnrolledCourses,
    fetchAllCourses,
    calculateCourseDuration,
    calculateChapterTime,
    calculateRating,
    calculateNoOfLectures,
    isEnrolled,
    loading
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};