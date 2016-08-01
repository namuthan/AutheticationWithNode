var express = require('express');
var router = express.Router();
var User = require('../models/user');



//GET /logout
router.get('/logout', function(req, res, next) {
  if (req.session) {

    //delete session
    req.session.destroy(function (err) {
      if(err) {
        return next(err);
      } else {
        return res.redirect('/');
      }
    })
  }
})


//GET /profile
router.get('/profile', function(req, res, next) {
  if(! req.session.userId) {
    var err = new Error("You are not authorized to view this page.");
    err.status = 403;
    return next(err);
  }

  //retreive user info
  User.findById(req.session.userId)
      .exec(function (error, user) {
        if (error) {
          return next(error);
        } else {
          return res.render('profile', { title: 'Profile', name: user.name, favorite: user.favoriteBook });
        }
      });
});


//GET /login
router.get('/login', function(req, res, next) {
  return res.render('login', {title: 'Log In'});
});

//POST /login
router.post('/login', function(req, res, next) {
  if (req.body.email && req.body.password) {
    User.authenticate(req.body.email, req.body.password, function(error, user) {
      if(error || !user) {
        var err = new Error('Wrong email or password');
        err.status = 401;
        return next(err);
      }

      req.session.userId = user._id;
      return res.redirect('/profile');
    });
  } else {
    var err = new Error('Email and password are required');
    err.status = 401;
    next(err);
  }

});


//GET /
router.get('/register', function(req, res, next) {
  return res.render('register', { title: 'Register' });
});


router.post('/register', function(req, res, next) {
  if(req.body.email && req.body.name && req.body.favoriteBook && req.body.password && req.body.confirmPassword) {

    //confirm the password
    if (req.body.password !== req.body.confirmPassword)   {
      var err = new Error('Passwords must match.');
      err.status = 400;
      return next(err);
    }

    //save the user to the backend
    var userData = {
      email: req.body.email,
      name: req.body.name,
      favoriteBook: req.body.favoriteBook,
      password: req.body.password
    }

    //Use schema's created
    User.create(userData, function(err, user) {
      if (err) {
        return next(err);
      } else {
        req.session.userId = user._id;
        return res.redirect('/profile');
      }
    });

  } else {
    var err = new Error('All fields are required.');
    err.status = 400;
    return next(err);
  }



});

// GET /
router.get('/', function(req, res, next) {
  return res.render('index', { title: 'Home' });
});

// GET /about
router.get('/about', function(req, res, next) {
  return res.render('about', { title: 'About' });
});

// GET /contact
router.get('/contact', function(req, res, next) {
  return res.render('contact', { title: 'Contact' });
});

module.exports = router;
