import jwt from "jsonwebtoken";
import User from "../models/user.js"; // adjust path

export const protectEducator = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    console.log("auth header for token", authHeader)
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("i got to 401 no auth header")

      return res.status(401).json({ success: false, message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    // Verify token (replace with your Auth0 public key or secret)
    const decoded = jwt.verify(token, process.env.JWT_SECRET); 
    // If using Auth0, you'll need jwks-rsa instead of JWT_SECRET

    // Find user in DB
    const user = await User.findOne({email:decoded.email}); // sub = Auth0 user ID

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.role !== "educator") {
      return res.status(403).json({ success: false, message: "Unauthorized Access" });
    }

    req.user = user; // store full user object for later use
    next();

  } catch (error) {
    console.log("error in protect edu ", erroraqq21)
    res.status(401).json({ success: false, message: error.message });
  }
};
