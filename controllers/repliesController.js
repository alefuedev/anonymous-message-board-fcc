let Thread = require("./../models/thread");

exports.get_replies = async function(params, thread_id, res) {
	let board = params;
	let threadId = thread_id;
	let t = await Thread.find(
		{ _id: threadId },
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
			let { reported, _id, text, created_on } = replies[x];
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
};

exports.post_reply = async function(
	boardName,
	thread_id,
	text,
	delete_password,
	res
) {
	let t = await Thread.findById({ _id: thread_id }, function(err, doc) {
		if (err) {
			console.log(err);
		} else if (doc == null) {
			res.redirect("back");
		} else {
			return doc;
		}
	});
	if (t != null) {
		t.bumped_on = Date.now();
		let reply = {
			text,
			delete_password
		};
		t.replies.push(reply);
		t.save(function(err) {
			if (err) {
				console.log("not save");
			} else {
				let board =
					boardName == undefined
						? t.board
						: boardName;
				res.redirect(`/b/${t.board}/${t._id}`);
			}
		});
	}
};

exports.report_reply = async function(threadId, replyId, res) {
	let thread = await Thread.findById({ _id: threadId }, function(
		err,
		doc
	) {
		if (err) {
			console.log(err);
			res.redirect("back");
		} else if (doc == null) {
			res.redirect("back");
		} else {
			for (let x = 0; x < doc.replies.length; x++) {
				if (doc.replies[x]._id == replyId) {
					doc.replies[x].reported = true;
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
	});
};

exports.delete_reply = async function(threadId, replyId, deletePassword, res) {
	let thread = await Thread.findById(
		{
			_id: threadId
		},
		function(err, doc) {
			if (err) {
				console.log(err);
			} else if (doc == null) {
				res.redirect("back");
			} else {
				let message = "";
				for (let x = 0; x < doc.replies.length; x++) {
					if (
						doc.replies[x]
							.delete_password ==
							deletePassword &&
						doc.replies[x]._id == replyId
					) {
						doc.replies[x].text =
							"[deleted]";
						message = "success";
					}
				}
				if (message == "success") {
					doc.save(function(err) {
						if (err) {
							console.log(err);
						} else {
							res.send("success");
						}
					});
				} else {
					res.send("incorrect password");
				}
			}
		}
	);
};
