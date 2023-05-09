const express = require('express');
const interestController = require('../controllers/interestController');
const firebaseTokenAuth = require('../middleware/firebaseTokenAuth');
const userDetails = require('../middleware/userDetails');

const router = express.Router();
router.get('/get', interestController.getInterests);

router.use(firebaseTokenAuth.protect);
router.use(userDetails.currentUser);
router.patch('/editInterests', interestController.updateInterests);

module.exports = router;
