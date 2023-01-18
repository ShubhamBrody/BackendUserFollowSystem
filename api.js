require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const mongoose = require("mongoose");
const User = require("./models/users.model");

mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => console.log("Connected to mongodb!"))
  .catch((err) => console.log(err));

const router = express.Router();
var secret = process.env.JWT_SECRET;

async function getAuth(token) {
  finaldata = { status: "Not Verified" };
  await axios
    .post(
      "http://localhost:3000/api/user/",
      {},
      {
        headers: { TOKEN_HEADER: token },
      }
    )
    .then((data) => {
      if (data.data.status === "Successfully Verified") {
        finaldata = data.data;
      }
    })
    .catch((err) => {
      finaldata = finaldata;
    });
  return finaldata;
}

router.get("/", (req, res) => {
  res.send("This is the api endpoint.");
});

router.post("/authenticate", (req, res) => {
  email = req.body.email;
  password = req.body.password; // Expecting an alreay encrypted password, so I am not encrypting the password here.
  User.findOne({ email: email, password: password })
    .then((user) => {
      payload = {
        email: email,
        password: password,
        id: user._id.toString(),
      };
      res.send(jwt.sign(payload, secret));
    })
    .catch((err) => {
      res.send("Error: " + err);
    });
});

router.post("/user", (req, res) => {
  let tokenHeaderKey = process.env.TOKEN_HEADER_KEY;
  let jwtSecretKey = secret;

  try {
    const token = req.header(tokenHeaderKey);
    const verified = jwt.verify(token, jwtSecretKey);
    console.log("V", verified);
    if (verified) {
      return res.json({ ...verified, status: "Successfully Verified" });
    } else {
      return res.status(401).send(error);
    }
  } catch (error) {
    return res.status(401).send(error);
  }
});

router.get("/addUsers", (req, res) => {
  data = [
    {
      email: "st8896464352@gmail.com",
      password: "qweretyuiop",
      followedBy: [],
      following: [],
      posts: [],
      postsLiked: [],
    },
    {
      email: "aaaaaaaaaaaa@gmail.com",
      password: "qweretyuiop",
      followedBy: [],
      following: [],
      posts: [],
      postsLiked: [],
    },
    {
      email: "qqqqqqqqqqqq@gmail.com",
      password: "qweretyuiop",
      followedBy: [],
      following: [],
      posts: [],
      postsLiked: [],
    },
    {
      email: "qweqweqweqwe@gmail.com",
      password: "qweretyuiop",
      followedBy: [],
      following: [],
      posts: [],
      postsLiked: [],
    },
    {
      email: "werwerwerwer@gmail.com",
      password: "qweretyuiop",
      followedBy: [],
      following: [],
      posts: [],
      postsLiked: [],
    },
    {
      email: "asdasdasdasd@gmail.com",
      password: "qweretyuiop",
      followedBy: [],
      following: [],
      posts: [],
      postsLiked: [],
    },
  ];
  User.insertMany(data)
    .then((d) => {
      res.send("Data inserted successfully!");
    })
    .catch((err) => {
      res.send("Error occured: " + err);
    });
});

router.get("/follow/:id", async (req, res) => {
  // current user follows user with Id as id
  console.log(req.body.token);
  getAuth(req.body.token).then((auth) => {
    console.log("Auth: ", auth);
    if (auth.status !== "Successfully Verified") {
      return res.status(401).send("Authentication Error!");
    }
    const id = req.params.id;
    const currentId = auth.id;

    var currentFollowing = 0,
      currentFollowedBy = 0;

    User.findOne({ _id: id }, (err, user) => {
      if (err) return res.status(404).send("Error occured: " + err);
      if (user) {
        console.log(user);
        console.log(typeof user.followedBy);
        if (!user.followedBy.includes(currentId)) {
          user.followedBy = [...user.followedBy, currentId];
          user.save();
        }
      }
    });
    User.findOne({ _id: currentId }, (err, user) => {
      if (err) return res.status(404).send("Error occured: " + err);
      if (user) {
        if (!user.following.includes(id)) {
          user.following = [...user.following, id];
          user.save();
        }
        currentFollowing = user.following.length;
        currentFollowedBy = user.followedBy.length;
        return res.json({
          following: currentFollowing,
          followedBy: currentFollowedBy,
          userFollowed: true,
        });
      }
    });
  });
});

router.get("/unfollow/:id", async (req, res) => {
  // current user follows user with Id as id
  console.log(req.body.token);
  getAuth(req.body.token).then((auth) => {
    console.log("Auth: ", auth);
    if (auth.status !== "Successfully Verified") {
      return res.status(401).send("Authentication Error!");
    }
    const id = req.params.id;
    const currentId = auth.id;

    var currentFollowing = 0,
      currentFollowedBy = 0;

    User.findOne({ _id: id }, (err, user) => {
      if (err) return res.status(404).send("Error occured: " + err);
      if (user) {
        console.log(user);
        console.log(typeof user.followedBy);
        if (user.followedBy.includes(currentId)) {
          user.followedBy.splice(user.followedBy.indexOf(currentId), 1);
        }
        user.save();
      }
    });
    User.findOne({ _id: currentId }, (err, user) => {
      if (err) return res.status(404).send("Error occured: " + err);
      if (user) {
        if (user.following.includes(id)) {
          user.following.splice(user.following.indexOf(id), 1);
        }
        currentFollowing = user.following.length;
        currentFollowedBy = user.followedBy.length;
        user.save();
        return res.json({
          following: currentFollowing,
          followedBy: currentFollowedBy,
          userFollowed: true,
        });
      }
    });
  });
});

module.exports = router;
