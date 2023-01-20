require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const mongoose = require("mongoose");
const User = require("../models/users.model");
const Post = require("../models/posts.model");
const Comment = require("../models/comments.model");

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
      posts: [],
      comments: [],
      likedPosts: [],
    },
    {
      email: "aaaaaaaaaaaa@gmail.com",
      password: "qweretyuiop",
      followedBy: [],
      following: [],
      posts: [],
      postsLiked: [],
      posts: [],
      comments: [],
      likedPosts: [],
    },
    {
      email: "qqqqqqqqqqqq@gmail.com",
      password: "qweretyuiop",
      followedBy: [],
      following: [],
      posts: [],
      postsLiked: [],
      posts: [],
      comments: [],
      likedPosts: [],
    },
    {
      email: "qweqweqweqwe@gmail.com",
      password: "qweretyuiop",
      followedBy: [],
      following: [],
      posts: [],
      postsLiked: [],
      posts: [],
      comments: [],
      likedPosts: [],
    },
    {
      email: "werwerwerwer@gmail.com",
      password: "qweretyuiop",
      followedBy: [],
      following: [],
      posts: [],
      postsLiked: [],
      posts: [],
      comments: [],
      likedPosts: [],
    },
    {
      email: "asdasdasdasd@gmail.com",
      password: "qweretyuiop",
      followedBy: [],
      following: [],
      posts: [],
      postsLiked: [],
      posts: [],
      comments: [],
      likedPosts: [],
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
  getAuth(req.body.token)
    .then((auth) => {
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
    })
    .catch((err) => {
      return res.status(500).send("Error occured: " + err);
    });
});

router.post("/posts", (req, res) => {
  getAuth(req.body.token)
    .then((auth) => {
      console.log("Auth: ", auth);
      if (auth.status !== "Successfully Verified") {
        return res.status(401).send("Authentication Error!");
      }
      title = req.body.title;
      description = req.body.description;
      if (!title || !description) return res.send("No proper details provided");
      Post.create({
        createdBy: auth.id,
        title: title,
        description: description,
        createdAt: new Date(),
        likes: 0,
      }).then((result) => {
        console.log("rerererer", result);
        User.findOne({ _id: auth.id })
          .then((user) => {
            console.log("results", user);
            user.posts = [...user.posts, result._id.toString()];
            user.save();
            return res.json({
              id: result._id.toString(),
              createdAt: result.createdAt,
              title: result.title,
              description: result.description,
            });
          })
          .catch((err) => {
            console.log(err);
            return res.send(err);
          });
      });
    })
    .catch((err) => {
      return res.status(500).send("Authentication Error");
    });
});

router.delete("/posts/:id", (req, res) => {
  id = req.params.id;
  getAuth(req.body.token)
    .then((auth) => {
      console.log("Auth: ", auth);
      if (auth.status !== "Successfully Verified") {
        return res.status(401).send("Authentication Error!");
      }
      Post.findByIdAndDelete({
        _id: id,
      }).then((result) => {
        console.log("asjhfdashjf", result);
        User.findOne({ _id: auth.id })
          .then((user) => {
            console.log("results", user);
            if (user.posts.includes(result.id)) {
              user.posts.splice(user.posts.indexOf(result.id), 1);
            }
            user.save();
            return res.send(
              "Post with id: " + result.id + " removed Successfully"
            );
          })
          .catch((err) => {
            console.log(err);
            return res.send(err);
          });
      });
    })
    .catch((err) => {
      return res.status(500).send("Authentication Error");
    });
});

router.post("/like/:id", (req, res) => {
  id = req.params.id;
  getAuth(req.body.token)
    .then((auth) => {
      console.log("Auth: ", auth);
      if (auth.status !== "Successfully Verified") {
        return res.status(401).send("Authentication Error!");
      }
      User.findOne({ _id: auth.id })
        .then((user) => {
          if (!user.posts.includes(id) && !user.likedPosts.includes(id)) {
            user.likedPosts = [...user.likedPosts, id];
            user.save();
            Post.findOne({ _id: id })
              .then((result) => {
                result.likes++;
                result.save();
                return res.json({
                  id: result._id.toString(),
                  createdAt: result.createdAt,
                  title: result.title,
                  description: result.description,
                  likes: result.likes,
                });
              })
              .catch((err) => {
                console.log(err);
                return res.send(err);
              });
          } else {
            return res.send("Post already liked or it's your own post");
          }
        })
        .catch((err) => {
          console.log(err);
          return res.send(err);
        });
    })
    .catch((err) => {
      return res.status(500).send("Authentication Error");
    });
});

