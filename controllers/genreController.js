const Genre = require('../models/genre');
const Book  = require("../models/book");
const async = require("async");
const { body, validationResult } = require("express-validator");

// Display list of all Genre.
exports.genre_list = function(req, res, next) {
    Genre.find()
        .sort([["name", "ascending"]])
        .exec(function(err, genre_list) {
            if (err) return next(err);
            res.render("genre_list", { title: "Genre List", genre_list });
        })
};

// Display detail page for a specific Genre.
exports.genre_detail = function(req, res, next) {
    async.parallel({
        genre: function(callback) {
            Genre.findById(req.params.id)
                .exec(callback);
        }, 

        genre_books: function(callback) {
            Book.find({ "genre": req.params.id })
                .exec(callback);
        }, 
    }, function(err, results) {
        if (err) return next(err);
        if (results.genre == null) {
            const err = new Error("Genre Not Found!");
            err.status = 404;
            return next(err);
        }

        res.render("genre_detail", { title: "Genre Detail", genre: results.genre, genre_books: results.genre_books });
    });
};

// Display Genre create form on GET.
exports.genre_create_get = function(req, res, next) {
    res.render("genre_form", { title: "Create Genre" });
};

// Handle Genre create on POST.
exports.genre_create_post = [
    // Validate and sanitize the name field
    body("name", "Genre name required").trim().isLength({ min: 1 }).escape(),

    // Process request after validation and sanitization
    (req, res, next) => {
        // Extract the validation errors from request
        const errors = validationResult(req);

        //Create a genre object with esacped and trimmed data
        const genre = new Genre({ name: req.body.name });

        if (!errors.isEmpty()) {
            return res.render("genre_form", { title: "Create Genre", genre: genre, errors: errors.array() });
        } else {
            // Data from form is valid
            // Check if genre with same name already exists
            Genre.findOne({ "name": req.body.name })
                .exec(function(err, found_genre) {
                    if (err) return next(err);
                    if (found_genre) {
                        // redirect to its detail page
                        res.redirect(found_genre.url);
                    } else {
                        genre.save(function(err) {
                            if (err) return next(err);
                            // Genre saved. Redirect to detail page
                            res.redirect(genre.url);
                        });
                    }
                });
        }
    }
];

// Display Genre delete form on GET.
exports.genre_delete_get = function(req, res, next) {
    Genre.findById(req.params.id).exec(function(err, genre) {
        if (err) return next(err);
        res.render("genre_delete", { title: "Delete Genre", genre });
    });
};

// Handle Genre delete on POST.
exports.genre_delete_post = function(req, res, next) {
    Genre.findByIdAndRemove(req.params.id, function(err) {
        if (err) return next(err);
        res.redirect("/catalog/genres");
    })
};

// Display Genre update form on GET.
exports.genre_update_get = function(req, res, next) {
    Genre.findById(req.params.id).exec(function(err, genre) {
        if (err) return next(err);
        res.render("genre_form", { title: "Update Genre", genre });
    })
};

// Handle Genre update on POST.
exports.genre_update_post = [
    body("name", "Name cannot be empty").trim().isLength({ min: 1 }).escape(),

    (req, res, next) => {
        const errors = validationResult(req);

        const genre = new Genre({ name: req.body.name, _id: req.params.id });

        if (!errors.isEmpty()) {
            res.render("genre_form", { title: "Update Genre", genre, errors: errors.array() });
        } else {
            Genre.findByIdAndUpdate(req.params.id, genre, {}, function(err) {
                if (err) return next(err);
                res.redirect(genre.url);
            })
        }
    }
];