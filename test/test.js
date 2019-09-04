const request = require("supertest");
const EthCrypto = require("eth-crypto");

describe("loading express", async () => {
  let server;
  const generatedKeyPair = EthCrypto.createIdentity();
  const privKey = generatedKeyPair.privateKey;
  const pubKey = EthCrypto.publicKeyByPrivateKey(privKey);
  const pubAddress = EthCrypto.publicKey.toAddress(pubKey);
  let relay = "0xD216153c06E857cD7f72665E0aF1d7D82172F494";
  let from = "0xD216153c06E857cD7f72665E0aF1d7D82172F494";
  let encodedFunction = "0xe0b6fcfc";
  let transactionFee = 1;
  let gasPrice = 1;
  let gasLimit = 1;
  let nonce = 1;

  beforeEach(() => {
    delete require.cache[require.resolve("../index.js")];
    server = require("../index.js");
  });
  afterEach(done => {
    server.close(done);
  });
  it("Signs a message", done => {
    request(server)
      .post("/checkSig")
      .send({
        relay,
        from,
        encodedFunction,
        transactionFee,
        gasPrice,
        gasLimit,
        nonce
      })
      .expect(200, done);
  });
});
