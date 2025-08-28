import express from "express";
import {
  addUserRating,
  getUserCourseProgress,
  getUserData,
  purchaseCourse,
  updateUserCourseProgress,
  userEnrolledCourses,getMe
} from "../controllers/userController.js";
import auth from '../middleware/auth.js';
const userRouter = express.Router();

// Get user Data
userRouter.post("/data", getUserData);
userRouter.post("/purchase", purchaseCourse);
userRouter.post("/enrolled-courses", userEnrolledCourses);
userRouter.post("/update-course-progress", updateUserCourseProgress);
userRouter.post("/get-course-progress", getUserCourseProgress);
userRouter.post("/add-rating", addUserRating);
userRouter.get('/me', auth, getMe);

export default userRouter;
