import React from 'react'
import { Routes, Route, useMatch } from 'react-router-dom'
import Navbar from './components/student/Navbar'
import ProtectedRoute from './components/educator/ProtectedRoute'
import Home from './pages/student/Home'
import CourseDetails from './pages/student/CourseDetails'
import CoursesList from './pages/student/CoursesList'
import Login from './pages/student/Login'
import StudentRegister from './pages/student/Registration'
import Dashboard from './pages/educator/Dashboard'
import AddCourse from './pages/educator/AddCourse'
import MyCourses from './pages/educator/MyCourses'
import EducatorRegister from './pages/educator/Registration'
import StudentsEnrolled from './pages/educator/StudentsEnrolled'
import Educator from './pages/educator/Educator'
import 'quill/dist/quill.snow.css'
import 'react-toastify/dist/ReactToastify.css'
import { ToastContainer } from 'react-toastify'
import Player from './pages/student/Player'
import MyEnrollments from './pages/student/MyEnrollments'
import Loading from './components/student/Loading'

const App = () => {
  const isEducatorRoute = useMatch('/educator/*')

  return (
    <div className="text-default min-h-screen bg-white">
      <ToastContainer />
      {/* Render Student Navbar only if not on educator routes */}
      {!isEducatorRoute && <Navbar />}

      <Routes>
        {/* Student routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register/student" element={<StudentRegister />} />
        <Route path="/register/educator" element={<EducatorRegister />} />
        <Route path="/" element={<Home />} />
        <Route path="/course/:id" element={<CourseDetails />} />
        <Route path="/course-list" element={<CoursesList />} />
        <Route path="/course-list/:input" element={<CoursesList />} />
        <Route path="/my-enrollments" element={<MyEnrollments />} />
        <Route
          path="/player/:courseId"
          element={
            <ProtectedRoute>
              <Player />
            </ProtectedRoute>
          }
        />
        <Route path="/loading/:path" element={<Loading />} />

        {/* Educator routes */}
        <Route path="/educator/*" element={<Educator />}>
          <Route
            path="dashboard"
            element={
              <ProtectedRoute role="educator">
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="add-course"
            element={
              <ProtectedRoute role="educator">
                <AddCourse />
              </ProtectedRoute>
            }
          />
          <Route
            path="my-courses"
            element={
              <ProtectedRoute role="educator">
                <MyCourses />
              </ProtectedRoute>
            }
          />
          <Route
            path="student-enrolled"
            element={
              <ProtectedRoute role="educator">
                <StudentsEnrolled />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </div>
  )
}

export default App
