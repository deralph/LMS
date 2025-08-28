import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import Loading from '../../components/student/Loading';

const MyCourses = () => {
  const { backendUrl, userData, currency, getToken } = useContext(AppContext);
  const [courses, setCourses] = useState(null);

  const fetchEducatorCourses = async () => {
    try {
      const token = await getToken();
      
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const { data } = await axios.post(
        backendUrl + '/api/educator/courses', 
        { email: userData.email },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        setCourses(data.courses);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch courses');
    }
  };

  useEffect(() => {
    if (userData && userData.role === 'educator') {
      fetchEducatorCourses();
    }
  }, [userData]);

  if (!userData || userData.role !== 'educator') {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700">Access Denied</h2>
          <p className="text-gray-500">Only educators can access this page.</p>
        </div>
      </div>
    );
  }

  return courses ? (
    <div className="min-h-screen flex flex-col items-start justify-between md:p-8 md:pb-0 p-4 pt-8 pb-0">
      <div className='w-full'>
        <h2 className="pb-4 text-2xl font-bold text-gray-800">My Courses</h2>
        {courses.length > 0 ? (
          <div className="flex flex-col items-center max-w-4xl w-full overflow-hidden rounded-md bg-white border border-gray-500/20">
            <table className="md:table-auto table-fixed w-full overflow-hidden">
              <thead className="text-gray-900 border-b border-gray-500/20 text-sm text-left">
                <tr>
                  <th className="px-4 py-3 font-semibold truncate">All Courses</th>
                  <th className="px-4 py-3 font-semibold truncate">Students</th>
                  <th className="px-4 py-3 font-semibold truncate hidden md:table-cell">Published On</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-500">
                {courses.map((course) => (
                  <tr key={course._id} className="border-b border-gray-500/20 hover:bg-gray-50">
                    <td className="md:px-4 pl-2 md:pl-4 py-3 flex items-center space-x-3 truncate">
                      <img 
                        src={course.courseThumbnail} 
                        alt="Course" 
                        className="w-16 h-10 object-cover rounded" 
                      />
                      <span className="truncate">{course.courseTitle}</span>
                    </td>
                    <td className="px-4 py-3">{course.enrolledStudents?.length || 0}</td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {new Date(course.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-md border border-gray-200 text-center">
            <p className="text-gray-500">You haven't created any courses yet.</p>
            <a 
              href="/educator/add-course" 
              className="text-blue-600 hover:text-blue-800 mt-2 inline-block"
            >
              Create your first course
            </a>
          </div>
        )}
      </div>
    </div>
  ) : <Loading />;
};

export default MyCourses;