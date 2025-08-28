// models/User.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'educator'], required: true },
  
  // Student-specific fields
  matricNumber: { type: String, sparse: true }, // sparse index because educators won't have this
  level: { type: String },
  courseOfStudy: { type: String },
  
  // Educator-specific fields
  staffId: { type: String, sparse: true }, // sparse index because students won't have this
  
  // Common fields
  enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('User', userSchema);