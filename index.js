const express = require("express");
const cors = require("cors");
const app = express();

const whitelist = ["http://localhost"];
const corsOptions = {
  origin: function(origin, callback) {
    console.log("Origin is:  ", origin);
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  }
};

app.use(cors(corsOptions));

app.get("/", function(req, res, next) {
  res.json({ msg: "This is CORS-enabled for all origins!" });
});

app.listen(80, function() {
  console.log("CORS-enabled web server listening on port 80");
});
