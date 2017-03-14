var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var Verify = require('./verify');
var Favorites = require('../models/favorites');

var router = express.Router();
router.use(bodyParser.json());

router.route('/')
.get(Verify.verifyOrdinaryUser, function(req, res, next) {
    var postedBy = req.decoded._doc._id;
    Favorites.findOne({'postedBy': postedBy})
        .populate('dishes')
        .populate('postedBy')
        .exec(function(err, dish) {
            if (err) throw err;
            res.json(dish);
        });
})

.post(Verify.verifyOrdinaryUser, function(req, res, next) {
    
    // Find favorites posted by this user
    var postedBy = req.decoded._doc._id;
    Favorites.findOne({'postedBy': postedBy}, function (err, favorite) {
        
        if (err) throw err;
        if (!favorite) {
            // Favorite does not exist. Create one.
            console.log('Created favorite!');
            favorite = new Favorites();
            favorite.postedBy = postedBy;
            favorite.dishes = new Array();
        }
        
        // Check if dish has already been added to favorites
        var dishId = req.body._id;
        var found = false;
        for (var i = 0; i < favorite.dishes.length; i++) {
            if (favorite.dishes[i] == dishId) {
                console.log("Dish already exists in the list of favorites!");
                found = true;
                break;
            }                
        }
        
        if (!found) {
            
            // Add dish and save record.
            favorite.dishes.push(req.body);
            favorite.save(function (err, favorite) {
                if (err) throw err;
                console.log('Added favorite!');
                res.json(favorite);
            });
            
        } else {
            
            // Nothing to do. Just return the existing record.
            res.json(favorite);
        }
    });
})

.delete(Verify.verifyOrdinaryUser, function(req, res, next) {
    
    var postedBy = req.decoded._doc._id;
    Favorites.remove({'postedBy': postedBy}, function(err, resp) {
        if (err) throw err;
        res.json(resp);
    });
});


router.route('/:id')
.delete(Verify.verifyOrdinaryUser, function(req, res, next) {
    
    // Lookup favorites for this user
    var postedBy = req.decoded._doc._id;
    Favorites.findOne({'postedBy': postedBy}, function (err, favorite) {  
        
        if (err) throw err;
        if (!favorite) {
            
            console.log("User does not have any favorites yet");
            res.json(favorite);
            
        } else {
            
            var index = favorite.dishes.indexOf(req.params.id);
            favorite.dishes.splice(index, 1);
            favorite.save(function (err, favorite) {
                if (err) throw err;
                console.log('deleted favorite ' + req.params.id);
                res.json(favorite);
            });
        }
    });
});

module.exports = router;
