const { utils } = require("@openzeppelin/gsn-provider");

const EthCrypto = require("eth-crypto");
const Web3 = require("web3");
const {
  utils: { toBN, soliditySha3, toChecksumAddress }
} = require("web3");
const web3 = new Web3("ws://localhost:8545");

// const signer = web3.eth.accounts.create();
// console.log(web3.eth.accounts.wallet)
// console.log("The signer is: ", signer);
function fixSignature(signature) {
  // in geth its always 27/28, in ganache its 0/1. Change to 27/28 to prevent
  // signature malleability if version is 0/1
  // see https://github.com/ethereum/go-ethereum/blob/v1.8.23/internal/ethapi/api.go#L465
  let v = parseInt(signature.slice(130, 132), 16);
  if (v < 27) {
    v += 27;
  }
  const vHex = v.toString(16);
  return signature.slice(0, 130) + vHex;
}

const signMessage = async data => {
  let accounts = await web3.eth.getAccounts();
  console.log("Sign Account: ", accounts[0]);
  return fixSignature(
    await web3.eth.sign(
      soliditySha3(
        // eslint-disable-next-line max-len
        data.relayerAddress,
        data.from,
        data.encodedFunctionCall,
        toBN(data.txFee),
        toBN(data.gasPrice),
        toBN(data.gas),
        toBN(data.nonce),
        data.relayHubAddress,
        data.to
      ),
      accounts[0]
    )
  );
};

module.exports = {
  signMessage
};

// const signMessage = async (
//   from,
//   to,
//   encodedFunctionCall,
//   txFee,
//   gasPrice,
//   gas,
//   nonce,
//   relayerAddress,
//   relayHubAddress,
//   signer
// ) => {
//   const hash = EthCrypto.hash.keccak256([
//     { type: "address", value: from },
//     { type: "address", value: to },
//     { type: "bytes", value: encodedFunctionCall },
//     { type: "uint256", value: txFee },
//     { type: "uint256", value: gasPrice },
//     { type: "uint256", value: gas },
//     { type: "uint256", value: nonce },
//     { type: "address", value: relayHubAddress },
//     { type: "address", value: relayerAddress }
//   ]);
//   const signature = await EthCrypto.sign(signer, hash);
//   return signature; // this takes care of removing signature malleability attacks
// };
