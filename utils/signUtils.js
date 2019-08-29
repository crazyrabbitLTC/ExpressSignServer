const EthCrypto = require("eth-crypto");

const signMessage = async (req, res, RELAY_HUB, RECIPIENT_ADDRESS, trustedPrivKey) => {
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
  console.log("The message once hashed is: ", message);
  const signedMessage = await EthCrypto.sign(privateKey, message);

  return signedMessage;
};

module.exports = { signMessage };
