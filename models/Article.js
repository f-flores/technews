var mongoose = require("mongoose");

// reference to the Schema constructor
var Schema = mongoose.Schema;

// Create a new ArticleSchema object using Schema constructor
var ArticleSchema = new Schema({
	// title is required and of type String
	"title": {
    "type": String,
    "default": "None",
		"required": true
	},
	// link is required and of type String
	"link": {
    "type": String,
    "default": "None",
		"required": true
	},
	// link is required and of type String
	"summary": {
    "type": String,
    "default": "None"
  },
  // keeps track of saved article
  "saved": {
    "type": Boolean,
    "default": false
  },
	// `notes` is an array that stores ObjectIds
	// The ref property links these ObjectIds to the Note model
	// This allows us to populate the Article with any associated Notes
	"notes": [
		{
			// Store ObjectIds in the array
			type: Schema.Types.ObjectId,
			// The ObjectIds will refer to the ids in the Note model
			ref: "Note"
		}
	]
});

// This creates our model from the above schema, using mongoose's model method
var Article = mongoose.model("Article", ArticleSchema);

// Export the Article model
module.exports = Article;