"use strict";
let mongoose = require("mongoose");
let Thread = require("./../models/thread");
let expect = require("chai").expect;
let threadController = require("./../controllers/threadController");
let repliesController = require("./../controllers/repliesController");

mongoose.connect(process.env.DB, {
	useNewUrlParser: true,
	useUnifiedTopology: true
});

module.exports = function(app) {
	app.route("/api/threads/:board")

		.get(async function(req, res) {
			threadController.get_thread(req.params.board, res);
		})

		.post(function(req, res) {
			threadController.new_thread(
				req.body.board,
				req.params.board,
				req.body.text,
				req.body.delete_password,
				res
			);
		})

		.put(function(req, res) {
			threadController.report_thread(
				req.body.thread_id,
				req.body.report_id,
				res
			);
		})

		.delete(async function(req, res) {
			threadController.delete_thread(
				req.body.thread_id,
				req.body.delete_password,
				res
			);
		});

	app.route("/api/replies/:board")
		.get(async function(req, res) {
			repliesController.get_replies(
				req.params,
				req.query.thread_id,
				res
			);
		})

		.post(function(req, res) {
			repliesController.post_reply(
				req.body.board,
				req.body.thread_id,
				req.body.text,
				req.body.delete_password,
				res
			);
		})

		.put(async function(req, res) {
			repliesController.report_reply(
				req.body.thread_id,
				req.body.reply_id,
				res
			);
		})

		.delete(async function(req, res) {
			repliesController.delete_reply(
				req.body.thread_id,
				req.body.reply_id,
				req.body.delete_password,
				res
			);
		});
};
