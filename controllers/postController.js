/* eslint-disable no-await-in-loop */
/* eslint-disable no-plusplus */
const Post = require('../models/postModel');
const User = require('../models/userModel');
const Store = require('../models/storeModel');
const catchAsync = require('../utils/catchAsync');
const { uploadMultipleFile, deleteMultipleFile } = require('../config/s3');

exports.createPost = catchAsync(async (req, res, next) => {
  let images;
  const imageArr = [];

  if (req.files) {
    images = req.files;
    await uploadMultipleFile(req.files);

    images.forEach((img) => {
      const imgPath = img.filename;
      imageArr.push(`/api/v1/users/profileImage/${imgPath}`);
    });
  }

  const stores = await Store.findOne({ merchant: req.body.merchantName });
  let trackingLink;
  let defaultTrackingLink;
  let isTrackingLinkGenerated;

  if (stores !== null && stores.status === 'active') {
    defaultTrackingLink = new URL(stores.url);
    // defaultTrackingLink.searchParams.set('url', req.body.productLink);
    defaultTrackingLink.searchParams.set('subid', req.currentUser._id);
    trackingLink = defaultTrackingLink.toString();
    isTrackingLinkGenerated = true;
  } else isTrackingLinkGenerated = false;

  const data = await Post.create({
    userId: req.currentUser._id,
    author: req.currentUser.userName,
    userImage: req.currentUser.userImage,
    trackingLink,
    isTrackingLinkGenerated,
    draft: req.body.draft,
    visibility: req.body.visibility,
    bookmarks: req.body.bookmarks,
    enableSharing: req.body.enableSharing,
    enableComments: req.body.enableComments,
    price: req.body.price,
    rating: req.body.rating,
    lifestyle: req.body.lifestyle,
    productLink: req.body.productLink,
    productName: req.body.productName,
    merchantName: req.body.merchantName,
    description: req.body.description,
    postTitle: req.body.postTitle,
    orderId: req.body.orderId,
    orderStatus: req.body.orderStatus,
    courier: req.body.courier,
    AWB: req.body.AWB,
    category: req.body.category,
    packaging: req.body.packaging,
    instructions: req.body.instructions,
    fitting: req.body.fitting,
    finish: req.body.finish,
    materialUsed: req.body.materialUsed,
    postImages: imageArr,
  });

  const user = await User.findById(req.currentUser._id);
  if (!user) {
    return res.status(200).json({
      status: false,
      user,
      message: 'User does not exist',
    });
  }
  user.posts.unshift(data._id);
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: true,
    data,
  });
});

exports.feed = catchAsync(async (req, res, next) => {
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 20;
  const startIndex = (page - 1) * limit;
  const user = await User.findById(req.currentUser._id);
  const following = [...user.following];

  const { type } = req.query;
  let posts;

  if (type === 'following') {
    const users = await User.find()
      .where('_id')
      .in(following.concat([req.currentUser._id]));
    const postIds = users.map((usersId) => usersId.posts).flat();
    posts = await Post.find({ draft: false })
      .where('_id')
      .in(postIds)
      .sort({ _id: -1 })
      .lean()
      .skip(startIndex)
      .limit(limit);
  } else if (type === 'interests') {
    posts = await Post.find({ draft: false })
      .where('category')
      .in(user.interests)
      .sort({ _id: -1 })
      .lean()
      .skip(startIndex)
      .limit(limit);
  } else {
    res.status(200).json({
      status: true,
      message: 'Please pass the type of field for feeds',
    });
  }
  //-------------------------------------Alternative Approach might take more time--------------------------------------
  // const posts = await Post.find({
  //   userId: {
  //     $in: following.concat([req.currentUser._id]),
  //   },
  // });
  //-------------------------------------------(Check once posts are in 1ks)--------------------------------------------------------------

  posts.forEach((post) => {
    const likes = post.userLikes.map((like) => like.toString());
    post.isLiked = likes.includes(req.currentUser._id.toString());
    const dislikes = post.userDislikes.map((dislike) => dislike.toString());
    post.isDisliked = dislikes.includes(req.currentUser._id.toString());

    //new code for isBookMarked
    const bookmarks = post.bookMarkedByUsers.map((bookmark) =>
      bookmark.toString()
    );
    post.isBookmarked = bookmarks.includes(req.currentUser._id.toString());
  });

  res.status(200).json({
    status: true,
    data: posts,
  });
});

