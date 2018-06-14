// ==============================================================================
//
// File name: median-app.js
//
// ==============================================================================

$( document).ready(function() {
	// ----------------------------------------------------------------------------
	// creates and returns a centered gif that is a loading image
	// ------------------------------------------------------------------------
	function getCenteredLoadingImage() {
		const lcImg= $("<img>");
		// center loading gif on center of page while news is getting scraped
		lcImg.attr("src", "./assets/images/loading.gif")
			.attr("alt", "Loading image")
			.attr("id","loading-img")
			.css({"display":"block","margin-left":"auto","margin-right":"auto","z-index":"5"});
		return lcImg;
	}

	// -------------------------------------------------------------------------------------
	// saved articles when 'saved articles' link is clicked
	// -------------------------------------------------------------------------------------
/*  	$("a#save-link").click(function() {

		console.log("inside saved-link");
	}); */

	// -------------------------------------------------------------------------------------
	// scrape articles when "scrape" button link is clicked
	// -------------------------------------------------------------------------------------
	$("a#scrape-link").click(function() {
		const loadingImg = getCenteredLoadingImage();

		$("#load").append(loadingImg);
		// Grab the articles as a json
		$.getJSON("/scrapearticles", (data) => {
			$("#numArticlesContent").empty();
			$("#load > img#loading-img").remove();
			$("#articles").append("Done scraping");
			console.log(`num articles found: ${data.length}`);
			$("#numArticlesContent").html(`<h4>Found ${data.length} Articles.</h4>`);
			$("#numArticles").modal("show");
		});
	});

	// ----------------------------------------------------------------------
	// fills existing notes in modal content
	// ----------------------------------------------------------------------
	function fillNotes(notesArr) {
		$("#previousNotes").empty();
		console.log("in fillNotes()");
		notesArr.forEach(function(element, i) {
			let noteRow = $("<div>").addClass("row mb-2 ");
			let noteArea = $("<textarea>").addClass("col-md-7 col-xs-12")
				.text(element.body)
				.attr("type", "text")
				.attr("id", `body-${element._id}`);
			const updateBtn = $("<button>").addClass("note-update notes-modal-btn btn btn-sm btn-info col-md-2 col-xs-12")
				.text("Update")
				.attr("data-id", element._id);
			const delNoteBtn = $("<button>").addClass("note-delete notes-modal-btn btn btn-sm btn-danger offset-md-1 col-md-2 col-xs-12")
				.text("Delete")
				.attr("data-id", element._id);
			noteRow.append(noteArea, updateBtn, delNoteBtn);

			console.log(`val of element ${i} is ${element.body}`);
			$("#previousNotes").append(noteRow);
		});
	}

	// ----------------------------------------------------------------------
	// moves article to saved ones
	// ----------------------------------------------------------------------
	function moveToSaved() {
		const articleId = $(this).attr("data-id");
		console.log("in moveToSaved");
    
		// Run a POST request to change the note, using what's entered in the inputs
		$.ajax({
			method: "PUT",
			url: "/saved/" + articleId,
		})
			.then(function(data) {
				// Log the response
				console.log(data);
				console.log("saved article");
				window.location.reload();
			});

	}
  
	// ----------------------------------------------------------------------
	// unsave previously saved articles
	// ----------------------------------------------------------------------
	function unSave() {
		const articleId = $(this).attr("data-id");

		console.log("in unSave");
		// Run a PUT request to change saved state of an article
		$.ajax({
			method: "PUT",
			url: "/unsave/" + articleId,
		})
			.then(function(data) {
				console.log(data);
				console.log("unsave article");

				window.location.reload();
			});

	}

	// ----------------------------------------------------------------------
	// delete selected article
	// ----------------------------------------------------------------------
	function deleteItem() {
		const articleId = $(this).attr("data-id");

		console.log("in deleteItem");
		$.ajax({
			url: "/api/article/" + articleId,
			method: "DELETE"
		})
			.then(function() {
				console.log("deleted article");
				// reload page
				window.location.reload();
			});
	}
  
	// ----------------------------------------------------------------------
	// delete selected note
	// ----------------------------------------------------------------------
	function deleteNote() {
		const noteId = $(this).attr("data-id");

		console.log("in deleteItem");
		$.ajax({
			url: "/api/note/" + noteId,
			method: "DELETE"
		})
			.then(function() {
				console.log("deleted article");
				// reload page
				window.location.replace("/saved");
			});
	}
  
	// ----------------------------------------------------------------------
	// displayNote
	// ----------------------------------------------------------------------
	function displayNote() {
		const articleId = $(this).attr("data-id");

		$.getJSON("/populatedarticle/" + articleId, (data) => {
			let htmlText = "";

			if (data.notes.length === 0) {
				htmlText += "No notes for this article yet.";
			} else {
				// build notes data with update and delete buttons;
				fillNotes(data.notes);
			}

			// construct new note form
			htmlText += "<div class = \"row\">";
			htmlText += "<textarea class=\"col-10\" type=\"text\" name=\"body\" id=\"body-input\" placeholder=\"Write Note Here\"></textarea>";
			htmlText += `<button data-id="${data._id}" class="col-2 btn btn-sm notes-modal-btn save-note btn-success">Save Note</button>`;
			htmlText += "</div>";
			htmlText += "</form>";
			$("#articleNotesContent").append(htmlText);
			$("#articleNotesLongTitle").text(`Notes for Article ${articleId}`);
			$("#articleNotes").modal("show");
		});
    
	}
  
	// ------------------------------------------------------------------------------------
	// process save note
	// ------------------------------------------------------------------------------------
	function saveNote() {
		// Grab the id associated with the article from the save button
		var articleId = $(this).attr("data-id");
  
		// Run a POST request to change the note, using what's entered in the inputs
		$.ajax({
			method: "POST",
			url: "/postnote/" + articleId,
			data: {
				body: $("#body-input").val()
			}
		})
			.then(function(data) {
				// Log the response
				console.log(data);
    
				// Close modal
				$("#articleNotes").modal("hide");
			});
  }
  
	// ------------------------------------------------------------------------------------
	// process update note
	// ------------------------------------------------------------------------------------
	function noteUpdate() {
		// Grab the id associated with the article from the save button
		var noteId = $(this).attr("data-id");
  
		// Run a PUT request to update the note, using the text area input
		$.ajax({
			method: "PUT",
			url: "/note/" + noteId,
			data: {
				// Value taken from note textarea
				body: $(`#body-${noteId}`).val()
			}
		})
			.then(function(data) {
				// Log the response
				console.log(data);
    
				// Close modal
				$("#articleNotes").modal("hide");
			});
	}

	$(document).on("click", ".save-button", moveToSaved);
	$(document).on("click", ".unsave-button", unSave);
	$(document).on("click", ".delete-button", deleteItem);
	$(document).on("click", ".note-button", displayNote);
	$(document).on("click", ".save-note", saveNote);
	$(document).on("click", ".note-delete", deleteNote);
	$(document).on("click", ".note-update", noteUpdate);

	// when information modal specifying the number of articles is closed,
	// the home page is reloaded
	$(document).on("hidden.bs.modal", "#numArticles", function () { 
		// remove the values entered in the input and textarea for note entry
		$("#body-input").val("");
		window.location.replace("/");
	});

	$(document).on("hidden.bs.modal", "#articleNotes", function () { 
		window.location.replace("/saved");
	});


});

