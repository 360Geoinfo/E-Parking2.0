import jwt from 'jsonwebtoken';

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  // Check if Authorization header exists
  if (!authHeader) {
    return res.status(401).json({ message: 'Authorization header missing' });
  }

  const token = authHeader.split(' ')[1]; // Expecting format: "Bearer <token>"

  // Check if token is present after 'Bearer'
  if (!token) {
    return res.status(401).json({ message: 'Token missing from header' });
  }

  // Verify token
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }

    req.user = user; // Save decoded user info to request
    next(); // Proceed to the next middleware or route
  });
};

export default authenticateToken;
