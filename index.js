require("dotenv").config();
const port = process.env.PORT || 88;
const express = require("express");
const EthCrypto = require("eth-crypto");
const cors = require("cors");
const asyncHandler = require("express-async-handler");
const app = express();
const {
  signMessage,
  createUser,
  recoverSignerAddress,
  checkBlockNumber,
  propCheckAuthUser,
  notAuthenticated,
  logOut
} = require("./utils/signUtils.js");

//Connect to Web3
const Web3Eth = require("web3-eth");
const eth = new Web3Eth("ws://localhost:8545");

//This is our Mock Database
//Each user should have this format, we index by publicKey and always require messages to be signed with a nonce  top revent reuse
// publickey:  { user:  userName, email:  email, encryptedPrivateKey: encryptedPrivateKey, validUser: bool, nonce: nonce}
// {
// 	"userName": "DenTest2", 
// 	"email": "testEmail@email.com",
// 	"encryptedPrivKey": "encryptedPrivateKeyHere",
// 	"pubKey": "PublicKeyHere1",
// 	"signature": "blah blach blach",
// 	"blockNumber": "1"
// }

const db = {};

//Not sure if we need this.
const generatedKeyPair = EthCrypto.createIdentity();

const trustedPrivKey =
  process.env.TRUSTED_SIGNER_PRIVKEY || generatedKeyPair.privateKey;
const trustedPubKey = EthCrypto.publicKeyByPrivateKey(trustedPrivKey);
//console.log("Trusted Pub Key: ", EthCrypto.publicKey.toAddress(trustedPubKey));

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


// //Do we know this user? If  yes, load the user as Authenticated.
// //Each interaction with the Server should have the minimum following properties:
// // {
// // ...
// // 	"pubKey": "PublicKeyHere",
// // 	"signature": "Signature",
// // 	"blockNumber": "BlockNumber"
// // }

// app.use(
//   asyncHandler(async (req, res, next) => {
//     const obj = req.body;
//     const currentBlock = await eth.getBlock("latest");

//     //Make sure we have the proper fields
//     if (propCheckAuthUser(obj)) {
//       const { blockNumber, signature, pubKey } = obj;
//       const userBlock = await eth.getBlock(blockNumber);
//       const recoveredAddress = recoverSignerAddress(signature, userBlock.hash);
//       const validBlockNumber = checkBlockNumber(blockNumber, currentBlock);

//       //The user supplies a signedMessage of a blockhash, and the blockNumber.
//       //We check the blocknumber, get the hash and then attempt to recover the PublicKey
//       //If the public Key matches the users supplied public key, we know  they have signed
//       //The  message  recently, and thus it should be them. 
//       //If there is any problem, we  simply don't authenticate  them. 
//       if (validBlockNumber && recoveredAddress == pubKey) {
//         req.user = db[pubKey];
//         req.authenticated = true;
//         console.log("Authenticated: ", req.authenticated, "User: ", req.user);
//         next();
//       }
//       notAuthenticated(req, next);
//     } else {
//       notAuthenticated(req, next);
//     }
//   })
// );


app.get("/", (req, res) => {
  return res.status(200).send("Received a GET HTTP method");
});

// app.post("/", (req, res) => {
//   return res.send("Received a POST HTTP method");
// });

//Signup Area
//We already know they are who they say they are because of the middleware above
//At this point  we  can decide to  create  them  as a user or not.
app.post("/signup", (req, res) => {
  createUser(req, res, db);
});

//Since we already know who they  are, if they wish to be  delete, we can let them. 
app.delete("/", (req, res) => {
  if(req.authenticated){
    delete db[req.user];
    logOut(req);
  }
  return res.send(`User ${reg.user} deleted`);
});

app.get("/test", function(req, res, next) {
  res.json({ msg: "This is CORS-enabled for all origins!" });
});

app.post("/test", (req, res) => {
  return res.json(req.body);
});

//Expose the JSON Body:
app.post("/checkSig", (req, res, next) => {
  const obj = req.body;
  // Decided if we want to sign the transaction or not.
  signMessage(req, res, RELAY_HUB, RECIPIENT_ADDRESS, trustedPrivKey);
});

// app.listen(port, function() {
//   console.log("CORS-enabled web server listening on port 80");
// });


var server = app.listen(3000, function () {
  var port = server.address().port;
  console.log('Example app listening at port %s', port);
});
module.exports = server;