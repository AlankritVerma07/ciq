const mongoose = require('mongoose');
const fetch = require('node-fetch');
const User = require('../models/userModel');
const { uploadFile, getFileStream } = require('../config/s3');
//const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const dummyUser = require('../models/dummyUser');

exports.signup = catchAsync(async (req, res, next) => {
  let image;
  if (req.file) {
    image = `${process.env.AWS_SERVER_URL}/api/v1/users/profileImage/${req.file.filename}`;
    await uploadFile(req.file);
  } else {
    image = req.user.picture;
  }

  // getting latitute and longitute data from pinCode and storing it in user collection
  const googlData = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${req.body.pinCode}&key=${process.env.Google_Maps_APiKey}`
  );
  const apiResponseData = await googlData.json();

  /*eslint-disable-next-line*/ // verifying pincode
  if (apiResponseData.status == 'ZERO_RESULTS') {
    return res.status(200).json({
      status: false,
      message: 'Pincode is not valid',
    });
  }

  let location;
  /*eslint-disable-next-line*/
  if (apiResponseData.status == 'OK') {
    const coordinates = apiResponseData.results[0].geometry.location;
    location = Object.values(coordinates).reverse();
  }

  const data = await User.create({
    firebaseId: req.user.user_id,
    email: req.body.email,
    userName: req.body.userName,
    fName: req.body.fName,
    lName: req.body.lName,
    dob: req.body.dob,
    gender: req.body.gender,
    mobile: req.body.mobile,
    pinCode: req.body.pinCode,
    bio: req.body.bio,
    referralCode: req.body.referralCode,
    profileVisibility: req.body.profileVisibility,
    interests: req.body.interests,
    followedBy: req.body.followedBy,
    following: req.body.following
      ? req.body.following.map((s) => mongoose.Types.ObjectId(s))
      : [],
    blockedBy: req.body.blockedBy,
    blocking: req.body.blocking,
    mutedBy: req.body.mutedBy,
    muting: req.body.muting,
    postAction: req.body.postAction,
    comment: req.body.comment,
    commentAction: req.body.commentAction,
    orders: req.body.orders,
    userImage: image,
    location: {
      type: 'Point',
      coordinates: location, //can't store empty array because mongoDB will give geo data error
    },
  });

  // saving the current user's id in each following users
  if (req.body.following) {
    const userData = req.body.following;
    userData.map(async (id) => {
      const userD = await User.findById(id).select('-location');
      if (userD) {
        userD.followers.unshift(mongoose.Types.ObjectId(data._id));
        await userD.save({ validateBeforeSave: false });
      }
    });
  }

  res.status(200).json({
    status: true,
    data,
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const firebaseId = req.user.user_id;

  // Check if user exists
  const data = await User.findOne({ firebaseId });
  if (!data) {
    return res.status(200).json({
      status: false,
      data,
      message: 'User does not exist',
    });
  }
  res.status(200).json({
    status: true,
    data,
  });
});

exports.search = catchAsync(async (req, res, next) => {
  if (!req.query.userName) {
    return res.status(200).json({
      status: false,
      message: 'The username cannot be empty',
    });
  }

  const regex = new RegExp(req.query.userName, 'i');
  const data = await User.find({ userName: regex })
    .select('userName email posts')
    .populate({
      path: 'posts',
      select: '-__v -updatedAt -createdAt',
    });

  res.status(200).json({
    status: true,
    data,
  });
});
//------------------------------------------Profile-----------------------------------------------------------

exports.getMe = catchAsync(async (req, res, next) => {
  const data = await User.findOne({ _id: req.currentUser._id });
  if (!data) {
    return res.status(200).json({
      status: false,
      message: 'No user found ',
    });
  }

  res.status(200).json({
    success: true,
    data,
  });
});

exports.editMe = catchAsync(async (req, res, next) => {
  let image;
  const user = await User.findOne({ _id: req.query.id });
  if (req.file) {
    image = `${process.env.AWS_SERVER_URL}/api/v1/users/profileImage/${req.file.filename}`;
    await uploadFile(req.file);
  } else if (user.userImage) {
    image = user.userImage;
  }
  const newData = {
    userName: req.body.userName,
    fName: req.body.fName,
    lName: req.body.lName,
    gender: req.body.gender,
    profileVisibility: req.body.profileVisibility,
    bio: req.body.bio,
    userImage: image,
  };
  const data = await User.findByIdAndUpdate(req.query.id, newData, {
    new: true,
    runValidators: false,
  });

  if (!data) {
    return res.status(200).json({
      status: false,
      message: 'No user found with that ID',
    });
  }
  res.status(200).json({
    success: true,
    message: 'User successfully updated',
    data,
  });
});

//------------------------------Get image from s3---------------------------------

exports.getImage = catchAsync(async (req, res) => {
  const image = getFileStream(req.params.url);
  image.pipe(res);
  // console.log(image.pipe())
  if (!image) {
    return res.status(200).json({
      status: false,
      message: 'No image found',
    });
  }
  // const user = await User.findOne({ userImage: req.params.url });

  // function encode(data) {
  //   const buf = Buffer.from(data);
  //   const base64 = buf.toString('base64');
  //   return base64;
  // }
  // getFileStream(req.params.url).then((image) => {
  //   const img = encode(image.Body);
  //   console.log(typeof img);
  //   const data = {
  //     user,
  //     image: img,
  //   };
  //   res.send({ data });
  // });
  // image.pipe(res);
  // // console.log(image.pipe())
  // if (!image) {
  //   return res.status(200).json({
  //     status: false,
  //     message: 'No image found',
  //   });
  // }
});

//--------------------------------Dummy Api's-------------------------------------

exports.createDummyuser = async (req, res, next) => {
  try {
    const user = await dummyUser.create({
      name: req.body.name,
    });

    res.status(200).json({
      status: true,
      data: {
        user,
      },
    });
  } catch (err) {
    console.log(err);
  }
};

exports.getFriends = async (req, res, next) => {
  const friends = await dummyUser.find();
  try {
    res.status(200).json({
      status: true,
      data: {
        popular: friends,
        near_you: friends,
        others: friends,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.nearMe = async (req, res, next) => {
  const googlData = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${req.query.pinCode}&key=${process.env.Google_Maps_APiKey}`
  );
  const apiResponseData = await googlData.json();

  // If pinCode is wrong send random users
  /*eslint-disable-next-line*/
  if (apiResponseData.status == 'ZERO_RESULTS') {
    return res.status(200).json({
      status: false,
      meesage: 'Pincode is invalid',
    });
  }
  let location;
  /*eslint-disable-next-line*/
  if (apiResponseData.status == 'OK') {
    const coordinates = apiResponseData.results[0].geometry.location;
    location = Object.values(coordinates).reverse();
  }

  const nearbyUsers = await User.find({
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: location,
        },
        $maxDistance: 20000, // 20km in meters
      },
    },
  }).select('userName , location , pinCode');

  res.status(200).json({
    status: 'success',
    userlocation: location,
    nearbyUsers,
  });
};

