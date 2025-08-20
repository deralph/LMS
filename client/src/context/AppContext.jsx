/* context/AppContext.jsx */
import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth0 } from "@auth0/auth0-react";
import humanizeDuration from "humanize-duration";

export const AppContext = createContext();

export const AppContextProvider = (props) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const currency = import.meta.env.VITE_CURRENCY;

  const navigate = useNavigate();
  const {
    getAccessTokenSilently: getToken,
    user,
    isAuthenticated,
    loginWithRedirect,
    logout,
  } = useAuth0();

  const [showLogin, setShowLogin] = useState(false);
  const [isEducator, setIsEducator] = useState(false);
  const [allCourses, setAllCourses] = useState([]);
  const [userData, setUserData] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);

  // Fetch All Courses
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

  //   // Fetch User Data
  //   const fetchUserData = async () => {
  //   try {
  //     const token = await getToken();
  //     const { data } = await axios.get(
  //       `${backendUrl}/api/user/data`,
  //       { headers: { Authorization: `Bearer ${token}` } }
  //     );
  // console.log(data)
  //     if (data.success) {
  //       setUserData(data.user);
  //       // Set educator flag based on the role field returned by your API
  //       if (data.user.role === 'educator') {
  //         setIsEducator(true);
  //       } else {
  //         setIsEducator(false);
  //       }
  //     } else {
  //       console.log(data.message);
  //       toast.error(data.message);
  //     }
  //   } catch (error) {
  //     console.log(error.message);
  //     toast.error(error.message);
  //   }
  // };

  const fetchUserData = async () => {
    try {
      if (!user) return;

      const token = await getToken();
      const userPayload = {
        name: user.name || user.nickname,
        email: user.email,
        imageUrl: user.picture,
      };

      // Always try to register/check user existence first
      await axios.post(`${backendUrl}/api/user/register`, userPayload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Then fetch the user data
      const { data } = await axios.post(
        `${backendUrl}/api/user/data`,
        { email: user.email },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (data.success) {
        setUserData(data.user);
        console.log("user role = ", data.user.role);
        setIsEducator(data.user.role === "educator");
      } else {
        console.log(data.message);
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error.message);
      toast.error("Failed to fetch user data");
    }
  };

  // Fetch Enrolled Courses
  const fetchUserEnrolledCourses = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.post(
        `${backendUrl}/api/user/enrolled-courses`,{ email: user.email },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success && data.enrolledCourses) {setEnrolledCourses(data.enrolledCourses.reverse());}
      else {
        console.log(data);
        console.log(data.enrolledCourses);
        console.error(data.message);
        // toast.error(data.message);
      }
    } catch (error) {
      console.error("error in fetch courses",error.message);
      toast.error(error.message);
    }
  };

  const calculateChapterTime = (chapter) => {
    let time = 0;
    chapter.chapterContent.forEach((l) => (time += l.lectureDuration));
    return humanizeDuration(time * 60 * 1000, { units: ["h", "m"] });
  };

  const calculateCourseDuration = (course) => {
    let time = 0;
    course.courseContent.forEach((ch) =>
      ch.chapterContent.forEach((l) => (time += l.lectureDuration))
    );
    return humanizeDuration(time * 60 * 1000, { units: ["h", "m"] });
  };

  const calculateRating = (course) => {
    if (!course.courseRatings.length) return 0;
    const total = course.courseRatings.reduce((sum, r) => sum + r.rating, 0);
    return Math.floor(total / course.courseRatings.length);
  };

  const calculateNoOfLectures = (course) => {
    return course.courseContent.reduce(
      (sum, ch) =>
        sum + (Array.isArray(ch.chapterContent) ? ch.chapterContent.length : 0),
      0
    );
  };

  useEffect(() => {
    fetchAllCourses();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserData();
      fetchUserEnrolledCourses();
    }
  }, [isAuthenticated]);

  const value = {
    showLogin,
    setShowLogin,
    backendUrl,
    currency,
    navigate,
    userData,
    setUserData,
    getToken,
    allCourses,
    fetchAllCourses,
    enrolledCourses,
    fetchUserEnrolledCourses,
    calculateChapterTime,
    calculateCourseDuration,
    calculateRating,
    calculateNoOfLectures,
    isEducator,
    setIsEducator,
    user,
    isAuthenticated,
    loginWithRedirect,
    logout,
  };

  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};
