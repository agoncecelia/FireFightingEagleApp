var express = require('express')
var app = express();
var fs = require('fs');
var bodyParser = require('body-parser');
var runningPort = 3500;
var request = require('request');
var cookieParser = require('cookie-parser');
var flash        = require('req-flash');
var session      = require('express-session');
var API_URL = 'https://firefightingeagle.herokuapp.com/api/';


app.set('view engine', 'pug');

app.use(express.static('public'));

app.use(bodyParser.json({limit: '50mb'}));

app.use(bodyParser.urlencoded({
    extended: true,
    limit: '10mb'
}));

app.use(cookieParser());
3
app.use(session({ secret: 'b103bdbe6892ab002bf14d08f9f653a' }));

app.use(flash());

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

                if(result.user.role == 'user'){
                    next();
                }else{
                    req.flash('errorMessage', 'Session expired!');
                    return res.redirect('/login');
                }
                next();
            }catch (e){
                req.flash('errorMessage', 'Session expired!');
                return res.redirect('/login');
            }
        });

    }else{
        return res.redirect('/login');
    }
};

var isAuthenticatedAdmin = function (req, res, next) {
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
                if(result.user.role == 'admin'){
                    next();
                }else{
                    req.flash('errorMessage', 'Session expired!');
                    return res.redirect('/login');
                }

            }catch (e){
                req.flash('errorMessage', 'Session expired!');
                return res.redirect('/login');
            }
        });

    }else{
        return res.redirect('/login');
    }
};

app.get('/', isAuthenticated, function (req, res) {
    return res.render('dashboard', {user: req.user});
});

app.get('/login', function (req, res) {
    var error = req.flash();
    return res.render('login', {error: error.errorMessage})
});

app.get('/admin', isAuthenticatedAdmin, function (req, res) {
    if(req.cookies.token){
        var token = req.cookies.token;

        request.get({
            headers: {
                'content-type' : 'application/x-www-form-urlencoded',
                'Authorization' : token
            },
            url:     API_URL + 'users/pendingUsers',
            form:    {}
        }, function(error, response, body){
            if(error){
                return res.status(500).send(error);
            }

            try{
                var result = JSON.parse(body);

                return res.render('admin', {pendings: result.length});

            }catch (e){
                return res.status(500).send(e);
            }
        });

    }else{
        return res.redirect('/login');
    }
});

app.get('/register', function (req, res) {
    return res.render('register');
});

app.get('/pendingusers', function (req, res) {
    var token = req.cookies.token;

    request.get({
        headers: {
            'content-type' : 'application/x-www-form-urlencoded',
            'Authorization' : token
        },
        url:     API_URL + 'users/pendingUsers',
        form:    {}
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

app.get('/refreshfires', function (req, res) {
    var token = req.cookies.token;

    request.get({
        headers: {
            'content-type' : 'application/x-www-form-urlencoded',
            'Authorization' : token
        },
        url:     API_URL + 'getActiveFires',
        form:    {}
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

app.post('/approveuser', function (req, res) {
    var token = req.cookies.token;
    var body = req.body;

    request.post({
        headers: {
            'content-type' : 'application/x-www-form-urlencoded',
            'Authorization' : token
        },
        url:     API_URL + 'users/approveUser/' + body.id,
        form:    {}
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

        var result = JSON.parse(body);
        if(result.success){
            if(result.user.role == "admin"){
                res.cookie('token', result.token);

                return res.redirect('/admin');
            }else{
                res.cookie('token', result.token);

                return res.redirect('/');
            }
        }else{
            req.flash('errorMessage', 'Wrong username or password');
            return res.redirect('/login');
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