exports.getMyPosts = catchAsync(async (req, res, next) => {
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 20;
  const startIndex = (page - 1) * limit;

  const postData = await Post.find({
    userId: req.currentUser._id,
    draft: false,
  })
    .sort({ _id: -1 })
    .lean()
    .skip(startIndex)
    .limit(limit);

  const data = postData.map((post) => {
    const likes = post.userLikes.map((like) => like.toString());
    post.isLiked = likes.includes(req.currentUser._id.toString());
    const dislikes = post.userDislikes.map((dislike) => dislike.toString());
    post.isDisliked = dislikes.includes(req.currentUser._id.toString());

    //new code for isBookMarked
    const bookmarks = post.bookMarkedByUsers.map((bookmark) =>
      bookmark.toString()
    );
    post.isBookmarked = bookmarks.includes(req.currentUser._id.toString());
    return post;
  });

  res.status(200).json({
    status: true,
    data,
  });
});

exports.getPost = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id).lean();
  if (!post) {
    return res.status(200).json({
      status: false,
      post,
      message: 'No posts found with that ID',
    });
  }
  const likes = post.userLikes.map((like) => like.toString());
  post.isLiked = likes.includes(req.currentUser._id.toString());
  const dislikes = post.userDislikes.map((dislike) => dislike.toString());
  post.isDisliked = dislikes.includes(req.currentUser._id.toString());

  //new code for isBookMarked
  const bookmarks = post.bookMarkedByUsers.map((bookmark) =>
    bookmark.toString()
  );
  post.isBookmarked = bookmarks.includes(req.currentUser._id.toString());

  res.status(200).json({
    status: true,
    data: post,
  });
});

exports.updatePost = catchAsync(async (req, res, next) => {
  let images;

  let imageArr = [];
  const post = await Post.findOne({ _id: req.params.id });

  if (req.files.length === 0) imageArr = [...post.postImages];
  if (req.files) {
    images = req.files;
    await uploadMultipleFile(req.files);

    images.forEach((img) => {
      const imgPath = img.filename;
      imageArr.push(`/api/v1/users/profileImage/${imgPath}`);
    });
  }

  const data = await Post.findByIdAndUpdate(
    req.params.id,
    {
      draft: req.body.draft,
      visibility: req.body.visibility,
      bookmarks: req.body.bookmarks,
      enableSharing: req.body.enableSharing,
      enableComments: req.body.enableComments,
      price: req.body.price,
      rating: req.body.rating,
      lifestyle: req.body.lifestyle,
      productLink: req.body.productLink,
      productName: req.body.productName,
      merchantName: req.body.merchantName,
      description: req.body.description,
      postTitle: req.body.postTitle,
      orderId: req.body.orderId,
      orderStatus: req.body.orderStatus,
      courier: req.body.courier,
      AWB: req.body.AWB,
      category: req.body.category,
      packaging: req.body.packaging,
      instructions: req.body.instructions,
      fitting: req.body.fitting,
      finish: req.body.finish,
      materialUsed: req.body.materialUsed,
      postImages: imageArr,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!data) {
    return res.status(200).json({
      status: false,
      data,
      message: 'No posts found with that ID',
    });
  }

  res.status(200).json({
    success: true,
    data,
  });
});

exports.deletePost = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    return res.status(200).json({
      success: false,
      message: 'Post not found',
    });
  }

  if (post.userId.toString() !== req.currentUser._id.toString()) {
    return res.status(200).json({
      success: false,
      message: 'Unauthorized, you can delete only your post!',
    });
  }
  await post.deleteOne();
  if (post.postImages.length !== 0) await deleteMultipleFile(post.postImages);

  const user = await User.findById(req.currentUser._id);
  const index = user.posts.indexOf(req.params.id);
  user.posts.splice(index, 1);
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Post deleted successfully',
  });
});

