const express = require('express');
const storeController = require('../controllers/storeController');
const firebaseTokenAuth = require('../middleware/firebaseTokenAuth');
const userDetails = require('../middleware/userDetails');

const router = express.Router();

router.use(firebaseTokenAuth.protect);
router.use(userDetails.currentUser);

router.get('/available-store', storeController.getStore);
router.all('/search-stores', storeController.searchStore);
router.post('/updateStore', storeController.updateStores);

module.exports = router;
