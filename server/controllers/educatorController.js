import { v2 as cloudinary } from 'cloudinary'
import Course from '../models/Course.js';
import { Purchase } from '../models/Purchase.js';
import User from '../models/User.js';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

// controllers/educatorController.js


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

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



// Configure multer for temporary file storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create uploads directory if it doesn't exist
    const dir = 'uploads/';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    // Preserve original file extension
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + ext);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

// File upload endpoint
export const uploadFile = async (req, res) => {
  try {
    const file = req.file;
    console.log("file = ",file)
    const { resourceType = 'auto', fileName } = req.body;
console.log(resourceType)
    if (!file) {
      return res.json({ success: false, message: 'No file uploaded' });
    }

    // Validate file type
    const fileExt = path.extname(file.originalname).toLowerCase();
    if (resourceType === 'raw' && fileExt !== '.pdf') {
      fs.unlinkSync(file.path);
      return res.json({ success: false, message: 'Only PDF files are allowed' });
    }

    // Upload to Cloudinary with proper resource type
    const uploadOptions = {
      resource_type: resourceType,
      // Use original file name if provided
      public_id: fileName ? path.parse(fileName).name : undefined,
    };
    console.log("uploadOptions = ",uploadOptions)

    // const result = await cloudinary.uploader.upload(file.path, uploadOptions);
    const result = await cloudinary.uploader.upload(file.path, function(res,err){console.log(res,err)});

    console.log("result url = ", result.secure_url)

    // Clean up the temporary file
    fs.unlinkSync(file.path);

    res.json({
      success: true,
      fileUrl: result.secure_url
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    
    // Clean up temporary file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.json({
      success: false,
      message: error.message
    });
  }
};

// Add New Course
export const addCourse = async (req, res) => {
  try {
    const { courseData, email } = req.body;
    const imageFile = req.file;

    const userData = await User.findOne({ email });
    const educatorId = userData._id;

    if (!imageFile) {
      return res.json({ success: false, message: 'Thumbnail Not Attached' });
    }

    // Upload thumbnail with public access
    const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
      access_mode: 'public' // Ensure public access
    });

    const parsedCourseData = await JSON.parse(courseData);
    parsedCourseData.educator = educatorId;
    parsedCourseData.courseThumbnail = imageUpload.secure_url;

    const newCourse = await Course.create(parsedCourseData);
    res.json({ success: true, message: 'Course Added' });

  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

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

    
            const courses = await Course.find({ educator })
          .populate("enrolledStudents", "name email imageUrl");


        const totalCourses = courses.length;

        const courseIds = courses.map(course => course._id);

        // Calculate total earnings from purchases
        const purchases = await Purchase.find({
            courseId: { $in: courseIds },
            status: 'completed'
        });

        const totalEarnings = purchases.reduce((sum, purchase) => sum + purchase.amount, 0);

    // console.log("educator courses = ", courses);

    // Collect enrolled students from all courses
    const enrolledStudents = courses.flatMap(course =>
      course.enrolledStudents.map(student => ({
        student,
        courseTitle: course.courseTitle,
        enrolledDate: course.createdAt, // Or you can track specific enrollment date if you store it
      }))
    );
console.log("dashboardData = ",  {
                totalEarnings,
                enrolledStudents,
                totalCourses
              })
              console.log("enrolledStudentsData = ",enrolledStudents) 
        res.json({
            success: true,
            dashboardData: {
                totalEarnings,
                enrolledStudentsData:enrolledStudents,
                totalCourses
            }
        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};
// Get Enrolled Students Data with Course Enrollment
export const getEnrolledStudentsData = async (req, res) => {
  try {
    const { email } = req.body;

    // Get educator by email
    const userData = await User.findOne({ email });
    const educator = userData._id;

    console.log("educator id = ", educator);

    // Fetch all courses created by this educator (with enrolled students populated)
    const courses = await Course.find({ educator })
      .populate("enrolledStudents", "name email imageUrl");

    console.log("educator courses = ", courses);

    // Collect enrolled students from all courses
    const enrolledStudents = courses.flatMap(course =>
      course.enrolledStudents.map(student => ({
        student,
        courseTitle: course.courseTitle,
        enrolledDate: course.createdAt, // Or you can track specific enrollment date if you store it
      }))
    );

    console.log("educator enrolled students = ", enrolledStudents);

    res.json({
      success: true,
      enrolledStudents,
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};
