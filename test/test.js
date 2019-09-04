const request = require("supertest");
const EthCrypto = require("eth-crypto");

describe("loading express", async () => {
  let server;
  const generatedKeyPair = EthCrypto.createIdentity();
  const privKey = generatedKeyPair.privateKey;
  const pubKey = EthCrypto.publicKeyByPrivateKey(privKey);
  const pubAddress = EthCrypto.publicKey.toAddress(pubKey);
  const userName = "Dennison Bertram";
  const email = "dennison@example.com";

  beforeEach(() => {
    delete require.cache[require.resolve("../index.js")];
    server = require("../index.js");
  });
  afterEach(done => {
    server.close(done);
  });
  it("responds to /", done => {
    request(server)
      .get("/")
      .expect(200, done);
  });
  it("404 everything else", done => {
    request(server)
      .get("/foo/bar")
      .expect(404, done);
  });
  it("Creates a new user: ", done => {
    console.log(`User  Pub  Key: ${pubAddress}`);
    request(server)
      .post("/signup")
      .send({
        userName,
        email,
        encryptedPrivKey: privKey,
        pubKey: pubAddress
      })
      .expect(201, done);
  });
  it("Creates and Finds created user", done => {
    request(server)
      .post("/signup")
      .send({
        userName,
        email,
        encryptedPrivKey: privKey,
        pubKey: pubAddress
      });

    request(server)
      .get("/user")
      .send({ pubKey: pubAddress })
      .expect(200, done);
  });
});
