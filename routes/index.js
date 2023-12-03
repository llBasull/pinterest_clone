var express = require('express');
var router = express.Router();
var userModel = require('./users');
const postModel = require('./posts');
const passport = require('passport');
const multer = require('./multer');
const localStrategy = require('passport-local');

passport.use(new localStrategy(userModel.authenticate()));

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index');
});

router.get('/profile', isLoggedin, async function (req, res) {
  const user = await userModel.findOne({
    username: req.session.passport.user,
  }).populate('posts');
  res.render('profile', { user, messages: req.flash() });
});

router.post('/register', function (req, res) {
  const userData = new userModel(req.body);
  userModel.register(userData, req.body.password, function (err, user) {
    if (err) {
      console.log(err);
      return res.redirect('/');
    }
    passport.authenticate('local')(req, res, function () {
      res.redirect('/profile');
    });
  });
});

router.get('/login', function (req, res) {
  res.render('login', { error: req.flash('error') });
});

router.post(
  '/login',
  passport.authenticate('local', {
    successRedirect: '/profile',
    failureRedirect: '/login',
    failureFlash: true,
  }),
  (req, res) => {}
);

router.get('/logout', function (req, res, next) {
  req.logOut((err) => {
    if (err) return next(err);
    res.redirect('/login');
  });
});

router.get('/feed', isLoggedin, function (req, res) {
  res.render('feed');
});

router.get('/upload', function(req,res){
  res.render('upload')
})

router.post(
  '/upload',
  isLoggedin,
  multer.postImageUpload.single('file'),
  async function (req, res, next) {
    if (!req.file) {
      return res.status(400).send('No files were uploaded');
    }

    const user = await userModel.findOne({ username: req.session.passport.user });
    const post = await postModel.create({
      image: req.file.filename,
      imageText: req.body.filecaption,
      user: user._id,
    });
    user.posts.push(post._id);
    await user.save();
    req.flash('success', 'Image successfully uploaded!');
    res.redirect('/profile');
  }
);


router.get('/edit_profile', isLoggedin, function (req, res) {
  res.render('edit_profile');
});

router.post('/edit_profile', isLoggedin, multer.profileImageUpload.single('profileImage'), async function (req, res) {
  const user = await userModel.findOne({ username: req.session.passport.user });

  if (req.file) {
    user.dp = req.file.filename;
  }

  user.tagline = req.body.tagline;
  user.description = req.body.description;

  await user.save();
  
  req.flash('success', 'Profile updated successfully!');
  res.redirect('/profile');
});


function isLoggedin(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}
module.exports = router;
