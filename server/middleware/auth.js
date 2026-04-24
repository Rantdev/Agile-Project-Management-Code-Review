const jwt = require("jsonwebtoken");

const protect = async (req, res, next) => {
  let token;

  console.log("🔐 Checking authentication...");

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
    console.log("✅ Token found");
  }

  if (!token) {
    console.log("❌ No token provided");
    return res.status(401).json({
      success: false,
      error: "Not authorized - No token provided",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    console.log("✅ User authenticated:", req.user.email);
    next();
  } catch (error) {
    console.log("❌ Invalid token:", error.message);
    return res.status(401).json({
      success: false,
      error: "Not authorized - Invalid or expired token",
    });
  }
};

module.exports = { protect };