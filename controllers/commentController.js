const catchAsync = require('../utils/catchAsync');
const Comment = require('../models/commentModel');
const Post = require('../models/postModel');

/**
 * @route /api/v1/comments/create-comment
 */

const createComment = async (req, res, next) => {
  try {
    const data = await Comment.create({
      userName: req.currentUser.userName,
      userId: req.currentUser._id,
      userImage: req.currentUser.userImage,
      comment: req.body.comment,
      postId: req.query.id,
    });

    // update totalComments counter on post
    const post = await Post.findById(req.query.id);
    post.totalComments += 1;
    await post.save({ validateBeforeSave: false });

    res.status(200).json({
      status: true,
      data,
    });
  } catch (err) {
    // console.log(err);
    res.status(200).json({
      status: false,
      message: 'Comment not created',
    });
  }
};

/**
 * @route api/v1/comments/create-reply?id=xxxxxxx(comment id)
 */

const createReply = async (req, res, next) => {
  const newMessage = {
    userName: req.currentUser.userName,
    userId: req.currentUser._id,
    commentId: req.query.id,
    userImage: req.currentUser.userImage,
    comment: req.body.comment,
  };
  Comment.updateOne(
    { _id: req.query.id },
    { $push: { replies: newMessage } },
    (err) => {
      if (!err) {
        res.status(200).json({
          status: true,
          message: 'Reply created succesfully',
        });
      } else {
        res.status(200).json({
          status: false,
          message: "Reply can't be created",
        });
      }
    }
  );
};

/**
 * @route /api/v1/comments/get-all-comments
 */

const getAllComments = catchAsync(async (req, res, next) => {
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 100;

  const data = await Comment.find()
    .limit(limit)
    .skip(limit * (page - 1));

  res.status(200).json({
    status: true,
    data,
  });
});

/**
 * @api /api/v1/comments/get-reply-by-commentId?id=630c57eebce21a2f98d61a8e
 * Api to get replies on each comment
 */

const getReplyByCommentId = catchAsync(async (req, res, next) => {
  const comment = await Comment.findById(req.query.id).select('replies').lean();

  if (!comment) {
    return res.status(200).json({
      status: 'success',
      message: 'No comment with this id.',
    });
  }

  if (comment.replies.length === 0) {
    return res.status(200).json({
      status: true,
      message: 'No replies on this comment yet.',
    });
  }

  if (comment.replies.length > 0) {
    /*eslint-disable-next-line*/
    comment.replies.map((reply) => {
      const replyLikes = reply.replyLikedUsers.map((like) => like.toString());
      reply.isLiked = replyLikes.includes(req.currentUser._id.toString());
      const replyDislikes = reply.replydisLikedUsers.map((dislike) =>
        dislike.toString()
      );
      reply.isDisliked = replyDislikes.includes(req.currentUser._id.toString());
    });
  }

  res.status(200).json({
    status: true,
    data: comment.replies,
  });
});

/**
 * @route /api/v1/comments/get-comments-by-postId?id=xxxxxxxxxxxxxxxxx
 */

const getCommentByPostId = async (req, res, next) => {
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 100;

  try {
    const comments = await Comment.find({ postId: req.query.id })
      .sort({ _id: -1 })
      .lean()
      .limit(limit)
      .skip(limit * (page - 1));

    const data = comments.map((comment) => {
      //for comment
      const likes = comment.commentLikedUsers.map((like) => like.toString());
      comment.isLiked = likes.includes(req.currentUser._id.toString());
      const dislikes = comment.commentdisLikedUsers.map((dislike) =>
        dislike.toString()
      );
      comment.isDisliked = dislikes.includes(req.currentUser._id.toString());

      // for reply
      if (comment.replies.length > 0) {
        /*eslint-disable-next-line*/
        comment.replies.map((reply) => {
          const replyLikes = reply.replyLikedUsers.map((like) =>
            like.toString()
          );
          reply.isLiked = replyLikes.includes(req.currentUser._id.toString());
          const replyDislikes = reply.replydisLikedUsers.map((dislike) =>
            dislike.toString()
          );
          reply.isDisliked = replyDislikes.includes(
            req.currentUser._id.toString()
          );
        });
      }

      return comment;
    });

    res.status(200).json({
      status: true,
      data,
    });
  } catch (err) {
    res.status(200).json({
      status: false,
      message: "Can't find comment related to postId",
    });
  }
};

/**
 * @route /api/v1/comments/get-single-comment?id=xxxxxxxxxx
 */

const getSingleCommnet = async (req, res, next) => {
  try {
    const data = await Comment.findById(req.query.id);
    res.status(200).json({
      status: true,
      data,
    });
  } catch (err) {
    res.status(200).json({
      status: false,
      message: `No such comment with comment id ${req.query.id}`,
    });
  }
};

/**
 * @route /api/v1/comments/delete-comment?id=xxxxxxxxxxxxxx
 */

const deleteComment = async (req, res) => {
  // Find post and decrement the totalComments count
  const comment = await Comment.findById(req.query.id);
  const post = await Post.findById(comment.postId);
  post.totalComments -= 1;
  await post.save({ validateBeforeSave: false });

  Comment.deleteOne({ _id: req.query.id }, (err) => {
    if (!err) {
      res.status(200).json({
        status: true,
        message: 'Comment deleted successfully',
      });
    } else {
      res.status(200).json({
        status: false,
        message: "Can't delete comment",
      });
    }
  });
};

/**
 * @route /api/v1/comments/delete-sub-comment?comment_id=xxxxxx&reply_id=xxxxxxx
 */

