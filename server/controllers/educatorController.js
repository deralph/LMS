import { v2 as cloudinary } from 'cloudinary'
import Course from '../models/Course.js';
import { Purchase } from '../models/Purchase.js';
import User from '../models/User.js';

// controllers/educatorController.js


// update role to educator
export const updateRoleToEducator = async (req, res) => {
  try {
    // Auth0 JWT via express-jwt will put claims on req.auth (or req.user)
    // use either userId or sub depending on your setup
    // const userId = req.auth.userId ?? req.auth.sub;
    
     const { email } = req.body;
     console.log("user email to become educator ",email)
    const userData = await User.findOne({email});
    console.log("user data for update ", userData)
    const userId = userData._id
    console.log("user id for update", userId)

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // Update the Mongo user document
    const user = await User.findByIdAndUpdate(
      userId,
      { role: "educator" },
      { new: true }
    );

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
console.log("user in update role ",user)
    return res.json({
      success: true,
      message: "You can publish a course now",
    });

  } catch (error) {
    console.error("Error updating role:", error);
    return res
      .status(500)
      .json({ success: false, message: error.message });
  }
};

// Add New Course
export const addCourse = async (req, res) => {

    try {

        const { courseData,email } = req.body

        const imageFile = req.file

        // const educatorId = req.auth.userId

    
    const userData = await User.findOne({email});
    const educatorId = userData._id


        if (!imageFile) {
            return res.json({ success: false, message: 'Thumbnail Not Attached' })
        }

        const parsedCourseData = await JSON.parse(courseData)

        parsedCourseData.educator = educatorId

        const newCourse = await Course.create(parsedCourseData)

        const imageUpload = await cloudinary.uploader.upload(imageFile.path)

        newCourse.courseThumbnail = imageUpload.secure_url

        await newCourse.save()

        res.json({ success: true, message: 'Course Added' })

    } catch (error) {

        res.json({ success: false, message: error.message })

    }
}

// Get Educator Courses
export const getEducatorCourses = async (req, res) => {
    try {

        // const educator = req.auth.userId
        
         const { email } = req.body;
    
    const userData = await User.findOne({email});
    const educator = userData._id


        const courses = await Course.find({ educator })

        res.json({ success: true, courses })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Get Educator Dashboard Data ( Total Earning, Enrolled Students, No. of Courses)
export const educatorDashboardData = async (req, res) => {
    try {
        // const educator = req.auth.userId;
           const { email } = req.body;
    
    const userData = await User.findOne({email});
    const educator = userData._id


        const courses = await Course.find({ educator });

        const totalCourses = courses.length;

        const courseIds = courses.map(course => course._id);

        // Calculate total earnings from purchases
        const purchases = await Purchase.find({
            courseId: { $in: courseIds },
            status: 'completed'
        });

        const totalEarnings = purchases.reduce((sum, purchase) => sum + purchase.amount, 0);

        // Collect unique enrolled student IDs with their course titles
        const enrolledStudentsData = [];
        for (const course of courses) {
            const students = await User.find({
                _id: { $in: course.enrolledStudents }
            }, 'name imageUrl');

            students.forEach(student => {
                enrolledStudentsData.push({
                    courseTitle: course.courseTitle,
                    student
                });
            });
        }

        res.json({
            success: true,
            dashboardData: {
                totalEarnings,
                enrolledStudentsData,
                totalCourses
            }
        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Get Enrolled Students Data with Purchase Data
export const getEnrolledStudentsData = async (req, res) => {
    try {
        // const educator = req.auth.userId;

           const { email } = req.body;
    
    const userData = await User.findOne({email});
    const educator = userData._id


        // Fetch all courses created by the educator
        const courses = await Course.find({ educator });

        // Get the list of course IDs
        const courseIds = courses.map(course => course._id);

        // Fetch purchases with user and course data
        const purchases = await Purchase.find({
            courseId: { $in: courseIds },
            status: 'completed'
        }).populate('userId', 'name imageUrl').populate('courseId', 'courseTitle');

        // enrolled students data
        const enrolledStudents = purchases.map(purchase => ({
            student: purchase.userId,
            courseTitle: purchase.courseId.courseTitle,
            purchaseDate: purchase.createdAt
        }));

        res.json({
            success: true,
            enrolledStudents
        });

    } catch (error) {
        res.json({
            success: false,
            message: error.message
        });
    }
};
