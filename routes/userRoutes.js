const express = require('express');
const multer = require('multer');
const userContoller = require('../controllers/userController');
const firebaseTokenAuth = require('../middleware/firebaseTokenAuth');
//const firebaseTokenAuth = require('../middleware/old_firebaseTokenAuth');
const userDetails = require('../middleware/userDetails');
const userHelper = require('../helpers/userHelper');

const upload = multer({ dest: 'uploads/' });

const router = express.Router();

//create and get dummy users data for final screen//
router.post('/create', userContoller.createDummyuser);
// router.get('/peoples/:id', userHelper.similarInterests);

router.use(firebaseTokenAuth.protect); //Middleware to validates Firebase ID Tokens passed in the Authorization HTTP header

router.get('/friends', userContoller.getFriends);
router.post('/signup', upload.single('image'), userContoller.signup);
router.get('/login', userContoller.login);
router.get('/search', userContoller.search);

router.use(userDetails.currentUser);

//-------API's for FinishUp Screen-----------

router.get('/nearMe', userContoller.nearMe);
router.get('/similar', userContoller.similarInterests);
router.get('/finshiUpScreen', userContoller.finshiUpApi);

//-------API's for Network Section-----------

router.get('/networkList', userHelper.list);
router.post('/addAction', userHelper.addAction);
router.delete('/removeAction', userHelper.removeAction);

//---------API's for Porfile Section-----------

router.get('/me', userContoller.getMe);
router.patch('/updateMe', upload.single('image'), userContoller.editMe); //delete image from s3 also

//--------APi to create Image url---------------
router.get('/profileImage/:url', userContoller.getImage);

module.exports = router;
