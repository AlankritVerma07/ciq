const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      //required: [true, 'Post must belong to a user'],
    },
    author: {
      type: String,
      //required: [true, 'Post Must Have A Author'],
    },
    userImage: String,
    trackingLink: {
      type: String,
      default: ' ',
    },
    isTrackingLinkGenerated: {
      type: Boolean,
      default: false,
    },
    draft: {
      type: Boolean,
      default: false,
    },
    enableSharing: {
      type: Boolean,
      default: true,
    },
    enableComments: {
      type: Boolean,
      default: true,
    },
    visibility: {
      type: [String],
    },
    likesCount: {
      type: Number,
      default: 0,
    },
    userLikes: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
    dislikesCount: {
      type: Number,
      default: 0,
    },
    userDislikes: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
    bookMarkedByUsers: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
    totalComments: {
      type: Number,
      default: 0,
    },
    price: Number,
    rating: Number,
    productLink: {
      type: String,
      //required: [true, 'Post Must Have A Product Link'],
    },
    productName: {
      type: String,
      //required: [true, 'Post Must Have A Product Name'],
    },
    merchantName: {
      type: String,
      //required: [true, 'Post Must Have A Merchant Name'],
    },
    description: {
      type: String,
      trim: true,
    },
    postTitle: {
      type: String,
      trim: true,
    },
    postImages: [String],
    orderId: String,
    orderStatus: String,
    packaging: {
      type: String,
      default: 'AVERAGE',
      enum: {
        values: ['BAD', 'AVERAGE', 'GOOD'],
        message: 'Packaging can either be of 3 values',
      },
    },
    instructions: {
      type: String,
      default: 'AVERAGE',
      enum: {
        values: ['BAD', 'AVERAGE', 'GOOD'],
        message: 'Instructions can either be of 3 values',
      },
    },
    fitting: {
      type: String,
      default: 'AVERAGE',
      enum: {
        values: ['BAD', 'AVERAGE', 'GOOD'],
        message: 'Fitting can either be of 3 values',
      },
    },
    finish: {
      type: String,
      default: 'AVERAGE',
      enum: {
        values: ['BAD', 'AVERAGE', 'GOOD'],
        message: 'Finish can either be of 3 values',
      },
    },
    materialUsed: {
      type: String,
      default: 'AVERAGE',
      enum: {
        values: ['BAD', 'AVERAGE', 'GOOD'],
        message: 'Material used can either be of 3 values',
      },
    },
    courier: String,
    AWB: String,
    // bookmarks: {
    //   type: Boolean,
    //   default: false,
    // },
    category: String,
    lifestyle: String,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//Virtual populate comments on posts
// postSchema.virtual('comments', {
//   ref: 'Comment',
//   foreignField: 'postId',
//   localField: '_id',
// });

const Post = mongoose.model('Post', postSchema);
module.exports = Post;
