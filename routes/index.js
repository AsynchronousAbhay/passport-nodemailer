var express = require('express');
var router = express.Router();

const nodemailer = require("nodemailer");

const User = require('../models/userModel');
const passport = require('passport');
const localStrategy = require('passport-local');

passport.use(new localStrategy(User.authenticate())); //--- USE WHEN LOGIN WITH USERNAME
                  //----0R-----
// passport.use(User.createStrategy()); --- USE WHEN LOGIN WITH EMAIL..

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('signup');
});

router.get('/signin', function (req, res, next) {
  res.render('signin');
});

router.post('/signup', function (req, res, next) {

  const { username, name, email, phone, password } = req.body;

  const newUser = {
    username,
    name,
    email,
    phone,
  };

  User.register(newUser, password)
    .then((userCreated) => {
      // res.send(userCreated);
      res.redirect('/signin');
    })
    .catch((err) => {
      res.send(err)
    });

});

router.post('/signin', passport.authenticate('local', {
  successRedirect: "/profile",
  failureRedirect: "/signin",
}),
  function (req, res, next) { }
);

router.get('/profile', isLoggedIn, function (req, res, next) {
  // res.render('profile', { user: req.user });
  res.render('profile', { user: req.session.passport.user });
});

router.get('/logout', isLoggedIn, function (req, res, next) {
  req.logout(function (err) {
    if (err) return next(err);
    res.redirect('/signin');
  });
});

router.post('/reset', isLoggedIn, function (req, res, next) {
  const { oldpassword, newpassword } = req.body;

  req.user.changePassword(oldpassword, newpassword, function (err, user) {
    if (err) {
      res.send(err);
    }
    else {
      res.redirect('/signin');
    };
  })

});

router.get('/forget', function (req, res, next) {
  // res.render('profile', { user: req.user });
  res.render('forget');
});

router.post('/forget', function (req, res, next) {

  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user)
        return res.send(
          "Not found <a href='/forget'>Try Harder!</a>"
        );

      // -----

      const pageurl =
        req.protocol +
        "://" +
        req.get("host") +
        "/change-password/" +
        user._id;

      // send email to the email with gmail
      const transport = nodemailer.createTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        port: 465,
        auth: {
          user: "abhayparmar.22012001@gmail.com",
          pass: "ckdpqttqddulxctm",
        },
      });

      const mailOptions = {
        from: "abhayparmar.22012001@gmail.com",
        to: req.body.email,
        subject: "Password Reset Link",
        text: "Do not share this link to anyone.",
        html: `<a href=${pageurl}>Password Reset Link</a>`,
      };

      transport.sendMail(mailOptions, (err, info) => {
        if (err) return res.send(err);
        console.log(info);
        user.resetPasswordToken = 1;
        user.save();
        return res.send(
          "<h1 style='text-align:center;color: tomato; margin-top:10%'><span style='font-size:60px;'>✔️</span> <br />Email Sent! Check your inbox , <br/>check spam in case not found in inbox.</h1>"
        );
      });

    })
    .catch((err) => {
      res.send(err);
    });

});


router.get('/change-password/:id', function (req, res, next) {
  res.render('changePWD', { id: req.params.id });
});

router.post('/change-password/:id', function (req, res, next) {

  User.findById(req.params.id)
    .then((userFound) => {
      if (userFound.resetPasswordToken === 1) {
        if (userFound === null) {
          res.send("not found <a href='/signin'>home</a>");
        }
        else {
          userFound.setPassword(req.body.password, function (err, user) {
            userFound.resetPasswordToken = 0;
            userFound.save();
            res.redirect('/signin');
          });
        };
      }
      else {
        res.send(
          "Link Expired! <a href='/forget'>Try Again.</a>"
        );
      };
    })
    .catch((err) => {
      res.send(err);
    });

});


// ----------------------
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    next();
    return;
  }
  res.redirect("/");
}


module.exports = router;
