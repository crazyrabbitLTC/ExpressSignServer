const EthCrypto = require("eth-crypto");

const signMessage = async (obj, trustedPrivKey) => {
    const {
      from,
      to,
      encodedFunctionCall,
      txFee,
      gasPrice,
      gas,
      nonce,
      relayerAddress,
      relayHubAddress
    } = obj;
    const signedMessage = await _signContractCall(
      from,
      to,
      encodedFunctionCall,
      txFee,
      gasPrice,
      gas,
      nonce,
      relayerAddress,
      relayHubAddress,
      trustedPrivKey
    );
    return { signedMessage: signedMessage };
};

const recoverSignerAddress = (signature, message) => {
  const signer = EthCrypto.recover(
    signature, // signature
    EthCrypto.hash.keccak256(message) // message hash
  );
  return signer;
};

const _signContractCall = async (
  from,
  to,
  encodedFunctionCall,
  txFee,
  gasPrice,
  gas,
  nonce,
  relayerAddress,
  relayHubAddress,
  privateKey
) => {
  const message = EthCrypto.hash.keccak256([
    { type: "address", value: from },
    { type: "address", value: to },
    { type: "bytes", value: encodedFunctionCall },
    { type: "uint256", value: txFee },
    { type: "uint256", value: gasPrice },
    { type: "uint256", value: gas },
    { type: "uint256", value: nonce },
    { type: "address", value: relayHubAddress },
    { type: "address", value: relayerAddress }
  ]);
  const signedMessage = await EthCrypto.sign(privateKey, message);

  return signedMessage;
};

module.exports = {
  signMessage
};
