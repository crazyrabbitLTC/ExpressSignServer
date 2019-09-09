require("dotenv").config();
const port = process.env.PORT || 88;
const express = require("express");
const EthCrypto = require("eth-crypto");
const cors = require("cors");
const asyncHandler = require("express-async-handler");
const app = express();
const { signMessage } = require("./utils/signUtils.js");

//Connect to Web3
const Web3Eth = require("web3-eth");
const eth = new Web3Eth("ws://localhost:8545");

//Not sure if we need this.
const generatedKeyPair = EthCrypto.createIdentity();
const trustedPrivKey =
  process.env.TRUSTED_SIGNER_PRIVKEY || generatedKeyPair.privateKey;
const trustedPubKey = EthCrypto.publicKeyByPrivateKey(trustedPrivKey);
const RELAY_HUB =
  process.env.RELAY_HUB || "0xd216153c06e857cd7f72665e0af1d7d82172f494";

const RECIPIENT_ADDRESS = process.env.RECIPIENT_ADDRESS || null;

//Check to be sure we have our contract addresses. Kill server if not provided.
if (!RECIPIENT_ADDRESS) {
  process.on("exit", function(code) {
    return console.log(
      "ERROR: Contract Addresses are required to run signing server. Please edit the .env"
    );
  });
  process.exit(22);
}

const whitelist = ["http://localhost", "localhost:3001"];
const corsOptions = {
  origin: function(origin, callback) {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  }
};

//SERVER CODE STARTS HERE:

//app.use(cors(corsOptions));
app.use(express.json());

//Expose the JSON Body:
app.post(
  "/checkSig",
  asyncHandler(async (req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "localhost:3001");
    const obj = req.body;
    let result;

    console.log(`Request for Signature:`);
    console.dir(obj);

    try {
      result = await signMessage(obj, trustedPrivKey);
    } catch (error) {
      console.log(error);
    }

    if (result) {
      return res.status(200).json(result);
    } else {
      return res.status(404).send();
    }
  })
);

var server = app.listen(3000, function() {
  var port = server.address().port;
  console.log("Example app listening at port %s", port);
  console.log(
    "TrustedPubKey is: ",
    EthCrypto.publicKey.toAddress(trustedPubKey)
  );
  console.log("TrustedPrivKey is: ", trustedPrivKey);
});
module.exports = server;
