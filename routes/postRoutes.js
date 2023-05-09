const express = require('express');
const multer = require('multer');
const postContoller = require('../controllers/postController');
const firebaseTokenAuth = require('../middleware/firebaseTokenAuth');
const userDetails = require('../middleware/userDetails');

const upload = multer({ dest: 'uploads/' });

const router = express.Router();

router.use(firebaseTokenAuth.protect);
router.use(userDetails.currentUser);

router.get('/myPosts', postContoller.getMyPosts);
router.get('/myDrafts', postContoller.getMyDrafts);
router.get('/feed', postContoller.feed);

router.patch('/like-post', postContoller.likePost);
router.patch('/dislike-post', postContoller.dislikePost);
router.post('/createPosts', upload.array('images'), postContoller.createPost);

//Bookmarks routes//
// router.get('/getBookmarks', postContoller.getBookmarks);
// router.patch('/addBookmarks/:id', postContoller.addtoBookmarks);
// router.delete('/deleteBookmarks/:id', postContoller.deleteBookmarks);

router.patch('/addRemoveBookmarks', postContoller.bookMarkPost);
router.get('/getBookmarks', postContoller.getMyBookMarks);

router
  .route('/:id')
  .get(postContoller.getPost)
  .patch(upload.array('images'), postContoller.updatePost)
  .delete(postContoller.deletePost);

module.exports = router;
