// ===================================================================================
// File name: html-routes.js
// Description: Using nodejs express, this file provides the html routes for the
//  scraper app.
//
// ====================================================================================

// =======================================================================================
// APP CONSTANTS
// =======================================================================================

// url or news site to be scraped
// const MEDIUM_URL = "https://medium.com/topic/technology";
const MEDIUM_URL = "https://money.cnn.com/technology/";
// const TECH_NAV_MENU = "a.ds-link[href='" + MEDIUM_URL + "']";
const LOAD_TIME_WAIT = 1700;
const MIDPOINT_VERT = 3000;
const BOTTOM_VERT = 8000;

// ====================================================================================
// VARIABLE DECLARATIONS
//
// ====================================================================================
// Requiring our topics and users models
var db = require("../models");

// Requiring path to so we can use relative routes to our HTML files
// var path = require("path");

// Require Nightmare and cheerio. This makes the scraping possible
// =====================================================================================
var cheerio = require("cheerio"),

	// nightmare is a simple wrapper for PhantomJS for web automation and scraping
	// ===========================================================================
	Nightmare = require("nightmare");

// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
module.exports = function(app) {

	// retrieve existing articles in mongodb
	app.get("/", function(req, res) {
		var hbsObject = {};
		console.log("in \"/index\"route");
		db.Article.find({})
			.then(function(data) {
				// If no articles were found, send back a 404
				if (!data) res.status(404).end();

				// If we were able to successfully find Articles, send them back to the client
				hbsObject.articleData = data;				
				res.render("index", hbsObject);
			})
			.catch(function(err) {
				// If an error occurred, send it to the client
				res.json(err);
			});
	});

	// retrieve existing articles in mongoose database
	app.get("/getarticles", function(req, res) {
		console.log("in \"/getarticles\"route");
		db.Article.find({})
			.then(function(articleData) {
				// If no articles were found, send back a 404
				if (!articleData) res.status(404).end();

				// If we were able to successfully find Articles, send them back to the client
				// res.json(articleData);
				res.json(articleData);
			})
			.catch(function(err) {
				// If an error occurred, send it to the client
				res.json(err);
			});
	});

	app.get("/saved", function(req, res) {
		var hbsObject = {};
		console.log("in \"/saved\" articles route");
    
		db.Article.find({"saved": true})
			.then(function(data) {
				// If no articles were found, send back a 404
				if (!data) res.status(404).end();

				// If we were able to successfully find Articles, send them back to the client
				hbsObject.savedData = data;				
				res.render("saved", hbsObject);
			})
			.catch(function(err) {
				// If an error occurred, send it to the client
				res.json(err);
			});
	});


	// ---------------------------------------------------------------------
	// scrape article
	// ---------------------------------------------------------------------
	app.get("/scrapearticles", function(req, res) {
		Nightmare({ show: false })
			.goto(MEDIUM_URL)
		// wait 3 seconds so page is guaranteed to be fully loaded
		// do something in the chain to go to your desired page.
			.wait(LOAD_TIME_WAIT)
		// Click the technology menu to reload page and retrieve more news items
		//	.click(TECH_NAV_MENU)
			.wait(LOAD_TIME_WAIT)
		// scroll down in order to load more news items
			.scrollTo(MIDPOINT_VERT,0)
			.wait(LOAD_TIME_WAIT)
			.scrollTo(BOTTOM_VERT,0)
			.evaluate(() => document.querySelector("body").outerHTML)
			.then((html) => {
				// Load the html body from request into cheerio
				var $ = cheerio.load(html);
				// the articles array will hold the news items found on the page
				var articles = [];
				// search the html for the articles based on the u-flexColumnTop class
				$("._16wRP").each(function(i, element){
					var article = {};
					// scrape title, link and summary of medium news article
					article.title = $(element).children("a").text();
					article.link = $(element).children("a").attr("href");
					article.summary = $(element).children("._1iT_b").text();

					articles.push(article);
				}); 
				// return scraped data
				return articles;

			})
			.then((data) => {
				// insert all of the articles found into the mongoose database
				db.Article.insertMany(data)
					.then(function(dbArticle) {
						// View the added result in the console
						console.log(dbArticle);
						res.json("Done scraping data");
					})
					.catch(function(err) {
						// If an error occurred, send it to the client
						res.json(err);
						// throw err;
					});
			});

	});
  
	// Route to get articles and populate them with their notes
	app.get("/populatedarticle/:id", function(req, res) {
		var articleId = req.params.id;
  
		// Find all users
		db.Article.findById(articleId)
		// Specify that we want to populate the retrieved article with any associated notes
			.populate("notes")
			.then(function(articleData) {
				// If no articles were found, send back a 404
				if (!articleData) res.status(404).end();

				// If able to successfully find and associate article and Notes, send back to client
				res.json(articleData);
			})
			.catch(function(err) {
				// If an error occurs, send it back to the client
				res.json(err);
			});
	});
  
	// ***********
	// POST ROUTES
	// ***********
	// save a new note to the Note db and associate it with an article
	app.post("/postnote/:id", function(req, res) {
		// Create a new Note in the db
		console.log("in route postnote: " + req.body);

		db.Note.create(req.body)
			.then(function(dbNote) {
        // If a Note was created successfully, find the associated Article and push the new Note's _id 
        // to the Articles's `notes` array
        // *** from lesson 18.3 populate exercise 19 ****
				// { new: true } tells the query that we want it to return the updated User -- it returns the original by default
				// Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
				return db.Article.findOneAndUpdate({_id: req.params.id}, { $push: { notes: dbNote._id } }, { new: true });
			})
			.then(function(dbUser) {
				// If the Article was updated successfully, send it back to the client
				res.json(dbUser);
			})
			.catch(function(err) {
				// If an error occurs, send it back to the client
				res.json(err);
			});
	});


	// **********
	// PUT routes
	// **********
	app.put("/saved/:id", function(req, res) {
		const articleId = req.params.id;

		db.Article.findByIdAndUpdate(articleId, { $set: { saved: true }}, { new: true }, function (err, art) {
			if (err) throw err;

			res.end();
		});
  });
  
	app.put("/note/:id", function(req, res) {
    const noteId = req.params.id;
    let newBody = req.body.body;

    console.log("in note/:id req.body: " + newBody);

		db.Note.findByIdAndUpdate(noteId, { $set: { body: newBody }}, { new: true }, function (err, art) {
			if (err) throw err;

			res.end();
		});
	});
  
	app.put("/unsave/:id", function(req, res) {
		const articleId = req.params.id;

		db.Article.findByIdAndUpdate(articleId, { $set: { saved: false }}, { new: true }, function (err, art) {
			if (err) throw err;
			console.log("article updated in /unsave route");

			res.end();
		});
	});
  
	// **********
	// DELETE routes
	// **********
	// ----------------------------------------------------------------------------
	// delete articles route
	// ----------------------------------------------------------------------------
	app.delete("/api/article/:id", function(req, res) {
		const articleId = req.params.id;

		db.Article.findByIdAndRemove(articleId, function (err) {
			if (err) throw err;
			console.log("article deleted in /api/article/:id route");

			res.end();
		});
	});

	// ----------------------------------------------------------------------------
	// delete note route
	// ----------------------------------------------------------------------------
	app.delete("/api/note/:id", function(req, res) {
		const noteId = req.params.id;

		db.Note.findByIdAndRemove(noteId, function (err) {
			if (err) throw err;
			console.log("note deleted in /api/note/:id route");

			res.end();
		});
	});
};
