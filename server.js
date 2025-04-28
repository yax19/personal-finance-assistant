const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Debugging: Log environment variables
console.log('MONGODB_URL:', process.env.MONGODB_URL);
console.log('SESSION_SECRET:', process.env.SESSION_SECRET);
console.log('PORT:', process.env.PORT);

// Initialize Express app
const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

// Session setup
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
  }
}));

// New middleware to pass user to view
const passUserToView = (req, res, next) => {
  res.locals.user = req.session.user;
  next();
};

// Use the new passUserToView middleware
app.use(passUserToView);

// Routes
const authController = require('./controllers/authController');
const transactionsController = require('./controllers/transactionsController');
const isSignedIn = require('./middleware/isSignedIn');

app.get('/', (req, res) => {
  // Check if the user is signed in
  if (req.session.user) {
    // Redirect signed-in users to their transactions dashboard
    res.redirect(`/users/${req.session.user._id}/transactions`);
  } else {
    // Show the homepage for users who are not signed in
    res.render('index.ejs');
  }
});

app.use('/auth', authController);
app.use(isSignedIn); // Use new isSignedIn middleware here
app.use('/users/:userId/transactions', transactionsController); // New!

// Connect to MongoDB
if (process.env.MONGODB_URL) {
  mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
      console.log('Connected to MongoDB');
      // Start the server
      const PORT = process.env.PORT || 3000;
      app.listen(PORT, () => {
        console.log(`The express app is ready on port ${PORT}!`);
      });
    })
    .catch(err => {
      console.error('Failed to connect to MongoDB', err);
    });
} else {
  console.error('MONGODB_URL is not defined in the environment variables.');
}
