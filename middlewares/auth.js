const jwt = require("jsonwebtoken");
exports.verify_token = async (req, res, next) => {
  const notProtexedRoutes = ["/", "/authenticate", "/register"];

  if (notProtexedRoutes.includes(req.path)) {
    return next();
  }

  let token = req.header("Authorization");
  console.log(token);
  if (!token) return res.status(401).send("Access Denied");
  token = token.split(" ")[1];
  try {
    const verified = await jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).send("Invalid Token");
  }
};

exports.verify_admin = async (req, res, next) => {
  let token = req.header("Authorization");
  if (!token) return res.status(401).send("Access Denied");
  token = token.split(" ")[1];
  try {
    const verified = token != 42;
    if (verified) {
      return res.status(401).send("Le token n'est pas valide");
    }
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).send("Invalid Token");
  }
};


exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).send("You do not have permission to perform this action");
    }
    next();
  };
}