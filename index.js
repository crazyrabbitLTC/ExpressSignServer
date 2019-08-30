require("dotenv").config();
const port = process.env.PORT || 88;
const express = require("express");
const EthCrypto = require("eth-crypto");
const cors = require("cors");
const app = express();
const {
  signMessage,
  createUser,
  recoverSignerAddress,
  checkTimeStamp
} = require("./utils/signUtils.js");

//This is our Mock Database
//Each user should have this format, we index by publicKey and always require messages to be signed with a nonce  top revent reuse
// publickey:  { user:  userName, email:  email, encryptedPrivateKey: encryptedPrivateKey, validUser: bool, nonce: nonce}
// db = {
//   'address1': {user},
//   'address2': {user},
//   ...
// }

const db = {};

//Not sure if we need this.
const generatedKeyPair = EthCrypto.createIdentity();

const trustedPrivKey =
  process.env.TRUSTED_SIGNER_PRIVKEY || generatedKeyPair.privateKey;
const trustedPubKey = EthCrypto.publicKeyByPrivateKey(trustedPrivKey);
console.log("Trusted Pub Key: ", EthCrypto.publicKey.toAddress(trustedPubKey));

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

//SERVER CODE STARTS HERE:

app.use(cors(corsOptions));
app.use(express.json());

//On each interaction with the server, the user will be required on the front end to sign a message with
//their private key with the  most recent nonce. We recover the signer in Javascript and identify theu sers

//Here we check if we know this user.
//We
app.use((req, res, next) => {
  const obj = req.body;

  //Make sure we have the proper fields
  //In this case, we could someone sign something at the current time, and then allow them
  //to  submit in the "range" of allowed times.
  if (
    !obj.hasOwnProperty(obj.timeStamp) &&
    !obj.hasOwnProperty(obj.signature) &&
    !obj.hasOwnProperty(obj.pubKey)
  ) {
    const { timeStamp, signature, pubKey } = obj;
    console.log(
      "TimeStamp: ",
      timeStamp,
      " Signature: ",
      signature,
      " PubKey: ",
      pubKey
    );
    try {
      if (
        recoverSignerAddress(signature, timeStamp) === pubKey &&
        checkTimeStamp(timeStamp)
      ) {
        //Now we need to be sure that our TimeStamp is  "Around now"
        //This means our  user has signed  this "recently". 
        //We could theoretically use a nonce, but in this case, we only want to check
        //that we  KNOW  this user, not that  we  will pay their transactions. 
        //This means We can reasonably assume that the user has righst to see  private
        //Information we might have about them.
        req.user = db[pubKey];
        req.authenticated = true;
      } else {
        req.user = null;
        req.authenticated = false;
      }
    } catch (error) {
      req.user = null;
      req.authenticated = false;
    }
  } else {
    req.user = null;
    req.authenticated = false;
  }

  console.log("Authenticated: ", req.authenticated, "User: ", req.user);
  next();
});

// app.get("/", (req, res) => {
//   return res.send("Received a GET HTTP method");
// });
// app.post("/", (req, res) => {
//   return res.send("Received a POST HTTP method");
// });

//Signup Area
app.put("/", (req, res) => {
  const obj = req.body;
  createUser(req, res, db);
});

app.delete("/", (req, res) => {
  return res.send("Received a DELETE HTTP method");
});

app.get("/test", function(req, res, next) {
  res.json({ msg: "This is CORS-enabled for all origins!" });
});

app.post("//test", (req, res) => {
  //console.log(req.body);
  //console.log("Type of: ", typeof req.body);
  return res.json(req.body);
});

//Expose the JSON Body:
app.post("/checkSig", (req, res, next) => {
  const obj = req.body;
  // Decided if we want to sign the transaction or not.
  signMessage(req, res, RELAY_HUB, RECIPIENT_ADDRESS, trustedPrivKey);
});

app.listen(port, function() {
  console.log("CORS-enabled web server listening on port 80");
});