exports.likePost = async (req, res) => {
  const post = await Post.findById(req.query.id);
  if (!post) {
    return res.status(200).json({
      success: false,
      post,
      message: 'Post not found',
    });
  }
  // if (post.userLikes.includes(req.currentUser._id)) {
  //   return res.status(200).json({
  //     success: true,
  //     message: 'You have already liked this post',
  //   });
  // }
  // post.userLikes.push(req.currentUser._id);
  // post.likesCount += 1;
  // await post.save();
  let msg = '';
  if (post.userLikes.includes(req.currentUser._id)) {
    const index = post.userLikes.indexOf(req.currentUser._id);
    post.userLikes.splice(index, 1);
    post.likesCount -= 1;
    msg = 'Post Liked Removed successfully';
    await post.save();
  } else {
    post.userLikes.push(req.currentUser._id);
    post.likesCount += 1;
    await post.save();
    msg = 'Post Liked successfully';
  }

  return res.status(200).json({
    success: true,
    message: msg,
  });

  // return res.status(200).json({
  //   success: true,
  //   message: 'Post Liked successfully',
  // });
};

exports.dislikePost = async (req, res) => {
  const post = await Post.findById(req.query.id);
  if (!post) {
    return res.status(200).json({
      success: false,
      post,
      message: 'Post not found',
    });
  }

  let msg = '';
  if (post.userDislikes.includes(req.currentUser._id)) {
    const index = post.userDislikes.indexOf(req.currentUser._id);
    post.userDislikes.splice(index, 1);
    post.dislikesCount -= 1;
    msg = 'Post Disliked Removed successfully';
    await post.save();
  } else {
    post.userDislikes.push(req.currentUser._id);
    post.dislikesCount += 1;
    await post.save();
    msg = 'Post Disliked successfully';
  }

  return res.status(200).json({
    success: true,
    message: msg,
  });
};

//------------------------------------------Drafts-----------------------------------------------------------

exports.getMyDrafts = catchAsync(async (req, res, next) => {
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 20;
  const startIndex = (page - 1) * limit;

  const data = await Post.find({ userId: req.currentUser._id, draft: true })
    .sort({ _id: -1 })
    .skip(startIndex)
    .limit(limit);

  res.status(200).json({
    status: true,
    data,
  });
});

//------------------------------------------Drafts-----------------------------------------------------------

//-----------------------------------------Bookmarks----------------------------------------------------------

exports.bookMarkPost = async (req, res) => {
  const post = await Post.findById(req.query.id);
  if (!post) {
    return res.status(200).json({
      status: false,
      message: 'Post not found',
      post,
    });
  }

  let msg = '';
  if (post.bookMarkedByUsers.includes(req.currentUser._id)) {
    const index = post.bookMarkedByUsers.indexOf(req.currentUser._id);
    const postIndex = req.currentUser.myBookmarks.indexOf(req.query.id);
    req.currentUser.myBookmarks.splice(postIndex, 1);
    post.bookMarkedByUsers.splice(index, 1);
    msg = 'Post removed from bookmark successfully';
    await req.currentUser.save();
    await post.save();
  } else {
    post.bookMarkedByUsers.push(req.currentUser._id);
    req.currentUser.myBookmarks.unshift(req.query.id);
    await req.currentUser.save();
    await post.save();
    msg = 'Post bookmarked successfully';
  }

  return res.status(200).json({
    status: true,
    message: msg,
  });
};

exports.getMyBookMarks = catchAsync(async (req, res, next) => {
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 30;

  const { myBookmarks } = await User.findById(req.currentUser._id)
    .lean()
    .populate({
      path: 'myBookmarks',
    })
    .select('myBookmarks');

  if (myBookmarks.length === 0) {
    return res.status(200).json({
      status: true,
      data: [],
    });
  }

  const finalData = myBookmarks.map((post) => {
    const likes = post.userLikes.map((like) => like.toString());
    post.isLiked = likes.includes(req.currentUser._id.toString());
    const dislikes = post.userDislikes.map((dislike) => dislike.toString());
    post.isDisliked = dislikes.includes(req.currentUser._id.toString());

    //new code for isBookMarked
    const bookmarks = post.bookMarkedByUsers.map((bookmark) =>
      bookmark.toString()
    );
    post.isBookmarked = bookmarks.includes(req.currentUser._id.toString());
    return post;
  });

  // Pagination using slice
  const data = finalData.slice((page - 1) * limit, page * limit);

  return res.status(200).json({
    status: true,
    data,
  });
});
