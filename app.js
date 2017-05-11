var express = require('express')
var app = express();
var fs = require('fs');
var bodyParser = require('body-parser');
var runningPort = 3500;
var request = require('request');
var cookieParser = require('cookie-parser');
var API_URL = 'http://192.168.100.6:3000/api/';


app.set('view engine', 'pug');

app.use(express.static('public'))

app.use(bodyParser.json({limit: '50mb'}));

app.use(bodyParser.urlencoded({
    extended: true,
    limit: '10mb'
}));

app.use(cookieParser());

var isAuthenticated = function (req, res, next) {
    if(req.cookies.token){
        var token = req.cookies.token;

        request.post({
            headers: {
                'content-type' : 'application/x-www-form-urlencoded',
                'Authorization' : token
            },
            url:     API_URL + 'users/isAuthenticated',
            form:    {}
        }, function(error, response, body){
            if(error){
                return res.status(500).send(error);
            }

            try{
                var result = JSON.parse(body);
                req.user = result.user;

                next();
            }catch (e){
                return res.status(500).send(e);
            }
        });

    }else{
        return res.redirect('/login');
    }
}

app.get('/', isAuthenticated, function (req, res) {
    return res.render('dashboard', {user: req.user});
});

app.get('/login', function (req, res) {
    return res.render('login')
});

app.get('/admin', function (req, res) {
    if(req.cookies.token){
        var token = req.cookies.token;



        return res.render('admin');

    }else{
        return res.redirect('/login');
    }
});

app.get('/register', function (req, res) {
    return res.render('register');
})

app.post('/authenticate', function (req, res) {
    var body = req.body;
    var username = body.username;
    var password = body.password;

    request.post({
        headers: {'content-type' : 'application/x-www-form-urlencoded'},
        url:     API_URL + 'users/authenticate',
        form:    {
            username: username,
            password: password
        }
    }, function(error, response, body){
        if(error){
            return res.status(500).send(error);
        }

        try{
            var result = JSON.parse(body);
            if(result.success){
                if(result.user.role == "admin"){

                }else{
                    res.cookie('token', result.token);

                    return res.redirect('/');
                }
                // res.cookie('token', result.token);
                // return res.redirect('/admin');
            }else{
                return res.status(401).send("Wrong username or password")
            }
        }catch (e){
            return res.status(500).send(e);
        }
    });

});

app.post('/register', function (req, res) {
    var body = req.body;
    var departmentName = body.departmentName;
    var email = body.email;
    var username = body.username;
    var password = body.password;
    var servingArea = body.servingArea;
    var departmentLocation = body.departmentLocation;

    request.post({
        headers: {'content-type' : 'application/x-www-form-urlencoded'},
        url:     API_URL + 'users/register',
        form:    {
            departmentName: departmentName,
            departmentLocation: departmentLocation,
            servingArea: servingArea,
            email: email,
            username: username,
            password: password,
            role: 'user'
        }
    }, function(error, response, body){
        if(error){
            return res.status(500).send(error);
        }

        try{
            var result = JSON.parse(body);
            return res.send(result);
        }catch (e){
            return res.status(500).send(e);
        }
    });

});

app.listen(runningPort, function () {
    console.log('Example app listening on port ', runningPort)
})