var chaiHttp = require("chai-http");
var chai = require("chai");
var assert = chai.assert;
var server = require("../server");

chai.use(chaiHttp);

suite("Functional Tests", function() {
	suite("API ROUTING FOR /api/threads/:board", function() {
		test("POST =>Create a thread", function(done) {
			chai.request(server)
				.post("/api/threads/:board")
				.type("form")
				.send({
					board: "test",
					text: "Testing post request with Chai",
					delete_password: "deleteChai!1234"
				})
				.end(function(err, res) {
					let boardName = res.redirects[0];
					assert.equal(
						boardName.includes("/b/test"),
						true
					);
					assert.equal(res.status, 200);
					done();
				});
		});

		test("GET =>Get threads", function(done) {
			chai.request(server)
				.get("/api/threads/test")
				.end(function(err, res) {
					assert.equal(
						res.body[0]["board"],
						"test"
					);
					assert.equal(
						res.body[0]["text"],
						"Testing post request with Chai"
					);
					done();
				});
		});

		test("PUT=> Get the last thread from the board test take the id, use the id to change the reported value to true", function(done) {
			chai.request(server)
				.get("/api/threads/test")
				.end(function(err, res) {
					let idLastThread =
						res.body[res.body.length - 1][
							"_id"
						];
					chai.request(server)
						.put("/api/threads/:board")
						.type("form")
						.send({
							board: "test",
							thread_id: idLastThread
						})
						.end(function(err, res) {
							assert.equal(
								res.text,
								"success"
							);
							assert.equal(
								res.status,
								200
							);
							done();
						});
				});
		});
		test("DELETE", function(done) {
			chai.request(server)
				.get("/api/threads/test")
				.end(function(err, res) {
					let idLastThread =
						res.body[res.body.length - 1][
							"_id"
						];
					let board =
						res.body[res.body.length - 1][
							"board"
						];
					let delete_password = "deleteChai!1234";
					chai.request(server)
						.delete("/api/threads/:board")
						.type("form")
						.send({
							board: board,
							thread_id: idLastThread,
							delete_password: delete_password
						})
						.end(function(err, res) {
							assert.equal(
								res.text,
								"success"
							);
							assert.equal(
								res.status,
								200
							);
							done();
						});
				});
		});
	});

	suite("API ROUTING FOR /api/replies/:board", function() {
		test("POST => new Reply", function(done) {
			chai.request(server)
				.post("/api/threads/:board")
				.type("form")
				.send({
					board: "test",
					text: "Testing post request with Chai",
					delete_password: "deleteChai!1234"
				})
				.end(function(err, res) {
					chai.request(server)
						.get("/api/threads/test")
						.end(function(err, res) {
							let id =
								res.body[0][
									"_id"
								];
							chai.request(server)
								.post(
									"/api/replies/test"
								)
								.type("form")
								.send({
									thread_id: id,
									text:
										"reply for test thread",
									delete_password:
										"deleteChai!1234",
									board:
										"test"
								})
								.end(function(
									err,
									res
								) {
									let redirect = `/test/${id}`;
									assert.equal(
										res.status,
										200
									);
									assert.equal(
										res.redirects[0].includes(
											redirect
										),
										true
									);
									done();
								});
						});
				});
		});
		test("GET=>Get replies from a thread", function(done) {
			chai.request(server)
				.get("/api/threads/test")
				.end(function(err, res) {
					let id = res.body[0]["_id"];
					chai.request(server)
						.get("/api/replies/test")
						.query({ thread_id: id })
						.end(function(err, res) {
							assert.equal(
								res.body[
									"board"
								],
								"test"
							);
							assert.equal(
								res.body
									.replies[0][
									"text"
								],
								"reply for test thread"
							);
							done();
						});
				});
		});

		test("PUT=> report a reply", function(done) {
			chai.request(server)
				.get("/api/threads/test")
				.end(function(err, res) {
					let idThread = res.body[0]["_id"];
					let idReply =
						res.body[0].replies[0]["_id"];
					chai.request(server)
						.put("/api/replies/:board")
						.type("form")
						.send({
							board: "test",
							thread_id: idThread,
							reply_id: idReply
						})
						.end(function(err, res) {
							assert.equal(
								res.text,
								"success"
							);
							done();
						});
				});
		});
		test("DELETE", function(done) {
			chai.request(server)
				.get("/api/threads/test")
				.end(function(err, res) {
					let idThread = res.body[0]["_id"];
					let idReply =
						res.body[0].replies[0]["_id"];
					chai.request(server)
						.delete("/api/replies/:board")
						.type("form")
						.send({
							board: "test",
							thread_id: idThread,
							reply_id: idReply,
							delete_password:
								"deleteChai!1234"
						})
						.end(function(err, res) {
							assert.equal(
								res.text,
								"success"
							);
							done();
						});
				});
		});
	});
});
