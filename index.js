const express = require("express");
const { verify_token } = require("./middlewares/auth");

const app = express();
app.use(verify_token)
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/restricted1", (req, res) => {
  res.send("This is a restricted route");
});

app.get("/restricted2", (req, res) => {
  res.send("This is a restricted route");
});

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
