import Course from "../models/Course.js";
import { CourseProgress } from "../models/CourseProgress.js";
import { Purchase } from "../models/Purchase.js";
import User from "../models/User.js";
import stripe from "stripe";

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
export const purchaseCourse = async (req, res) => {
  try {
    const { courseId,email } = req.body;
    const { origin } = req.headers;

    // const userId = req.auth.userId;

    const courseData = await Course.findById(courseId);
    const userData = await User.findOne({email});

    if (!userData || !courseData) {
      return res.json({ success: false, message: "Data Not Found" });
    }

    const purchaseData = {
      courseId: courseData._id,
      userId:userData._id,
      amount: (
        courseData.coursePrice -
        (courseData.discount * courseData.coursePrice) / 100
      ).toFixed(2),
    };

    const newPurchase = await Purchase.create(purchaseData);

    // Stripe Gateway Initialize
    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

    const currency = process.env.CURRENCY.toLocaleLowerCase();

    // Creating line items to for Stripe
    const line_items = [
      {
        price_data: {
          currency,
          product_data: {
            name: courseData.courseTitle,
          },
          unit_amount: Math.floor(newPurchase.amount) * 100,
        },
        quantity: 1,
      },
    ];

    const session = await stripeInstance.checkout.sessions.create({
      success_url: `${origin}/loading/my-enrollments`,
      cancel_url: `${origin}/`,
      line_items: line_items,
      mode: "payment",
      metadata: {
        purchaseId: newPurchase._id.toString(),
      },
    });

    res.json({ success: true, session_url: session.url });
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
        userId:userData._id,
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
