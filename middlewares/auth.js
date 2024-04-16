exports.verify_token = async (req, res, next) => {

    const notProtexedRoutes = ["/"];

    if (notProtexedRoutes.includes(req.path)) {
        return next();
    }

  let token = req.header("Authorization");
  console.log(token);
  if (!token) return res.status(401).send("Access Denied");
  token = token.split(" ")[1];
  try {
    const verified = token == 42 ? 42 : 0;
    if (verified == 0) {
      return res.status(401).send("Le token n'est pas valide");
    }
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
