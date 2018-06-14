// ====================================================================================
//
// File name: server.js
// Description: controller for median-scrape news
//
// ===================================================================================

var PORT = process.env.PORT || 3000;

var mongoose_options = {
  "server" : {
    "socketOptions" : {
      "keepAlive" : 300000,
      "connectTimeoutMS" : 50000
    }
  },
  "replset" : {
    "socketOptions" : {
      "keepAlive" : 300000,
      "connectTimeoutMS" : 50000
    }
  }
}

// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

// ========================================================================================
// DEPENDENCIES
// ========================================================================================

// File dependencies
// =======================================================================================
var logger = require("morgan"),
	fs = require("fs"),
	path = require("path"),

  // nodeJS server dependencies
  // =====================================================================================
	express = require("express"),
	bodyParser = require("body-parser"),

  // database dependencies
  // =====================================================================================
	mongoose = require("mongoose"),

  // exphbs wraps handlebars functions for templating
  // ================================================
  exphbs = require("express-handlebars");

  // Initialize Express
  // =============================================================
	var app = express();
  
// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
var MONGODB_LOC = process.env.MONGODB_URI || "mongodb://localhost/mediumnewsPopulate";

// Setup Handlebars View Engine
// =============================================================
app.set("view engine", "handlebars");
app.engine("handlebars", exphbs({
    "defaultLayout": "main",
    // handlebars 'helpers' functions not used yet but may come in handy
    // later, addOne is a sample handlebar helper function, not used yet
    "helpers": {
      // not used yet
      "addOne": (value) => parseInt(value, 10) + 1 //,
      // formates timestamp date into DD, MM NN, YYYY  HH:MM format
      // example Monday, May 21, 2018 5:41 PM
      // "fmtDate": (date) => moment(date).format("LLLL")
    }
  }));

// Connect to the Mongo DB
// ============================================================
mongoose.Promise = global.Promise;
mongoose.connect(MONGODB_LOC, mongoose_options, function (err, res) {
  if (err) {
  console.log ('ERROR connecting to: ' + MONGODB_LOC + '. ' + err);
  } else {
  console.log ('Succeeded connected to: ' + MONGODB_LOC);
  }
});

  
// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

// =======================================================================
// MIDDLEWARE
// =======================================================================
// Use morgan logger for logging requests
var accessLogStream = fs.createWriteStream(path.join(__dirname, "access.log"), {
	"flags": "a"
});

app.use(logger("dev", {
	"stream": accessLogStream
}));

// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: true }));

// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));
app.use(logger("dev"));


// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

// =======================================================================
// SERVER FUNCTIONS
// =======================================================================

// Routes
// =============================================================
require("./routes/html-routes.js")(app);


// Start the server
// =============================================================
app.listen(PORT, function() {
	console.log(`==> 🌎   App listening on ${PORT}, http://localhost:${PORT}`);
});