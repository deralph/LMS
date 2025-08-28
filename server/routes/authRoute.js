import {
  studentRegistration,
  educatorRegistration,
  studentLogin,
  educatorLogin,
  } from "../controllers/authController.js";

// routes/auth.js
import express from 'express';

const router = express.Router();

router.post('/register/student', studentRegistration);
router.post('/register/educator', educatorRegistration);
router.post('/login/student', studentLogin);
router.post('/login/educator', educatorLogin);


export default router;