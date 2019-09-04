var request = require("supertest");
describe("loading express", function() {
  var server;
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
});
