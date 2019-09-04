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
      .expect("Content-Type", "application/json; charset=utf-8")
      .expect(
        200,
        {
          signedMessage:
            "0x7e8aed9f6e82c5081d6bd4c97bd0dd546eab6543919d1903c3da8b0261508e3f642a8bfe4fa91ad8bc1476494d1c253d78cae2b037b8f068e200b1e0d89ee41a1b"
        },
        done
      );
  });
});
