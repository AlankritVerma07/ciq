const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    userName: {
      type: 'String',
      required: [true, 'User Must Have A Name'],
    },
    comment: {
      type: 'String',
      required: [true, 'User Must Have A Comment'],
    },
    likes: {
      type: Number,
      default: 0,
    },
    dislikes: {
      type: Number,
      default: 0,
    },
    commentLikedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    commentdisLikedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: [true, 'Comment Must Have A Post'],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Comment Must Have A Post'],
    },

    editable: {
      type: 'Boolean',
      default: true,
    },
    userImage: 'String',
    replies: [
      {
        userName: {
          type: 'String',
        },
        comment: {
          type: 'String',
        },
        likesCount: {
          type: Number,
          default: 0,
        },
        dislikesCount: {
          type: Number,
          default: 0,
        },
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        commentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Comment',
        },
        userImage: 'String',
        replyLikedUsers: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
          },
        ],
        replydisLikedUsers: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
          },
        ],
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Comment = mongoose.model('Comment', commentSchema);
module.exports = Comment;
