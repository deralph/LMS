import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AppContext } from '../../context/AppContext';
import { toast } from 'react-toastify';
import Loading from '../../components/student/Loading';

const StudentsEnrolled = () => {
  const { backendUrl, getToken, userData } = useContext(AppContext);
  const [enrolledStudents, setEnrolledStudents] = useState(null);

  const fetchEnrolledStudents = async () => {
    try {
      const token = await getToken();
      
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const { data } = await axios.post(
        backendUrl + '/api/educator/enrolled-students',
        { email: userData.email },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        setEnrolledStudents(data.enrolledStudents.reverse());
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error fetching enrolled students:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch enrolled students');
    }
  };

  useEffect(() => {
    if (userData && userData.role === 'educator') {
      fetchEnrolledStudents();
    }
  }, [userData]);

  // Function to generate avatar from name
  const getAvatarFromName = (name) => {
    if (!name) return <div className="w-9 h-9 rounded-full bg-gray-300 flex items-center justify-center">?</div>;
    
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 'bg-red-500'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const initials = name.split(' ').map(word => word[0]).join('').toUpperCase().substring(0, 2);
    
    return (
      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-medium ${randomColor}`}>
        {initials}
      </div>
    );
  };

  if (!userData || userData.role !== 'educator') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700">Access Denied</h2>
          <p className="text-gray-500">Only educators can access this page.</p>
        </div>
      </div>
    );
  }

  return enrolledStudents ? (
    <div className="min-h-screen flex flex-col items-start justify-between md:p-8 md:pb-0 p-4 pt-8 pb-0">
      <div className="w-full">
        <h2 className="pb-4 text-2xl font-bold text-gray-800">Enrolled Students</h2>
        
        {enrolledStudents.length > 0 ? (
          <div className="flex flex-col items-center max-w-4xl w-full overflow-hidden rounded-md bg-white border border-gray-500/20 ">
            <table className="table-fixed md:table-auto w-full overflow-hidden pb-4">
              <thead className="text-gray-900 border-b border-gray-500/20 text-sm text-left">
                <tr>
                  <th className="px-4 py-3 font-semibold text-center hidden sm:table-cell">#</th>
                  <th className="px-4 py-3 font-semibold">Student Name</th>
                  <th className="px-4 py-3 font-semibold">Course Title</th>
                  <th className="px-4 py-3 font-semibold hidden sm:table-cell">Date</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-500">
                {enrolledStudents.map((item, index) => (
                  <tr key={index} className="border-b border-gray-500/20 hover:bg-gray-50">
                    <td className="px-4 py-3 text-center hidden sm:table-cell">{index + 1}</td>
                    <td className="md:px-4 px-2 py-3 flex items-center space-x-3">
                      {getAvatarFromName(item.student?.fullName)}
                      <span className="truncate">{item.student?.fullName || 'Unknown Student'}</span>
                    </td>
                    <td className="px-4 py-3 truncate">{item.courseTitle || 'Unknown Course'}</td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      {item.enrolledDate ? new Date(item.enrolledDate).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-md border border-gray-200 text-center">
            <p className="text-gray-500">No students have enrolled in your courses yet.</p>
          </div>
        )}
      </div>
    </div>
  ) : <Loading />;
};

export default StudentsEnrolled;