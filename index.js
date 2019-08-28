require("dotenv").config();
const port = process.env.PORT || 88;
const express = require("express");
const EthCrypto = require("eth-crypto");
const cors = require("cors");
const app = express();

//Not clearly needed.
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
app.use(express.json());

app.get("/", function(req, res, next) {
  res.json({ msg: "This is CORS-enabled for all origins!" });
});

app.post("/", (req, res) => {
  console.log(req.body);
  console.log("Type of: ", typeof req.body);
  return res.json(req.body);
});

app.post("/checkSig", (req, res, next) => {
  signMessage(req, res);
})

const signMessage = async (req, res) => {
  const obj = req.body;
  //Require that all our properties are present or else send an error
  if (
    !obj.hasOwnProperty(obj.relay) &&
    !obj.hasOwnProperty(obj.from) &&
    !obj.hasOwnProperty(obj.encodedFunction) &&
    !obj.hasOwnProperty(obj.transactionFee) &&
    !obj.hasOwnProperty(obj.gasPRice) &&
    !obj.hasOwnProperty(obj.gasLimit) &&
    !obj.hasOwnProperty(obj.nonce)
  ) {
    const {relay, from, encodedFunction, transactionFee, gasPrice, gasLimit, nonce }  = obj;
    const signedMessage = await _signContractCall(relay, from, encodedFunction, transactionFee, gasPrice, gasLimit, nonce, RELAY_HUB, RECIPIENT_ADDRESS, trustedPrivKey)
    console.log("Signed message: ", signedMessage);
    return res.json({signedMessage: signedMessage});
  } else {
    //Send this error message if our POST object  is not properly formatted
    res.status(500).send("Incorrect JSON object");
  }
};

const _signContractCall = async (
  relay,
  from,
  encodedFunction,
  transactionFee,
  gasPrice,
  gasLimit,
  nonce,
  RELAY_HUB,
  RELAY_RECIPIENT,
  privateKey
) => {
  const message = EthCrypto.hash.keccak256("0x",[
    { type: "address", value: relay },
    { type: "address", value: from },
    { type: "bytes", value: encodedFunction },
    { type: "uint256", value: transactionFee },
    { type: "uint256", value: gasPrice },
    { type: "uint256", value: gasLimit },
    { type: "uint256", value: nonce },
    { type: "address", value: RELAY_HUB },
    { type: "address", value: RELAY_RECIPIENT }
  ]);
  const signedMessage = await EthCrypto.sign(privateKey, message);

  return signedMessage;
};

app.listen(port, function() {
  console.log("CORS-enabled web server listening on port 80");
});
