const Web3 = require("web3");
let userDb;
let web3;
let accounts;

const getDatabase = async () => {
  web3 = new Web3("ws://localhost:8545");

  const userDbArtifact = require("./../build/contracts/UserDB.json");
  accounts = await web3.eth.getAccounts();
  const networkId = await web3.eth.net.getId();
  const deployedNetwork = userDbArtifact.networks[networkId.toString()];
  userDb = new web3.eth.Contract(userDbArtifact.abi, deployedNetwork.address);

  // console.log("Network ID", networkId);
  // console.log("Deployed Network address", deployedNetwork.address);
  // console.log("Accounts", accounts);

  return userDb;
};

const addUser = async userAddress => {
  const accounts = await web3.eth.getAccounts();
  let tx;
  try {
    await userDb.methods.addUser(userAddress).send({ from: accounts[0] });
    return true;
  } catch (error) {
    return false;
  }
};

const checkUser = async () => {};

const deleteUser = async () => {};

module.exports = { getDatabase, addUser, checkUser, deleteUser };
