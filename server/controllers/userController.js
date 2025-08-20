import Course from "../models/Course.js";
import { CourseProgress } from "../models/CourseProgress.js";
import { Purchase } from "../models/Purchase.js";
import User from "../models/User.js";

// Get User Data
// export const getUserData = async (req, res) => {
//     try {

//         const userId = req.auth.userId

//         const user = await User.findById(userId)

//         if (!user) {
//             return res.json({ success: false, message: 'User Not Found' })
//         }

//         res.json({ success: true, user })

//     } catch (error) {
//         res.json({ success: false, message: error.message })
//     }
// }

// controllers/userController.js

export const registerUserIfNotExists = async (req, res) => {
  try {
    // const userId = req.auth.userId;
    // console.log(userId)
    const { name, email, imageUrl } = req.body;
    console.log(req.body)

    let user = await User.findOne({email});
console.log("first checking for user", user)
if (!user) {
  user = new User({
    name,
    email,
    imageUrl,
    role: "student", // default
  });
  
  await user.save();
  console.log("second checking for user", user)
      return res.json({ success: true, message: "User created", user });
    }

    res.json({ success: true, message: "User already exists", user });
  } catch (error) {
    console.log("error",error)
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserData = async (req, res) => {
  try {
    // const userId = req.auth.userId;

    const { name, email, imageUrl } = req.body;
    const user = await User.findOne({email});

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User Not Found" });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.log('error',error)
    res.status(500).json({ success: false, message: error.message });
  }
};

// Purchase Course
// Purchase Course
export const purchaseCourse = async (req, res) => {
  try {
    const { courseId, email } = req.body;
    const { origin } = req.headers;

    // Find course and user
    const courseData = await Course.findById(courseId);
    const userData = await User.findOne({ email });

    if (!userData || !courseData) {
      console.log("data not found in enrolling");
      return res.json({ success: false, message: "Data Not Found" });
    }

    // Calculate amount (still keep the structure)
    const purchaseData = {
      courseId: courseData._id,
      userId: userData._id,
      amount: (
        courseData.coursePrice -
        (courseData.discount * courseData.coursePrice) / 100
      ).toFixed(2),
    };

    // Save purchase in DB
    const newPurchase = await Purchase.create(purchaseData);
    console.log("new enrolled course ", newPurchase);

    // 🔑 Add course to user.enrolledCourses if not already there
    if (!userData.enrolledCourses.includes(courseData._id)) {
      userData.enrolledCourses.push(courseData._id);
      await userData.save();
    }

    // 🔑 Add user to course.enrolledStudents if not already there
    if (!courseData.enrolledStudents.includes(userData._id.toString())) {
      courseData.enrolledStudents.push(userData._id.toString());
      await courseData.save();
    }

   
    // Instead of Stripe session, send back success + redirect URL
    return res.json({
      success: true,
      message: "Course successfully enrolled for free",
      purchase: newPurchase,
      session_url: `${origin}/loading/my-enrollments`,
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};


// Users Enrolled Courses With Lecture Links
export const userEnrolledCourses = async (req, res) => {
  try {
    // const userId = req.auth.userId;
    const {email} = req.body

    const userData = await User.findOne({email}).populate("enrolledCourses");
    console.log("user data in enrolled courses",userData)

    res.json({ success: true, enrolledCourses: userData.enrolledCourses });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Update User Course Progress
export const updateUserCourseProgress = async (req, res) => {
  try {
    // const userId = req.auth.userId;

    const { courseId, lectureId,email } = req.body;

    const userData = await User.findOne({email});
    const userId = userData._id
    const progressData = await CourseProgress.findOne({ userId, courseId });

    if (progressData) {
      if (progressData.lectureCompleted.includes(lectureId)) {
        return res.json({
          success: true,
          message: "Lecture Already Completed",
        });
      }

      progressData.lectureCompleted.push(lectureId);
      await progressData.save();
    } else {
      await CourseProgress.create({
        userId,
        courseId,
        lectureCompleted: [lectureId],
      });
    }

    res.json({ success: true, message: "Progress Updated" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// get User Course Progress
export const getUserCourseProgress = async (req, res) => {
  try {
    // const userId = req.auth.userId;

    const { courseId,email } = req.body;
    
    const userData = await User.findOne({email});
    const userId = userData._id

    const progressData = await CourseProgress.findOne({ userId, courseId });

    res.json({ success: true, progressData });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Add User Ratings to Course
export const addUserRating = async (req, res) => {
  // const userId = req.auth.userId;
  const { courseId, rating,email } = req.body;
    
    const userData = await User.findOne({email});
    const userId = userData._id

  // Validate inputs
  if (!courseId || !userId || !rating || rating < 1 || rating > 5) {
    return res.json({ success: false, message: "InValid Details" });
  }

  try {
    // Find the course by ID
    const course = await Course.findById(courseId);

    if (!course) {
      return res.json({ success: false, message: "Course not found." });
    }

    const user = await User.findById(userId);

    if (!user || !user.enrolledCourses.includes(courseId)) {
      return res.json({
        success: false,
        message: "User has not purchased this course.",
      });
    }

    // Check is user already rated
    const existingRatingIndex = course.courseRatings.findIndex(
      (r) => r.userId === userId
    );

    if (existingRatingIndex > -1) {
      // Update the existing rating
      course.courseRatings[existingRatingIndex].rating = rating;
    } else {
      // Add a new rating
      course.courseRatings.push({ userId, rating });
    }

    await course.save();

    return res.json({ success: true, message: "Rating added" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};
