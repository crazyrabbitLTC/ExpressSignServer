require("dotenv").config();
const port = process.env.PORT || 3000;
const express = require("express");
const asyncHandler = require("express-async-handler");
const app = express();
const { signMessage } = require("./utils/signUtils.js");
const {
  getDatabase,
  addUser,
  deleteUser,
  checkUser
} = require("./utils/userDB.js");

app.use(express.json());

app.put(
  "/addUser",
  asyncHandler(async (req, res, next) => {
    const obj = req.body;
    console.log(obj);
    let tx;
    try {
      tx = await addUser(obj.user);
    } catch (error) {
      console.log(error);
    }
    if (tx) {
      res
        .status(200)
        .json({ success: true })
        .send();
    } else {
      res
        .status(501)
        .json({ success: false })
        .send();
    }
  })
);

app.post(
  "/checkUser",
  asyncHandler(async (req, res, next) => {
    const obj = req.body;
    console.log(obj);
    let tx;
    try {
      tx = await checkUser(obj.user);
    } catch (error) {
      console.log(error);
    }
    if (tx) {
      res
        .status(200)
        .json({ success: true })
        .send();
    } else {
      res
        .status(501)
        .json({ success: false })
        .send();
    }
  })
);

app.delete(
  "/deleteUser",
  asyncHandler(async (req, res, next) => {
    const obj = req.body;
    console.log(obj);
    let tx;
    try {
      tx = await deleteUser(obj.user);
    } catch (error) {
      console.log(error);
    }
    if (tx) {
      res
        .status(200)
        .json({ success: true })
        .send();
    } else {
      res
        .status(501)
        .json({ success: false })
        .send();
    }
  })
);

app.post(
  "/checkSig",
  asyncHandler(async (req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "localhost:3001");

    const obj = req.body;

    //check if user is allowed:
    let verifiedUser;
    try {
      verifiedUser = await checkUser(obj.from);
    } catch (error) {}
    if (verifiedUser) {
      let result;
      try {
        result = await signMessage(obj);
      } catch (error) {
        console.log(error);
      }
      if (result) {
        return res.status(200).json(result);
      } else {
        return res.status(404).json({ success: false }).send();
      }
    } else {
      return res.status(404).json({ success: false }).send();
    }
  })
);

var server = app.listen(3000, async function() {
  var port = server.address().port;
  await getDatabase();
  console.log("Example app listening at port %s", port);
});
module.exports = server;
