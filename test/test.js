const request = require("supertest");
const Web3 = require("web3");
const {
  utils: { toBN, soliditySha3 }
} = require("web3");
const web3 = new Web3("ws://localhost:8545");
const { signMessage } = require("../utils/signUtils.js");

describe("loading express", async () => {
  let server;
  let accounts;
  let relayHubAddress = "0xD216153c06E857cD7f72665E0aF1d7D82172F494";
  let relayerAddress = "0xD216153c06E857cD7f72665E0aF1d7D82172F494";
  let to = "0xD216153c06E857cD7f72665E0aF1d7D82172F494";
  let from;
  let encodedFunctionCall = "0xe0b6fcfc";
  let txFee = toBN(10);
  let gasPrice = toBN(10);
  let gas = toBN(10);
  let nonce = toBN(10);

  beforeEach(() => {
    delete require.cache[require.resolve("../index.js")];
    server = require("../index.js");
  });

  afterEach(done => {
    server.close(done);
  });

  it("Signs a message", async done => {
    accounts = await web3.eth.getAccounts();
    from = accounts[1];

    //SIGN MESSAGE LOCALLY TO COMPARE SIGNATURES
    let testSig = await signMessage({
      relayerAddress,
      from,
      encodedFunctionCall,
      txFee,
      gasPrice,
      gas,
      nonce,
      relayHubAddress,
      to
    });
    //testSig = `\"${testSig}\"`
    console.log("Test sig: ", testSig);
    console.log("Typeof: ", typeof testSig);
    request(server)
      .post("/checkSig")
      .send({
        relayerAddress,
        from,
        encodedFunctionCall,
        txFee,
        gasPrice,
        gas,
        nonce,
        relayHubAddress,
        to
      })
      .expect(200, testSig, done);
  });
});
