let mongoose = require("mongoose");
let replySchema = require("./reply");

let threadSchema = mongoose.Schema({
	board: String,
	text: String,
	created_on: {
		type: Date,
		default: Date.now
	},
	delete_password: String,
	replies: [replySchema],
	bumped_on: {
		type: Date,
		default: Date.now
	},
	reported: {
		type: Boolean,
		default: false
	}
});

let Thread = mongoose.model("Thread", threadSchema);

module.exports = Thread;
