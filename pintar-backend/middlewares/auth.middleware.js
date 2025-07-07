import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config({ path: ".env.dev" });
import { v4 as uuidv4 } from "uuid";
const authenticateToken = (req, res, next) => {
  console.log("Authenticating token...");
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1];
  console.log("Received token:", token);

  if (!token) {
    console.log("No token provided");
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error("Token verification failed:", err.message);
      return res.sendStatus(403);
    }
    req.user = user;
    console.log("Token verified for user:", user.email || user.username);
    next();
  });
};

export { authenticateToken };
