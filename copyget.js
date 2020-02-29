await Thread.find(
	{
		board: req.params.board
	},
	"board text created_on bumped_on replies"
)
	.sort({ bumped_on: -1 })
	.limit(10)
	.exec(function(err, docs) {
		if (err) {
			console.log(err);
		} else if (docs.length == 0) {
			res.redirect("back");
		} else {
			for (let x = 0; x < docs.length; x++) {
				let repliesLimit = docs[x].replies.slice(-3);
				docs[x].replies = repliesLimit;
			}
			console.log(docs);
		}
	});
