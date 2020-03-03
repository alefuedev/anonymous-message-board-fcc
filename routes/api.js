"use strict";
let mongoose = require("mongoose");
let Thread = require("./../models/thread");
let expect = require("chai").expect;

mongoose.connect(process.env.DB, {
	useNewUrlParser: true,
	useUnifiedTopology: true
});

module.exports = function(app) {
	app.route("/api/threads/:board")

		.get(async function(req, res) {
			let board = await Thread.find(
				{
					board: req.params.board
				},
				"board text created_on bumped_on replies.text replies.created_on replies._id"
			)
				.sort({ bumped_on: -1 })
				.limit(10)
				.slice("replies", 3)
				.exec()
				.then(doc => res.send(doc));
		})

		.post(async function(req, res) {
			let t = new Thread();
			t.board =
				req.body.board == undefined
					? req.params.board
					: req.body.board;
			t.text = req.body.text;
			t.delete_password = req.body.delete_password;
			t.save(function(err) {
				if (err) {
					console.log(err);
				} else {
					res.redirect(`/b/${t.board}`);
				}
			});
		})

		.put(async function(req, res) {
			let id =
				req.body.thread_id == undefined
					? req.body.report_id
					: req.body.thread_id;
			await Thread.findById({ _id: id }, function(err, doc) {
				if (err) {
					console.log(err);
				} else if (doc == null) {
					res.redirect("back");
				} else {
					doc.reported = true;
					doc.save(function(err) {
						if (err) {
							console.log(err);
						} else {
							res.send("success");
						}
					});
				}
			});
		})

		.delete(async function(req, res) {
			let t = await Thread.findById(
				{ _id: req.body.thread_id },
				function(err, doc) {
					if (err) {
						console.log(err);
						res.redirect("back");
					} else if (doc == null) {
						res.redirect("back");
					} else {
						if (
							req.body
								.delete_password ==
							doc.delete_password
						) {
							Thread.deleteOne(
								{
									_id:
										doc._id
								},
								function(err) {
									if (
										err
									) {
										console.log(
											err
										);
									}
								}
							);
							res.send("success");
						} else {
							res.send(
								"incorrect password"
							);
						}
					}
				}
			);
		});

	app.route("/api/replies/:board")
		.get(async function(req, res) {
			let board = req.params;
			let thread_id = req.query.thread_id;
			let t = await Thread.find(
				{ _id: thread_id },
				"-delete_password",
				function(err, doc) {
					if (err) {
						console.log(err);
					} else if (doc.length == 0) {
						res.redirect("back");
					} else {
						return doc;
					}
				}
			);
			if (t.length > 0) {
				let repliesFilter = [];
				let replies = t[0].replies;
				for (let x = 0; x < replies.length; x++) {
					let {
						reported,
						_id,
						text,
						created_on
					} = replies[x];
					repliesFilter.push({
						reported,
						_id,
						text,
						created_on
					});
				}
				let response = {
					reported: t[0].reported,
					_id: t[0]["_id"],
					replies: repliesFilter,
					created_on: t[0]["created_on"],
					bumped_on: t[0]["bumped_on"],
					board: t[0]["board"],
					text: t[0]["text"]
				};
				res.send(response);
			}
		})

		.post(async function(req, res) {
			let t = await Thread.findById(
				{ _id: req.body.thread_id },
				function(err, doc) {
					if (err) {
						console.log(err);
					} else if (doc == null) {
						console.log(
							"not found redirect"
						);
						res.redirect("back");
					} else {
						return doc;
					}
				}
			);
			if (t != null) {
				t.bumped_on = Date.now();
				let reply = {
					text: req.body.text,
					delete_password:
						req.body.delete_password
				};
				t.replies.push(reply);
				t.save(function(err) {
					if (err) {
						console.log("not save");
					} else {
						console.log("save");
						let board =
							req.body.board ==
							undefined
								? t.board
								: req.body
										.board;
						res.redirect(
							`/b/${board}/${t._id}`
						);
					}
				});
			}
		})

		.put(async function(req, res) {
			let thread = await Thread.findById(
				{ _id: req.body.thread_id },
				function(err, doc) {
					if (err) {
						console.log(err);
						res.redirect("back");
					} else if (doc == null) {
						res.redirect("back");
					} else {
						for (
							let x = 0;
							x < doc.replies.length;
							x++
						) {
							if (
								doc.replies[x]
									._id ==
								req.body
									.reply_id
							) {
								doc.replies[
									x
								].reported = true;
							}
						}
					}
					doc.save(function(err) {
						if (err) {
							console.log(err);
						} else {
							res.send("success");
						}
					});
				}
			);
		})

		.delete(async function(req, res) {
			let thread = await Thread.findById(
				{
					_id: req.body.thread_id
				},
				function(err, doc) {
					if (err) {
						console.log(err);
					} else if (doc == null) {
						res.redirect("back");
					} else {
						let message = "";
						for (
							let x = 0;
							x < doc.replies.length;
							x++
						) {
							if (
								doc.replies[x]
									.delete_password ==
									req.body
										.delete_password &&
								doc.replies[x]
									._id ==
									req.body
										.reply_id
							) {
								doc.replies[
									x
								].text =
									"[deleted]";
								message =
									"success";
							}
						}
						if (message == "success") {
							doc.save(function(err) {
								if (err) {
									console.log(
										err
									);
								} else {
									res.send(
										"success"
									);
								}
							});
						} else {
							res.send(
								"incorrect password"
							);
						}
					}
				}
			);
		});
};
