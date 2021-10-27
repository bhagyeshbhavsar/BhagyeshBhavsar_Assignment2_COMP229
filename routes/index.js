'use strict';
var express = require('express');
var router = express.Router();
var passport = require('passport');
var userModel = require('../models/user');
var bcrypt = require('bcryptjs');
var employeeModel = require('../models/employee');
var formidable = require('formidable');
var fs = require('fs');
var path = require('path');
//Library for using API - node-fetch
const fetch = require('node-fetch');

let settings = { method: "Get" };

router.get('/employee', function (req, res) {
    try {
        //Retrieve all employees if there is any 
        employeeModel.find({}, function (err, foundEmployee) {
            console.log(err);
            console.log(foundEmployee);
            //Pass found employee from server to pug file
            res.render('employee', { employee: foundEmployee, user: req.user });
        });
    } catch (err) {
        console.log(err);
    }
});


/* GET home page. */
router.get('/', function (req, res) {
    res.render('index', { user: req.user });
});

/* GET insert page. */
router.get('/insert', function (req, res) {
    res.render('insert', { user: req.user });
});

/* POST insert page */
router.post('/insert', function (req, res) {
    var form = new formidable.IncomingForm();
    //Specify our image file directory
    form.uploadDir = path.join(__dirname, '../public/images');
    form.parse(req, function (err, fields, files) {
        console.log('Parsed form.');
        //Update filename
        //files.image.name = fields.name + '.' + files.image.name.split('.')[1];
        //Create a new article using the Employee Model Schema
        const article = new employeeModel({ ContactName: fields.fname, ContactNumber: fields.lname, email: fields.email });
        //Insert Employee into DB
        article.save(function (err) {
            console.log(err);
        });
        //Upload file on our server
        /*fs.rename(files.image.path, path.join(form.uploadDir, files.image.name), function (err) {
            if (err) console.log(err);
        });*/
        console.log('Received upload');
    });
    form.on('error', function (err) {
        console.log(err);
    });
    form.on('end', function (err, fields, files) {
        console.log('File successfuly uploaded');
        res.redirect('/employee');
    });
});


/* GET update page */
router.get('/update/:id', function (req, res) {
    employeeModel.findById(req.params.id, function (err, foundArticle) {
        if (err) console.log(err);
        //Render update page with specific employee
        res.render('update', { employee: foundArticle, user: req.user })
    })
});

/* POST update page */
router.post('/update', function (req, res) {
    console.log(req.body);
    //Find and update by id
    employeeModel.findByIdAndUpdate(req.body.id, { ContactName: req.body.fname, ContactNumber: req.body.lname, email: req.body.email }, function (err, model) {
        console.log(err);
        res.redirect('/employee');
    });
});

/* POST delete page */
router.post('/delete/:id', function (req, res) {
    //Find and delete employee
    employeeModel.findByIdAndDelete(req.params.id, function (err, model) {
        res.redirect('/employee');
    });
});



/*POST for login*/
//Try to login with passport
router.post('/login', passport.authenticate('local', {
    successRedirect: '/employee',
    failureRedirect: '/login',
    failureMessage: 'Invalid Login'
}));

/*Logout*/
router.get('/logout', function (req, res) {
    req.session.destroy(function (err) {
        res.redirect('/login');
    });
});

/*POST for register*/
router.post('/register', function (req, res) {
    //Insert user
    bcrypt.hash(req.body.password, 10, function (err, hash) {
        var registerUser = {
            username: req.body.username,
            password: hash
        }
        //Check if user already exists
        userModel.find({ username: registerUser.username }, function (err, user) {
            if (err) console.log(err);
            if (user.length) console.log('Username already exists please login.');
            const newUser = new userModel(registerUser);
            newUser.save(function (err) {
                console.log('Inserting');
                if (err) console.log(err);
                req.login(newUser, function (err) {
                    console.log('Trying to login');
                    if (err) console.log(err);
                    return res.redirect('/employee');
                });
            });
        });
    })
});

/*GET for register*/
router.get('/register', function (req, res) {
    res.render('register');
});

/*GET for login*/
router.get('/login', function (req, res) {
    res.render('login');
});

module.exports = router;
