"use strict";
let mongoose = require("mongoose");
let Thread = require("./../models/thread");

var expect = require("chai").expect;
mongoose.connect(process.env.DB, {
	useNewUrlParser: true,
	useUnifiedTopology: true
});

module.exports = function(app) {
	app.route("/api/threads/:board")

		//
		///Number 6 return an Array
		///Work here limit 3 replies Incomplete
		//Look for number 7 should be the same
		.get(async function(req, res) {
			console.log("get threads");
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
		//
		//Number 4 Create a new Thread Done!!!
		.post(async function(req, res) {
			console.log("post");
			let t = new Thread();
			t.board = req.body.board;
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
		//Number 10 report thread Done!!
		.put(async function(req, res) {
			await Thread.findById(
				{ _id: req.body.thread_id },
				function(err, doc) {
					if (err) {
						console.log(err);
					} else if (doc == null) {
						res.redirect("back");
					} else {
						doc.reported = true;
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
					}
				}
			);
		})

		//8 Delete thread using id password Done!!
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
							res.send("succes");
						} else {
							res.send(
								"incorrect password"
							);
						}
					}
				}
			);
		});

	///7 Get Entire Thread hidding passwords Done!!
	//notes Try to clean this part later
	app.route("/api/replies/:board")
		.get(async function(req, res) {
			console.log("get replies!");
			console.log(req.params);
			console.log(req.query);
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
					let { reported, _id, text } = replies[
						x
					];
					repliesFilter.push({
						reported,
						_id,
						text
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

		///Number 5 Create a Reply Done!!!
		.post(async function(req, res) {
			console.log("post");
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
						res.redirect(
							`/b/${req.body.board}/${t._id}`
						);
					}
				});
			}
		})

		//number 11 complete Done!!
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

		//number 9 Change text to deleted Complete!!
		//Clean Code
		.delete(async function(req, res) {
			let thread = await thread.findbyid(
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