const deleteReply = async (req, res) => {
  const commentId = req.query.comment_id;
  const replyId = req.query.reply_id;

  Comment.updateOne(
    { _id: commentId },
    { $pull: { replies: { _id: replyId } } },
    (err) => {
      if (!err) {
        res.status(200).json({
          status: true,
          message: 'Reply deleted successfully',
        });
      } else {
        res.status(200).json({
          status: false,
          message: "Can't delete reply",
        });
      }
    }
  );
};

// like comment
const likeComment = catchAsync(async (req, res, next) => {
  const comment = await Comment.findById(req.query.id);
  if (!comment) {
    return res.status(200).json({
      status: false,
      message: 'Comment not found',
    });
  }

  let msg = '';
  if (comment.commentLikedUsers.includes(req.currentUser._id)) {
    const index = comment.commentLikedUsers.indexOf(req.currentUser._id);
    comment.commentLikedUsers.splice(index, 1);
    comment.likes -= 1;
    msg = 'Comment Liked Removed successfully';
    await comment.save();
  } else {
    const index = comment.commentdisLikedUsers.indexOf(req.currentUser._id);
    if (index >= 0) {
      comment.commentdisLikedUsers.splice(index, 1);
      comment.dislikes -= 1;
      await comment.save();
    }
    comment.commentLikedUsers.push(req.currentUser._id);
    comment.likes += 1;
    await comment.save();
    msg = 'Comment Liked successfully';
  }

  return res.status(200).json({
    status: true,
    message: msg,
  });
});

//dislike comment
const disLikeComment = catchAsync(async (req, res, next) => {
  const comment = await Comment.findById(req.query.id);
  if (!comment) {
    return res.status(200).json({
      status: false,
      message: 'Comment not found',
    });
  }

  let msg = '';
  if (comment.commentdisLikedUsers.includes(req.currentUser._id)) {
    const index = comment.commentdisLikedUsers.indexOf(req.currentUser._id);
    comment.commentdisLikedUsers.splice(index, 1);
    comment.dislikes -= 1;
    msg = 'Comment dislike removed successfully';
    await comment.save();
  } else {
    const index = comment.commentLikedUsers.indexOf(req.currentUser._id);
    if (index >= 0) {
      comment.commentLikedUsers.splice(index, 1);
      comment.likes -= 1;
      await comment.save();
    }
    comment.commentdisLikedUsers.push(req.currentUser._id);
    comment.dislikes += 1;
    await comment.save();
    msg = 'Comment disliked successfully';
  }

  return res.status(200).json({
    status: true,
    message: msg,
  });
});

// like reply
const likeReply = catchAsync(async (req, res, next) => {
  const comment = await Comment.findById(req.query.comment_id);
  if (!comment) {
    return res.status(200).json({
      status: false,
      message: 'Comment not found',
    });
  }

  const replyData = comment.replies.filter(
    (c) => c._id.toString() === req.query.reply_id
  );

  const singleRelpy = replyData[0];

  let msg = '';
  if (singleRelpy.replyLikedUsers.includes(req.currentUser._id)) {
    const index = singleRelpy.replyLikedUsers.indexOf(req.currentUser._id);
    singleRelpy.replyLikedUsers.splice(index, 1);
    singleRelpy.likesCount -= 1;
    msg = 'Reply Liked Removed successfully';
    await comment.save();
  } else {
    const index = singleRelpy.replydisLikedUsers.indexOf(req.currentUser._id);
    // console.log(index);
    if (index >= 0) {
      singleRelpy.replydisLikedUsers.splice(index, 1);
      singleRelpy.dislikesCount -= 1;
      await comment.save();
    }
    singleRelpy.replyLikedUsers.push(req.currentUser._id);
    singleRelpy.likesCount += 1;
    await comment.save();
    msg = 'Reply Liked successfully';
  }

  return res.status(200).json({
    status: true,
    message: msg,
  });
});

// dislike Reply
const dislikeReply = catchAsync(async (req, res, next) => {
  const comment = await Comment.findById(req.query.comment_id);
  if (!comment) {
    return res.status(200).json({
      status: false,
      message: 'Comment not found',
    });
  }

  const replyData = comment.replies.filter(
    (c) => c._id.toString() === req.query.reply_id
  );

  const singleRelpy = replyData[0];

  let msg = '';
  if (singleRelpy.replydisLikedUsers.includes(req.currentUser._id)) {
    const index = singleRelpy.replydisLikedUsers.indexOf(req.currentUser._id);
    singleRelpy.replydisLikedUsers.splice(index, 1);
    singleRelpy.dislikesCount -= 1;
    msg = 'Reply dislike removed successfully';
    await comment.save();
  } else {
    const index = singleRelpy.replyLikedUsers.indexOf(req.currentUser._id);
    if (index >= 0) {
      singleRelpy.replyLikedUsers.splice(index, 1);
      singleRelpy.likesCount -= 1;
      await comment.save();
    }
    singleRelpy.replydisLikedUsers.push(req.currentUser._id);
    singleRelpy.dislikesCount += 1;
    await comment.save();
    msg = 'Reply disliked successfully';
  }

  return res.status(200).json({
    status: true,
    message: msg,
  });
});

const commentController = {
  createComment,
  getAllComments,
  createReply,
  getCommentByPostId,
  getSingleCommnet,
  deleteComment,
  deleteReply,
  likeComment,
  disLikeComment,
  likeReply,
  dislikeReply,
  getReplyByCommentId,
};

module.exports = commentController;
