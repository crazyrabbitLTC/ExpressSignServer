require("dotenv").config();
const port = process.env.PORT || 88;
const express = require("express");
const EthCrypto = require("eth-crypto");
const cors = require("cors");
const app = express();


const generatedKeyPair = EthCrypto.createIdentity();
const trustedSigner =
  process.env.TRUSTED_SIGNER ||
  EthCrypto.publicKey.toAddress(generatedKeyPair.publicKey);
console.log("Trusted Signer is: ", trustedSigner);

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

app.listen(port, function() {
  console.log("CORS-enabled web server listening on port 80");
});
