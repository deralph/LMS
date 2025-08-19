// server.js

import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './configs/mongodb.js';
import connectCloudinary from './configs/cloudinary.js';
import userRouter from './routes/userRoutes.js';
import educatorRouter from './routes/educatorRoutes.js';
import courseRouter from './routes/courseRoute.js';


const app = express();

// Connect to DB + Cloudinary
await connectDB();
await connectCloudinary();

// Public middleware
app.use(cors());
app.use(express.json());

// Public/Test routes
app.get('/', (req, res) => res.send('API Working'));

// Protected API routes (require a valid Auth0 access token)
app.use('/api/educator',   educatorRouter);
app.use('/api/course',    courseRouter);
app.use('/api/user',    userRouter);

// Port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
