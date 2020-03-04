let Thread = require("./../models/thread");
exports.get_thread = async function(boardName, res) {
	let board = await Thread.find(
		{
			board: boardName
		},
		"board text created_on bumped_on replies.text replies.created_on replies._id"
	)
		.sort({ bumped_on: -1 })
		.limit(10)
		.slice("replies", 3)
		.exec()
		.then(doc => res.send(doc));
};

exports.new_thread = function(
	bodyBoard,
	paramsBoard,
	bodyText,
	bodyDeletePassword,
	res
) {
	let t = new Thread();
	t.board = bodyBoard == undefined ? paramsBoard : bodyBoard;
	t.text = bodyText;
	t.delete_password = bodyDeletePassword;
	t.save(function(err) {
		if (err) {
			console.log(err);
		} else {
			res.redirect(`/b/${t.board}`);
		}
	});
};

exports.report_thread = async function(bodyThreadId, bodyReportId, res) {
	let threadId = bodyThreadId == undefined ? bodyReportId : bodyThreadId;
	await Thread.findById({ _id: threadId }, function(err, doc) {
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
};

exports.delete_thread = async function(threadId, deletePassword, res) {
	let t = await Thread.findById({ _id: threadId }, function(err, doc) {
		if (err) {
			console.log(err);
			res.redirect("back");
		} else if (doc == null) {
			res.redirect("back");
		} else {
			if (deletePassword == doc.delete_password) {
				Thread.deleteOne(
					{
						_id: doc._id
					},
					function(err) {
						if (err) {
							console.log(err);
						}
					}
				);
				res.send("success");
			} else {
				res.send("incorrect password");
			}
		}
	});
};
