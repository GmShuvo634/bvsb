// backend/routes/auth.js
const express   = require('express');
const router    = express.Router();                // use express.Router()
const authCtrl  = require('../controllers/authController');

// Register a new user (if you want to keep registration)
router.post('/register', authCtrl.register);

// Log in and receive a JWT
router.post('/login',    authCtrl.login);



module.exports = router;

