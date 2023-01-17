require('dotenv').config()
const express = require("express");
const router = express.Router();
const jwt = require('jsonwebtoken');

var secret = process.env.JWT_SECRET;

router.get("/", (req, res) => {
  res.send("This is the api endpoint.");
});

router.post("/authenticate", (req, res) => {
  email = req.body.email;
  console.log("SECRET: ", secret)
  password = req.body.password; // Expecting an alreay encrypted password, so I am not encrypting the password here.
  console.log(email, password);
  payload = {
    emial: email,
    password: password,
  };

  res.send(jwt.sign(payload, secret));
});

router.post("/user", (req, res) => {
  let tokenHeaderKey = process.env.TOKEN_HEADER_KEY;
  let jwtSecretKey = secret;

  try {
    const token = req.header(tokenHeaderKey);
    const verified = jwt.verify(token, jwtSecretKey);
    if (verified) {
      return res.send("Successfully Verified");
    } else {
      return res.status(401).send(error);
    }
  } catch (error) {
    return res.status(401).send(error);
  }
});

module.exports = router;
