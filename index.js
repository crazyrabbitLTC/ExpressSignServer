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

const RELAY_HUB = process.env.RELAY_HUB || "0xd216153c06e857cd7f72665e0af1d7d82172f494";
const RECIPIENT_ADDRESS =  process.env.RECIPIENT_ADDRESS || null;

//Check to be sure we have our contrat addresses. Kill server if not provided.
if(!RECIPIENT_ADDRESS){
  process.on('exit', function(code) {
    return console.log('ERROR: Contract Addresses are required to run signing server. Please edit the .env')
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
app.use(express.json())

app.get("/", function(req, res, next) {
  res.json({ msg: "This is CORS-enabled for all origins!" });
});

app.post('/', (req, res) => {
  console.log(req.body);
  console.log("Type of: ", typeof(req.body));
  return res.json(req.body)
});

//DATA  Required to  Sign
// address relay,
// address from,
// bytes calldata encodedFunction,
// uint256 transactionFee,
// uint256 gasPrice,
// uint256 gasLimit,
// uint256 nonce,
// Address  RelayHub
// Address Recipient contract
app.listen(port, function() {
  console.log("CORS-enabled web server listening on port 80");
});