router.post("/unlike/:id", (req, res) => {
  id = req.params.id;
  getAuth(req.body.token)
    .then((auth) => {
      console.log("Auth: ", auth);
      if (auth.status !== "Successfully Verified") {
        return res.status(401).send("Authentication Error!");
      }
      User.findOne({ _id: auth.id })
        .then((user) => {
          if (user.likedPosts.includes(id)) {
            user.likedPosts.splice(user.likedPosts.indexOf(id), 1);
            user.save();
            Post.findOne({ _id: id })
              .then((result) => {
                result.likes--;
                result.save();
                return res.json({
                  id: result._id.toString(),
                  createdAt: result.createdAt,
                  title: result.title,
                  description: result.description,
                  likes: result.likes,
                });
              })
              .catch((err) => {
                console.log(err);
                return res.send(err);
              });
          }
        })
        .catch((err) => {
          console.log(err);
          return res.send(err);
        });
    })
    .catch((err) => {
      return res.status(500).send("Authentication Error");
    });
});

router.post("/comment/:id", (req, res) => {
  id = req.params.id;
  getAuth(req.body.token)
    .then((auth) => {
      console.log("Auth: ", auth);
      if (auth.status !== "Successfully Verified") {
        return res.status(401).send("Authentication Error!");
      }
      title = req.body.title;
      description = req.body.description;
      if (!title || !description) return res.send("No proper details provided");
      Comment.create({
        createdBy: auth.id,
        createdFor: id,
        title: title,
        description: description,
        createdAt: new Date(),
      })
        .then((comment) => {
          Post.findOne({ _id: id })
            .then((post) => {
              post.comments = [...post.comments, comment._id.toString()];
              post.save();
              User.findOne({ _id: auth.id })
                .then((user) => {
                  user.comments = [...user.comments, comment._id.toString()];
                  user.save();
                  return res.json({ comment: comment, post: post, user, user });
                })
                .catch((err) => {
                  return res.send("Error occured: ", err);
                });
            })
            .catch((err) => {
              return res.send("Error occured: ", err);
            });
        })
        .catch((err) => {
          return res.send("Error occured: ", err);
        });
    })
    .catch((err) => {
      return res.status(500).send("Authentication Error");
    });
});

router.get("/posts/:id", (req, res) => {
  id = req.params.id;
  Post.findOne({ _id: id })
    .then((post) => {
      result = {
        title: post.title,
        description: post.description,
        likes: post.likes,
        comments: [],
      };
      Comment.find({ createdFor: id })
        .then((comments) => {
          result.comments = comments.map((comment) => {
            return {
              title: comment.title,
              description: comment.description,
            };
          });
          return res.json(result);
        })
        .catch((err) => {
          return res.send(err);
        });
    })
    .catch((err) => {
      return res.send(err);
    });
});

router.get("/all_posts", (req, res) => {
  getAuth(req.body.token)
    .then((auth) => {
      console.log("Auth: ", auth);
      if (auth.status !== "Successfully Verified") {
        return res.status(401).send("Authentication Error!");
      }
      Post.find({ createdBy: auth.id })
        .then((posts) => {
          listPost = []
          finalResult = {}
          posts.forEach((post) => {
            finalResult[post._id] = {
              id: post._id,
              title: post.title,
              description: post.description,
              likes: post.likes,
              createdAt: post.createdAt,
              comments: [],
            };
            listPost.push(post._id)
          })
          Comment.find({ createdFor: listPost })
            .then((comments) => {
              console.log("COMMENTS: ", comments);
              comments.forEach((comment, index) => {
                finalResult[comment.createdFor].comments.push({
                  title: comment.title,
                  description: comment.description,
                  createdAt: comment.createdAt,
                });
              });
              return res.json(finalResult);
            })
            .catch((err) => {
              console.log(err)
              return res.send(err);
            });
        })
        .catch((err) => {
          console.log(err)
          return res.send(err);
        });
    })
    .catch((err) => {
      return res.status(500).send("Authentication Error");
    });
});

module.exports = router;