exports.similarInterests = catchAsync(async (req, res, next) => {
  const { interests } = req.query;

  const interestsArray = interests.split(',');

  const users = await User.aggregate([
    {
      $match: { interests: { $in: interestsArray } },
    },
    { $project: { userName: 1, interests: 1 } },
    { $sort: { fName: 1 } },
    { $limit: 25 },
  ]);

  res.json({
    status: true,
    data: users,
  });
});

//---------------------- Work on optimization when user increase-------------------------------

exports.finshiUpApi = catchAsync(async (req, res, next) => {
  //----------------------Popular Users-------------------------

  const popularUsers = await User.find().limit(25).select('fName , userImage');

  //----------------------Near by Users------------------------------------

  const googlData = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${req.query.pinCode}&key=${process.env.Google_Maps_APiKey}`
  );
  const apiResponseData = await googlData.json();

  /*eslint-disable-next-line*/
  if (apiResponseData.status == 'ZERO_RESULTS') {
    return res.status(200).json({
      status: false,
      meesage: 'Pincode is invalid',
    });
  }
  let location;
  /*eslint-disable-next-line*/
  if (apiResponseData.status == 'OK') {
    const coordinates = apiResponseData.results[0].geometry.location;
    location = Object.values(coordinates).reverse();
  }

  const nearbyUsers = await User.find({
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: location,
        },
        $maxDistance: 100000, // 100km in meters
      },
    },
  }).select('fName , pinCode , userImage');

  //----------------------Similar Interest------------------------------------

  const { interests } = req.query;
  const interestsArray = interests.split(',');

  const similarInterestsUsers = await User.aggregate([
    {
      $match: { interests: { $in: interestsArray } },
    },
    { $project: { fName: 1, userImage: 1, interests: 1 } },
    { $sort: { fName: 1 } },
    { $limit: 25 },
  ]);

  //----------------------Random Users-----------------

  const randomUsers = await User.aggregate([
    { $sample: { size: 25 } },
    { $project: { fName: 1, userImage: 1 } },
  ]);

  res.status(200).json({
    status: true,
    data: {
      popularUsers,
      nearbyUsers:
        nearbyUsers.length === 25
          ? nearbyUsers
          : nearbyUsers.concat(randomUsers).splice(0, 25),
      // : [...nearbyUsers, ...randomUsers].slice(0, 25),
      similarInterestsUsers:
        similarInterestsUsers.length === 25
          ? similarInterestsUsers
          : similarInterestsUsers.concat(randomUsers).splice(0, 25),
      // : [...similarInterestsUsers, ...randomUsers].slice(0, 25),
    },
  });
});
