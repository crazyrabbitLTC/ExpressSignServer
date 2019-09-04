const EthCrypto = require("eth-crypto");

const signMessage = async (
  req,
  res,
  RELAY_HUB,
  RECIPIENT_ADDRESS,
  trustedPrivKey
) => {
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
    const {
      relay,
      from,
      encodedFunction,
      transactionFee,
      gasPrice,
      gasLimit,
      nonce
    } = obj;
    const signedMessage = await _signContractCall(
      relay,
      from,
      encodedFunction,
      transactionFee,
      gasPrice,
      gasLimit,
      nonce,
      RELAY_HUB,
      RECIPIENT_ADDRESS,
      trustedPrivKey
    );
    return res.json({ signedMessage: signedMessage });
  } else {
    //Send this error message if our POST object  is not properly formatted
    res.status(500).send("Incorrect JSON object");
  }
};

const createUser = (req, res, db) => {
  //Require the following fields: username, email, encryptedPrivKey, pubKey.
  //Potentially ask user to sign something like the Username + Email so we know their private key
  //Matches their public key.
  const obj = req.body;

  if (
    !obj.hasOwnProperty(obj.userName) &&
    !obj.hasOwnProperty(obj.email) &&
    !obj.hasOwnProperty(obj.encryptedPrivKey) &&
    !obj.hasOwnProperty(obj.pubKey)
  ) {
    //Check if User Exists:
    if (db[obj.pubKey]) {
      return res.status(500).send("User already exists");
    } else {
      //Create the User on our MockDatabase
      db[obj.pubKey] = {
        userName: obj.userName,
        email: obj.email,
        encryptedPrivKey: obj.encryptedPrivKey,
        nonce: 0
      };

      //Return okay Status.
      return res
        .status(201)
        .send(`User ${obj.userName} with publicKey: ${obj.pubKey} created.`);
    }
  } else {
    //Send this error message if our POST object is not properly formatted
    return res
      .status(500)
      .send("Incorrect JSON object: User Signup has wrong arguments");
  }
};

const getUser = (req, res, db) => {
  const obj = req.body;
  console.log(`The request  object: `);
  console.dir(obj);
  if (db[obj.pubKey]) {
    return { exists: true };
  } else {
    return { exists: false };
  }
};

const recoverSignerAddress = (signature, message) => {
  const signer = EthCrypto.recover(
    signature, // signature
    EthCrypto.hash.keccak256(message) // message hash
  );
  return signer;
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
  const message = EthCrypto.hash.keccak256([
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

const checkBlockNumber = (userBlockNumber, currentBlock, offset = 1) => {
  return (
    currentBlock - offset <= userBlockNumber &&
    userBlockNumber <= currentBlock + offset
  );
};

const checkBlockStamp = async (blockHash, blockNumber, web3) => {
  const currentBlock = await web3.eth.getBlockNumber();
  const userBlock = await web3.eth.getBlock(currentBlock);

  //Require  the submitted block number to be recent.
  //In this case, within 2 blocks
  if (checkBlockNumber(blockNumber, currentBlock, 2)) {
    //Here we need  to check  the hash is  correct.
  } else {
    return false;
  }
};

const propCheckAuthUser = obj => {
  if (
    !obj.hasOwnProperty(obj.blockNumber) &&
    !obj.hasOwnProperty(obj.signature) &&
    !obj.hasOwnProperty(obj.pubKey)
  ) {
    return true;
  } else {
    return false;
  }
};

const notAuthenticated = (req, next) => {
  //console.log("Not authenticated");
  req.user = null;
  req.authenticated = false;
  next();
};

const logOut = req => {
  req.user = null;
  req.authenticated = false;
};

module.exports = {
  signMessage,
  checkBlockNumber,
  createUser,
  recoverSignerAddress,
  checkBlockStamp,
  propCheckAuthUser,
  notAuthenticated,
  logOut,
  getUser
};
