import express from 'express'
import { addCourse, educatorDashboardData, getEducatorCourses, getEnrolledStudentsData, updateRoleToEducator } from '../controllers/educatorController.js';
import upload from '../configs/multer.js';
import { protectEducator } from '../middlewares/authMiddleware.js';


const educatorRouter = express.Router()

// Add Educator Role 
educatorRouter.post('/update-role', updateRoleToEducator)

// Add Courses 
// educatorRouter.post('/add-course', upload.single('image'), protectEducator, addCourse)
educatorRouter.post('/add-course', upload.single('image'),  addCourse)

// Get Educator Courses 
educatorRouter.post('/courses',  getEducatorCourses)

// Get Educator Dashboard Data
educatorRouter.post('/dashboard',  educatorDashboardData)

// Get Educator Students Data
educatorRouter.post('/enrolled-students',  getEnrolledStudentsData)


export default educatorRouter;