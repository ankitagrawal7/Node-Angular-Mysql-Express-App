// app/routes.js
var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcrypt-nodejs');
var dbconfig = require('../config/database');
var connection = dbconfig.connection;
	
	router.get('/', function(req, res) {
		res.render('index.html');
	});

	// process the signup form
	router.post('/api/signup', function(req, res){
		var first_name = req.body.firstname;
		var last_name = req.body.lastname;
		var username = req.body.email;
		var password = req.body.password;
		var created = new Date();
		
		connection.query("SELECT * FROM users WHERE username = ?",[username], function(err, rows) {
                if (err)
                    return done(err);
                if (rows.length) {
                    console.log('That username is already taken.');
                } else {
                    // if there is no user with that username
                    // create the user
                    var newUserMysql = {
						first_name: first_name,
						last_name: last_name,
                        username: username,
                        password: bcrypt.hashSync(password),
						created: created
                    };

                    var insertQuery = "INSERT INTO users ( first_name, last_name, username, password, created ) values (?,?,?,?,?)";

                    connection.query(insertQuery,[newUserMysql.first_name, newUserMysql.last_name, newUserMysql.username, newUserMysql.password, newUserMysql.created],function(err, rows) {
                        newUserMysql.id = rows.insertId;
							if(newUserMysql !== null){
								res.send("true");
								console.log(newUserMysql.id);
							}
                    });
                }
        });
	});

	// process the login form
	router.post('/api/login', passport.authenticate('userLogin', {successRedirect : '/homepage', failureRedirect : '/'}),
        function(req, res) {
            console.log("hello");

            if (req.body.remember) {
              req.session.cookie.maxAge = 1000 * 60 * 3;
            } else {
              req.session.cookie.expires = false;
            }
        res.redirect('/');
    });
	
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        connection.query("SELECT * FROM users WHERE id = ? ",[id], function(err, rows){
            done(err, rows[0]);
        });
    });

    passport.use('userLogin', new LocalStrategy(function(username, password, done) {
            connection.query("SELECT * FROM users WHERE username = ?",[username], function(err, rows){
                if (err)
                    return done(err);
                if (!rows.length) {
                    return done(null, false, {'loginMessage': 'No user found.'});
                }

                // if the user is found but the password is wrong
                if (!bcrypt.compareSync(password, rows[0].password))
                    return done(null, false, {'loginMessage': 'Oops! Wrong password.'}); 

                //return user
                return done(null, rows[0]);
            });
    }));
	
	router.get('/homepage', isLoggedIn, function(req, res) {
		res.render('homepage.html');
	});

	router.get('/api/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});
	
	router.get('/api/getCurrentUserInfo', isLoggedIn, function(req, res) {
		res.json({
			userid: req.user.id,
			name: req.user.first_name + " " + req.user.last_name,
			username: req.user.username
		});
	});
	
	router.post('/api/add_book', isLoggedIn, function(req, res){
		
		console.log(req.body);
		
        // create the user
        var newBook= {
			book_name: req.body.book_name,
			author: req.body.author,
			description: req.body.description,
			added_by: req.user.id,
			added_on: new Date()
        };

        var insertQuery = "INSERT INTO books ( book_name, author, description, added_by, added_on ) values (?,?,?,?,?)";
        connection.query(insertQuery,[newBook.book_name, newBook.author, newBook.description, newBook.added_by, newBook.added_on],function(err, rows) {
			if(rows !== null){
				res.send("true");
			}
        });
	});
	
	router.get('/api/getBooksList', isLoggedIn, function(req, res) {
		var selectQuery = "SELECT * FROM books ORDER BY `added_on` DESC";
        connection.query(selectQuery,function(err, results) {
			if(results !== null){
				res.send(JSON.stringify(results));
			}
        });
	});
	
	router.get('/api/getMyBooksList', isLoggedIn, function(req, res) {
		var user_id = req.user.id;
		var selectQuery = "SELECT * FROM books WHERE added_by = ? ORDER BY `added_on` DESC";
        connection.query(selectQuery,[user_id],function(err, results) {
			if(results !== null){
				res.send(JSON.stringify(results));
			}
        });
	});
	
	router.post('/api/delete_book', isLoggedIn, function(req, res) {
		console.log(req.body.book_id);
		var book_id = req.body.book_id;
		var deleteQuery = "DELETE FROM books WHERE id = ?";
        connection.query(deleteQuery,[book_id],function(err, results) {
			if(results !== null){
				res.send("true");
			}
        });
	});

function isLoggedIn(req, res, next) {
	// if user is authenticated in the session, carry on
	if (req.isAuthenticated())
		return next();
	// if they aren't redirect them to the home page
	res.redirect('/');
}

module.exports = router;