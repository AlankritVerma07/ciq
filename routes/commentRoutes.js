const express = require('express');
const commentController = require('../controllers/commentController');
const firebaseTokenAuth = require('../middleware/firebaseTokenAuth');
const userDetails = require('../middleware/userDetails');

const router = express.Router();

router.use(firebaseTokenAuth.protect);
router.use(userDetails.currentUser);

router.get('/get-all-comments', commentController.getAllComments);
router.get('/get-single-comment', commentController.getSingleCommnet);
router.get('/get-comments-by-postId', commentController.getCommentByPostId);
router.get('/get-reply-by-commentId', commentController.getReplyByCommentId);

//-----------------Comments Api-----------------------
router.post('/create-comment', commentController.createComment);
router.patch('/like-comment', commentController.likeComment);
router.patch('/dislike-comment', commentController.disLikeComment);
router.delete('/delete-comment', commentController.deleteComment);

//---------------Reply Apis----------------------------
router.post('/create-reply', commentController.createReply);
router.patch('/like-reply', commentController.likeReply);
router.patch('/dislike-reply', commentController.dislikeReply);
router.delete('/delete-reply', commentController.deleteReply);

// router.patch('/remove-like-comment', commentController.removeLike);
// router.patch('/remove-like-reply', commentController.removelikeReply);
// router.patch('/remove-dislike-comment', commentController.removeDislikeComment);
// router.patch('/remove-dislike-reply', commentController.removeReplyDislike);

module.exports = router;
