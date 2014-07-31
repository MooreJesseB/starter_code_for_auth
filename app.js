var express = require('express'),
  bodyParser = require('body-parser'),
  methodOvrride = require('method-override'),
  passport = require('passport'),
  passportLocal = require('passport-local'),
  cookieParser = require('cookie-parser'),
  cookieSession = require('cookie-session'),
  flash = require('connect-flash'),
  app = express(),
  db = require('./models/index.js'),;

app.set('view engine', 'ejs');

app.use(methodOvrride());
app.use(bodyParser.urlencoded());
app.use(express.static(__dirname + '/public'));

app.use(cookieSession({
  secret: 'amazingcookiesecret',
  name: 'cookie is created by JBM',
  maxage: 360000
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// prepare our serialize functions
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializer(function(id, done) {
  console.log("DESERIALIZED RAN!");
  db.user.find({
    where: {
      id: id
    }
  }).done(function(error, user) {
    console.log(error, user);
    done(error, user);
  });
});

// logging
app.use(function(req, res, next){
  console.log(req.method, req.url)
  next()
});

app.get('/', function (req, res) {
  if(!req.user) {
    res.render('index');
  } else {
    res.redirect('home');
  }
});

app.get('/signup', function(req, res) {
  if(!req.user) {
    res.render('signup');
  } else {
    res.redirect('home')
  }
});

app.get('/login', function(req, res) {
  if (!req.user) {
    res.render("login")
  } else {
    res.redirect('home')
  }
});

app.get('/home', function(req, res) {
  res.render('home', {
    isAuthenticated: req.isAuthenticated(),
    user: req.user
  });
});

app.post('/login', passport.authenticate('local', {
  successRedirect: '/home',
  failureRedirect: '/login',
  failureFlash: true
}));

app.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

app.post('/create', function(req, res) {
  db.user.createNewUser(req.body.username, req.body.password, function(err) {
    res.render('signup', {message: err.message, username: req.body.username})
  },
  function(success) {
    res.render('index');
  });
});

app.get('/users', function (req,res) {
  db.user.findAll().success(function(users) {
    console.log(users);
    res.render('users', {users: users});
  });
});

app.get('/users/:id', function (req,res) {
  db.user.find(req.params.id).success(function(user) {
    console.log(user);
    db.post.findAll({ where: {userId: req.params.id}}).success(function(posts) {
      console.log(posts);
      res.render('show_user', {user: user, posts: posts});
    });
  });
});

app.get('/posts/:id', function (req,res) {
  var id = req.params.id;
  //

});

app.get('/users/:id/posts/new', function(req, res){
  var id = req.params.id;
  db.user.find(id).success(function(user) {
    res.render('create_post', {user: user});
  });
});

app.post('/users/:id/posts', function(req, res){
  var id = req.params.id;
  db.user.find(id).success(function(user) {
    var post = db.post.create({title: req.body.title, body: req.body.body}).success(function(post){
      user.addPost(post).success(function(post) {
      console.log("TRYING TO ADD A NEW POST", post);
      res.redirect('/users');  
      });
    });
  });
});

app.get("*", function(req, res) {
  res.render('404');
});


app.listen(3000, function(){
  console.log("LISTENING ON PORT 3000")
})
