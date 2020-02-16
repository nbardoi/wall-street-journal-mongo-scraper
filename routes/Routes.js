// Dependencies
const axios = require("axios");
const cheerio = require("cheerio");

var db = require("../models");

module.exports = function(app) {

// Routes
// A GET route for scraping the WSJ website
app.get("/scrape", function(req, res) {
    // First, we grab the body of the html with axios
    axios.get("https://www.wsj.com/news/us").then(function(response) {
      // Then, we load that into cheerio and save it to $ for a shorthand selector
      var $ = cheerio.load(response.data);
  
      // Save an empty result object
      var results = {};

      $("article").each(function(i, element) {
        
        // Add the text and href of every link, and save them as properties of the result object
        
        results.title = $(this)
          .find("a")
          .text();
        results.link = $(this)
          .find("a")
          .attr("href");
        results.summary = $(this)
          .find("p")
          .text();

        
        // Create a new Article using the `result` object built from scraping
      db.Article.create(results)
      .then(function(dbArticle) {
        // View the added result in the console
        console.log(dbArticle);
      })
      .catch(function(err) {
        // If an error occurred, log it
        console.log(err);
      });
    });
      // Send a message to the client
      res.send("scrape complete");
});
});

app.get("/articles", (req, res) => {
    db.Article.find({})
        .then(function (dbArticle) {
            // If we were able to successfully find Articles, send them back to the client
            hbsObject = {
                articles: dbArticle
            };
            res.render("index", hbsObject);        
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});
  
app.get("/saved", (req, res) => {
    db.Article.find({saved: true})
        .then(function (dbArticle) {
            // If we were able to successfully find Articles, send them back to the client
            hbsObject = {
                articles: dbArticle
            };
            res.render("saved", hbsObject);
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});

app.get("/", function(req, res) {
    db.Article.find({}, null, {sort: {created: -1}}, function(err, data) {
      if(data.length === 0) {
        // First time to the / page, so redirect to /scrape to add some articles into the database
        res.redirect("/scrape");
      } else{
        // Display the articles that are currently in the database
        res.redirect("/articles")
      }
    });
  });

app.put("articles/save/:id", function (req, res) {
    db.Article.findOneAndUpdate({ _id: req.params.id }, { saved: true })
        .then(function (data) {
            // If we were able to successfully find Articles, send them back to the client
            res.json(data);
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });;
});

app.put("articles/delete/:id", function (req, res) {
    db.Article.findOneAndUpdate({ _id: req.params.id }, { saved: false })
        .then(function (data) {
            // If we were able to successfully find Articles, send them back to the client
            res.json(data)
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function (req, res) {
    // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
    db.Article.find({ _id: req.params.id })
        // ..and populate all of the notes associated with it
        .populate("notes")
        .then(function (dbArticle) {
            // If we were able to successfully find an Article with the given id, send it back to the client
            res.json(dbArticle);
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});

// Route for saving/updating an Article's associated Note
app.post("/notes/save/:id", function (req, res) {
    // Create a new note and pass the req.body to the entry
    db.Note.create(req.body)
        .then(function (dbNote) {
            // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
            // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
            // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
            return db.Article.findOneAndUpdate({ _id: req.params.id }, {$push: { note: dbNote._id }}, { new: true });
        })
        .then(function (dbArticle) {
            // If we were able to successfully update an Article, send it back to the client
            res.json(dbArticle);
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});

app.delete("/notes/delete/:note_id/:article_id", function (req, res) {
    // Create a new note and pass the req.body to the entry
    db.Note.findByIdAndRemove({ _id: req.params.id })
        .then(function (dbNote) {

            return db.Article.findOneAndUpdate({ note: req.params.id }, { $pullAll: [{ note: req.params.id }]});
        })
        .then(function (dbArticle) {
            // If we were able to successfully update an Article, send it back to the client
            res.json(dbArticle);
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
                 res.json(err);
        });
});
};
