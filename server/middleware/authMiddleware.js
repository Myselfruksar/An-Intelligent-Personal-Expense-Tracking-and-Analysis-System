const jwt = require("jsonwebtoken");

exports.auth = (req, res, next) => {
 
  const token =  req.header("Authorization").replace("Bearer ", "")

  if (!token || token === undefined) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("token decoded",decoded)
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};
