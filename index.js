const express = require("express");
const { verify_token, restrictTo } = require("./middlewares/auth");
const jwt = require("jsonwebtoken");
const registeredUsers = require("./inMemoryUserRepository");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");

const app = express();
app.use(express.json());
app.use(verify_token);
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/restricted1", (req, res) => {
  res.send("This is a restricted route");
});

app.get("/restricted2", restrictTo("admin"), (req, res) => {
  res.send("This is a restricted route");
});

const authentiactedUsers = {};

const comparePassword = async (password, hashedPassword) => {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    console.error("Error comparing password:", error);
    throw error;
  }
};

const checkCredentials = async (email, password) => {
  try {
    const user_exists = registeredUsers.find((user) => user.email === email);

    if (!user_exists) {
      return false;
    }

    if(!await comparePassword(password, user_exists.password)){
      return false;
    }

    return user_exists;

  } catch (e) {
    console.error("Error checking credentials:", e);
    throw e;
  }
};

app.post("/authenticate", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await checkCredentials(email, password);

    if (!user) {
      return res.status(403).send("Invalid credentials");
    }

    const token = jwt.sign({ ...user }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    authentiactedUsers[token] = email;

    res.json({ token, uuid: uuidv4() });
  } catch (e) {
    console.error("Error authenticating user:", e);
    res.status(500).send("Internal server error");
  }
});

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});

const hashPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  } catch (error) {
    console.error("Error hashing password:", error);
    throw error;
  }
};

const newUserRegistered = (email, password, role='user') => {
  const user_exists = registeredUsers.find((user) => user.email === email);

  if (user_exists) {
    return false;
  }

  registeredUsers.push({ email, password, role });

  return true;
};

app.post("/register", async (req, res) => {
  try {
    const { email, password,role } = req.body;

    const hashedPassword = await hashPassword(password);

    if (!newUserRegistered(email, hashedPassword,role)) {
      return res.status(403).send("User already exists");
    }

    res.json({ email });
  } catch (e) {
    console.error("Error registering user:", e);
    res.status(500).send("Internal server error");
  }
});
