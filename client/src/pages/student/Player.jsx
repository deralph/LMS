import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import YouTube from "react-youtube";
import { assets } from "../../assets/assets";
import { useParams } from "react-router-dom";
import humanizeDuration from "humanize-duration";
import axios from "axios";
import { toast } from "react-toastify";
import Rating from "../../components/student/Rating";
import Footer from "../../components/student/Footer";
import Loading from "../../components/student/Loading";

const Player = () => {
  const {
    enrolledCourses,
    backendUrl,
    getToken,
    calculateChapterTime,
    userData,
    fetchUserEnrolledCourses,
  } = useContext(AppContext);

  const { courseId } = useParams();

  const [courseData, setCourseData] = useState(null);
  const [progressData, setProgressData] = useState(null);
  const [openSections, setOpenSections] = useState({});
  const [playerData, setPlayerData] = useState(null);
  const [initialRating, setInitialRating] = useState(0);
  const [loading, setLoading] = useState(true);

  const extractVideoId = (url) => {
    const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  /** Find the current course and set rating if user has rated */
  const getCourseData = () => {
    const course = enrolledCourses.find((c) => c._id === courseId);
    if (course) {
      setCourseData(course);

      const userRating = course.courseRatings.find(
        (item) => item.userId === userData?._id
      );
      if (userRating) {
        setInitialRating(userRating.rating);
      }
    }
  };

  const toggleSection = (index) => {
    setOpenSections((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  /** Mark a lecture as completed */
  const markLectureAsCompleted = async (lectureId) => {
    if (!userData) return toast.error("User not loaded yet");

    try {
      const token = await getToken();
      const { data } = await axios.post(
        backendUrl + "/api/user/update-course-progress",
        { courseId, lectureId, email: userData.email },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success(data.message);
        getCourseProgress();
      } else {
        console.log("error in mark as complete 1", data);
        toast.error(data.message);
      }
    } catch (error) {
      console.log("error in mark as complete ", error);
      toast.error(error.message);
    }
  };

  /** Fetch user's course progress */
  const getCourseProgress = async () => {
    if (!userData) return;
    
    try {
      const token = await getToken();
      const { data } = await axios.post(
        backendUrl + "/api/user/get-course-progress",
        { courseId, email: userData.email },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        setProgressData(data.progressData);
      } else {
        console.log("error in get course progress 1", data);
        toast.error(data.message);
      }
    } catch (error) {
      console.log("error in get course progress ", error);
      toast.error(error.message);
    }
  };

  /** Handle rating submission */
  const handleRate = async (rating) => {
    if (!userData) return toast.error("User not loaded yet");

    try {
      const token = await getToken();
      const { data } = await axios.post(
        backendUrl + "/api/user/add-rating",
        { courseId, rating, email: userData.email },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success(data.message);
        fetchUserEnrolledCourses();
      } else {
        console.log("error in rating course 1", data);
        toast.error(data.message);
      }
    } catch (error) {
      console.log("error in rating course ", error);
      toast.error(error.message);
    }
  };

  /** Effect: load course + progress once userData and enrolledCourses are ready */
  useEffect(() => {
    if (userData && enrolledCourses.length > 0) {
      getCourseData();
      getCourseProgress();
      setLoading(false);
    }
  }, [userData, enrolledCourses, courseId]);

  const renderLectureContent = (lecture) => {
    switch (lecture.lectureType) {
      case 'youtube':
        return (
          <YouTube
            iframeClassName="w-full aspect-video"
            videoId={extractVideoId(lecture.lectureUrl)}
          />
        );
      case 'pdf':
        return (
          <div className="w-full h-96">
            <iframe
              src={`https://docs.google.com/gview?url=${encodeURIComponent(lecture.lectureUrl)}&embedded=true`}
              className="w-full h-full"
              title={lecture.lectureTitle}
              frameBorder="0"
            />
            <div className="mt-2">
              <a 
                href={lecture.lectureUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-500 underline"
              >
                Download PDF
              </a>
            </div>
          </div>
        );
      case 'image':
        return (
          <div className="flex justify-center">
            <img 
              src={lecture.lectureUrl} 
              alt={lecture.lectureTitle}
              className="max-w-full max-h-96 object-contain"
            />
          </div>
        );
      default:
        return <div>Unsupported content type</div>;
    }
  };

  if (loading || !courseData) return <Loading />;

  return (
    <>
      <div className="p-4 sm:p-10 flex flex-col-reverse md:grid md:grid-cols-2 gap-10 md:px-36">
        {/* Left Section: Course Structure */}
        <div className="text-gray-800">
          <h2 className="text-xl font-semibold">Course Structure</h2>
          <div className="pt-5">
            {courseData.courseContent.map((chapter, index) => (
              <div
                key={index}
                className="border border-gray-300 bg-white mb-2 rounded"
              >
                <div
                  className="flex items-center justify-between px-4 py-3 cursor-pointer select-none"
                  onClick={() => toggleSection(index)}
                >
                  <div className="flex items-center gap-2">
                    <img
                      src={assets.down_arrow_icon}
                      alt="arrow icon"
                      className={`transform transition-transform ${
                        openSections[index] ? "rotate-180" : ""
                      }`}
                    />
                    <p className="font-medium md:text-base text-sm">
                      {chapter.chapterTitle}
                    </p>
                  </div>
                  <p className="text-sm md:text-default">
                    {chapter.chapterContent.length} lectures -{" "}
                    {calculateChapterTime(chapter)}
                  </p>
                </div>

                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openSections[index] ? "max-h-96" : "max-h-0"
                  }`}
                >
                  <ul className="list-disc md:pl-10 pl-4 pr-4 py-2 text-gray-600 border-t border-gray-300">
                    {chapter.chapterContent.map((lecture, i) => (
                      <li key={i} className="flex items-start gap-2 py-1">
                        <img
                          src={
                            progressData &&
                            progressData.lectureCompleted.includes(
                              lecture.lectureId
                            )
                              ? assets.blue_tick_icon
                              : assets.play_icon
                          }
                          alt="bullet icon"
                          className="w-4 h-4 mt-1"
                        />
                        <div className="flex items-center justify-between w-full text-gray-800 text-xs md:text-default">
                          <p>{lecture.lectureTitle}</p>
                          <div className="flex gap-2">
                            <p
                              onClick={() => {
                                setPlayerData({
                                  ...lecture,
                                  chapter: index + 1,
                                  lecture: i + 1,
                                })
                              }}
                              className="text-blue-500 cursor-pointer"
                            >
                              {lecture.lectureType === 'youtube' ? 'Watch' : 
                               lecture.lectureType === 'pdf' ? 'View PDF' : 'View Image'}
                            </p>
                            <p>
                              {humanizeDuration(
                                lecture.lectureDuration * 60 * 1000,
                                { units: ["h", "m"] }
                              )}
                            </p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* Rating Section */}
          <div className="flex items-center gap-2 py-3 mt-10">
            <h1 className="text-xl font-bold">Rate this Course:</h1>
            <Rating initialRating={initialRating} onRate={handleRate} />
          </div>
        </div>

        {/* Right Section: Player */}
        <div className="md:mt-10">
          {playerData ? (
            <div>
              {renderLectureContent(playerData)}
              <div className="flex justify-between items-center mt-1">
                <p className="text-xl mt-8 ">
                  {playerData.chapter}.{playerData.lecture}{" "}
                  {playerData.lectureTitle}
                </p>
                <button
                  onClick={() => markLectureAsCompleted(playerData.lectureId)}
                  className="text-blue-600"
                >
                  {progressData &&
                  progressData.lectureCompleted.includes(playerData.lectureId)
                    ? "Completed"
                    : "Mark Complete"}
                </button>
              </div>
            </div>
          ) : (
            <img
              src={courseData ? courseData.courseThumbnail : ""}
              alt="course thumbnail"
              className="w-full"
            />
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Player;