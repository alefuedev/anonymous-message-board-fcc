let mongoose = require("mongoose");

let replySchema = mongoose.Schema({
	text: String,
	delete_password: String,
	reported: {
		type: Boolean,
		default: false
	},
	created_on: {
		type: Date,
		default: Date.now
	}
});

module.exports = replySchema;
