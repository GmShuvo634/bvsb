// backend/routes/pool.js
const router = require('express').Router();
const poolCtrl = require('../controllers/poolController');

router.get('/current', poolCtrl.getCurrent);

module.exports = router;
