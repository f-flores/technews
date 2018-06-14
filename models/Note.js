var mongoose = require("mongoose");

// reference to Schema constructor
var Schema = mongoose.Schema;

// create a new NoteSchema object using the Schema constructor
var NoteSchema = new Schema({
	// "title": String,
	"body": String
});

// creates model from NoteSchema using mongoose's model method
var Note = mongoose.model("Note", NoteSchema);

// Export the Note model
module.exports = Note;