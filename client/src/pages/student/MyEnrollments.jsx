import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../../context/AppContext'
import axios from 'axios'
import { Line } from 'rc-progress';
import Footer from '../../components/student/Footer';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const MyEnrollments = () => {
    const { userData, enrolledCourses, backendUrl, getToken, calculateCourseDuration, calculateNoOfLectures } = useContext(AppContext);
    const [progressArray, setProgressData] = useState([]);
    const navigate = useNavigate();

    const getCourseProgress = async () => {
        try {
            const token = await getToken();
            
            if (!token) {
                toast.error('Authentication required');
                return;
            }

            // Use Promise.all to handle multiple async operations
            const tempProgressArray = await Promise.all(
                enrolledCourses.map(async (course) => {
                    try {
                        const { data } = await axios.post(
                            `${backendUrl}/api/user/get-course-progress`,
                            { courseId: course._id, email: userData.email },
                            { headers: { Authorization: `Bearer ${token}` } }
                        );

                        // Calculate total lectures
                        let totalLectures = calculateNoOfLectures(course);

                        const lectureCompleted = data.progressData ? data.progressData.lectureCompleted.length : 0;
                        return { totalLectures, lectureCompleted };
                    } catch (error) {
                        console.error('Error fetching progress for course:', course._id, error);
                        return { totalLectures: 0, lectureCompleted: 0 };
                    }
                })
            );

            setProgressData(tempProgressArray);
        } catch (error) {
            console.error('Error in getCourseProgress:', error);
            toast.error(error.response?.data?.message || 'Failed to fetch course progress');
        }
    };

    // useEffect(() => {
    //     if (userData) {
    //         fetchUserEnrolledCourses();
    //     }
    // }, [userData]);

    useEffect(() => {
        if (enrolledCourses.length > 0) {
            getCourseProgress();
        }
    }, [enrolledCourses]);

    if (!userData) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-700">Please log in to view your enrollments</h2>
                    <button 
                        onClick={() => navigate('/login')} 
                        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                        Log In
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className='md:px-36 px-8 pt-10 min-h-screen'>
                <h1 className='text-2xl font-semibold'>My Enrollments</h1>

                {enrolledCourses.length > 0 ? (
                    <table className="md:table-auto table-fixed w-full overflow-hidden border mt-10">
                        <thead className="text-gray-900 border-b border-gray-500/20 text-sm text-left max-sm:hidden">
                            <tr>
                                <th className="px-4 py-3 font-semibold truncate">Course</th>
                                <th className="px-4 py-3 font-semibold truncate max-sm:hidden">Duration</th>
                                <th className="px-4 py-3 font-semibold truncate max-sm:hidden">Completed</th>
                                <th className="px-4 py-3 font-semibold truncate">Status</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-700">
                            {enrolledCourses.map((course, index) => {
                                const progress = progressArray[index] || { totalLectures: 0, lectureCompleted: 0 };
                                const progressPercent = progress.totalLectures > 0 
                                    ? (progress.lectureCompleted * 100) / progress.totalLectures 
                                    : 0;
                                
                                return (
                                    <tr key={index} className="border-b border-gray-500/20 hover:bg-gray-50">
                                        <td className="md:px-4 pl-2 md:pl-4 py-3 flex items-center space-x-3">
                                            <img 
                                                src={course.courseThumbnail} 
                                                alt={course.courseTitle} 
                                                className="w-14 sm:w-24 md:w-28 object-cover rounded" 
                                            />
                                            <div className='flex-1'>
                                                <p className='mb-1 max-sm:text-sm font-medium'>{course.courseTitle}</p>
                                                <div className="flex items-center gap-2">
                                                    <Line 
                                                        className='bg-gray-300 rounded-full' 
                                                        strokeWidth={2} 
                                                        percent={progressPercent} 
                                                        strokeColor="#3B82F6" 
                                                    />
                                                    <span className="text-xs text-gray-500">
                                                        {Math.round(progressPercent)}%
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 max-sm:hidden">{calculateCourseDuration(course)}</td>
                                        <td className="px-4 py-3 max-sm:hidden">
                                            {progress.lectureCompleted} / {progress.totalLectures}
                                            <span className='text-xs ml-2'>Lectures</span>
                                        </td>
                                        <td className="px-4 py-3 max-sm:text-right">
                                            <button 
                                                onClick={() => navigate('/player/' + course._id)} 
                                                className='px-3 sm:px-5 py-1.5 sm:py-2 bg-blue-600 max-sm:text-xs text-white rounded hover:bg-blue-700 transition-colors'
                                            >
                                                {progressPercent === 100 ? 'Completed' : 'Continue Learning'}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                ) : (
                    <div className="mt-10 bg-white p-6 rounded-md border border-gray-200 text-center">
                        <p className="text-gray-500">You haven't enrolled in any courses yet.</p>
                        <button 
                            onClick={() => navigate('/')} 
                            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                        >
                            Browse Courses
                        </button>
                    </div>
                )}
            </div>

            <Footer />
        </>
    )
}

export default MyEnrollments;