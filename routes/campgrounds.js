var express = require('express');
var router = express.Router();
var Campground = require('../models/campground');
var middleware = require("../middleware");

//INDEX - show new camprounds
router.get('/', function(req, res){
        //get all campgrounds from db
        Campground.find({}, function(err, allCampgrounds){
            if(err){
                console.log(err);
            } else {
                res.render('campgrounds/index', {campgrounds:allCampgrounds, currentUser: req.user});
            }
        });
});

//POST - to create new into db
router.post('/', middleware.isLoggedIn, function(req, res){
   var name = req.body.name;
   var price = req.body.price;
   var image = req.body.image;
   var desc = req.body.description;
   var author = {
       id: req.user._id,
       username: req.user.username
   }
   var newCampground = {name: name, price: price, image: image, description: desc, author: author};
   // create a new campground and save to db
   Campground.create(newCampground, function(err, newlyCreated){
       if(err){
           console.log(err);
       } else {
           //redirect back to campgrounds page
           res.redirect('/campgrounds');
       }
   });
});

//NEW - show form to create new campgournds
router.get('/new', middleware.isLoggedIn, function(req, res){
    res.render('campgrounds/new');
});


//SHOW - shows more info about one campground
router.get('/:id', function(req, res) {
    //find the campgound with the provided ID
    Campground.findById(req.params.id).populate('comments').exec(function(err, foundCampground){
        if(err){
            console.log(err);
        } else {
            //render template with that campground
            res.render('campgrounds/show', {campground: foundCampground});
        }
    });
});

//EDIT
router.get('/:id/edit', middleware.checkCampgroundOwnership, function(req, res) {
    Campground.findById(req.params.id, function(err, foundCampground){
            res.render('campgrounds/edit', {campground: foundCampground});
    });
});

// UPDATE
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
    // find and update the correct campground
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
       if(err){
           res.redirect("/campgrounds");
       } else {
           //redirect somewhere(show page)
           res.redirect("/campgrounds/" + req.params.id);
       }
    });
});

//DESTROY
router.delete('/:id', middleware.checkCampgroundOwnership, function(req, res){
    Campground.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect('/campgrounds');
        } else {
            res.redirect('/campgrounds');
        }
    });
});

module.exports = router;