import React, { useContext, useEffect, useState } from 'react'
import { assets } from '../../assets/assets'
import { AppContext } from '../../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import Loading from '../../components/student/Loading';

const Dashboard = () => {
  const { backendUrl, userData, currency, getToken } = useContext(AppContext)
  const [dashboardData, setDashboardData] = useState(null)

  const fetchDashboardData = async () => {
    try {
      const token = await getToken()
      
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const { data } = await axios.post(
        backendUrl + '/api/educator/dashboard',
        { email: userData.email },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (data.success) {
        setDashboardData(data.dashboardData)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.error("Dashboard error: ", error)
      toast.error(error.response?.data?.message || 'Failed to fetch dashboard data')
    }
  }

  useEffect(() => {
    if (userData && userData.role === 'educator') {
      fetchDashboardData()
    }
  }, [userData])

  // Function to generate avatar from name
  const getAvatarFromName = (name) => {
    if (!name) return assets.profile_img;
    
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 'bg-red-500'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    return (
      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-medium ${randomColor}`}>
        {name.charAt(0).toUpperCase()}
      </div>
    );
  };

  return dashboardData ? (
    <div className='min-h-screen flex flex-col items-start justify-between gap-8 md:p-8 md:pb-0 p-4 pt-8 pb-0'>
      <div className='space-y-5 w-full'>
        <h1 className='text-2xl font-bold text-gray-800'>Educator Dashboard</h1>
        
        <div className='flex flex-wrap gap-5 items-center'>
          <div className='flex items-center gap-3 shadow-card border border-blue-500 p-4 w-56 rounded-md'>
            <img src={assets.patients_icon} alt="patients_icon" className="w-8 h-8" />
            <div>
              <p className='text-2xl font-medium text-gray-600'>{dashboardData.enrolledStudentsCount || dashboardData.enrolledStudentsData.length|| 0}</p>
              <p className='text-base text-gray-500'>Total Enrolments</p>
            </div>
          </div>
          <div className='flex items-center gap-3 shadow-card border border-blue-500 p-4 w-56 rounded-md'>
            <img src={assets.appointments_icon} alt="patients_icon" className="w-8 h-8" />
            <div>
              <p className='text-2xl font-medium text-gray-600'>{dashboardData.totalCourses || 0}</p>
              <p className='text-base text-gray-500'>Total Courses</p>
            </div>
          </div>
          
        </div>
        
        <div className='w-full'>
          <h2 className="pb-4 text-lg font-medium">Latest Enrolments</h2>
          {dashboardData.enrolledStudentsData && dashboardData.enrolledStudentsData.length > 0 ? (
            <div className="flex flex-col items-center max-w-4xl w-full overflow-hidden rounded-md bg-white border border-gray-500/20">
              <table className="table-fixed md:table-auto w-full overflow-hidden">
                <thead className="text-gray-900 border-b border-gray-500/20 text-sm text-left">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-center hidden sm:table-cell">#</th>
                    <th className="px-4 py-3 font-semibold">Student Mail</th>
                    <th className="px-4 py-3 font-semibold">Course Title</th>
                    <th className="px-4 py-3 font-semibold">Enrollment Date</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-gray-500">
                  {dashboardData.enrolledStudentsData.map((item, index) => (
                    <tr key={index} className="border-b border-gray-500/20">
                      <td className="px-4 py-3 text-center hidden sm:table-cell">{index + 1}</td>
                      <td className="md:px-4 px-2 py-3 flex items-center space-x-3">
                        {getAvatarFromName(item.student?.email)}
                        <span className="truncate">{item.student?.email || 'Unknown Student'}</span>
                      </td>
                      <td className="px-4 py-3 truncate">{item.courseTitle || 'Unknown Course'}</td>
                      <td className="px-4 py-3">
                        {/* {item.enrollmentDate ? new Date(item.enrollmentDate).toLocaleDateString() : 'N/A'} */}
                        {item.enrolledDate ? new Date(item.enrolledDate).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-md border border-gray-200 text-center">
              <p className="text-gray-500">No enrollment data available yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  ) : <Loading />
}

export default Dashboard